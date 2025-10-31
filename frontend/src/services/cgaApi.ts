// src/services/cgaApi.ts
import axios from 'axios';

const cgaApi = axios.create({
  baseURL: 'https://cga.pktech.ai',
  headers: {
    'Content-Type': 'application/json',
    'x-internal-api-key': import.meta.env.VITE_INTERNAL_API_KEY || ''
  }
});

export default cgaApi;