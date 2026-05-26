import api from './api';

export const complaintService = {
  create: (data, isDraft = false) => 
    api.post(`/complaints/create?is_draft=${isDraft}`, data).then(res => res.data),

  uploadMedia: (complaintId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/complaints/${complaintId}/upload-media`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },

  getMyComplaints: (status = '') => 
    api.get(`/complaints/my${status ? `?status=${status}` : ''}`).then(res => res.data),

  getComplaint: (id) => 
    api.get(`/complaints/${id}`).then(res => res.data),

  trackComplaint: (complaintNumber) =>
    api.get(`/complaints/track/${complaintNumber}`).then(res => res.data),

  getTimeline: (id) => 
    api.get(`/complaints/${id}/timeline`).then(res => res.data),

  reopen: (id, reason) => 
    api.post(`/complaints/${id}/reopen`, { reason }).then(res => res.data),
    
  getAnalytics: () =>
    api.get('/analytics/citizen').then(res => res.data),
    
  getNotifications: () =>
    api.get('/notifications').then(res => res.data),
    
  markNotificationRead: (id) =>
    api.patch(`/notifications/${id}/read`).then(res => res.data)
};
