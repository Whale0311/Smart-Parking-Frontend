import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ParkingSquare, LogOut, Car, History, Wallet, AlertCircle } from 'lucide-react';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  
  // State cho bản đồ
  const [slots, setSlots] = useState([]);
  const [availableCount, setAvailableCount] = useState(0);
  
  // State cho thông tin cá nhân (Tự động load)
  const [myCardData, setMyCardData] = useState(null);
  const [myHistory, setMyHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Load tất cả dữ liệu khi vào trang
  useEffect(() => {
    // Hàm lấy dữ liệu bản đồ (chạy định kỳ)
    const fetchMap = async () => {
      try {
        const data = await api.getParkingSlots();
        setSlots(data);
        setAvailableCount(data.filter(s => !s.isOccupied).length);
      } catch (e) { console.error(e); }
    };

    // Hàm lấy thông tin cá nhân (chạy 1 lần)
    const fetchMyInfo = async () => {
      setLoading(true);
      try {
        // Gọi API mới: Tự lấy thẻ của tôi
        const cardRes = await api.getMyCardInfo();
        const historyRes = await api.getMyCardHistory();
        
        setMyCardData(cardRes.data);
        setMyHistory(historyRes.data || []);
      } catch (error) {
        console.error(error);
        setErrorMsg("Bạn chưa liên kết thẻ xe nào hoặc lỗi hệ thống.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyInfo(); // Gọi ngay khi mount
    fetchMap();
    
    const interval = setInterval(fetchMap, 3000); // Cập nhật map mỗi 3s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Car className="text-blue-600" />
            <div>
                <h1 className="font-bold text-gray-800 text-lg">Xin chào, {user?.name}</h1>
                <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-3 py-2 rounded border border-red-100">
            <LogOut size={18} /> Thoát
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* PHẦN 1: THÔNG TIN THẺ & VÍ (ĐÃ SỬA: Ẩn Biển số và Loại xe) */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Wallet className="text-blue-600"/> Thông tin thẻ của bạn
            </h2>

            {loading ? (
                <p className="text-gray-500">Đang tải thông tin...</p>
            ) : errorMsg ? (
                <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20}/> {errorMsg}
                </div>
            ) : (
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-blue-100 text-sm uppercase tracking-wider">Số dư khả dụng</p>
                            <p className="text-3xl font-bold mt-1">{myCardData?.balance?.toLocaleString()} đ</p>
                        </div>
                        {/* Đã xóa phần hiển thị Loại xe (Ô tô/Xe máy) ở đây */}
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-blue-100 text-xs">Chủ thẻ</p>
                            <p className="font-medium text-lg">{myCardData?.owner_name}</p>
                        </div>
                        {/* Đã xóa phần hiển thị Biển số xe ở đây */}
                    </div>
                </div>
            )}
        </div>

        {/* PHẦN 2: SƠ ĐỒ BÃI XE */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <ParkingSquare className="text-green-600"/> Trạng thái bãi đỗ
            </h2>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold text-xs">
              Trống: {availableCount}/8
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {slots.map(slot => (
              <div key={slot.slotId} className={`h-20 rounded-lg flex flex-col items-center justify-center border transition-all ${slot.isOccupied ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <span className="font-bold text-gray-500 text-sm">{slot.slotName}</span>
                {slot.isOccupied ? <Car size={20} className="text-red-500 mt-1" /> : <span className="text-green-600 text-[10px] font-bold mt-1">TRỐNG</span>}
              </div>
            ))}
          </div>
        </div>

        {/* PHẦN 3: LỊCH SỬ GIAO DỊCH */}
        {!loading && !errorMsg && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <History className="text-purple-600"/> Lịch sử hoạt động
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500">
                    <tr>
                    <th className="p-3 rounded-tl-lg">Thời gian</th>
                    <th className="p-3">Hoạt động</th>
                    <th className="p-3 text-right rounded-tr-lg">Số tiền</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {myHistory.length > 0 ? myHistory.map((h, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                        <td className="p-3 text-gray-600">
                            {new Date(h.createdAt).toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'})}
                        </td>
                        <td className="p-3">
                        <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${
                            h.type === 'RECHARGE' ? 'bg-green-100 text-green-700' : 
                            h.type === 'PAYMENT' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                            {h.type === 'RECHARGE' ? 'Nạp tiền' : h.type === 'PAYMENT' ? 'Thanh toán' : 'Gửi xe'}
                        </span>
                        </td>
                        <td className={`p-3 text-right font-mono font-bold ${h.type === 'RECHARGE' ? 'text-green-600' : 'text-red-600'}`}>
                        {h.type === 'RECHARGE' ? '+' : '-'}{h.amount?.toLocaleString()}
                        </td>
                    </tr>
                    )) : (
                    <tr><td colSpan="3" className="p-6 text-center text-gray-400 italic">Chưa có giao dịch nào</td></tr>
                    )}
                </tbody>
                </table>
            </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default UserDashboard;