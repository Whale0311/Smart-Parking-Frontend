import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Car, ParkingSquare, LogOut, CreditCard, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const [slots, setSlots] = useState([]);
  const [stats, setStats] = useState({ total: 8, available: 8, occupied: 0 });
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchParkingSlots();
    // Poll mỗi 3 giây
    const interval = setInterval(fetchParkingSlots, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchParkingSlots = async () => {
    try {
      const data = await api.getParkingSlots();
      setSlots(data);
      
      const occupied = data.filter(s => s.isOccupied).length;
      setStats({
        total: 8,
        available: 8 - occupied,
        occupied
      });
    } catch (error) {
      console.error('Lỗi update map:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <ParkingSquare className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">Smart Parking System</h1>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                Quản lý Thẻ
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div><p className="text-gray-500 text-sm">Tổng số chỗ</p><p className="text-3xl font-bold text-gray-800">{stats.total}</p></div>
              <ParkingSquare className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div><p className="text-gray-500 text-sm">Còn trống</p><p className="text-3xl font-bold text-green-600">{stats.available}</p></div>
              <RefreshCw className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div><p className="text-gray-500 text-sm">Đã có xe</p><p className="text-3xl font-bold text-red-600">{stats.occupied}</p></div>
              <Car className="w-12 h-12 text-red-600" />
            </div>
          </div>
        </div>

        {/* Parking Map */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Bản đồ bãi đỗ (Real-time - ThingSpeak)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {slots.map((slot) => (
              <div key={slot.slotId} className={`p-6 rounded-lg border-2 transition-all ${slot.isOccupied ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}`}>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    {slot.isOccupied ? <Car className="w-12 h-12 text-red-600" /> : <ParkingSquare className="w-12 h-12 text-green-600" />}
                  </div>
                  <p className="font-bold text-lg text-gray-800">{slot.slotName}</p>
                  <p className={`text-sm font-semibold ${slot.isOccupied ? 'text-red-600' : 'text-green-600'}`}>
                    {slot.isOccupied ? 'CÓ XE' : 'TRỐNG'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;