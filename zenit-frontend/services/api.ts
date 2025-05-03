// zenit-frontend/src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api',
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use((config) => {
  // Buscar token no localStorage (navegador) ou em cookie (SSR)
  let token;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Serviço de autenticação usando o core-backend
export const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:3000/api',
});

authApi.interceptors.request.use((config) => {
  let token;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default api;