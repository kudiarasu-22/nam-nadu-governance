/**
 * Nam Nadu — Axios API Service
 * Centralized HTTP client with JWT interceptors and error handling
 */
import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '@/constants';

// Create Axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    let token = null;
    if (config.url?.startsWith('/cm_admin')) {
      token = localStorage.getItem('cm_token');
    } else if (config.url?.startsWith('/leadership') && !config.url?.includes('register') && !config.url?.includes('login')) {
      token = localStorage.getItem('mla_token');
    } else {
      token = localStorage.getItem(TOKEN_KEY);
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle token refresh & errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // For citizen/officer requests, try refresh
      if (!originalRequest.url?.startsWith('/cm_admin') && !originalRequest.url?.startsWith('/leadership')) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
          if (!refreshToken) throw new Error('No refresh token');

          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          localStorage.setItem(TOKEN_KEY, data.access_token);
          if (data.refresh_token) {
            localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
          }

          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // MLA / CM 401 - direct redirect
        if (originalRequest.url?.startsWith('/cm_admin')) {
          localStorage.removeItem('cm_token');
          localStorage.removeItem('cm_user');
          window.location.href = '/cm/login';
        } else if (originalRequest.url?.startsWith('/leadership')) {
          localStorage.removeItem('mla_token');
          localStorage.removeItem('mla_user');
          window.location.href = '/mla/login';
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
