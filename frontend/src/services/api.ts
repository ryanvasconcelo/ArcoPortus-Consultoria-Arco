// src/services/api.ts (CORRIGIDO)
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3335' // <-- Correto! Apenas o endereço do servidor.
});

export default api;