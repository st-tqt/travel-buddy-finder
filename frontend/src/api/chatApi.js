import axiosInstance from './axiosInstance';

export const chatApi = {
  getMessages: (tripId, params) => axiosInstance.get(`/messages`, { params: { tripId, ...params } }),
};
