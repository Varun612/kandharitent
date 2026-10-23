/**
 * Kandhari Tent & Caterers - Mobile API Service
 * Supports Android Emulator (10.0.2.2:5050), physical device LAN IP, or production server.
 */

const API_BASE_URL = 'http://10.0.2.2:5050/api';
const FALLBACK_URL = 'https://kandharitent.vercel.app/api';

const cleanParams = (params = {}) => {
  const cleaned = {};
  Object.keys(params).forEach((key) => {
    const val = params[key];
    if (val !== undefined && val !== null && val !== '' && val !== 'undefined' && val !== 'null') {
      cleaned[key] = val;
    }
  });
  return new URLSearchParams(cleaned).toString();
};

const request = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    // If local emulator endpoint fails, attempt fallback
    console.warn(`Local API request failed (${url}), trying fallback...`, err.message);
    try {
      const fallbackUrl = `${FALLBACK_URL}${endpoint}`;
      const fallbackResponse = await fetch(fallbackUrl, { ...options, headers });
      if (!fallbackResponse.ok) {
        throw new Error(`Fallback HTTP error! status: ${fallbackResponse.status}`);
      }
      return await fallbackResponse.json();
    } catch (fallbackErr) {
      console.error('All API requests failed:', fallbackErr);
      throw fallbackErr;
    }
  }
};

export const api = {
  // Rental Catalogue
  getItems: async (params = {}) => {
    const qs = cleanParams(params);
    const query = qs ? `?${qs}` : '';
    return request(`/items${query}`);
  },

  getItemById: async (id) => {
    return request(`/items/${id}`);
  },

  getCategories: async () => {
    return request('/categories');
  },

  // Promo Coupons
  validateCoupon: async (code, orderAmount) => {
    return request('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, orderAmount })
    });
  },

  // Inquiries & Quotations
  submitEnquiry: async (enquiryData) => {
    return request('/enquiries', {
      method: 'POST',
      body: JSON.stringify(enquiryData)
    });
  },

  getEnquiries: async (token) => {
    return request('/enquiries', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },

  trackEnquiry: async (enquiryNumber) => {
    return request(`/enquiries/track/${enquiryNumber}`);
  },

  // AI Receptionist Veronica Callbacks
  requestCallback: async ({ callerName, callerPhone, query }) => {
    return request('/receptionist/call/start', {
      method: 'POST',
      body: JSON.stringify({
        callerName,
        callerPhone,
        notes: query || 'Mobile App Callback Request'
      })
    });
  },

  // Dual-Identifier Admin Login
  adminLogin: async (username, password) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  // Venue Reels & Showcase
  getVenueReels: async () => {
    return request('/venue/reels');
  }
};
