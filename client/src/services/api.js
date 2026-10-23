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

const toQueryString = (params = {}) => {
  if (typeof params === 'string') return params ? (params.startsWith('?') ? params : `?${params}`) : '';
  const clean = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '' && v !== 'undefined' && v !== 'null') {
      clean[k] = v;
    }
  }
  const qs = new URLSearchParams(clean).toString();
  return qs ? `?${qs}` : '';
};

export const api = {
  // Rental Items
  getItems: (params = {}) => {
    return request(`/items${toQueryString(params)}`);
  },
  getCategories: () => request('/items/categories'),
  getItemById: (id) => request(`/items/${id}`),
  createItem: (itemData) => request('/items', { method: 'POST', body: JSON.stringify(itemData) }),
  updateItem: (id, updates) => request(`/items/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteItem: (id) => request(`/items/${id}`, { method: 'DELETE' }),

  // Enquiries & Workflow
  submitEnquiry: (enquiryData) => request('/enquiries', { method: 'POST', body: JSON.stringify(enquiryData) }),
  getEnquiries: (params = {}) => {
    return request(`/enquiries${toQueryString(params)}`);
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
  getLawnReels: () => request('/venue/reels'),
  getVenueVideo: () => request('/venue/video'),
  updateLawnReel: (id, data) => request(`/venue/reels/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
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
    return request(`/catering/menu${toQueryString(params)}`);
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
    return request(`/reports/summary${toQueryString(params)}`);
  },
  getReportPrintableUrl: (params = {}) => {
    const cleanBase = (API_BASE === '/api') ? '/api' : API_BASE;
    return `${cleanBase}/reports/printable-html${toQueryString(params)}`;
  },
  exportReportCSV: async (params = {}) => {
    const cleanBase = (API_BASE === '/api') ? '/api' : API_BASE;
    const res = await fetch(`${cleanBase}/reports/export-csv${toQueryString(params)}`, {
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
  }),

  // Physical Inventory Management
  getInventory: () => request('/inventory'),
  getPhysicalInventory: () => request('/inventory'),
  adjustInventory: (payload) => request('/inventory/adjust', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  adjustPhysicalStock: (payload) => request('/inventory/adjust', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getInventoryLogs: () => request('/inventory/logs'),
  getInventoryAuditLogs: () => request('/inventory/logs'),
  updateInventoryItem: (id, payload) => request(`/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),

  // Staff and Labour Management
  getStaffList: (params = {}) => request(`/staff${toQueryString(params)}`),
  getStaff: (params = {}) => request(`/staff${toQueryString(params)}`),
  createStaffMember: (payload) => request('/staff', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  createStaff: (payload) => request('/staff', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateStaffMember: (id, payload) => request(`/staff/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  updateStaff: (id, payload) => request(`/staff/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  getAttendance: (params = {}) => request(`/staff/attendance${toQueryString(params)}`),
  getAttendanceGrid: (params = {}) => request(`/staff/attendance-grid${toQueryString(params)}`),
  recordAttendance: (payload) => request('/staff/attendance', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  markAttendance: (payload) => request('/staff/attendance', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  recordBulkAttendance: (payload) => request('/staff/attendance/bulk', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  calculateWages: (params = {}) => request(`/staff/wages${toQueryString(params)}`),
  getWageSummary: (params = {}) => request(`/staff/wage-summary${toQueryString(params)}`),
  recordWagePayment: (payload) => request('/staff/payments', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  recordWageDisbursement: (payload) => request('/staff/payments', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getWageDisbursements: (params = {}) => request(`/staff/payments${toQueryString(params)}`),

  // Employee Advances Management
  getAdvances: (params = {}) => request(`/staff/advances${toQueryString(params)}`),
  recordAdvance: (payload) => request('/staff/advances', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  deleteAdvance: (id) => request(`/staff/advances/${id}`, {
    method: 'DELETE'
  }),

  // Payroll Settlement Engine
  getPayroll: (params = {}) => request(`/staff/payroll${toQueryString(params)}`),
  finalizePayroll: (payload) => request('/staff/payroll/finalize', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updatePayrollStatus: (id, status) => request(`/staff/payroll/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),
  exportPayrollCSV: async (params = {}) => {
    const cleanBase = (API_BASE === '/api') ? '/api' : API_BASE;
    const res = await fetch(`${cleanBase}/staff/payroll/export-csv${toQueryString(params)}`, {
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to export payroll CSV');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kandhari_payroll_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },

  // Coupons & Promotions
  getCoupons: () => request('/coupons'),
  createCoupon: (payload) => request('/coupons', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  validateCoupon: (code, subtotal) => request('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, subtotal })
  }),
  deleteCoupon: (id) => request(`/coupons/${id}`, {
    method: 'DELETE'
  }),

  // Website Visitor Analytics
  logAnalyticsEvent: (payload) => request('/analytics/event', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getAnalyticsSummary: (params = {}) => request(`/analytics/summary${toQueryString(params)}`),

  // Voice & Typed Master AI Agent
  queryMasterAgent: (payload) => request('/agent/query', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  confirmMasterAgentAction: (payload) => request('/agent/confirm', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Outside Payments (Dhobi, Suppliers, Logistics)
  getOutsidePayments: (params = {}) => request(`/payments/outside${toQueryString(params)}`),
  recordOutsidePayment: (payload) => request('/payments/outside', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Official Invoices & Commercial Bills
  getInvoices: () => request('/invoices'),
  getInvoiceById: (id) => request(`/invoices/${id}`),
  generateInvoice: (payload) => request('/invoices/generate', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // AI Marketing Studio
  searchMarketingMedia: (params = {}) => request(`/marketing/media${toQueryString(params)}`),
  getMarketingPortfolios: () => request('/marketing/portfolios'),
  createMarketingPortfolio: (payload) => request('/marketing/portfolios', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  renderMarketingReel: (payload) => request('/marketing/reels/render', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getRenderedReels: () => request('/marketing/reels'),

  // Master Agent 3-Layer Memory & Learned Workflows
  getAgentConversations: () => request('/agent/conversations'),
  getAgentMemories: () => request('/agent/memories'),
  createAgentMemory: (payload) => request('/agent/memories', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateAgentMemory: (id, payload) => request(`/agent/memories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  deleteAgentMemory: (id) => request(`/agent/memories/${id}`, {
    method: 'DELETE'
  }),
  getAgentWorkflows: () => request('/agent/workflows'),
  createAgentWorkflow: (payload) => request('/agent/workflows', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateAgentWorkflow: (id, payload) => request(`/agent/workflows/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  deleteAgentWorkflow: (id) => request(`/agent/workflows/${id}`, {
    method: 'DELETE'
  }),

  // Veronica Receptionist Telephony & Operations
  getReceptionistCalls: () => request('/receptionist/calls'),
  getReceptionistAppointments: () => request('/receptionist/appointments'),
  getReceptionistTickets: () => request('/receptionist/tickets'),
  getReceptionistCallbacks: () => request('/receptionist/callbacks'),
  getTelephonyConfig: () => request('/receptionist/telephony-config'),
  simulateIncomingCall: (payload) => request('/receptionist/simulate-incoming', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Central Business Settings
  getSettings: () => request('/settings'),
  updateSettings: (payload) => request('/settings', {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),

  // Live Item Viewing Analytics
  recordItemView: (itemId, location = 'Gurgaon') => request('/analytics/item-view', {
    method: 'POST',
    body: JSON.stringify({ itemId, location })
  }),
  getLiveViews: () => request('/analytics/live-views'),

  // Delivery Fleet & Partner Operations (Zomato-like Order Tracking)
  getDeliveryPartners: (status) => request(status ? `/delivery-partners?status=${status}` : '/delivery-partners'),
  createDeliveryPartner: (payload) => request('/delivery-partners', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateDeliveryPartner: (id, payload) => request(`/delivery-partners/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  deleteDeliveryPartner: (id) => request(`/delivery-partners/${id}`, {
    method: 'DELETE'
  }),
  assignDeliveryPartner: (payload) => request('/delivery-partners/assign', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  connectDriverRequest: (payload) => request('/delivery-partners/connect-driver', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  driverApproveOrder: (payload) => request('/delivery-partners/approve-order', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getEnquiryRouteInfo: (id) => request(`/enquiries/${encodeURIComponent(id)}/route`),
  updateOrderDeliveryStatus: (payload) => request('/delivery-partners/update-status', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  trackOrder: (orderId) => request(`/delivery-partners/track/${encodeURIComponent(orderId)}`),
  reviewEnquiry: (id, payload) => request(`/enquiries/${id}/review`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),

  // Three-Agent AI System Architecture
  agents: {
    // 1. Client Agent
    clientChat: (payload) => request('/agents/client/chat', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    clientCartAction: (payload) => request('/agents/client/cart-action', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    clientEscalate: (payload) => request('/agents/client/escalate', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

    // 2. Admin Agent
    adminQuery: (payload) => request('/agents/admin/query', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    adminConfirm: (payload) => request('/agents/admin/confirm', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    adminDropoffAnalysis: () => request('/agents/admin/dropoff-analysis'),

    // 3. Master Agent
    masterOverview: () => request('/agents/master/overview'),
    masterProposeRule: (payload) => request('/agents/master/rules/propose', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    masterApplyRule: (payload) => request('/agents/master/rules/apply', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    masterRollbackRule: (payload) => request('/agents/master/rules/rollback', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    masterEvents: (limit = 50) => request(`/agents/master/events?limit=${limit}`),
    masterAudit: (limit = 50) => request(`/agents/master/audit?limit=${limit}`)
  }
};
