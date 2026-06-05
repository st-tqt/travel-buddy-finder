import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: (() => {
    const base = import.meta.env.VITE_API_URL || '/api';
    return base.endsWith('/api') ? base : `${base}/api`;
  })(),
  timeout: 10000,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Xóa token và redirect về login nếu lỗi 401
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    // Throw error để component gọi API tự xử lý
    return Promise.reject(error);
  }
);

export default axiosInstance;
