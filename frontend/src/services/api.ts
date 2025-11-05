import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { jwtDecode } from 'jwt-decode';

export const api = axios.create({
  baseURL: 'https://arcoportus.pktech.ai'
});

export const setupInterceptors = (signOut: (showMessage?: boolean) => void, refreshToken: () => Promise<any>) => {

  // ✅ CORREÇÃO #12: Interceptor de REQUEST - Renovação automática antes de cada requisição
  api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('@ArcoPortus:token');

      if (token && config.url !== '/auth/refresh-token') {
        try {
          const decoded: { exp: number } = jwtDecode(token);
          const now = Date.now() / 1000;
          const timeUntilExpiration = decoded.exp - now;
          const refreshThreshold = 5 * 60; // 5 minutos em segundos

          // Se o token vai expirar em menos de 5 minutos, renova antes da requisição
          if (timeUntilExpiration < refreshThreshold && timeUntilExpiration > 0) {
            console.log('⚠️ Token próximo de expirar. Renovando antes da requisição...');
            await refreshToken();
          }
        } catch (error) {
          console.error('❌ Erro ao verificar expiração do token na requisição:', error);
        }
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // ✅ CORREÇÃO #13: Interceptor de RESPONSE - Tratamento de 401
  api.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Se recebeu 401 e não é da rota de refresh
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {

        // Se for erro na rota de refresh, faz logout imediato
        if (originalRequest.url === '/auth/refresh-token') {
          console.log('❌ Erro ao renovar token. Fazendo logout...');
          signOut(true);
          return Promise.reject(error);
        }

        // Tenta renovar o token uma única vez
        originalRequest._retry = true;

        try {
          console.log('🔄 Tentando renovar token após 401...');
          await refreshToken();

          // Retry da requisição original com o novo token
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

      return Promise.reject(error);
    }
  );
};

export default api;