import apiClient from './client';

export const fuelApi = {
  getAll: (params?: Record<string, any>) => apiClient.get('/fuel', { params }),
  getById: (id: string) => apiClient.get(`/fuel/${id}`),
  create: (data: any) => apiClient.post('/fuel', data),
  update: (id: string, data: any) => apiClient.put(`/fuel/${id}`, data),
  delete: (id: string) => apiClient.delete(`/fuel/${id}`),
  getStatistics: (params?: Record<string, any>) => apiClient.get('/fuel/statistics', { params }),
};
