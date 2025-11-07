import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { jwtDecode } from 'jwt-decode';

export const api = axios.create({
  baseURL: 'https://arcoportus.pktech.ai'
});

export const setupInterceptors = (
  signOut: (showMessage?: boolean) => void,
  refreshToken: () => Promise<any>,
  resetInactivityTimer: () => void
) => {

  // ✅ INTERCEPTOR DE REQUEST
  api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // ✅ TODA REQUISIÇÃO RESETA O TIMER DE INATIVIDADE
      resetInactivityTimer();

      const token = localStorage.getItem('@ArcoPortus:token');

      if (token && config.url !== '/auth/refresh-token') {
        try {
          const decoded: { exp: number } = jwtDecode(token);
          const now = Date.now() / 1000;
          const timeUntilExpiration = decoded.exp - now;
          const refreshThreshold = 30 * 60; // 30 minutos em segundos

          // Se o token vai expirar em menos de 30 minutos, renova
          if (timeUntilExpiration < refreshThreshold && timeUntilExpiration > 0) {
            console.log('⚠️ Token próximo de expirar. Renovando...');
            await refreshToken();
          }
        } catch (error) {
          console.error('❌ Erro ao verificar expiração do token:', error);
        }
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // ✅ INTERCEPTOR DE RESPONSE
  api.interceptors.response.use(
    (response: AxiosResponse) => {
      // ✅ TODA RESPOSTA BEM-SUCEDIDA RESETA O TIMER
      resetInactivityTimer();
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {

        if (originalRequest.url === '/auth/refresh-token') {
          console.log('❌ Erro ao renovar token. Fazendo logout...');
          signOut(true);
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
          console.log('🔄 Tentando renovar token após 401...');
          await refreshToken();

          const newToken = localStorage.getItem('@ArcoPortus:token');
          if (newToken) {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          }

          return api(originalRequest);
        } catch (refreshError) {
          console.log('❌ Falha ao renovar token. Fazendo logout...');
          signOut(true);
          return Promise.reject(refreshError);
        }
      }

      // ✅ 403 = Permissões revogadas
      if (error.response?.status === 403) {
        console.log('❌ Acesso negado (403). Permissões podem ter sido revogadas.');
        signOut(true);
      }

      return Promise.reject(error);
    }
  );
};

export default api;