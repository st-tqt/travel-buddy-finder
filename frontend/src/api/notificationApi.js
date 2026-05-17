import axiosInstance from './axiosInstance';

export const notificationApi = {
  getNotifications: (userId, params) => axiosInstance.get(`/notifications/${userId}`, { params }),
  getUnreadCount: (userId) => axiosInstance.get(`/notifications/${userId}/unread-count`),
  markAsRead: (id) => axiosInstance.put(`/notifications/${id}/read`),
  markAllAsRead: () => axiosInstance.put('/notifications/read-all'),
};
