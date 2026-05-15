import axiosInstance from './axiosInstance';

export const tripApi = {
  getAllTrips: async () => {
    const response = await axiosInstance.get('/api/trips');
    return response.data;
  },
  getTripById: async (id) => {
    const response = await axiosInstance.get(`/api/trips/${id}`);
    return response.data;
  },
  createTrip: async (tripData) => {
    const response = await axiosInstance.post('/api/trips', tripData);
    return response.data;
  }
};
