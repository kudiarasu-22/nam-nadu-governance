/**
 * Nam Nadu — Auth Service
 * Authentication API calls
 */
import api from './api';

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
};

export const authService = {
  login: async (identifier, password) => {
    const { data } = await api.post(AUTH_ENDPOINTS.LOGIN, { identifier, password });
    return data;
  },

  register: async (userData) => {
    const { data } = await api.post(AUTH_ENDPOINTS.REGISTER, userData);
    return data;
  },

  refresh: async () => {
    const refreshToken = localStorage.getItem('nam_nadu_refresh_token');
    const { data } = await api.post(AUTH_ENDPOINTS.REFRESH, { refresh_token: refreshToken });
    return data;
  },
  
  logout: async () => {
    const { data } = await api.post(AUTH_ENDPOINTS.LOGOUT);
    return data;
  },

  getMe: async () => {
    const { data } = await api.get(AUTH_ENDPOINTS.ME);
    return data;
  },
};

export default authService;
