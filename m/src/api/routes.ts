import apiClient from './client';

export const routesApi = {
  getAll: (params?: Record<string, any>) => apiClient.get('/routes', { params }),
  getById: (id: string) => apiClient.get(`/routes/${id}`),
  create: (data: any) => apiClient.post('/routes', data),
  update: (id: string, data: any) => apiClient.put(`/routes/${id}`, data),
  delete: (id: string) => apiClient.delete(`/routes/${id}`),
};
