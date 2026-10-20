import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import RazorpayCheckoutModal from '../components/RazorpayCheckoutModal';
import { 
  User, Mail, Phone, Calendar, Clock, FileText, 
  MessageSquare, ChevronRight, LogOut, RefreshCw, 
  CheckCircle, AlertCircle, Sparkles, MapPin, Package,
  CreditCard, Bell, Check, ArrowRight, ShieldCheck,
  Printer, Info, DollarSign, XCircle, AlertTriangle
} from 'lucide-react';

const CustomerPortalPage = ({ onOpenChatWithId }) => {
  const { 
    customerUser, 
    customerLogout, 
    notifications, 
    unreadNotifsCount, 
    refreshNotifications,
    openAuthModal,
    isCustomerAuthenticated 
  } = useAuth();

  const [enquiries, setEnquiries] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('enquiries'); // 'enquiries', 'notifications', 'conversations'
  
  // Payment modal state
  const [checkoutEnquiry, setCheckoutEnquiry] = useState(null);
  
  // Revised quotation review modal / drawer state
  const [reviewQuotationEnquiry, setReviewQuotationEnquiry] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [enqRes, convRes] = await Promise.all([
        api.getMyEnquiries().catch(() => ({ enquiries: [] })),
        api.getMyConversations().catch(() => ({ conversations: [] }))
      ]);
      setEnquiries(enqRes.enquiries || []);
      setConversations(convRes.conversations || []);
      if (refreshNotifications) {
        await refreshNotifications();
      }
    } catch (err) {
      console.error('Error loading customer portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isCustomerAuthenticated) {
      fetchData();
    }
  }, [isCustomerAuthenticated]);

  const handleAcceptQuotation = async (enquiryId) => {
    setActionLoading(true);
    setActionSuccessMsg('');
    try {
      const res = await api.acceptQuotation(enquiryId);
      if (res.success) {
        setActionSuccessMsg('Quotation accepted successfully! You can now proceed to pay your advance deposit.');
        // Refresh local data
        await fetchData();
        // Update currently reviewed enquiry if open
        if (reviewQuotationEnquiry && reviewQuotationEnquiry.id === enquiryId) {
          setReviewQuotationEnquiry(res.data);
        }
      } else {
        alert(res.message || 'Failed to accept quotation');
      }
    } catch (err) {
      alert(err.message || 'Network error accepting quotation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkNotificationRead = async (notifId) => {
    try {
      await api.markNotificationRead(notifId);
      refreshNotifications();
    } catch (err) {
      console.warn('Error marking notification read:', err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      refreshNotifications();
    } catch (err) {
      console.warn('Error marking all notifications read:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending Admin Approval':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span>Pending Admin Approval</span>
          </span>
        );
      case 'Approved — Awaiting Customer Acceptance':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-brand-purple border border-purple-200 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
            <span>Revised Quotation Ready</span>
          </span>
        );
      case 'Approved — Awaiting Payment':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
            <span>Approved &bull; Deposit Unlocked</span>
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Booking Confirmed (Paid)</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-800 border border-red-200">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Declined / Unavailable</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
            {status}
          </span>
        );
    }
  };

  if (!isCustomerAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-cream py-16 px-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl border border-neutral-100 p-8 max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary mx-auto">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-neutral-900">
              Customer Account Portal
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Please sign in to track your event quotation status, view revised item rates, and pay your booking deposit securely.
            </p>
          </div>
          <button
            onClick={() => openAuthModal({ mode: 'login', reason: 'Sign in to access your bookings and quotation dashboard' })}
            className="w-full py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Sign In to Your Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Profile Banner */}
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shrink-0">
              <User className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-serif text-2xl font-bold text-neutral-900">
                  {customerUser?.name || 'Customer Account'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Verified Client
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-neutral-500">
                {customerUser?.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    {customerUser.email}
                  </span>
                )}
                {customerUser?.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-brand-gold" />
                    +91 {customerUser.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2.5 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
              title="Refresh Portal Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={customerLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition-colors text-xs font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-neutral-200 gap-6">
          <button
            onClick={() => setActiveTab('enquiries')}
            className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'enquiries'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Bookings & Enquiries ({enquiries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 relative ${
              activeTab === 'notifications'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notification Center</span>
            {unreadNotifsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary text-white">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('conversations')}
            className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'conversations'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Saved AI Chats ({conversations.length})</span>
          </button>
        </div>

        {/* TAB 1: Enquiries & Bookings */}
        {activeTab === 'enquiries' && (
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center text-neutral-500 border border-neutral-100">
                <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-3 text-brand-primary" />
                Loading your booking records...
              </div>
            ) : enquiries.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-neutral-100">
                <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-neutral-800">No Bookings or Enquiries Yet</h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1 mb-6">
                  Browse our rental catalogue or check Dwarka Shri Lawn availability to plan your wedding, reception, or party.
                </p>
                <a
                  href="/catalogue"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:bg-brand-primary/95 transition-all shadow-md"
                >
                  Browse Rental Catalogue
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {enquiries.map((enq) => {
                  const hasRevisedQuotation = !!enq.quotationData;
                  const canPayOnline = enq.status === 'Approved — Awaiting Payment';
                  const needsCustomerAcceptance = enq.status === 'Approved — Awaiting Customer Acceptance';

                  return (
                    <div
                      key={enq.id}
                      className="bg-white rounded-3xl p-6 md:p-7 border border-neutral-100 shadow-sm hover:border-brand-primary/30 transition-all space-y-4"
                    >
                      {/* Top Header Row */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-mono text-xs font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-lg border border-brand-primary/20">
                              {enq.id}
                            </span>
                            <span className="text-base font-bold text-neutral-900">
                              {enq.eventType || 'Event Celebration'}
                            </span>
                            {getStatusBadge(enq.status)}
                          </div>
                          <p className="text-xs text-neutral-500 mt-1">
                            Service: <span className="font-medium text-neutral-700">{enq.serviceRequired}</span>
                          </p>
                        </div>

                        <div className="text-right text-xs text-neutral-500 space-y-1">
                          <div className="flex items-center gap-1.5 md:justify-end">
                            <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                            <span className="font-bold text-neutral-900">Date: {enq.eventDate}</span>
                          </div>
                          {enq.guestCount > 0 && (
                            <div className="flex items-center gap-1.5 md:justify-end">
                              <span className="text-[11px] bg-neutral-100 text-neutral-700 font-bold px-2 py-0.5 rounded">
                                {enq.guestCount} Guests
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 md:justify-end">
                            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{enq.locality || 'Lucknow'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Items Preview */}
                      {enq.items && enq.items.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-neutral-700 mb-2 flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5 text-brand-primary" />
                            Equipment Requested ({enq.items.length} items):
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {enq.items.map((it, idx) => (
                              <span key={idx} className="text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1 text-neutral-700">
                                {it.name} (Qty: {it.quantity})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Rejection notice if any */}
                      {enq.status === 'Rejected' && enq.rejectionReason && (
                        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Declined by Management: </span>
                            <span>{enq.rejectionReason}</span>
                          </div>
                        </div>
                      )}

                      {/* Financial summary bar */}
                      <div className="bg-brand-cream/60 rounded-2xl p-4 border border-brand-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <span className="text-neutral-500 block">Total Quotation Value:</span>
                          <span className="text-lg font-bold font-serif text-brand-primary">
                            ₹{(enq.grandTotal || enq.estimatedCost || 0).toLocaleString('en-IN')}
                          </span>
                        </div>

                        {enq.advancePaid > 0 && (
                          <div className="space-y-1">
                            <span className="text-neutral-500 block">Advance Deposit Paid:</span>
                            <span className="text-base font-bold text-emerald-700">
                              ₹{enq.advancePaid.toLocaleString('en-IN')}
                            </span>
                          </div>
                        )}

                        {/* Interactive Workflow Buttons */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                          {needsCustomerAcceptance && (
                            <button
                              onClick={() => setReviewQuotationEnquiry(enq)}
                              className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/95 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                              <span>Review Revised Quotation</span>
                            </button>
                          )}

                          {canPayOnline && (
                            <button
                              onClick={() => setCheckoutEnquiry(enq)}
                              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                            >
                              <CreditCard className="w-4 h-4" />
                              <span>Pay Online via Razorpay</span>
                            </button>
                          )}

                          {hasRevisedQuotation && (
                            <button
                              onClick={() => setReviewQuotationEnquiry(enq)}
                              className="px-3 py-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>View Itemized Rates</span>
                            </button>
                          )}

                          <a
                            href={`https://wa.me/919305465848?text=${encodeURIComponent(`Namaste Kandhari Tent & Caterers! Checking on my booking ${enq.id} for ${enq.eventDate}.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-semibold transition-colors flex items-center gap-1"
                          >
                            <span>WhatsApp Desk</span>
                            <ChevronRight className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Notifications */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <h2 className="text-base font-bold text-neutral-900">
                  Notification Center
                </h2>
                <p className="text-xs text-neutral-500">
                  Real-time updates regarding your event quotations, revisions, and payment confirmations.
                </p>
              </div>

              {notifications && notifications.length > 0 && (
                <button
                  onClick={handleMarkAllNotificationsRead}
                  className="text-xs font-bold text-brand-primary hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {(!notifications || notifications.length === 0) ? (
              <div className="py-12 text-center text-neutral-400 space-y-2">
                <Bell className="w-8 h-8 mx-auto text-neutral-300" />
                <p className="text-xs">No notifications yet. You will receive updates as your booking progresses.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => !notif.read && handleMarkNotificationRead(notif.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                      notif.read
                        ? 'bg-neutral-50/50 border-neutral-100 opacity-80'
                        : 'bg-brand-primary/5 border-brand-primary/20 shadow-sm'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-neutral-900">
                          {notif.title}
                        </span>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-brand-primary" />
                        )}
                      </div>
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-neutral-400 block pt-1">
                        {new Date(notif.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {notif.enquiryId && (
                      <button
                        onClick={() => {
                          const target = enquiries.find(e => e.id === notif.enquiryId);
                          if (target) {
                            setActiveTab('enquiries');
                          }
                        }}
                        className="px-2.5 py-1 bg-white border border-neutral-200 text-xs font-semibold rounded-lg text-brand-primary hover:bg-neutral-50 shrink-0"
                      >
                        View Order
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Saved Conversations */}
        {activeTab === 'conversations' && (
          <div className="space-y-4">
            {conversations.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-neutral-100">
                <MessageSquare className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-neutral-800">No Chat Sessions Found</h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1 mb-4">
                  When you chat with our AI Event Advisor, your conversation and collected preferences are automatically saved here so you can continue anytime!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                          {conv.id}
                        </span>
                        <span className="text-xs font-semibold text-brand-purple bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {conv.recognizedIntent || 'Event Planning'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 mt-2 line-clamp-1">
                        Last message: "{conv.messages?.[conv.messages.length - 1]?.content || 'Active discussion'}"
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs text-neutral-400">
                        {conv.messages?.length || 0} messages
                      </span>
                      <button
                        onClick={() => {
                          if (onOpenChatWithId) {
                            onOpenChatWithId(conv.id);
                          } else {
                            window.dispatchEvent(new CustomEvent('open-ai-chat', { detail: { conversationId: conv.id } }));
                          }
                        }}
                        className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold hover:bg-brand-primary/95 transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Continue Chat</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Revised Quotation Review Modal */}
      {reviewQuotationEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-fadeIn">
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-neutral-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-brand-primary text-white p-6 relative">
              <button
                onClick={() => { setReviewQuotationEnquiry(null); setActionSuccessMsg(''); }}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
              <span className="text-[11px] font-bold uppercase tracking-widest text-brand-gold">
                Itemized Quotation Breakdown
              </span>
              <h2 className="text-xl font-serif font-bold text-white mt-1">
                Booking Reference: {reviewQuotationEnquiry.id}
              </h2>
              <p className="text-xs text-white/80 mt-1">
                Prepared by Kandhari Tent & Caterers &bull; Kanpur Road, Lucknow
              </p>
            </div>

            <div className="p-6 space-y-5">
              {actionSuccessMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {/* Status Banner */}
              <div className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs">
                <div>
                  <span className="text-neutral-500 block">Current Workflow Stage:</span>
                  <span className="font-bold text-neutral-800">{reviewQuotationEnquiry.status}</span>
                </div>
                <div>{getStatusBadge(reviewQuotationEnquiry.status)}</div>
              </div>

              {/* Itemized Line Items Table */}
              <div>
                <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                  Itemized Rates & Inventory
                </h3>
                <div className="border border-neutral-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-neutral-100 text-neutral-600 font-bold border-b border-neutral-200">
                      <tr>
                        <th className="py-2.5 px-3">Item Description</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit Rate</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {(reviewQuotationEnquiry.quotationData?.lineItems || reviewQuotationEnquiry.items || []).map((it, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50/50">
                          <td className="py-2.5 px-3 font-medium text-neutral-800">
                            {it.name}
                            {it.dimensions && (
                              <span className="block text-[10px] text-neutral-400">{it.dimensions}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center text-neutral-600">{it.quantity}</td>
                          <td className="py-2.5 px-3 text-right text-neutral-600">₹{it.unitRate || it.ratePerSqFt || '-'}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-neutral-900">
                            ₹{(it.lineTotal || (it.unitRate * it.quantity) || 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ancillary Costs & Discount */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-2 text-xs">
                {reviewQuotationEnquiry.quotationData?.cartage > 0 && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Cartage & Transport:</span>
                    <span className="font-semibold text-neutral-800">
                      ₹{reviewQuotationEnquiry.quotationData.cartage.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                {reviewQuotationEnquiry.quotationData?.labour > 0 && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Labour, Setup & Rigging:</span>
                    <span className="font-semibold text-neutral-800">
                      ₹{reviewQuotationEnquiry.quotationData.labour.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                {reviewQuotationEnquiry.quotationData?.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Special Promotional Discount:</span>
                    <span>-₹{reviewQuotationEnquiry.quotationData.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-neutral-200 flex justify-between items-baseline font-bold text-sm text-brand-primary">
                  <span>Grand Total Payable:</span>
                  <span className="text-base font-serif">
                    ₹{(reviewQuotationEnquiry.grandTotal || reviewQuotationEnquiry.estimatedCost || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Quotation Notes from Admin */}
              {reviewQuotationEnquiry.quotationData?.quotationNotes && (
                <div className="p-3.5 bg-brand-cream/60 rounded-2xl border border-brand-primary/10 text-xs">
                  <span className="font-bold text-brand-primary block mb-1">Kandhari Team Message:</span>
                  <p className="text-neutral-700 leading-relaxed italic">
                    "{reviewQuotationEnquiry.quotationData.quotationNotes}"
                  </p>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                {reviewQuotationEnquiry.status === 'Approved — Awaiting Customer Acceptance' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleAcceptQuotation(reviewQuotationEnquiry.id)}
                    className="w-full sm:flex-1 py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{actionLoading ? 'Accepting...' : 'Accept Quotation & Unlock Deposit'}</span>
                  </button>
                )}

                {reviewQuotationEnquiry.status === 'Approved — Awaiting Payment' && (
                  <button
                    onClick={() => {
                      setReviewQuotationEnquiry(null);
                      setCheckoutEnquiry(reviewQuotationEnquiry);
                    }}
                    className="w-full sm:flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Proceed to Pay Advance Deposit</span>
                  </button>
                )}

                <button
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-4 py-3 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Quotation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Razorpay Checkout Modal */}
      {checkoutEnquiry && (
        <RazorpayCheckoutModal
          enquiry={checkoutEnquiry}
          isOpen={!!checkoutEnquiry}
          onClose={() => {
            setCheckoutEnquiry(null);
            fetchData();
          }}
          onSuccess={(result) => {
            fetchData();
          }}
        />
      )}

    </div>
  );
};

export default CustomerPortalPage;
