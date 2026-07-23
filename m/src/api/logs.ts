import apiClient from './client';

export const logsApi = {
  getActivity: (params?: Record<string, any>) => apiClient.get('/logs/activity', { params }),
  getAudit: (params?: Record<string, any>) => apiClient.get('/logs/audit', { params }),
};
