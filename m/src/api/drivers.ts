import apiClient from './client';

export const driversApi = {
  getAll: (params?: Record<string, any>) => apiClient.get('/drivers', { params }),
  getMe: () => apiClient.get('/drivers/me'),
  getMyTrips: (params?: Record<string, any>) => apiClient.get('/drivers/me/trips', { params }),
  getMyActiveTrip: () => apiClient.get('/drivers/me/active-trip'),
  getById: (id: string) => apiClient.get(`/drivers/${id}`),
  create: (data: any) => apiClient.post('/drivers', data),
  update: (id: string, data: any) => apiClient.put(`/drivers/${id}`, data),
  delete: (id: string) => apiClient.delete(`/drivers/${id}`),
};
