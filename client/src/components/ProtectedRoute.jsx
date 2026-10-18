import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role = 'admin' }) => {
  const { isAdminAuthenticated, isCustomerAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-brand-primary tracking-wider uppercase">
            Verifying Session...
          </p>
        </div>
      </div>
    );
  }

  if (role === 'admin') {
    if (!isAdminAuthenticated) {
      return <Navigate to="/admin/login" replace />;
    }
    return children;
  }

  if (role === 'customer') {
    if (!isCustomerAuthenticated) {
      return <Navigate to="/account/login" replace />;
    }
    return children;
  }

  return children;
};

export default ProtectedRoute;
