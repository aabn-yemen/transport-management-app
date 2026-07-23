import apiClient from './client';

export const tripsApi = {
  getAll: (params?: Record<string, any>) => apiClient.get('/trips', { params }),
  getById: (id: string) => apiClient.get(`/trips/${id}`),
  create: (data: any) => apiClient.post('/trips', data),
  update: (id: string, data: any) => apiClient.put(`/trips/${id}`, data),
  delete: (id: string) => apiClient.delete(`/trips/${id}`),
  startTrip: (id: string) => apiClient.post(`/trips/${id}/start`),
  endTrip: (id: string) => apiClient.post(`/trips/${id}/end`),
};
