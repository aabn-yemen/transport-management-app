import apiClient from './client';

export const attendanceApi = {
  getAll: (params?: Record<string, any>) => apiClient.get('/attendance', { params }),
  getById: (id: string) => apiClient.get(`/attendance/${id}`),
  create: (data: any) => apiClient.post('/attendance', data),
  update: (id: string, data: any) => apiClient.put(`/attendance/${id}`, data),
  delete: (id: string) => apiClient.delete(`/attendance/${id}`),
  checkIn: (data: any) => apiClient.post('/attendance/check-in', data),
  checkOut: (data: any) => apiClient.post('/attendance/check-out', data),
};
