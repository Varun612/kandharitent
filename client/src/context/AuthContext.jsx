import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Admin State
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('kandhari_admin_token') || null);
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kandhari_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Customer State
  const [customerToken, setCustomerToken] = useState(() => localStorage.getItem('kandhari_customer_token') || null);
  const [customerUser, setCustomerUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kandhari_customer_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  // Modal Interceptor & Post-Auth Callback State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [authModalReason, setAuthModalReason] = useState('');
  const [postAuthCallback, setPostAuthCallback] = useState(null);

  // Customer Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);

  const openAuthModal = ({ mode = 'login', reason = '', onAuthenticated = null } = {}) => {
    setAuthModalMode(mode);
    setAuthModalReason(reason);
    setPostAuthCallback(() => onAuthenticated);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPostAuthCallback(null);
    setAuthModalReason('');
  };

  const handlePostAuth = (userData) => {
    if (postAuthCallback && typeof postAuthCallback === 'function') {
      try {
        postAuthCallback(userData);
      } catch (e) {
        console.error('Error running post-auth callback:', e);
      }
    }
    closeAuthModal();
  };

  const refreshNotifications = async () => {
    if (!customerToken) {
      setNotifications([]);
      setUnreadNotifsCount(0);
      return;
    }
    try {
      const res = await api.getMyNotifications();
      if (res && res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
        setUnreadNotifsCount(res.unreadCount ?? res.data.filter(n => !n.read).length);
      }
    } catch (err) {
      console.warn('Could not refresh customer notifications:', err.message);
    }
  };

  // Admin Login
  const login = async (username, password) => {
    const res = await api.login({ username, password });
    if (res.success && res.token) {
      setAdminToken(res.token);
      setAdminUser(res.user);
      localStorage.setItem('kandhari_admin_token', res.token);
      localStorage.setItem('kandhari_admin_user', JSON.stringify(res.user));
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  // Admin Logout
  const logout = () => {
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem('kandhari_admin_token');
    localStorage.removeItem('kandhari_admin_user');
  };

  // Customer Register
  const customerRegister = async (userData) => {
    const res = await api.customerRegister(userData);
    if (res.success && res.token) {
      setCustomerToken(res.token);
      setCustomerUser(res.user);
      localStorage.setItem('kandhari_customer_token', res.token);
      localStorage.setItem('kandhari_customer_user', JSON.stringify(res.user));
      handlePostAuth(res.user);
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  // Customer Login
  const customerLogin = async (credentials) => {
    const res = await api.customerLogin(credentials);
    if (res.success && res.token) {
      setCustomerToken(res.token);
      setCustomerUser(res.user);
      localStorage.setItem('kandhari_customer_token', res.token);
      localStorage.setItem('kandhari_customer_user', JSON.stringify(res.user));
      handlePostAuth(res.user);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  // Customer Logout
  const customerLogout = () => {
    setCustomerToken(null);
    setCustomerUser(null);
    setNotifications([]);
    setUnreadNotifsCount(0);
    localStorage.removeItem('kandhari_customer_token');
    localStorage.removeItem('kandhari_customer_user');
  };

  useEffect(() => {
    setIsLoading(false);
    if (customerToken) {
      refreshNotifications();
    }
  }, [customerToken]);

  return (
    <AuthContext.Provider value={{
      // Admin
      token: adminToken,
      user: adminUser,
      isAdminAuthenticated: !!adminToken,
      login,
      logout,

      // Customer
      customerToken,
      customerUser,
      isCustomerAuthenticated: !!customerToken,
      customerRegister,
      customerLogin,
      customerLogout,

      // Modal Interceptor & Resumption
      isAuthModalOpen,
      authModalMode,
      authModalReason,
      openAuthModal,
      closeAuthModal,

      // Notifications
      notifications,
      unreadNotifsCount,
      refreshNotifications,

      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
