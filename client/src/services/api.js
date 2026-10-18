/**
 * Client API Client
 * Connects to Express backend with bearer token authentication for customer and admin endpoints.
 */

const API_BASE = '/api';

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

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, error);
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

  // Enquiries
  submitEnquiry: (enquiryData) => request('/enquiries', { method: 'POST', body: JSON.stringify(enquiryData) }),
  getEnquiries: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/enquiries${query ? `?${query}` : ''}`);
  },
  updateEnquiryStatus: (id, statusData) => request(`/enquiries/${id}/status`, { method: 'PUT', body: JSON.stringify(statusData) }),
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

  // Venue & Lawn
  getVenue: () => request('/venue'),
  updateVenue: (venueData) => request('/venue', { method: 'PUT', body: JSON.stringify(venueData) }),
  addAmenity: (amenityData) => request('/venue/amenities', { method: 'POST', body: JSON.stringify(amenityData) }),
  deleteAmenity: (id) => request(`/venue/amenities/${id}`, { method: 'DELETE' }),

  // Gallery (8 categories supported)
  getGallery: (category) => request(`/gallery${category ? `?category=${encodeURIComponent(category)}` : ''}`),
  addGalleryItem: (itemData) => request('/gallery', { method: 'POST', body: JSON.stringify(itemData) }),
  deleteGalleryItem: (id) => request(`/gallery/${id}`, { method: 'DELETE' }),

  // Customer Authentication & Portal
  customerRegister: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  customerLogin: (credentials) => request('/auth/customer-login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMyEnquiries: () => request('/auth/my-enquiries'),
  getMyConversations: () => request('/auth/my-conversations'),

  // Admin Auth & Dashboard Stats
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  verifyAuth: () => request('/auth/verify'),
  getStats: () => request('/auth/stats'),

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
