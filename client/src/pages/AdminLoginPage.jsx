import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, User, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(username, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid administrator username or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('admin@kandhari2026');
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-brand-cream animate-fadeIn">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/80 shadow-royal space-y-6">
        
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-brand-purple font-semibold transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Website</span>
        </Link>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl royal-gradient text-brand-gold flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-brand-primary">
            Administrator Portal
          </h1>
          <p className="text-xs text-neutral-500">
            Kandhari Tent & Caterers & Dwarka Shri Lawn Management
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Admin Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Secret Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl royal-gradient text-white font-bold text-sm shadow-royal hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <KeyRound className="w-4 h-4 text-brand-gold" />
                <span>Sign In to Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Helper Credentials Box */}
        <div className="pt-4 border-t border-neutral-100 text-center">
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-xs text-brand-purple hover:underline font-semibold"
          >
            Click to fill default credentials (admin / admin@kandhari2026)
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminLoginPage;
