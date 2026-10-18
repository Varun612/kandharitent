import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, X, Send, Sparkles, RefreshCw, 
  CheckCircle, ArrowRight, Image as ImageIcon, MapPin, 
  Calendar, Phone, ExternalLink, ChevronDown, Minimize2, Maximize2,
  Lock, Mail, User, ShieldCheck, Edit3, AlertCircle
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

  if (lower.includes('cater') || lower.includes('menu') || lower.includes('food') || lower.includes('khana') || lower.includes('dish') || lower.includes('starter') || lower.includes('sweet') || lower.includes('paneer') || lower.includes('chaat')) {
    return {
      text: `We provide 100% pure-vegetarian Awadhi banqueting across 17 printed brochure courses (Welcome Drinks, Soups, Live Chaat, Barbecue Tandoor, Handi Paneer, Subziyan, Breads, Salad Bar, and Hot Desserts like Kesaria Jalebi with Rabri).\n\n• **Full Catering Package:** ₹750/person (for ≥250 guests)\n• **Semi Catering Package:** ₹250/person (for ≥250 guests; includes buffet warmers, setup & service staff)\n• **Printed Brochure Rule:** All snacks & starters are served strictly for 2 to 2.5 hours only. Generator diesel to be provided by client.\n\n👉 You can explore all 17 categories and design your custom menu directly on our **[Catering Page](/catering)**!`
    };
  }

  if (lower.includes('rate') || lower.includes('price') || lower.includes('cost') || lower.includes('budget') || lower.includes('package') || lower.includes('quotation') || lower.includes('kitna')) {
    return {
      text: `Here are our official, verified booking packages and contract rates:\n\n• **Standard Wedding Package (₹50,000):** Waterproof Tent + Ambient Lighting + Fresh Flower Gate & Stage Decor + DJ Sound Setup.\n• **Grand Royal Wedding Setup (₹1,10,000):** Signature Kanpur Road setup with 20×200 ft illuminated gallery, 14 Maharaja Sofas, 200 Highback Chairs, 16×24 ft Stage, 16×16 ft Mandap, 2 Gates & DJ.\n• **Catering:** Full Catering at ₹750/person | Semi Catering at ₹250/person (≥250 guests).\n• **Approved Govt Contractors:** DRDO Lucknow seminar setups with 18% GST billing.\n\nWould you like a tailored quotation for your specific event date?`
    };
  }

  if (lower.includes('chair') || lower.includes('sofa') || lower.includes('table') || lower.includes('kursi') || lower.includes('furniture') || lower.includes('carpet') || lower.includes('takhat') || lower.includes('gadda') || (lower.includes('rent') && !lower.includes('tent'))) {
    return {
      text: `Here are our verified per-unit equipment rental rates from our Lucknow warehouse:\n\n• **Highback Banquet Chair:** ₹70 / pc\n• **VIP Chair:** ₹50 / pc | **PVC Chair:** ₹20 / pc\n• **Maharaja 2-Seater Sofa:** ₹600 / pc\n• **Center Table:** ₹300 / pc\n• **Mez Set (Table 2.5×5 ft):** ₹80 / set\n• **Round Table with Cover:** ₹150 – ₹200 / pc\n• **Takhat:** ₹80 | **Gadda (Mattress):** ₹60 | **Drum:** ₹100\n• **Red / 3D Carpet:** ₹2 / sq.ft\n\nAdd any item to your list in our **[Catalogue](/catalogue)** for an instant estimate!`
    };
  }

  if (lower.includes('stage') || lower.includes('decor') || lower.includes('mandap') || lower.includes('flower') || lower.includes('light')) {
    return {
      text: `Our decoration setups include:\n\n• Grand floral mandaps (Fresh & Artificial floral styling)\n• Royal reception stage backdrops with crystal chandeliers\n• Welcoming entrance arches with fairy light tunnels\n• Cold pyros, dry ice fog, and ambient LED lighting\n\nPlease check our Gallery page or let us know your preferred theme!`
    };
  }

  if (lower.includes('gallery') || lower.includes('photo') || lower.includes('picture') || lower.includes('real image') || lower.includes('album')) {
    return {
      text: `Explore our genuine Lucknow event photographs in the **[Event & Venue Gallery](/gallery)** across 7 dedicated sections:\n\n1. Actual wedding & reception setups\n2. Dwarka Shri Lawn venue & grounds\n3. Stage and mandap designs\n4. Tent structures & canopy layouts\n5. Seating & furniture arrangements\n6. Floral & lighting decor\n7. Catering & food counters\n\nAll photos feature real setups from our warehouse and Kanpur Road venue!`
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
  const navigate = useNavigate();
  const { isCustomerAuthenticated, customerUser, customerLogin, customerRegister } = useAuth();

  // Auth Modal State (Chat -> Auth flow)
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('register'); // 'register' or 'login'
  const [authForm, setAuthForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Review & Edit Summary Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    customerName: '',
    phone: '',
    whatsappNumber: '',
    eventType: 'Wedding / Celebration',
    eventDate: '',
    locality: 'Kanpur Road, Lucknow',
    guestCount: 300,
    serviceRequired: 'Tent-house equipment rentals and venue setup',
    notes: ''
  });
  const [reviewError, setReviewError] = useState('');

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

  // Prepare Review Form based on collected state & customer account details
  const prepareReviewForm = () => {
    const state = conversation?.collectedState || {};
    setReviewForm({
      customerName: customerUser?.name || state.customerName || '',
      phone: customerUser?.phone || state.phone || '',
      whatsappNumber: customerUser?.phone || state.whatsappNumber || state.phone || '',
      eventType: state.eventType || 'Wedding / Celebration',
      eventDate: state.eventDate || '',
      locality: state.locality || 'Kanpur Road, Lucknow',
      guestCount: state.guestCount || 300,
      serviceRequired: (state.selectedServices && state.selectedServices.length > 0)
        ? state.selectedServices.join(', ')
        : 'Tent-house equipment rentals and venue setup',
      notes: state.specialRequests || ''
    });
    setReviewError('');
  };

  // Critical Journey: Initiate Submission -> Check Auth -> Modal or Review
  const handleInitiateSubmission = () => {
    if (!isCustomerAuthenticated) {
      // 1. Preserve collected state in sessionStorage
      const pendingData = {
        conversationId: conversation?.id,
        collectedState: conversation?.collectedState || {}
      };
      sessionStorage.setItem('kandhari_pending_chat_enquiry', JSON.stringify(pendingData));

      // 2. Pre-fill auth form if name/phone detected in chat
      setAuthForm({
        name: conversation?.collectedState?.customerName || '',
        email: '',
        phone: conversation?.collectedState?.phone || '',
        password: ''
      });
      setAuthError('');
      setAuthModalOpen(true);
      return;
    }

    // Already signed in: go straight to review & edit
    prepareReviewForm();
    setReviewModalOpen(true);
  };

  // Handle Auth submission from inline modal
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'register') {
        if (!authForm.name.trim() || !authForm.email.trim() || !authForm.phone.trim() || !authForm.password) {
          throw new Error('Please fill in all fields to create your customer account.');
        }
        const cleanPhone = authForm.phone.replace(/[\s-]/g, '');
        if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
          throw new Error('Please enter a valid 10-digit Indian mobile number.');
        }
        await customerRegister({
          name: authForm.name.trim(),
          email: authForm.email.trim(),
          phone: cleanPhone,
          password: authForm.password
        });
      } else {
        if (!authForm.email.trim() || !authForm.password) {
          throw new Error('Please provide both your email address and password.');
        }
        await customerLogin({
          email: authForm.email.trim(),
          password: authForm.password
        });
      }

      // Successfully authenticated! Close auth modal and open Review & Edit
      setAuthModalOpen(false);
      prepareReviewForm();
      setReviewModalOpen(true);
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Final submission of edited enquiry with customer's verified token
  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    if (!conversation?.id || submittingEnquiry) return;
    setReviewError('');

    if (!reviewForm.customerName.trim()) {
      setReviewError('Please enter your full name.');
      return;
    }
    const cleanPhone = reviewForm.phone.replace(/[\s-]/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setReviewError('Please provide a valid 10-digit mobile number.');
      return;
    }
    if (!reviewForm.eventDate.trim()) {
      setReviewError('Please provide your proposed event date.');
      return;
    }

    setSubmittingEnquiry(true);

    try {
      const payload = {
        customerName: reviewForm.customerName.trim(),
        phone: cleanPhone,
        whatsappNumber: reviewForm.whatsappNumber ? reviewForm.whatsappNumber.replace(/[\s-]/g, '') : cleanPhone,
        eventType: reviewForm.eventType,
        eventDate: reviewForm.eventDate.trim(),
        locality: reviewForm.locality,
        guestCount: parseInt(reviewForm.guestCount, 10) || 0,
        serviceRequired: reviewForm.serviceRequired,
        notes: reviewForm.notes.trim()
      };

      const res = await api.submitChatEnquiry(conversation.id, payload);
      if (res.success) {
        // Clear pending sessionStorage
        sessionStorage.removeItem('kandhari_pending_chat_enquiry');

        setSubmittedRef(res.referenceNumber);
        setWhatsappLink(res.whatsappUrl);
        setReviewModalOpen(false);

        // Refresh conversation to show confirmed message
        const updated = await api.getChat(conversation.id);
        if (updated.success) {
          setMessages(updated.conversation.messages);
        }
      } else {
        setReviewError(res.message || 'Could not submit enquiry. Please call us directly.');
      }
    } catch (err) {
      console.error('Failed to submit enquiry from chat:', err);
      setReviewError(err.message || 'Network error submitting enquiry.');
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  // Check if pending inquiry is stored in sessionStorage
  const hasPendingInquiry = !submittedRef && typeof window !== 'undefined' && !!sessionStorage.getItem('kandhari_pending_chat_enquiry');

  // Quick Action Chips
  const quickActions = [
    'Aapke lawn ki photos hain?',
    'Catering package & menu rate?',
    'Wedding packages bataiye (₹50k / ₹1.1L)',
    'Chairs & sofa rental rates kya hain?',
    'German hangar tent chahiye',
    'Stage aur mandap decor dikhayein'
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
            <div className="flex-1 flex flex-col relative overflow-hidden">
              
              {/* Pending Inquiry Resume Banner */}
              {hasPendingInquiry && !authModalOpen && !reviewModalOpen && (
                <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-amber-500/10 border-b border-amber-200/80 px-4 py-2 flex items-center justify-between text-xs text-neutral-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>In-progress event enquiry saved.</span>
                  </div>
                  <button
                    onClick={handleInitiateSubmission}
                    className="px-2.5 py-1 bg-brand-primary text-white font-bold rounded-lg text-[10px] hover:bg-brand-primary/95 transition-colors"
                  >
                    Resume & Submit
                  </button>
                </div>
              )}

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

                {/* Slot Summary Card & Initiation Button */}
                {conversation?.collectedState?.phone && !submittedRef && (
                  <div className="bg-purple-50/90 border border-brand-purple/30 rounded-2xl p-4 shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-brand-purple font-bold text-xs">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Ready to Submit Official Enquiry</span>
                      </div>
                      {isCustomerAuthenticated ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          Signed In
                        </span>
                      ) : (
                        <span className="text-[10px] bg-purple-100 text-brand-purple font-semibold px-2 py-0.5 rounded-full">
                          Sign In Required
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-neutral-600 space-y-0.5 bg-white p-2.5 rounded-xl border border-purple-100">
                      {conversation.collectedState.eventType && <p>• <b>Event:</b> {conversation.collectedState.eventType}</p>}
                      {conversation.collectedState.eventDate && <p>• <b>Date:</b> {conversation.collectedState.eventDate}</p>}
                      {conversation.collectedState.guestCount > 0 && <p>• <b>Guests:</b> {conversation.collectedState.guestCount}</p>}
                      {conversation.collectedState.locality && <p>• <b>Location:</b> {conversation.collectedState.locality}</p>}
                      {conversation.collectedState.phone && <p>• <b>Phone:</b> {conversation.collectedState.phone}</p>}
                    </div>

                    <button
                      onClick={handleInitiateSubmission}
                      className="w-full py-2.5 bg-gradient-to-r from-brand-primary to-brand-purple text-white font-bold rounded-xl text-xs hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 shadow"
                    >
                      <span>{isCustomerAuthenticated ? 'Review Details & Submit Enquiry' : 'Sign In to Review & Submit Enquiry'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Submitted Success Badge (Real Database Confirmation) */}
                {submittedRef && (
                  <div className="bg-brand-cream/80 border border-brand-border rounded-2xl p-5 shadow-xs text-center space-y-3">
                    <div className="w-12 h-12 bg-amber-50 border border-brand-gold/30 rounded-full flex items-center justify-center mx-auto text-brand-gold shadow-xs">
                      <CheckCircle className="w-7 h-7 text-brand-primary" />
                    </div>
                    <div>
                      <p className="font-serif font-bold text-brand-primary text-base">Inquiry Received Successfully</p>
                      <p className="text-xs text-neutral-700 mt-1 leading-relaxed">
                        Thank you for contacting <strong>Kandhari Tent & Caterers</strong>! Your inquiry has been received. Our team will review your requirements and get in touch with you shortly.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      {whatsappLink && (
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 transition-colors shadow"
                        >
                          <span>Open WhatsApp Summary</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/account');
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold hover:bg-brand-plum transition-colors shadow"
                      >
                        <User className="w-3.5 h-3.5 text-brand-gold" />
                        <span>Client Portal</span>
                      </button>
                    </div>
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

              {/* MODAL 1: Customer Auth Modal (Sign In / Register) */}
              {authModalOpen && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center p-3 animate-fadeIn">
                  <div className="bg-white rounded-2xl w-full max-h-[92%] flex flex-col shadow-2xl overflow-hidden border border-neutral-200">
                    {/* Header */}
                    <div className="bg-brand-primary text-white p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-brand-gold" />
                        <h4 className="font-serif text-sm font-bold">
                          {authMode === 'register' ? 'Create Customer Account' : 'Sign In to Account'}
                        </h4>
                      </div>
                      <button
                        onClick={() => setAuthModalOpen(false)}
                        className="text-neutral-300 hover:text-white p-1 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Required Prompt Banner */}
                    <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2.5 text-xs text-amber-900 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="font-medium leading-relaxed">
                        Please sign in or create an account to submit your inquiry. Your event details will be retained while you sign in.
                      </p>
                    </div>

                    {/* Mode Switcher */}
                    <div className="flex border-b border-neutral-200 bg-neutral-50 text-xs">
                      <button
                        type="button"
                        onClick={() => { setAuthMode('register'); setAuthError(''); }}
                        className={`flex-1 py-2.5 font-bold transition-colors ${
                          authMode === 'register' 
                            ? 'bg-white text-brand-purple border-b-2 border-brand-purple' 
                            : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                      >
                        Create Account
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAuthMode('login'); setAuthError(''); }}
                        className={`flex-1 py-2.5 font-bold transition-colors ${
                          authMode === 'login' 
                            ? 'bg-white text-brand-purple border-b-2 border-brand-purple' 
                            : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                      >
                        Sign In
                      </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleAuthSubmit} className="p-4 space-y-3 overflow-y-auto text-xs">
                      {authError && (
                        <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                          <span>{authError}</span>
                        </div>
                      )}

                      {authMode === 'register' && (
                        <div>
                          <label className="block text-neutral-600 font-bold mb-1">Your Full Name</label>
                          <div className="relative">
                            <User className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                            <input
                              type="text"
                              value={authForm.name}
                              onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                              placeholder="e.g. Vikas Malhotra"
                              className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
                              required
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-neutral-600 font-bold mb-1">Email Address</label>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                          <input
                            type="email"
                            value={authForm.email}
                            onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                            placeholder="vikas@example.com"
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
                            required
                          />
                        </div>
                      </div>

                      {authMode === 'register' && (
                        <div>
                          <label className="block text-neutral-600 font-bold mb-1">Mobile Number (10 Digits)</label>
                          <div className="relative">
                            <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                            <input
                              type="tel"
                              value={authForm.phone}
                              onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                              placeholder="9839123456"
                              maxLength={10}
                              className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
                              required
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-neutral-600 font-bold mb-1">Password</label>
                        <div className="relative">
                          <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                          <input
                            type="password"
                            value={authForm.password}
                            onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                            placeholder="••••••••"
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
                            required
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAuthModalOpen(false)}
                          className="flex-1 py-2.5 bg-neutral-100 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-200 transition-colors"
                        >
                          Back to Chat
                        </button>
                        <button
                          type="submit"
                          disabled={authLoading}
                          className="flex-1 py-2.5 bg-gradient-to-r from-brand-primary to-brand-purple text-white font-bold rounded-xl hover:opacity-95 transition-opacity disabled:opacity-50"
                        >
                          {authLoading ? 'Verifying...' : (authMode === 'register' ? 'Register & Continue' : 'Sign In & Continue')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL 2: Review & Edit Summary Modal */}
              {reviewModalOpen && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center p-3 animate-fadeIn">
                  <div className="bg-white rounded-2xl w-full max-h-[95%] flex flex-col shadow-2xl overflow-hidden border border-neutral-200">
                    {/* Header */}
                    <div className="bg-brand-primary text-white p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-brand-gold" />
                        <div>
                          <h4 className="font-serif text-sm font-bold">Review & Confirm Event Details</h4>
                          <p className="text-[10px] text-neutral-300">Verified Account: {customerUser?.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setReviewModalOpen(false)}
                        className="text-neutral-300 hover:text-white p-1 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Review Form */}
                    <form onSubmit={handleConfirmSubmit} className="p-4 space-y-3 overflow-y-auto text-xs">
                      {reviewError && (
                        <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                          <span>{reviewError}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-neutral-600 font-bold mb-1">Your Name</label>
                          <input
                            type="text"
                            value={reviewForm.customerName}
                            onChange={(e) => setReviewForm({ ...reviewForm, customerName: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-neutral-600 font-bold mb-1">Mobile Phone</label>
                          <input
                            type="tel"
                            value={reviewForm.phone}
                            onChange={(e) => setReviewForm({ ...reviewForm, phone: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
                            maxLength={10}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-neutral-600 font-bold mb-1">Event Type</label>
                          <select
                            value={reviewForm.eventType}
                            onChange={(e) => setReviewForm({ ...reviewForm, eventType: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple bg-white"
                          >
                            <option value="Wedding">Wedding</option>
                            <option value="Reception">Reception</option>
                            <option value="Pre-Wedding Ceremony">Pre-Wedding (Haldi/Mehendi)</option>
                            <option value="Birthday Party">Birthday Party</option>
                            <option value="Corporate / Exhibition">Corporate / Exhibition</option>
                            <option value="Other Celebration">Other Celebration</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-neutral-600 font-bold mb-1">Proposed Event Date</label>
                          <input
                            type="text"
                            value={reviewForm.eventDate}
                            onChange={(e) => setReviewForm({ ...reviewForm, eventDate: e.target.value })}
                            placeholder="e.g. 20 November 2026"
                            className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-neutral-600 font-bold mb-1">Locality in Lucknow</label>
                          <input
                            type="text"
                            value={reviewForm.locality}
                            onChange={(e) => setReviewForm({ ...reviewForm, locality: e.target.value })}
                            placeholder="e.g. Kanpur Road / Daroga Kheda"
                            className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
                          />
                        </div>
                        <div>
                          <label className="block text-neutral-600 font-bold mb-1">Expected Guests</label>
                          <input
                            type="number"
                            value={reviewForm.guestCount}
                            onChange={(e) => setReviewForm({ ...reviewForm, guestCount: e.target.value })}
                            min="10"
                            max="5000"
                            className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-neutral-600 font-bold mb-1">Services Needed</label>
                        <input
                          type="text"
                          value={reviewForm.serviceRequired}
                          onChange={(e) => setReviewForm({ ...reviewForm, serviceRequired: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-600 font-bold mb-1">Additional Notes / Special Requests</label>
                        <textarea
                          rows={2}
                          value={reviewForm.notes}
                          onChange={(e) => setReviewForm({ ...reviewForm, notes: e.target.value })}
                          placeholder="Specific themes, waterproof German tent, floral mandap, etc."
                          className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
                        />
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setReviewModalOpen(false)}
                          className="flex-1 py-2.5 bg-neutral-100 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-200 transition-colors"
                        >
                          Edit Later
                        </button>
                        <button
                          type="submit"
                          disabled={submittingEnquiry}
                          className="flex-1 py-2.5 bg-gradient-to-r from-brand-primary to-brand-purple text-white font-bold rounded-xl hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          {submittingEnquiry ? 'Submitting...' : 'Confirm & Submit'}
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AiChatAssistant;
