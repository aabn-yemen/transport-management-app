import apiClient from './client';

export const reportsApi = {
  getDashboard: () => apiClient.get('/dashboard/stats'),
  getStudents: (params?: Record<string, any>) => apiClient.get('/reports/students', { params }),
  getDrivers: (params?: Record<string, any>) => apiClient.get('/reports/drivers', { params }),
  getBuses: (params?: Record<string, any>) => apiClient.get('/reports/buses', { params }),
  getAttendance: (params?: Record<string, any>) => apiClient.get('/reports/attendance', { params }),
  getSubscriptions: (params?: Record<string, any>) => apiClient.get('/reports/subscriptions', { params }),
  getMaintenance: (params?: Record<string, any>) => apiClient.get('/reports/maintenance', { params }),
  getFuel: (params?: Record<string, any>) => apiClient.get('/reports/fuel', { params }),
  getFinancial: (params?: Record<string, any>) => apiClient.get('/reports/financial', { params }),
  exportPdf: (type: string, params?: Record<string, any>) => apiClient.get('/reports/export/pdf', { params: { ...params, type }, responseType: 'blob' }),
  exportExcel: (type: string, params?: Record<string, any>) => apiClient.get('/reports/export/excel', { params: { ...params, type }, responseType: 'blob' }),
};
