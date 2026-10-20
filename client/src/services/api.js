/**
 * Client API Client
 * Connects to Express backend with bearer token authentication for customer and admin endpoints.
 */

const rawApiBase = import.meta.env?.VITE_API_URL || '/api';
const API_BASE = rawApiBase.endsWith('/') ? rawApiBase.slice(0, -1) : rawApiBase;

const getAuthHeaders = () => {
  // Use customer token if present, or admin token
  const token = localStorage.getItem('kandhari_customer_token') || localStorage.getItem('kandhari_admin_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const request = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...(options.headers || {})
  };

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = (cleanEndpoint.startsWith('/api') && API_BASE === '/api')
    ? cleanEndpoint
    : `${API_BASE}${cleanEndpoint.startsWith('/api') ? cleanEndpoint.replace(/^\/api/, '') : cleanEndpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    let responseData;
    if (isJson) {
      try {
        responseData = await res.json();
      } catch (jsonErr) {
        responseData = { message: 'Failed to parse JSON response from server' };
      }
    } else {
      const text = await res.text();
      // If server or CDN returned an HTML/plain text error page (e.g. 404 / 502 / 504)
      const cleanSnippet = text.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim().slice(0, 150);
      throw new Error(`Server returned HTTP ${res.status}${cleanSnippet ? `: ${cleanSnippet}` : ''}`);
    }

    if (!res.ok) {
      const errMsg = (responseData && (responseData.message || responseData.error)) 
        || `Request failed with status ${res.status}`;
      throw new Error(errMsg);
    }

    return responseData;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, error.message || error);
    throw error;
  }
};

export const api = {
  // Rental Items
  getItems: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/items${query ? `?${query}` : ''}`);
  },
  getCategories: () => request('/items/categories'),
  getItemById: (id) => request(`/items/${id}`),
  createItem: (itemData) => request('/items', { method: 'POST', body: JSON.stringify(itemData) }),
  updateItem: (id, updates) => request(`/items/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteItem: (id) => request(`/items/${id}`, { method: 'DELETE' }),

  // Enquiries & Workflow
  submitEnquiry: (enquiryData) => request('/enquiries', { method: 'POST', body: JSON.stringify(enquiryData) }),
  getEnquiries: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/enquiries${query ? `?${query}` : ''}`);
  },
  getEnquiryById: (id) => request(`/enquiries/${id}`),
  updateEnquiryStatus: (id, statusData) => request(`/enquiries/${id}/status`, { method: 'PUT', body: JSON.stringify(statusData) }),
  updateEnquiryQuotation: (id, quotationData) => request(`/enquiries/${id}/quotation`, { method: 'PUT', body: JSON.stringify(quotationData) }),
  reviewEnquiry: (id, reviewData) => request(`/enquiries/${id}/review`, { method: 'PUT', body: JSON.stringify(reviewData) }),
  acceptQuotation: (id) => request(`/enquiries/${id}/accept-quotation`, { method: 'PUT' }),
  deleteEnquiry: (id) => request(`/enquiries/${id}`, { method: 'DELETE' }),
  exportCSV: async () => {
    const res = await fetch(`${API_BASE}/enquiries/export/csv`, {
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to export CSV');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kandhari_enquiries_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },

  // Payments (Razorpay & Offline)
  createPaymentOrder: (data) => request('/payments/create-order', { method: 'POST', body: JSON.stringify(data) }),
  verifyPayment: (data) => request('/payments/verify', { method: 'POST', body: JSON.stringify(data) }),
  recordOfflinePayment: (data) => request('/payments/record-offline', { method: 'POST', body: JSON.stringify(data) }),
  getPaymentHistory: (enquiryId) => request(`/payments/history/${enquiryId}`),

  // Notifications
  getMyNotifications: () => request('/notifications/my-notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/notifications/mark-all-read', { method: 'PUT' }),

  // Venue & Lawn
  getVenue: () => request('/venue'),
  updateVenue: (venueData) => request('/venue', { method: 'PUT', body: JSON.stringify(venueData) }),
  addAmenity: (amenityData) => request('/venue/amenities', { method: 'POST', body: JSON.stringify(amenityData) }),
  deleteAmenity: (id) => request(`/venue/amenities/${id}`, { method: 'DELETE' }),

  // Gallery (8 Canonical Wedding & Event Sections)
  getGallery: (params) => {
    if (typeof params === 'string') {
      return request(`/gallery${params ? `?category=${encodeURIComponent(params)}` : ''}`);
    }
    const query = new URLSearchParams(params || {}).toString();
    return request(`/gallery${query ? `?${query}` : ''}`);
  },
  addGalleryItem: (itemData) => request('/gallery', { method: 'POST', body: JSON.stringify(itemData) }),
  updateGalleryItem: (id, updates) => request(`/gallery/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteGalleryItem: (id) => request(`/gallery/${id}`, { method: 'DELETE' }),

  // Catering Menu & Custom Enquiries
  getCateringMenu: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/catering/menu${query ? `?${query}` : ''}`);
  },
  getCateringCategories: () => request('/catering/categories'),
  getCateringPackages: () => request('/catering/packages'),
  submitCateringEnquiry: (enquiryData) => request('/catering/enquire', { method: 'POST', body: JSON.stringify(enquiryData) }),
  addCateringItem: (itemData) => request('/catering/items', { method: 'POST', body: JSON.stringify(itemData) }),
  updateCateringItem: (id, updates) => request(`/catering/items/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  generateFoodImage: (id, prompt) => request(`/catering/items/${id}/generate-image`, { method: 'POST', body: JSON.stringify({ prompt }) }),
  deleteCateringItem: (id) => request(`/catering/items/${id}`, { method: 'DELETE' }),

  // Customer Authentication & Portal
  customerRegister: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  customerLogin: (credentials) => request('/auth/customer-login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMyEnquiries: () => request('/auth/my-enquiries'),
  getMyConversations: () => request('/auth/my-conversations'),

  // Admin Auth, Dashboard Stats, Customers Registry & Reports
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  verifyAuth: () => request('/auth/verify'),
  getStats: () => request('/auth/stats'),
  getCustomers: () => request('/auth/customers'),
  getReportSummary: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/reports/summary${query ? `?${query}` : ''}`);
  },
  getReportPrintableUrl: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const cleanBase = (API_BASE === '/api') ? '/api' : API_BASE;
    return `${cleanBase}/reports/printable-html${query ? `?${query}` : ''}`;
  },
  exportReportCSV: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const cleanBase = (API_BASE === '/api') ? '/api' : API_BASE;
    const res = await fetch(`${cleanBase}/reports/export-csv${query ? `?${query}` : ''}`, {
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to export financial report CSV');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kandhari_financial_report_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },

  // Persistent AI Chat Assistant
  startChat: () => request('/chat/conversation/new', { method: 'POST' }),
  getChat: (conversationId) => request(`/chat/conversation/${conversationId}`),
  sendChatMessage: (conversationId, text) => request(`/chat/conversation/${conversationId}/message`, {
    method: 'POST',
    body: JSON.stringify({ text })
  }),
  submitChatEnquiry: (conversationId, details = {}) => request(`/chat/conversation/${conversationId}/submit`, {
    method: 'POST',
    body: JSON.stringify(details)
  })
};
