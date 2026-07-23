import apiClient from './client';

export const destinationsApi = {
  getAll: (params?: Record<string, any>) => apiClient.get('/destinations', { params }),
  getById: (id: string) => apiClient.get(`/destinations/${id}`),
  create: (data: any) => apiClient.post('/destinations', data),
  update: (id: string, data: any) => apiClient.put(`/destinations/${id}`, data),
  delete: (id: string) => apiClient.delete(`/destinations/${id}`),
};
