// src/services/api.ts (CORRIGIDO)
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://arcoportus.pktech.ai/api' // <-- Correto! Apenas o endereço do servidor.
});

export default api;