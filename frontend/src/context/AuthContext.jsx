import { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // Hàm helper để check token exp (nếu JWT hợp lệ)
  const isTokenExpired = (jwtToken) => {
    if (!jwtToken) return true;
    try {
      const payload = JSON.parse(atob(jwtToken.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return true;
      }
      return false;
    } catch (e) {
      return false; // Trả về false nếu là token mock (không parse được exp)
    }
  };

  useEffect(() => {
    const initializeAuth = () => {
      if (token) {
        if (isTokenExpired(token)) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        } else {
          // Trong thực tế sẽ gọi API lấy thông tin user dựa trên token.
          // Tạm thời set user mẫu để duy trì trạng thái đăng nhập.
          setUser({ name: "Authenticated User", email: "user@example.com" });
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (email, password) => {
    const response = await axiosInstance.post('/api/auth/login', { email, password });
    const { accessToken, user: userData } = response.data;
    
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
    setUser(userData);
  };

  const register = async (name, email, password) => {
    await axiosInstance.post('/api/auth/register', { name, email, password });
    // Tự động đăng nhập sau khi đăng ký thành công
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    register,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
