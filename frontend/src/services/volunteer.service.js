import api from './api';

export const volunteerService = {
  getProfile: async () => {
    const response = await api.get('/volunteer/profile');
    return response.data;
  },

  checkIn: async () => {
    const response = await api.post('/volunteer/check-in');
    return response.data;
  },

  getTasks: async () => {
    const response = await api.get('/volunteer/tasks');
    return response.data;
  },

  claimTask: async (taskId) => {
    const response = await api.post(`/volunteer/tasks/${taskId}/claim`);
    return response.data;
  },

  completeTask: async (taskId) => {
    const response = await api.post(`/volunteer/tasks/${taskId}/complete`);
    return response.data;
  },

  getLeaderboard: async () => {
    const response = await api.get('/volunteer/leaderboard');
    return response.data;
  }
};
