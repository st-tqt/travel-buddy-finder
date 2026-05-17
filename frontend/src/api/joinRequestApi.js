import axiosInstance from './axiosInstance';

export const joinRequestApi = {
  sendJoinRequest: (tripId) => axiosInstance.post('/join-requests', { tripId }),
  approveRequest: (id) => axiosInstance.put(`/join-requests/${id}/approve`),
  rejectRequest: (id) => axiosInstance.put(`/join-requests/${id}/reject`),
  getRequestsByTrip: (tripId) => axiosInstance.get(`/join-requests`, { params: { tripId } }),
  getMyRequests: (params) => axiosInstance.get('/join-requests/my', { params }),
  cancelRequest: (id) => axiosInstance.delete(`/join-requests/${id}`),
};
