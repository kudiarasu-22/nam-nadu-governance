import api from './api';

export const leadershipService = {
  getAnalytics: async () => {
    const response = await api.get('/leadership/analytics');
    return response.data;
  },

  getAlerts: async () => {
    const response = await api.get('/leadership/alerts');
    return response.data;
  },

  createAlert: async (data) => {
    const response = await api.post('/leadership/alerts', data);
    return response.data;
  },

  mlaRegister: async (data) => {
    const response = await api.post('/leadership/register', data);
    return response.data;
  },

  mlaLogin: async (mla_id, password) => {
    const response = await api.post('/leadership/login', { mla_id, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/leadership/profile');
    return response.data;
  },

  getPerformance: async () => {
    const response = await api.get('/leadership/performance');
    return response.data;
  },

  getComplaints: async (status) => {
    const response = await api.get('/leadership/complaints', { params: { status } });
    return response.data;
  },

  getProjects: async () => {
    const response = await api.get('/leadership/projects');
    return response.data;
  },

  getCmStats: async () => {
    const response = await api.get('/cm_admin/dashboard/stats');
    return response.data;
  },

  getAllMlas: async () => {
    const response = await api.get('/cm_admin/mlas');
    return response.data;
  },

  cmLogin: async (email, password) => {
    const response = await api.post('/cm_admin/login', { identifier: email, password });
    return response.data;
  }
};
