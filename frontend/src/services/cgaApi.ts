// src/services/cgaApi.ts
// API client específico para autenticação via CGA
import axios from 'axios';

const cgaApi = axios.create({
  baseURL: 'https://cga.pktech.ai',
  headers: {
    'x-internal-api-key': import.meta.env.VITE_INTERNAL_API_KEY || ''
  }
});

export default cgaApi;