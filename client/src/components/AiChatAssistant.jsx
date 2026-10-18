import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, X, Send, Sparkles, RefreshCw, 
  CheckCircle, ArrowRight, Image as ImageIcon, MapPin, 
  Calendar, Phone, ExternalLink, ChevronDown, Minimize2, Maximize2
} from 'lucide-react';

// Extract phone and details from text
const extractLeadInfo = (text) => {
  const phoneMatch = text.match(/(?:(?:\+|0{0,2})91[\s-]*)?([6-9]\d{9})/);
  const phone = phoneMatch ? phoneMatch[1] : null;

  let eventType = null;
  const lower = text.toLowerCase();
  if (lower.includes('shaadi') || lower.includes('wedding')) eventType = 'Wedding';
  else if (lower.includes('reception')) eventType = 'Reception';
  else if (lower.includes('birthday') || lower.includes('bday')) eventType = 'Birthday Party';
  else if (lower.includes('haldi') || lower.includes('mehendi') || lower.includes('sangeet')) eventType = 'Pre-Wedding Ceremony';
  else if (lower.includes('corporate') || lower.includes('exhibition')) eventType = 'Corporate / Exhibition';

  let locality = null;
  const localities = ['Kanpur Road', 'Alambagh', 'Transport Nagar', 'Ashiyana', 'Krishna Nagar', 'Sarojini Nagar', 'Gomti Nagar', 'Hazratganj', 'Indira Nagar', 'Charbagh', 'Telibagh', 'Rajajipuram', 'Vrindavan Colony'];
  for (const loc of localities) {
    if (lower.includes(loc.toLowerCase())) {
      locality = loc;
      break;
    }
  }

  return { phone, eventType, locality };
};

// Intelligent client-side NLP fallback when server is cold or offline
const getClientAiResponse = (text) => {
  const lower = text.toLowerCase();
  const info = extractLeadInfo(text);

  if (info.phone) {
    return {
      text: `Shukriya! We have recorded your contact number: **${info.phone}**.\n\nOur event management team from Kandhari Tent & Caterers / Dwarka Shri Lawn will contact you shortly to understand your requirements and prepare a tailored estimate.\n\nYou can also click below to chat directly with the owner on WhatsApp or call **9305465848**.`,
      detectedPhone: info.phone
    };
  }

  if (lower.includes('lawn') || lower.includes('dwarka') || lower.includes('venue') || lower.includes('ground') || lower.includes('location')) {
    return {
      text: `**Dwarka Shri Lawn (Managed by Kandhari Tent & Caterers)** is our signature event venue located Opp. Pillar No. 37, Daroga Kheda, Kanpur Road, Lucknow.\n\n• **Capacity:** 800–1000 guests\n• **Amenities:** Large lush green lawn, covered waterproof dining pavilion, AC bridal suite & rooms, safe parking.\n• **Booking:** Available for weddings, receptions, and family celebrations.\n\nWould you like to schedule an in-person visit or check available dates?`
    };
  }

  if (lower.includes('tent') || lower.includes('hangar') || lower.includes('waterproof') || lower.includes('canopy') || lower.includes('pandal')) {
    return {
      text: `We are Lucknow's premier tent-house specialists!\n\n• **German Waterproof Hangar Tents:** Heavy-gauge aluminum framing, 100% weather-tight, luxury AC/cooler ducting.\n• **Pagoda & High-Peak Canopies:** Perfect for VIP lounges and food displays.\n• **Traditional Shamianas & Draped Pockets:** Royal color combinations (White & Gold, Maroon & Velvet).\n\nWhat is your event date and approximate guest count?`
    };
  }

  if (lower.includes('cater') || lower.includes('menu') || lower.includes('food') || lower.includes('khana')) {
    return {
      text: `We coordinate delicious pure-vegetarian and multi-cuisine catering for celebrations:\n\n• **Live Counters:** Lucknow Chaat, South Indian Dosa, Chinese, Live Tandoor & Kebabs\n• **Royal Main Course:** Shahi Paneer, Dal Makhani, Dum Biryani, Assorted Breads\n• **Desserts:** Hot Jalebi with Rabdi, Gulab Jamun, Moong Dal Halwa, Ice Cream\n\nShare your expected guest count and date to get our customized menu package!`
    };
  }

  if (lower.includes('rate') || lower.includes('price') || lower.includes('cost') || lower.includes('budget') || lower.includes('package') || lower.includes('quotation')) {
    return {
      text: `At Kandhari Tent & Caterers, we offer tailored quotes with 100% transparent pricing and no hidden costs.\n\nBecause every event's space and equipment needs vary, please share your **event date**, **expected guests**, and **locality**, or call our desk directly at **9305465848** for an instant consultation.`
    };
  }

  if (lower.includes('stage') || lower.includes('decor') || lower.includes('mandap') || lower.includes('flower') || lower.includes('light')) {
    return {
      text: `Our decoration setups include:\n\n• Grand floral mandaps (Fresh & Artificial floral styling)\n• Royal reception stage backdrops with crystal chandeliers\n• Welcoming entrance arches with fairy light tunnels\n• Cold pyros, dry ice fog, and ambient LED lighting\n\nPlease check our Gallery page or let us know your preferred theme!`
    };
  }

  return {
    text: `Namaste! Kandhari Tent & Caterers & Dwarka Shri Lawn are ready to assist with your wedding, reception, or family function in Lucknow.\n\nPlease share your event date, approximate guest count, or phone number so we can check availability and provide the best package.`
  };
};

