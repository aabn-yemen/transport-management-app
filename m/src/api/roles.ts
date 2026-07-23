import apiClient from './client';

export const rolesApi = {
  getAll: (params?: Record<string, any>) => apiClient.get('/roles', { params }),
  getById: (id: string) => apiClient.get(`/roles/${id}`),
  create: (data: any) => apiClient.post('/roles', data),
  update: (id: string, data: any) => apiClient.put(`/roles/${id}`, data),
  delete: (id: string) => apiClient.delete(`/roles/${id}`),
  assignPermissions: (id: string, permissions: string[]) => apiClient.put(`/roles/${id}/permissions`, { permissions }),
};
