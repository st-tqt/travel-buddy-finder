import axiosInstance from './axiosInstance';

export const chatApi = {
  getMessagesForTrip: async (tripId) => {
    const response = await axiosInstance.get(`/api/chats/${tripId}/messages`);
    return response.data;
  }
};
