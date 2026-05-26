import api from './api';

export const projectService = {
  getProjects: () => 
    api.get('/projects').then(res => res.data),

  getProject: (id) => 
    api.get(`/projects/${id}`).then(res => res.data),

  verifyProject: (id, feedback, file) => {
    const formData = new FormData();
    formData.append('feedback', feedback);
    if (file) {
        formData.append('file', file);
    }
    return api.post(`/projects/${id}/verify`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  }
};
