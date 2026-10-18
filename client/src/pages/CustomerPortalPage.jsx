import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  User, Mail, Phone, Calendar, Clock, FileText, 
  MessageSquare, ChevronRight, LogOut, RefreshCw, 
  CheckCircle, AlertCircle, Sparkles, MapPin, Package
} from 'lucide-react';

const CustomerPortalPage = ({ onOpenChatWithId }) => {
  const { customerUser, customerLogout } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [activeTab, setActiveTab] = useState('enquiries');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [enqRes, convRes] = await Promise.all([
        api.getMyEnquiries().catch(() => ({ enquiries: [] })),
        api.getMyConversations().catch(() => ({ conversations: [] }))
      ]);
      setEnquiries(enqRes.enquiries || []);
      setConversations(convRes.conversations || []);
    } catch (err) {
      console.error('Error loading customer portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (status) => {
    const map = {
      'New': { bg: 'bg-blue-100 text-blue-800 border-blue-200' },
      'Contacted': { bg: 'bg-amber-100 text-amber-800 border-amber-200' },
      'In Discussion': { bg: 'bg-purple-100 text-purple-800 border-purple-200' },
      'Quoted': { bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
      'Converted': { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      'Confirmed': { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      'Closed': { bg: 'bg-neutral-100 text-neutral-800 border-neutral-200' }
    };
    const s = map[status] || { bg: 'bg-neutral-100 text-neutral-800 border-neutral-200' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.bg}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-brand-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Banner */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
              <User className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-serif text-2xl font-bold text-neutral-900">
                  {customerUser?.name || 'Customer Account'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-brand-purple border border-purple-200">
                  Verified Client
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {customerUser?.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  +91 {customerUser?.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2.5 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={customerLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-700 bg-red-50 hover:bg-red-100/80 transition-colors text-xs font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-neutral-200 gap-6">
          <button
            onClick={() => setActiveTab('enquiries')}
            className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
              activeTab === 'enquiries'
                ? 'border-brand-purple text-brand-purple'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            My Event Enquiries ({enquiries.length})
          </button>
          <button
            onClick={() => setActiveTab('conversations')}
            className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
              activeTab === 'conversations'
                ? 'border-brand-purple text-brand-purple'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Saved AI Conversations ({conversations.length})
          </button>
        </div>

        {/* Tab 1: Enquiries */}
        {activeTab === 'enquiries' && (
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center text-neutral-500 border border-neutral-100">
                <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-3 text-brand-purple" />
                Loading your enquiry records...
              </div>
            ) : enquiries.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-neutral-100">
                <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-neutral-800">No Enquiries Found</h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1 mb-6">
                  You haven't submitted any event enquiries under this account yet. Browse our rental catalogue or check Dwarka Shri Lawn availability to submit one!
                </p>
                <a
                  href="/catalogue"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:bg-brand-primary/95 transition-all"
                >
                  Browse Rental Catalogue
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {enquiries.map((enq) => (
                  <div
                    key={enq.id}
                    className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm hover:border-brand-purple/30 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-brand-purple bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                            {enq.id}
                          </span>
                          <span className="text-sm font-bold text-neutral-900">
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
                          <span className="font-semibold text-neutral-800">Date: {enq.eventDate}</span>
                        </div>
                        {enq.guestCount > 0 && (
                          <div className="flex items-center gap-1.5 md:justify-end">
                            <span className="text-[11px] bg-purple-50 text-brand-purple font-bold px-2 py-0.5 rounded border border-purple-100">
                              {enq.guestCount} Guests Expected
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 md:justify-end">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{enq.locality || 'Lucknow'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Equipment or Details preview */}
                    {enq.items && enq.items.length > 0 && (
                      <div className="mt-4 pt-2">
                        <p className="text-xs font-bold text-neutral-600 mb-2 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-brand-purple" />
                          Requested Items ({enq.items.length}):
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

                    {enq.detailedRequirements && (
                      <p className="text-xs text-neutral-600 mt-3 bg-brand-cream/60 p-3 rounded-xl border border-neutral-200/50">
                        <span className="font-bold text-neutral-800">Requirements: </span>
                        {enq.detailedRequirements}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between text-xs text-neutral-400 pt-3 border-t border-neutral-100">
                      <span>Submitted on: {new Date(enq.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <a
                        href={`https://wa.me/919305465848?text=${encodeURIComponent(`Namaste Kandhari Tent & Caterers! Checking on my enquiry ${enq.id} for ${enq.eventDate}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-brand-purple hover:underline flex items-center gap-1"
                      >
                        Follow up on WhatsApp <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Conversations */}
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
                        className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold hover:bg-brand-primary/95 transition-all flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Continue Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerPortalPage;
