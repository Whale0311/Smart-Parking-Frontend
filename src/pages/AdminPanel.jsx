import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Trash2, Search, Plus, DollarSign, Users, ArrowLeft } from 'lucide-react';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('register');

  // --- STATE CHO CÁC FORM ---
  const [cardForm, setCardForm] = useState({
    card_id: '', owner_name: '', email: '', license_plate: '', vehicle_type: 'motorbike', initial_balance: 0
  });
  const [rechargeForm, setRechargeForm] = useState({ card_id: '', amount: 0 });
  const [userForm, setUserForm] = useState({
    user_id: '', name: '', email: '', password: '', role: 'user'
  });
  
  // --- STATE CHO TRA CỨU ---
  const [searchCardId, setSearchCardId] = useState('');
  const [cardDetails, setCardDetails] = useState(null);
  const [cardHistory, setCardHistory] = useState([]);

  // 1. XỬ LÝ ĐĂNG KÝ THẺ
  const handleRegisterCard = async (e) => {
    e.preventDefault();
    try {
      await api.registerCard(cardForm);
      alert('Đăng ký thẻ thành công!');
      setCardForm({ card_id: '', owner_name: '', license_plate: '', vehicle_type: 'motorbike', initial_balance: 0 });
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  // 2. XỬ LÝ TẠO USER
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.createUser(userForm);
      alert(`Tạo tài khoản ${userForm.role.toUpperCase()} thành công!`);
      setUserForm({ user_id: '', name: '', email: '', password: '', role: 'user' });
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  // 3. XỬ LÝ NẠP TIỀN
  const handleRecharge = async (e) => {
    e.preventDefault();
    try {
      await api.rechargeCard(rechargeForm.card_id, rechargeForm.amount);
      alert('Nạp tiền thành công!');
      setRechargeForm({ card_id: '', amount: 0 });
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  // 4. XỬ LÝ TRA CỨU (ĐÃ SỬA LỖI HIỂN THỊ)
  const handleSearchCard = async () => {
    if (!searchCardId.trim()) {
      alert('Vui lòng nhập mã thẻ');
      return;
    }
    
    try {
      const detailsRes = await api.getCardDetails(searchCardId);
      const historyRes = await api.getCardHistory(searchCardId);
      
      // Sửa lỗi: Lấy dữ liệu từ .data
      setCardDetails(detailsRes.data);
      setCardHistory(historyRes.data || []);
    } catch (error) {
      alert('Không tìm thấy thẻ: ' + error.message);
      setCardDetails(null);
      setCardHistory([]);
    }
  };

  // 5. XỬ LÝ XÓA THẺ
  const handleDeleteCard = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa thẻ này?')) return;
    try {
      await api.deleteCard(searchCardId);
      alert('Xóa thẻ thành công!');
      setCardDetails(null);
      setCardHistory([]);
      setSearchCardId('');
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Quản trị Hệ thống</h1>
            </div>
            <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Về Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Navigation Tabs */}
          <div className="border-b">
            <div className="flex overflow-x-auto">
              {[
                { id: 'register', label: 'Đăng ký Thẻ', icon: Plus },
                { id: 'users', label: 'Tạo User', icon: Users },
                { id: 'recharge', label: 'Nạp tiền', icon: DollarSign },
                { id: 'search', label: 'Tra cứu', icon: Search },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center px-6 py-4 font-semibold transition-colors min-w-[140px] ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* TAB 1: ĐĂNG KÝ THẺ */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterCard} className="space-y-4 animate-fade-in">
                <h3 className="text-lg font-bold text-gray-700 mb-4">Đăng ký thẻ xe mới</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã thẻ</label>
                        <input type="text" value={cardForm.card_id} onChange={(e) => setCardForm({...cardForm, card_id: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên chủ thẻ</label>
                        <input type="text" value={cardForm.owner_name} onChange={(e) => setCardForm({...cardForm, owner_name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email tài khoản (Để liên kết)</label>
                        <input 
                        type="email" 
                        value={cardForm.email} 
                        onChange={(e) => setCardForm({...cardForm, email: e.target.value})} 
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        placeholder="Nhập email người dùng..."
                        required 
                        />
                        </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Biển số xe</label>
                        <input type="text" value={cardForm.license_plate} onChange={(e) => setCardForm({...cardForm, license_plate: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Loại xe</label>
                        <select value={cardForm.vehicle_type} onChange={(e) => setCardForm({...cardForm, vehicle_type: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="motorbike">Xe máy</option>
                            <option value="car">Ô tô</option>
                        </select>
                    </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số dư ban đầu (VNĐ)</label>
                  <input type="number" value={cardForm.initial_balance} onChange={(e) => setCardForm({...cardForm, initial_balance: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">Đăng ký Thẻ</button>
              </form>
            )}

            {/* TAB 2: TẠO USER */}
            {activeTab === 'users' && (
              <form onSubmit={handleCreateUser} className="space-y-4 animate-fade-in">
                <h3 className="text-lg font-bold text-gray-700 mb-4">Tạo tài khoản hệ thống</h3>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">User ID (Mã nhân viên/SV)</label>
                        <input type="text" value={userForm.user_id} onChange={(e) => setUserForm({...userForm, user_id: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: ADMIN_02" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên hiển thị</label>
                        <input type="text" value={userForm.name} onChange={(e) => setUserForm({...userForm, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email đăng nhập</label>
                        <input type="email" value={userForm.email} onChange={(e) => setUserForm({...userForm, email: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                        <input type="password" value={userForm.password} onChange={(e) => setUserForm({...userForm, password: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                        <select value={userForm.role} onChange={(e) => setUserForm({...userForm, role: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="user">User (Thường)</option>
                            <option value="admin">Admin (Quản trị)</option>
                        </select>
                    </div>
                </div>
                <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors">Tạo Người dùng</button>
              </form>
            )}

            {/* TAB 3: NẠP TIỀN */}
            {activeTab === 'recharge' && (
              <form onSubmit={handleRecharge} className="space-y-6 animate-fade-in text-center">
                <div className="bg-green-50 p-4 rounded-full inline-block mb-2">
                    <DollarSign size={40} className="text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-green-700">Nạp tiền vào tài khoản</h3>
                
                <div className="text-left space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã thẻ cần nạp</label>
                        <input type="text" value={rechargeForm.card_id} onChange={(e) => setRechargeForm({...rechargeForm, card_id: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-lg" placeholder="Nhập mã thẻ..." required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền (VNĐ)</label>
                        <input type="number" value={rechargeForm.amount} onChange={(e) => setRechargeForm({...rechargeForm, amount: Number(e.target.value)})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-lg font-bold text-green-700" placeholder="0" required />
                    </div>
                </div>
                <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors text-lg">Xác nhận Nạp tiền</button>
              </form>
            )}

            {/* TAB 4: TRA CỨU */}
            {activeTab === 'search' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchCardId}
                    onChange={(e) => setSearchCardId(e.target.value)}
                    // Sửa lỗi: Thêm sự kiện Enter
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchCard()}
                    placeholder="Nhập mã thẻ..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                  />
                  <button onClick={handleSearchCard} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Search className="w-6 h-6" />
                  </button>
                </div>

                {cardDetails && (
                  <div className="space-y-6">
                    {/* Thông tin thẻ */}
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                      <h3 className="font-bold text-xl text-blue-800 mb-4 border-b border-blue-200 pb-2">Thông tin thẻ</h3>
                      <div className="grid grid-cols-2 gap-4 text-gray-700">
                          <p>Chủ thẻ: <span className="font-bold text-black">{cardDetails.owner_name}</span></p>
                          <p>Biển số: <span className="font-bold text-black">{cardDetails.license_plate}</span></p>
                          <p>Loại xe: <span className="font-semibold">{cardDetails.vehicle_type}</span></p>
                          <p>Trạng thái: <span className={`font-bold ${cardDetails.is_active ? 'text-green-600' : 'text-red-600'}`}>{cardDetails.is_active ? 'Đang hoạt động' : 'Đã khóa'}</span></p>
                          <p className="col-span-2 mt-2 text-lg">Số dư: <span className="font-bold text-green-700 text-2xl">{cardDetails.balance?.toLocaleString()} VNĐ</span></p>
                      </div>
                    </div>

                    {/* Lịch sử giao dịch */}
                    <div>
                        <h3 className="font-bold text-lg text-gray-700 mb-3">Lịch sử giao dịch gần đây</h3>
                        {cardHistory.length > 0 ? (
                            <div className="border rounded-lg overflow-hidden shadow-sm">
                                <table className="w-full">
                                <thead className="bg-gray-100 text-gray-600">
                                    <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold uppercase">Thời gian</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold uppercase">Loại</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold uppercase">Số tiền</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {cardHistory.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        {/* Sửa lỗi Invalid Date */}
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                item.type === 'RECHARGE' ? 'bg-green-100 text-green-800' : 
                                                item.type === 'PAYMENT' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className={`px-4 py-3 text-sm text-right font-mono font-bold ${item.type === 'RECHARGE' ? 'text-green-600' : 'text-red-600'}`}>
                                            {item.type === 'RECHARGE' ? '+' : '-'}{item.amount?.toLocaleString()}
                                        </td>
                                    </tr>
                                    ))}
                                </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 italic py-4">Chưa có giao dịch nào.</p>
                        )}
                    </div>

                    <div className="flex justify-end pt-4">
                        <button onClick={handleDeleteCard} className="flex items-center gap-2 px-5 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold">
                            <Trash2 className="w-5 h-5" /> Xóa thẻ vĩnh viễn
                        </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;