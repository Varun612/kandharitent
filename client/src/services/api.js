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

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

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

  // Enquiries
  submitEnquiry: (enquiryData) => request('/enquiries', { method: 'POST', body: JSON.stringify(enquiryData) }),
  getEnquiries: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/enquiries${query ? `?${query}` : ''}`);
  },
  getEnquiryById: (id) => request(`/enquiries/${id}`),
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
