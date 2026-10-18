import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, Phone, ArrowRight, ShieldCheck, Calendar } from 'lucide-react';

const CustomerAuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { customerLogin, customerRegister } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/account';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const hasPendingChatEnquiry = typeof window !== 'undefined' && !!sessionStorage.getItem('kandhari_pending_chat_enquiry');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!formData.name || !formData.email || !formData.phone || !formData.password) {
          throw new Error('Please fill in all fields.');
        }
        if (!/^[6-9]\d{9}$/.test(formData.phone)) {
          throw new Error('Please enter a valid 10-digit Indian mobile number.');
        }
        await customerRegister(formData);
      } else {
        if (!formData.email || !formData.password) {
          throw new Error('Please provide both email and password.');
        }
        await customerLogin({ email: formData.email, password: formData.password });
      }

      if (hasPendingChatEnquiry) {
        window.dispatchEvent(new CustomEvent('open-ai-chat'));
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden">
        {/* Header */}
        <div className="bg-brand-primary p-8 text-white text-center">
          <div className="inline-flex p-3 rounded-xl bg-brand-purple/20 text-brand-gold mb-3">
            <User className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold">
            {isRegister ? 'Create Customer Account' : 'Welcome to Customer Portal'}
          </h2>
          <p className="text-neutral-300 text-xs mt-1">
            Kandhari Tent & Caterers & Dwarka Shri Lawn
          </p>
          <p className="text-neutral-400 text-xs mt-0.5">
            Track your event enquiries, quotations & chat history
          </p>
        </div>

        {/* Pending Inquiry Notice Banner */}
        {hasPendingChatEnquiry && (
          <div className="bg-amber-50 border-b border-amber-200/80 p-3.5 text-xs text-amber-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">
              Please sign in or create an account to submit your inquiry. Your event details will be retained while you sign in.
            </p>
          </div>
        )}

        {/* Tab switch */}
        <div className="flex border-b border-neutral-200">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              !isRegister
                ? 'border-b-2 border-brand-purple text-brand-primary bg-purple-50/50'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              isRegister
                ? 'border-b-2 border-brand-purple text-brand-primary bg-purple-50/50'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
                    required={isRegister}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
                  required
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Mobile Number (10 Digits)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9839012345"
                    maxLength={10}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
                    required={isRegister}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-primary text-white rounded-xl text-sm font-semibold hover:bg-brand-primary/95 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>{isRegister ? 'Register Account' : 'Sign In to Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Privacy & Guest note */}
          <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
            <p className="text-xs text-neutral-500">
              Submitting an enquiry does not require an account. You can always submit enquiries as a guest directly from our catalogue or lawn booking forms.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-brand-purple font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Your personal contact data is strictly confidential</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerAuthPage;
