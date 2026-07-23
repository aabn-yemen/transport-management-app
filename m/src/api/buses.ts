import apiClient from './client';

export const busesApi = {
  getAll: (params?: Record<string, any>) => apiClient.get('/buses', { params }),
  getById: (id: string) => apiClient.get(`/buses/${id}`),
  create: (data: any) => apiClient.post('/buses', data),
  update: (id: string, data: any) => apiClient.put(`/buses/${id}`, data),
  delete: (id: string) => apiClient.delete(`/buses/${id}`),
};
