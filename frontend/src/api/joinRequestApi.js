import axiosInstance from './axiosInstance';

export const joinRequestApi = {
  sendJoinRequest: (tripId) => axiosInstance.post('/join-requests', { tripId }),
  approveRequest: (id) => axiosInstance.put(`/join-requests/${id}/approve`),
  rejectRequest: (id) => axiosInstance.put(`/join-requests/${id}/reject`),
  getRequestsByTrip: (tripId) => axiosInstance.get(`/join-requests`, { params: { tripId } }),
  getMyRequests: (params) => axiosInstance.get('/join-requests/my', { params }),
  cancelRequest: (id) => axiosInstance.delete(`/join-requests/${id}`),
  removeMember: (id) => axiosInstance.post(`/join-requests/${id}/remove`),
  leaveTrip: (tripId) => axiosInstance.post(`/join-requests/trips/${tripId}/leave`),
  getTripMembers: (tripId) => axiosInstance.get(`/join-requests/trips/${tripId}/members`),
};
