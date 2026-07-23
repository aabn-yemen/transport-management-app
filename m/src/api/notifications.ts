import apiClient from './client';

export const notificationsApi = {
  getAll: (params?: Record<string, any>) => apiClient.get('/notifications', { params }),
  markRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () => apiClient.patch('/notifications/read-all'),
  getUnreadCount: () => apiClient.get('/notifications/unread-count'),
  delete: (id: string) => apiClient.delete(`/notifications/${id}`),
};
