import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Trash2, Search, Plus, DollarSign, Users, ArrowLeft, List, 
  ArrowUpDown, X, User, Calendar, Mail, Shield 
} from 'lucide-react';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('register');

  // --- STATE CHO CÁC FORM ---
  // Hardcode mặc định license_plate và vehicle_type như yêu cầu cũ
  const [cardForm, setCardForm] = useState({
    card_id: '', 
    owner_name: '', 
    email: '', 
    license_plate: '30A-99999', 
    vehicle_type: 'car',       
    initial_balance: 0
  });

  const [rechargeForm, setRechargeForm] = useState({ card_id: '', amount: 0 });
  const [userForm, setUserForm] = useState({
    user_id: '', name: '', email: '', password: '', role: 'user'
  });
  
  // --- STATE CHO TRA CỨU ---
  const [searchCardId, setSearchCardId] = useState('');
  const [cardDetails, setCardDetails] = useState(null);
  const [cardHistory, setCardHistory] = useState([]);

  // --- STATE CHO DANH SÁCH USER (MỚI) ---
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [selectedUser, setSelectedUser] = useState(null); 

  // --- EFFECT: TỰ ĐỘNG LOAD USER KHI VÀO TAB LIST ---
  useEffect(() => {
    if (activeTab === 'list_users') {
        handleFetchUsers();
    }
  }, [activeTab]);

  // --- HÀM XỬ LÝ: USER LIST ---
  const handleFetchUsers = async () => {
    setLoadingUsers(true);
    try {
        const res = await api.getAllUsers();
        setUsersList(res.data || []); 
    } catch (error) {
        alert('Lỗi lấy danh sách user: ' + error.message);
    } finally {
        setLoadingUsers(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = [...usersList].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleDeleteUser = async (e, userId) => {
    e.stopPropagation(); 
    if (!window.confirm(`CẢNH BÁO: Bạn có chắc muốn xóa User ${userId}?\nHành động này không thể hoàn tác!`)) return;

    try {
      await api.deleteUser(userId);
      alert('Đã xóa người dùng thành công!');
      if (selectedUser?.user_id === userId) setSelectedUser(null); // Đóng modal nếu đang mở user đó
      handleFetchUsers(); 
    } catch (error) {
      alert('Lỗi xóa user: ' + error.message);
    }
  };

  // --- CÁC HÀM XỬ LÝ CŨ ---
  // 1. ĐĂNG KÝ THẺ
  const handleRegisterCard = async (e) => {
    e.preventDefault();
    try {
      await api.registerCard(cardForm);
      alert('Đăng ký thẻ thành công!');
      setCardForm({ 
        card_id: '', 
        owner_name: '', 
        email: '',
        license_plate: '30A-99999', 
        vehicle_type: 'car', 
        initial_balance: 0 
      });
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  // 2. TẠO USER
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.createUser(userForm);
      alert(`Tạo tài khoản ${userForm.role.toUpperCase()} thành công!`);
      setUserForm({ user_id: '', name: '', email: '', password: '', role: 'user' });
      if (activeTab === 'list_users') handleFetchUsers();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  // 3. NẠP TIỀN
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

  // 4. TRA CỨU
  const handleSearchCard = async () => {
    if (!searchCardId.trim()) { alert('Vui lòng nhập mã thẻ'); return; }
    try {
      const detailsRes = await api.getCardDetails(searchCardId);
      const historyRes = await api.getCardHistory(searchCardId);
      setCardDetails(detailsRes.data);
      setCardHistory(historyRes.data || []);
    } catch (error) {
      alert('Không tìm thấy thẻ: ' + error.message);
      setCardDetails(null);
      setCardHistory([]);
    }
  };

  // 5. XÓA THẺ
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
    <div className="min-h-screen bg-gray-50 relative">
      
      {/* --- MODAL CHI TIẾT USER (Popup) --- */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            {/* Modal Header */}
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <User className="w-5 h-5"/> Chi tiết Người dùng
              </h3>
              <button onClick={() => setSelectedUser(null)} className="hover:bg-blue-700 p-1 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-800">{selectedUser.name}</h4>
                  <p className="text-gray-500 text-sm">{selectedUser.user_id}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span>{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <span className={`px-2 py-0.5 rounded text-sm font-bold ${selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {selectedUser.role.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span>Ngày tạo: {new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                 <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span>Cập nhật cuối: {new Date(selectedUser.updatedAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
               <button 
                onClick={(e) => { handleDeleteUser(e, selectedUser.user_id); }}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium flex items-center gap-2"
              >
                <Trash2 size={18}/> Xóa User này
              </button>
              <button 
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Navigation Tabs */}
          <div className="border-b">
            <div className="flex overflow-x-auto">
              {[
                { id: 'register', label: 'Đăng ký Thẻ', icon: Plus },
                { id: 'users', label: 'Tạo User', icon: Users },
                { id: 'list_users', label: 'DS User', icon: List },
                { id: 'recharge', label: 'Nạp tiền', icon: DollarSign },
                { id: 'search', label: 'Tra cứu', icon: Search },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center px-6 py-4 font-semibold transition-colors min-w-[140px] whitespace-nowrap ${
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

          <div className="p-6">
            {/* TAB 1: ĐĂNG KÝ THẺ (ĐÃ KHÔI PHỤC FULL) */}
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
                    {/* Đã ẩn Biển số và Loại xe nhưng vẫn giữ Logic trong State */}
                    <div className="md:col-span-2"> 
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
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số dư ban đầu (VNĐ)</label>
                  <input type="number" value={cardForm.initial_balance} onChange={(e) => setCardForm({...cardForm, initial_balance: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">Đăng ký Thẻ</button>
              </form>
            )}

            {/* TAB 2: TẠO USER (ĐÃ KHÔI PHỤC FULL) */}
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

            {/* TAB 3: DANH SÁCH USER (FULL TÍNH NĂNG MỚI) */}
            {activeTab === 'list_users' && (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-700">Danh sách Người dùng ({usersList.length})</h3>
                        <div className="flex gap-2">
                             <button onClick={handleFetchUsers} className="text-sm text-blue-600 hover:underline font-bold border border-blue-200 px-3 py-1 rounded bg-blue-50">Làm mới</button>
                        </div>
                    </div>

                    {loadingUsers ? (
                        <p className="text-center py-4 text-gray-500">Đang tải dữ liệu...</p>
                    ) : (
                        <div className="border rounded-lg overflow-hidden shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 text-gray-600 font-bold uppercase">
                                    <tr>
                                        <th onClick={() => handleSort('user_id')} className="px-4 py-3 cursor-pointer hover:bg-gray-200 select-none transition-colors">
                                            <div className="flex items-center gap-1">User ID <ArrowUpDown size={14} className={sortConfig.key==='user_id' ? 'text-blue-600' : 'text-gray-400'}/></div>
                                        </th>
                                        <th onClick={() => handleSort('name')} className="px-4 py-3 cursor-pointer hover:bg-gray-200 select-none transition-colors">
                                            <div className="flex items-center gap-1">Họ tên <ArrowUpDown size={14} className={sortConfig.key==='name' ? 'text-blue-600' : 'text-gray-400'}/></div>
                                        </th>
                                        <th className="px-4 py-3">Email</th>
                                        <th onClick={() => handleSort('role')} className="px-4 py-3 cursor-pointer hover:bg-gray-200 select-none transition-colors">
                                            <div className="flex items-center gap-1">Vai trò <ArrowUpDown size={14} className={sortConfig.key==='role' ? 'text-blue-600' : 'text-gray-400'}/></div>
                                        </th>
                                        <th className="px-4 py-3 text-center">Xóa</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {sortedUsers.length > 0 ? sortedUsers.map((u) => (
                                        <tr 
                                            key={u._id} 
                                            onClick={() => setSelectedUser(u)}
                                            className="hover:bg-blue-50 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-4 py-3 font-medium text-gray-900">{u.user_id}</td>
                                            <td className="px-4 py-3 font-semibold text-gray-700 group-hover:text-blue-700">{u.name}</td>
                                            <td className="px-4 py-3 text-gray-500">{u.email}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                    u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {u.role ? u.role.toUpperCase() : 'USER'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button 
                                                    onClick={(e) => handleDeleteUser(e, u.user_id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                                    title="Xóa người dùng vĩnh viễn"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="px-4 py-6 text-center text-gray-500 italic">Trống.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 4: NẠP TIỀN (ĐÃ KHÔI PHỤC FULL) */}
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

            {/* TAB 5: TRA CỨU (ĐÃ KHÔI PHỤC FULL - ẨN BIỂN SỐ/LOẠI XE) */}
            {activeTab === 'search' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchCardId}
                    onChange={(e) => setSearchCardId(e.target.value)}
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
                          {/* Đã ẩn dòng Biển số và Loại xe theo yêu cầu */}
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