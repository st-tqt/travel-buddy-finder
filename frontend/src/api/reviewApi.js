import axiosInstance from './axiosInstance';

export const reviewApi = {
  createReview: (data) => axiosInstance.post('/reviews', data),
  getReviewsByUser: (userId) => axiosInstance.get(`/reviews/user/${userId}`),
};
