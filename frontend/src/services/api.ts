import axios, { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'sonner';

export const api = axios.create({
  baseURL: 'https://arcoportus.pktech.ai'
});

export const setupInterceptors = (signOut: () => void, refreshToken: () => Promise<any>) => {
  api.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && originalRequest && originalRequest.url !== '/auth/refresh-token') {
        try {
          await refreshToken();
          return api(originalRequest);
        } catch (refreshError) {
          toast.error('Sua sessão expirou. Por favor, faça login novamente.');
          signOut();
          return Promise.reject(refreshError);
        }
      }

      if (error.response?.status === 401 && originalRequest && originalRequest.url === '/auth/refresh-token') {
        toast.error('Sua sessão expirou. Por favor, faça login novamente.');
        signOut();
      }

      return Promise.reject(error);
    }
  );
};

export default api;
