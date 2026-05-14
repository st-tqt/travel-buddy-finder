import axiosInstance from './axiosInstance';

export const reviewApi = {
  getReviewsForUser: async (userId) => {
    const response = await axiosInstance.get(`/api/reviews?userId=${userId}`);
    return response.data;
  },
  createReview: async (reviewData) => {
    const response = await axiosInstance.post('/api/reviews', reviewData);
    return response.data;
  }
};
