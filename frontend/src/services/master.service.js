import api from './api';

export const masterService = {
  getDistricts: () => api.get('/master/districts').then(res => res.data),
  
  getWards: (districtId) => api.get(`/master/wards/${districtId}`).then(res => res.data),
  
  getAreas: (wardId) => api.get(`/master/areas/${wardId}`).then(res => res.data),
  
  getLocationDetails: (areaId) => api.get(`/master/location-details/${areaId}`).then(res => res.data),
  
  getCategories: () => api.get('/master/categories').then(res => res.data),
  
  getDepartments: () => api.get('/master/departments').then(res => res.data),
  
  detectLocation: (lat, lng) => api.get(`/master/detect-location?lat=${lat}&lng=${lng}`).then(res => res.data),
};
