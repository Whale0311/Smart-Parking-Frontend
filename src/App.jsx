import { Routes, Route, Navigate } from 'react-router-dom'; // Bỏ import BrowserRouter
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import UserDashboard from './pages/UserDashboard';

// Component Bảo vệ
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

// Component Admin Route
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'admin') {
    return <Navigate to="/user-home" replace />;
  }
  return children;
};

function App() {
  return (
    // XÓA BrowserRouter Ở ĐÂY, CHỈ GIỮ AuthProvider
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/user-home" 
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;