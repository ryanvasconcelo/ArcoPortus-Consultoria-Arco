import axios from 'axios';

// A URL base do nosso backend rodando no Docker
const api = axios.create({
  baseURL: 'http://localhost:3335/api', // Lembre-se que mudamos a porta para 3335
});

export default api;