/**
 * Nam Nadu — Notification Service
 * API calls for notifications
 */
import api from './api';

const NOTIFICATION_ENDPOINTS = {
  LIST: '/notifications',
  MARK_READ: '/notifications/:id/read',
  MARK_ALL_READ: '/notifications/read-all',
  DELETE: '/notifications/:id',
};

export const notificationService = {
  getAll: async (params = {}) => {
    const response = await api.get(NOTIFICATION_ENDPOINTS.LIST, { params });
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.patch(NOTIFICATION_ENDPOINTS.MARK_READ.replace(':id', id));
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch(NOTIFICATION_ENDPOINTS.MARK_ALL_READ);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(NOTIFICATION_ENDPOINTS.DELETE.replace(':id', id));
    return response.data;
  },
};

export default notificationService;
