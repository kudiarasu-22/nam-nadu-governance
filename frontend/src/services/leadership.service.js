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
  }
};
