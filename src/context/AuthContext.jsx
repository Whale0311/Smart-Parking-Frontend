import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Sử dụng điều hướng của Router

  useEffect(() => {
    // Kiểm tra token khi load trang
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    // Chỉ khôi phục nếu dữ liệu hợp lệ (không phải chuỗi "undefined")
    if (token && token !== "undefined" && savedUser && savedUser !== "undefined") {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch (error) {
        // Nếu lỗi parse JSON, xóa sạch để đăng nhập lại
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.login(email, password);
      
      // --- SỬA ĐỔI QUAN TRỌNG DỰA TRÊN JSON CỦA BẠN ---
      // Dữ liệu nằm trong response.data
      if (response.status === 'success' && response.data) {
          const token = response.data.token;
          const userData = response.data.user;

          // Lưu vào LocalStorage
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Cập nhật State
          setIsAuthenticated(true);
          setUser(userData);
          return { success: true };
      } else {
          return { success: false, error: response.message || "Lỗi cấu trúc phản hồi" };
      }
      // --------------------------------------------------

    } catch (error) {
      console.error("Login Error:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/'); // Điều hướng về trang login
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);