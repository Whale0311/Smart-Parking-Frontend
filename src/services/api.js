const API_BASE_URL = 'http://localhost:3000';
const THINGSPEAK_URL = 'https://api.thingspeak.com/channels/3122919/feeds/last.json?api_key=QX1T5U4DAF75TNQ2';

const apiClient = {
  request: async (method, url, data = null, requiresAuth = false) => {
    const headers = { 'Content-Type': 'application/json' };
    
    if (requiresAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn("Cảnh báo: Request cần Auth nhưng không tìm thấy Token!");
      }
    }

    const config = { method, headers };
    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, config);
      
      const isLoginRequest = url.includes('/login');

      // tự động logout/reload nếu KHÔNG PHẢI là đang đăng nhập
      if ((response.status === 401 || response.status === 403) && !isLoginRequest) {
        console.error(`Lỗi Auth (${response.status}): Token không hợp lệ.`);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        throw new Error('Phiên đăng nhập hết hạn.');
      }
      // --------------------

      const result = await response.json();
      
      if (!response.ok) {
          throw new Error(result.message || 'Request failed');
      }
      
      return result;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  get: (url, auth = false) => apiClient.request('GET', url, null, auth),
  post: (url, data, auth = false) => apiClient.request('POST', url, data, auth),
  delete: (url, auth = false) => apiClient.request('DELETE', url, null, auth),
};

export const api = {
  // Auth
  login: (email, password) => apiClient.post('/auth/login', { email, password }, false),  
  // ThingSpeak - Lấy dữ liệu cảm biến
  getParkingSlots: async () => {
    try {
      const response = await fetch(THINGSPEAK_URL);
      const data = await response.json();
      
      // Map field1..field8 sang slot
      return Array.from({ length: 8 }, (_, i) => ({
        slotId: i + 1,
        slotName: `LOT ${String.fromCharCode(65 + i)}`, // A, B, C...
        // ThingSpeak trả về chuỗi "1" là có xe
        isOccupied: data[`field${i + 1}`] === "1" || data[`field${i + 1}`] === 1
      }));
    } catch (error) {
      console.error("Lỗi ThingSpeak:", error);
      // Trả về mảng rỗng để không crash giao diện
      return Array.from({ length: 8 }, (_, i) => ({
        slotId: i + 1,
        slotName: `LOT ${String.fromCharCode(65 + i)}`,
        isOccupied: false
      }));
    }
  },
  
  // Admin - Quản lý thẻ (Yêu cầu Auth = true)
  registerCard: (cardData) => apiClient.post('/admin/cards', cardData, true),
  rechargeCard: (cardId, amount) => apiClient.post(`/admin/cards/${cardId}/recharge`, { amount }, true),
  getCardDetails: (cardId) => apiClient.get(`/admin/cards/${cardId}`, true),
  getCardHistory: (cardId) => apiClient.get(`/admin/cards/${cardId}/history`, true),
  deleteCard: (cardId) => apiClient.delete(`/admin/cards/${cardId}`, true),
  createUser: (userData) => apiClient.post('/admin/create_user', userData, true),
  getMyCardInfo: () => apiClient.get('/api/user/my-card', true),
  getMyCardHistory: () => apiClient.get('/api/user/my-history', true),
};