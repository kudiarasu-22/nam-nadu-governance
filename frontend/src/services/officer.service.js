import api from './api';

export const officerService = {
  getDashboardStats: async () => {
    const response = await api.get('/officer/dashboard');
    return response.data;
  },

  getComplaints: async () => {
    const response = await api.get('/officer/complaints');
    return response.data;
  },

  updateComplaint: async (id, data) => {
    const response = await api.patch(`/officer/complaints/${id}`, data);
    return response.data;
  },

  getProjects: async () => {
    const response = await api.get('/officer/projects');
    return response.data;
  },

  updateProject: async (id, data) => {
    const response = await api.patch(`/officer/projects/${id}`, data);
    return response.data;
  }
};
