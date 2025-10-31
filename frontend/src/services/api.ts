// src/services/api.ts
// API client para o backend do Arco-Portus
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://arcoportus.pktech.ai/api' // AGORA INCLUI /api
});


export default api;