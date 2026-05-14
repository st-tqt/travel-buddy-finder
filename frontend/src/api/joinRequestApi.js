import axiosInstance from './axiosInstance';

export const joinRequestApi = {
  getRequestsForTrip: async (tripId) => {
    const response = await axiosInstance.get(`/api/join-requests?tripId=${tripId}`);
    return response.data;
  },
  createRequest: async (requestData) => {
    const response = await axiosInstance.post('/api/join-requests', requestData);
    return response.data;
  }
};
