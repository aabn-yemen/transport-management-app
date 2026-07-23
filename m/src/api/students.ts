import apiClient from './client';

export const studentsApi = {
  getAll: (params?: Record<string, any>) => apiClient.get('/students', { params }),
  getMe: () => apiClient.get('/students/me'),
  getMyAttendance: () => apiClient.get('/students/me/attendance'),
  getMyTrips: () => apiClient.get('/students/me/trips'),
  getById: (id: string) => apiClient.get(`/students/${id}`),
  create: (data: any) => apiClient.post('/students', data),
  update: (id: string, data: any) => apiClient.put(`/students/${id}`, data),
  delete: (id: string) => apiClient.delete(`/students/${id}`),
};
