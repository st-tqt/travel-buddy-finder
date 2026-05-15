import axiosInstance from './axiosInstance';

export const notificationApi = {
  getUserNotifications: async (userId) => {
    const response = await axiosInstance.get(`/api/notifications/${userId}`);
    return response.data;
  }
};
