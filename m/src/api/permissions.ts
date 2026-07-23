import apiClient from './client';

export const permissionsApi = {
  getAll: (params?: Record<string, any>) => apiClient.get('/permissions', { params }),
  getById: (id: string) => apiClient.get(`/permissions/${id}`),
  create: (data: any) => apiClient.post('/permissions', data),
  update: (id: string, data: any) => apiClient.put(`/permissions/${id}`, data),
  delete: (id: string) => apiClient.delete(`/permissions/${id}`),
};
