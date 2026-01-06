import { useState, useEffect } from 'react'; // Thêm useEffect
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ParkingSquare } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('admin1@gmail.com');
  const [password, setPassword] = useState('123456789');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth(); // Lấy thêm isAuthenticated và user
  const navigate = useNavigate();

  // Nếu đã login rồi thì tự chuyển trang (tránh việc user F5 lại bị kẹt ở login)
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/dashboard');
      else navigate('/user-home');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // Lấy role trực tiếp từ local storage để điều hướng ngay lập tức
      const savedUser = localStorage.getItem('user');
      const userRole = savedUser ? JSON.parse(savedUser).role : 'user';
      
      if (userRole === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/user-home'); // <-- BỎ COMMENT DÒNG NÀY
      }
    } else {
      setError(result.error || 'Đăng nhập thất bại');
    }
  };

  return (
    // ... (Phần giao diện giữ nguyên như cũ)
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <ParkingSquare className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Smart Parking</h1>
          <p className="text-gray-500 mt-2">Đăng nhập hệ thống</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;