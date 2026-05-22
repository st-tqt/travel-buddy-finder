import { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // Hàm helper để check token exp
  const isTokenExpired = (jwtToken) => {
    if (!jwtToken) return true;
    try {
      const payload = JSON.parse(atob(jwtToken.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  };

  useEffect(() => {
    const initializeAuth = () => {
      if (token) {
        if (isTokenExpired(token)) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        } else {
          // Nếu không có user trong localStorage nhưng token còn hạn, parse tạm từ JWT
          if (!user) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              setUser({
                id: payload.userId || payload.id || payload.sub,
                email: payload.email || "user@example.com",
                name: payload.name || "Authenticated User"
              });
            } catch {
              setUser({ id: "authenticated-user", name: "Authenticated User", email: "user@example.com" });
            }
          }
        }
      } else {
        localStorage.removeItem('user');
        setUser(null);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (email, password) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    const { accessToken, user: userData } = response.data;
    
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
  };

  const register = async (name, email, password) => {
    await axiosInstance.post('/auth/register', { name, email, password });
    // Tự động đăng nhập sau khi đăng ký thành công
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