const createInitialState = (id = 'conv-init-' + Date.now()) => ({
  id,
  status: 'active',
  recognizedIntent: 'general_inquiry',
  collectedState: {
    customerName: '',
    phone: '',
    whatsappNumber: '',
    preferredContactMethod: 'Phone',
    eventType: '',
    eventDate: '',
    locality: 'Lucknow, Uttar Pradesh',
    guestCount: 0,
    selectedServices: [],
    budget: '',
    specialRequests: '',
    enquiryReference: null
  },
  messages: [
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: 'Namaste! I am the AI Event Advisor for Kandhari Tent & Caterers & Dwarka Shri Lawn, Lucknow.\n\nHow may I assist you with your celebration today? You can ask about our wedding lawn availability, German waterproof tents, stage & mandap decor, or catering coordination.',
      timestamp: new Date()
    }
  ]
});

const AiChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversation, setConversation] = useState(() => createInitialState());
  const [messages, setMessages] = useState(() => createInitialState().messages);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  const [submittedRef, setSubmittedRef] = useState(null);
  const [whatsappLink, setWhatsappLink] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { isCustomerAuthenticated, customerUser } = useAuth();

  // Scroll to bottom on new message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Listen for custom event to open chat with specific conversation or service intent
  useEffect(() => {
    const handleOpenChat = (event) => {
      setIsOpen(true);
      setIsMinimized(false);
      if (event.detail?.conversationId) {
        loadConversation(event.detail.conversationId);
      } else if (event.detail?.initialMessage) {
        initAndSendMessage(event.detail.initialMessage);
      }
    };

    window.addEventListener('open-ai-chat', handleOpenChat);
    return () => window.removeEventListener('open-ai-chat', handleOpenChat);
  }, []);

  // Initialize chat session
  const initChat = async () => {
    try {
      const savedConvId = localStorage.getItem('kandhari_active_conv_id');
      if (savedConvId) {
        const res = await api.getChat(savedConvId);
        if (res && res.success && res.conversation) {
          setConversation(res.conversation);
          if (res.conversation.messages && res.conversation.messages.length > 0) {
            setMessages(res.conversation.messages);
          }
          if (res.conversation.collectedState?.enquiryReference) {
            setSubmittedRef(res.conversation.collectedState.enquiryReference);
          }
          return;
        }
      }
      startNewChat();
    } catch (e) {
      console.warn('Initial chat connect error, staying in ready mode:', e);
    }
  };

  const startNewChat = async () => {
    const fresh = createInitialState('conv-' + Date.now());
    setConversation(fresh);
    setMessages(fresh.messages);
    setSubmittedRef(null);
    setWhatsappLink(null);
    localStorage.removeItem('kandhari_active_conv_id');

    setLoading(true);
    try {
      const res = await api.startChat();
      if (res && res.success && res.conversation) {
        setConversation(res.conversation);
        setMessages(res.conversation.messages || fresh.messages);
        localStorage.setItem('kandhari_active_conv_id', res.conversation.id);
      }
    } catch (err) {
      console.warn('Backend startChat offline, operating in client fallback mode:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (convId) => {
    setLoading(true);
    try {
      const res = await api.getChat(convId);
      if (res && res.success && res.conversation) {
        setConversation(res.conversation);
        setMessages(res.conversation.messages || []);
        localStorage.setItem('kandhari_active_conv_id', res.conversation.id);
        if (res.conversation.collectedState?.enquiryReference) {
          setSubmittedRef(res.conversation.collectedState.enquiryReference);
        }
      }
    } catch (err) {
      console.error('Failed to load conversation:', err);
    } finally {
      setLoading(false);
    }
  };

  const initAndSendMessage = async (initialText) => {
    let convId = conversation?.id || localStorage.getItem('kandhari_active_conv_id');
    if (!convId) {
      try {
        const res = await api.startChat();
        if (res && res.success && res.conversation) {
          setConversation(res.conversation);
          setMessages(res.conversation.messages || []);
          convId = res.conversation.id;
          localStorage.setItem('kandhari_active_conv_id', convId);
        }
      } catch (e) {
        convId = 'conv-local-' + Date.now();
      }
    }
    handleSend(initialText, convId);
  };

  useEffect(() => {
    if (isOpen) {
      initChat();
    }
  }, [isOpen]);

  const handleSend = async (textToSend = inputText, convId = null) => {
    const text = (textToSend || '').trim();
    if (!text || loading) return;

    const activeConvId = convId || conversation?.id || localStorage.getItem('kandhari_active_conv_id') || ('conv-local-' + Date.now());
    setInputText('');

    // Optimistic user message
    const tempUserMsg = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await api.sendChatMessage(activeConvId, text);
      if (res && res.success) {
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== tempUserMsg.id);
          return [...filtered, res.userMessage, res.assistantMessage];
        });
        if (res.collectedState) {
          setConversation(prev => ({
            ...prev,
            id: activeConvId,
            collectedState: res.collectedState,
            recognizedIntent: res.recognizedIntent
          }));
        }
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Backend chat response error, activating resilient intelligent fallback:', err);
    }

    // Client-side intelligent fallback response
    try {
      const fallbackResult = getClientAiResponse(text);
      const leadInfo = extractLeadInfo(text);

      const assistantMsg = {
        id: 'ast-' + Date.now(),
        role: 'assistant',
        content: fallbackResult.text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);

      // If user provided a phone number, update state & auto-submit enquiry into database and notes
      if (leadInfo.phone) {
        const detectedPhone = leadInfo.phone;
        setConversation(prev => ({
          ...prev,
          collectedState: {
            ...(prev?.collectedState || {}),
            phone: detectedPhone,
            locality: leadInfo.locality || prev?.collectedState?.locality || 'Lucknow',
            eventType: leadInfo.eventType || prev?.collectedState?.eventType || 'Celebration'
          }
        }));

        api.submitEnquiry({
          customerName: customerUser?.name || 'Chat Visitor',
          phone: detectedPhone,
          whatsappNumber: detectedPhone,
          serviceRequired: 'Live Chat Consultation / Booking',
          locality: leadInfo.locality || 'Kanpur Road, Lucknow',
          eventType: leadInfo.eventType || 'Celebration',
          notes: `Lead automatically recorded from Live Chat. Customer query: "${text}"`,
          conversationId: activeConvId,
          enquiryType: 'chat'
        }).catch(e => console.warn('Could not auto-submit fallback lead:', e));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEnquiry = async () => {
    if (!conversation?.id || submittingEnquiry) return;
    setSubmittingEnquiry(true);

    try {
      const res = await api.submitChatEnquiry(conversation.id);
      if (res.success) {
        setSubmittedRef(res.referenceNumber);
        setWhatsappLink(res.whatsappUrl);
        // Refresh conversation to show confirmed message
        const updated = await api.getChat(conversation.id);
        if (updated.success) {
          setMessages(updated.conversation.messages);
        }
      }
    } catch (err) {
      console.error('Failed to submit enquiry from chat:', err);
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  // Quick Action Chips
  const quickActions = [
    'Aapke lawn ki photos hain?',
    'Khaane ka menu bhejiye',
    'Stage aur mandap decor dikhayein',
    'German hangar tent chahiye',
    'Grand entrance gates dikhao',
    'Mujhe custom quotation chahiye'
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-white px-3.5 py-2 rounded-full shadow-lg border border-purple-200/60 text-xs font-semibold text-brand-primary animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
            <span>Chat with AI Event Advisor</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-primary to-brand-purple text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 border-2 border-brand-gold/40 relative"
            title="Open AI Event Assistant"
          >
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed z-50 transition-all duration-300 shadow-2xl rounded-2xl bg-white border border-neutral-200 flex flex-col overflow-hidden ${
          isMinimized 
            ? 'bottom-6 right-6 w-80 h-16' 
            : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[440px] h-[85vh] sm:h-[620px] max-h-[700px]'
        }`}>
          {/* Header */}
          <div className="bg-brand-primary text-white p-4 flex items-center justify-between border-b border-purple-900/40 select-none">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-purple/40 border border-brand-gold/30 flex items-center justify-center text-brand-gold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold leading-tight">
                  Kandhari AI Event Advisor
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online • English & हिन्दी</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-neutral-300">
              <a
                href="tel:9305465848"
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-amber-300"
                title="Direct Call to Owner (9305465848)"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/919305465848?text=Namaste!%20I%20am%20chatting%20on%20your%20website%20and%20need%20assistance%20for%20my%20event."
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-emerald-400"
                title="Direct WhatsApp (9305465848)"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              <button
                onClick={startNewChat}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Start New Conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Message History Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-cream/30 text-xs">
                {messages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-brand-primary text-white rounded-br-none'
                        : 'bg-white text-neutral-800 border border-neutral-100 rounded-bl-none'
                    }`}>
                      <p className="whitespace-pre-line">{msg.content}</p>

                      {/* Display 5 Gallery Photographs if present */}
                      {msg.galleryImages && msg.galleryImages.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-neutral-100 space-y-2">
                          <p className="font-bold text-[11px] text-brand-purple flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Published Setups ({msg.galleryImages.length} Photographs):</span>
                          </p>
                          <div className="grid grid-cols-1 gap-2.5 max-h-60 overflow-y-auto pr-1">
                            {msg.galleryImages.map((img, i) => (
                              <div key={img.id || i} className="group relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 shadow-sm">
                                <img
                                  src={img.imageUrl}
                                  alt={img.title}
                                  className="w-full h-32 object-cover transition-transform group-hover:scale-105"
                                  loading="lazy"
                                />
                                <div className="p-2 bg-white">
                                  <p className="font-bold text-neutral-800 text-[11px] truncate">{img.title}</p>
                                  <p className="text-[10px] text-neutral-500 truncate">{img.caption}</p>
                                  <button
                                    onClick={() => handleSend(`Mujhe "${img.title}" jaisa setup pasand hai. Iski availability aur details batayein.`)}
                                    className="mt-1.5 w-full py-1 text-[10px] font-bold bg-brand-purple/10 text-brand-purple hover:bg-brand-purple hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1"
                                  >
                                    <Sparkles className="w-3 h-3" />
                                    <span>Enquire About This Style</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <span className="text-[9px] text-neutral-400 mt-1 px-1">
                      {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}

                {/* Slot Summary Card & Confirmation Button */}
                {conversation?.collectedState?.phone && !submittedRef && (
                  <div className="bg-purple-50/90 border border-brand-purple/30 rounded-2xl p-4 shadow-sm space-y-2">
                    <div className="flex items-center gap-2 text-brand-purple font-bold text-xs">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Ready to Submit Official Enquiry</span>
                    </div>
                    <div className="text-[11px] text-neutral-600 space-y-0.5 bg-white p-2.5 rounded-xl border border-purple-100">
                      {conversation.collectedState.eventType && <p>• <b>Event:</b> {conversation.collectedState.eventType}</p>}
                      {conversation.collectedState.eventDate && <p>• <b>Date:</b> {conversation.collectedState.eventDate}</p>}
                      {conversation.collectedState.guestCount > 0 && <p>• <b>Guests:</b> {conversation.collectedState.guestCount}</p>}
                      {conversation.collectedState.locality && <p>• <b>Location:</b> {conversation.collectedState.locality}</p>}
                      {conversation.collectedState.phone && <p>• <b>Phone:</b> {conversation.collectedState.phone}</p>}
                    </div>
                    <button
                      onClick={handleSubmitEnquiry}
                      disabled={submittingEnquiry}
                      className="w-full py-2 bg-gradient-to-r from-brand-primary to-brand-purple text-white font-bold rounded-xl text-xs hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 shadow"
                    >
                      {submittingEnquiry ? 'Submitting...' : 'Submit Official Enquiry to Owner'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Submitted Success Badge */}
                {submittedRef && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-sm text-center space-y-2">
                    <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto" />
                    <p className="font-bold text-emerald-900 text-xs">Enquiry Submitted Successfully!</p>
                    <p className="text-[11px] text-emerald-700">Reference: <span className="font-mono font-bold">{submittedRef}</span></p>
                    {whatsappLink && (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow"
                      >
                        <span>Connect on WhatsApp</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {loading && (
                  <div className="flex items-center gap-2 text-neutral-400 text-xs italic">
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-brand-gold" />
                    <span>Advisor is thinking...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="px-3 py-2 bg-white border-t border-neutral-100 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(action)}
                    className="whitespace-nowrap px-3 py-1 rounded-full bg-neutral-100 hover:bg-purple-50 text-neutral-700 hover:text-brand-purple border border-neutral-200/60 transition-colors font-medium"
                  >
                    {action}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your event query (English ya हिन्दी)..."
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || loading}
                  className="p-2.5 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/95 disabled:opacity-40 transition-colors"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AiChatAssistant;
