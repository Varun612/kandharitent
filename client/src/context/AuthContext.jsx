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
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  // Customer Logout
  const customerLogout = () => {
    setCustomerToken(null);
    setCustomerUser(null);
    localStorage.removeItem('kandhari_customer_token');
    localStorage.removeItem('kandhari_customer_user');
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);

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
