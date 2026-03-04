import api from './api';
import { Notification } from '../types/notification';

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get<Notification[]>('/notifications/');
    return response.data;
  },

  markAsRead: async (id: number): Promise<Notification> => {
    const response = await api.patch<Notification>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<{ status: string }> => {
    const response = await api.patch<{ status: string }>('/notifications/read-all');
    return response.data;
  },
};
