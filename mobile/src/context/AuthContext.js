import React, { createContext, useContext, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (username, password) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.adminLogin(username, password);
      if (res && res.success && res.token) {
        setUser(res.user);
        setToken(res.token);
        setLoading(false);
        return { success: true, user: res.user };
      } else {
        const msg = res?.message || 'Invalid credentials';
        setError(msg);
        setLoading(false);
        return { success: false, message: msg };
      }
    } catch (err) {
      const msg = err.message || 'Login failed';
      setError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError('');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin,
        loading,
        error,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
