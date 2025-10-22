// src/services/api.ts (CORRIGIDO)
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://arcoportus.pktech.ai',
  headers: {
    'x-internal-api-key': import.meta.env.VITE_INTERNAL_API_KEY || ''
  }
});

export default api;