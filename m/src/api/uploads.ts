import apiClient from './client';

export const uploadsApi = {
  getAll: (params?: Record<string, any>) => apiClient.get('/uploads', { params }),
  getById: (id: string) => apiClient.get(`/uploads/${id}`),
  delete: (id: string) => apiClient.delete(`/uploads/${id}`),
};
