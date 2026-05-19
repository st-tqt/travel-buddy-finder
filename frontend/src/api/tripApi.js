import axiosInstance from './axiosInstance';

export const tripApi = {
  getTrips: (params) => axiosInstance.get('/trips', { params }),
  getTripById: (id) => axiosInstance.get(`/trips/${id}`),
  createTrip: (data) => axiosInstance.post('/trips', data),
  updateTrip: (id, data) => axiosInstance.put(`/trips/${id}`, data),
  deleteTrip: (id) => axiosInstance.delete(`/trips/${id}`),
  getMyTrips: (params) => axiosInstance.get('/trips/my', { params }),
};
