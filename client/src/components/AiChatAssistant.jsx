import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useEnquiry } from '../context/EnquiryContext';
import { 
  MessageSquare, X, Send, Sparkles, RefreshCw, 
  CheckCircle, ArrowRight, Image as ImageIcon, MapPin, 
  Calendar, Phone, ExternalLink, ChevronDown, Minimize2, Maximize2,
  Lock, Mail, User, ShieldCheck, Edit3, AlertCircle, ShoppingBag, Plus,
  Mic, MicOff
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
      text: `Shukriya! We have recorded your contact number: **${info.phone}**.\n\nOur event management team from Kandhari Tent & Caterers / Dwarka Shri Lawn will contact you shortly to understand your requirements and prepare a tailored estimate.\n\nYou can also click below to chat directly with our event desk on WhatsApp or call our toll-free helpline **1800-890-3456**.`,
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
      text: `We provide authentic Awadhi banqueting across 17 printed brochure courses (Welcome Drinks, Soups, Live Chaat, Barbecue Tandoor, Handi Paneer, Subziyan, Breads, Salad Bar, and Hot Desserts like Kesaria Jalebi with Rabri).\n\n• **Above 500 Guests:** Grand Veg Platter @ ₹650 / person | Grand Non-Veg Platter @ ₹850 / person\n• **250 to 500 Guests:** Royal Full Catering @ ₹750 / person (Veg) | Semi Catering @ ₹250 / person\n• **Under 250 Guests:** Per-plate price increases and varies based on specific menu courses.\n• **Printed Brochure Rule:** All snacks & starters are served strictly for 2 to 2.5 hours only. Generator diesel to be provided by client.\n\n👉 You can design your custom menu and calculate estimates directly on our **[Catering Page](/catering)**!`
    };
  }

  if (lower.includes('rate') || lower.includes('price') || lower.includes('cost') || lower.includes('budget') || lower.includes('package') || lower.includes('quotation') || lower.includes('kitna')) {
    return {
      text: `Here are our official, verified booking packages and contract rates:\n\n• **Catering Tiers:** >500 pax: Veg @ ₹650/pp &bull; Non-Veg @ ₹850/pp | 250–500 pax: Full @ ₹750/pp &bull; Semi @ ₹250/pp | <250 pax: Custom quotation.\n• **Standard Wedding Package (₹50,000):** Waterproof Tent + Ambient Lighting + Fresh Flower Gate & Stage Decor + DJ Sound Setup.\n• **Grand Royal Wedding Setup (₹1,10,000):** Signature Kanpur Road setup with 20×200 ft illuminated gallery, 14 Maharaja Sofas, 200 Highback Chairs, 16×24 ft Stage, 16×16 ft Mandap, 2 Gates & DJ.\n• **Approved Govt Contractors:** DRDO Lucknow seminar setups with 18% GST billing.\n\nWould you like a tailored quotation for your specific event date?`
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

  if (lower.includes('gallery') || lower.includes('photo') || lower.includes('picture') || lower.includes('real image') || lower.includes('album') || lower.includes('video')) {
    return {
      text: `Explore over 220 authentic Lucknow event photographs and video walkthrough reels in our **[Event & Venue Gallery](/gallery)** across 8 dedicated sections:\n\n1. Wedding and reception setups\n2. Dwarka Shri Lawn venue and grounds\n3. Stage and mandap designs\n4. Tent structures and canopy layouts\n5. Seating and furniture arrangements\n6. Floral decoration and lighting\n7. Catering and food counters\n8. Other event photographs\n\nAll photos and walkthrough reels feature genuine setups from our warehouse and Kanpur Road venue!`
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
  const { enquiryList = [], addItem, setIsDrawerOpen, subtotal = 0 } = useEnquiry();

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

  // Voice Dictation (Web Speech API)
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please type your query directly.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const spoken = event.results[0][0].transcript;
        if (spoken) {
          setInputText(spoken);
          setTimeout(() => {
            handleSend(spoken);
          }, 350);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition notice:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Could not start speech recognition:', e);
      setIsListening(false);
    }
  };

  // Initialize chat session with auto-recovery
  const initChat = async () => {
    try {
      const savedConvId = localStorage.getItem('kandhari_active_conv_id');
      if (savedConvId) {
        try {
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
        } catch (innerErr) {
          console.warn('Saved conversation expired or invalid, initializing fresh session:', innerErr);
          localStorage.removeItem('kandhari_active_conv_id');
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

    // 1. Primary: Three-Agent Client Agent Architecture
    try {
      let journeyMeta = { pages: [], clicks: [] };
      try {
        journeyMeta = JSON.parse(localStorage.getItem('kandhari_client_journey') || '{"pages":[],"clicks":[]}');
      } catch (e) {}

      const agentRes = await api.agents.clientChat({
        message: text,
        conversationHistory: messages,
        activeCart: enquiryList || [],
        clientContext: {
          pagesVisited: journeyMeta.pages || [],
          recentClicks: journeyMeta.clicks || [],
          locality: conversation?.collectedState?.locality || 'Lucknow',
          activeCartCount: (enquiryList || []).length
        }
      });

      if (agentRes && agentRes.success && agentRes.data) {
        const agentData = agentRes.data;

        // Proactive Single Item Cart Addition Execution
        if (agentData.action && agentData.action.type === 'add_to_cart' && agentData.action.item && addItem) {
          addItem(agentData.action.item, agentData.action.quantity || 1);
        }

        // Proactive Multiple Spoken Items Cart Addition Execution
        if (agentData.action && agentData.action.type === 'add_multiple_to_cart' && agentData.action.items && addItem) {
          agentData.action.items.forEach(it => addItem(it, it.quantity || 1));
        }

        const assistantMsg = {
          id: 'ast-' + Date.now(),
          role: 'assistant',
          content: agentData.reply,
          suggestedQuestions: agentData.suggestedQuestions,
          recommendedItems: agentData.recommendedItems,
          galleryPhotos: agentData.galleryPhotos,
          action: agentData.action,
          timestamp: new Date()
        };

        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== tempUserMsg.id);
          return [...filtered, tempUserMsg, assistantMsg];
        });

        // Fire-and-forget sync to persistent conversation
        try {
          api.sendChatMessage(activeConvId, text).catch(() => {});
        } catch (e) {}

        setLoading(false);
        return;
      }
    } catch (agentErr) {
      console.warn('Client agent specialized route error, falling back to standard conversation:', agentErr);
    }

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
                href="/contact"
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-amber-300"
                title="Toll-Free Helpline (1800-890-3456)"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/??text=Namaste!%20I%20am%20chatting%20on%20your%20website%20and%20need%20assistance%20for%20my%20event."
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-emerald-400"
                title="Official WhatsApp Support"
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
                      {((msg.galleryImages && msg.galleryImages.length > 0) || (msg.galleryPhotos && msg.galleryPhotos.length > 0)) && (
                        <div className="mt-3 pt-3 border-t border-neutral-100 space-y-2">
                          <p className="font-bold text-[11px] text-[#7c3aed] flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Authentic Setups ({((msg.galleryImages || msg.galleryPhotos) || []).length} Photographs):</span>
                          </p>
                          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                            {(msg.galleryImages || msg.galleryPhotos || []).map((img, i) => (
                              <div key={img.id || i} className="group relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 shadow-xs">
                                <img
                                  src={img.imageUrl || img.url}
                                  alt={img.title}
                                  className="w-full h-24 object-cover transition-transform group-hover:scale-105"
                                  loading="lazy"
                                />
                                <div className="p-1.5 bg-white">
                                  <p className="font-bold text-neutral-800 text-[10px] truncate">{img.title}</p>
                                  <button
                                    onClick={() => handleSend(`Mujhe "${img.title}" jaisa setup pasand hai. Iski availability aur details batayein.`)}
                                    className="mt-1 w-full py-0.5 text-[9px] font-bold bg-purple-50 text-brand-purple hover:bg-brand-purple hover:text-white rounded transition-colors flex items-center justify-center gap-1"
                                  >
                                    <Sparkles className="w-2.5 h-2.5" />
                                    <span>Enquire Style</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Display Direct Gallery Section Deep-Link Navigation */}
                      {msg.action && msg.action.type === 'navigate_gallery' && (
                        <div className="mt-3">
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              navigate(msg.action.url || '/gallery?section=Floral%20and%20lighting%20decor');
                            }}
                            className="w-full py-2.5 px-3 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
                            <span>{msg.action.title || 'Explore Floral & Lighting Gallery Section'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Display Add Multiple Spoken Items to Cart Action */}
                      {msg.action && msg.action.type === 'add_multiple_to_cart' && (
                        <div className="mt-3 p-3 rounded-xl bg-purple-50 border border-brand-purple/30 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-brand-purple">
                            <div className="flex items-center gap-1.5">
                              <ShoppingBag className="w-4 h-4 text-brand-purple" />
                              <span>Recognized Spoken Items ({msg.action.items?.length || 0} Items)</span>
                            </div>
                            <button
                              onClick={() => {
                                if (msg.action.items && addItem) {
                                  msg.action.items.forEach(it => addItem(it, it.quantity || 1));
                                  setIsDrawerOpen(true);
                                }
                              }}
                              className="px-2.5 py-1 bg-[#7c3aed] text-white text-[10px] rounded-lg font-bold hover:bg-[#6d28d9] transition flex items-center gap-1 shadow-xs"
                            >
                              <span>Add All to Cart</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Display Add to Cart Confirmation Action Pill */}
                      {msg.action && msg.action.type === 'add_to_cart' && (
                        <div className="mt-3 p-2.5 rounded-xl bg-purple-50 border border-brand-purple/30 flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-2 text-brand-purple font-bold">
                            <ShoppingBag className="w-4 h-4 text-brand-purple" />
                            <span>Added to Enquiry Cart</span>
                          </div>
                          <button
                            onClick={() => setIsDrawerOpen(true)}
                            className="px-2.5 py-1 bg-brand-primary text-white rounded-lg font-bold text-[10px] hover:bg-brand-primaryDark transition flex items-center gap-1 shadow-xs"
                          >
                            <span>View Cart</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Display Escalation to Owner / WhatsApp */}
                      {msg.action && msg.action.type === 'escalation' && (
                        <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                          <p className="font-bold text-[11px] text-emerald-800 flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            <span>Direct Human / Owner Connect:</span>
                          </p>
                          <div className="flex gap-2">
                            <a
                              href={msg.action.whatsappLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold text-center flex items-center justify-center gap-1"
                            >
                              <span>WhatsApp Desk</span>
                            </a>
                            <a
                              href={`tel:${msg.action.phone}`}
                              className="flex-1 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white text-[10px] font-bold text-center flex items-center justify-center gap-1"
                            >
                              <span>Call Toll-Free</span>
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Display Recommended Items with 1-Click Cart Addition */}
                      {msg.recommendedItems && msg.recommendedItems.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-neutral-100 space-y-2">
                          <p className="font-bold text-[11px] text-brand-purple flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Recommended Catalogue Options:</span>
                          </p>
                          <div className="grid grid-cols-1 gap-2">
                            {msg.recommendedItems.map((item, i) => (
                              <div key={item.id || i} className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-[11px]">
                                <div>
                                  <p className="font-bold text-neutral-800">{item.name}</p>
                                  <p className="text-[10px] text-neutral-500">₹{item.unitRate}/pc &bull; {item.bestFor}</p>
                                </div>
                                <button
                                  onClick={() => {
                                    if (addItem) addItem(item, 100);
                                  }}
                                  className="px-2.5 py-1 bg-brand-purple text-white rounded-lg font-bold text-[10px] hover:bg-brand-purple/90 transition flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Add 100</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Display Suggested Question Chips */}
                      {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {msg.suggestedQuestions.map((sq, i) => (
                            <button
                              key={i}
                              onClick={() => handleSend(sq)}
                              className="text-[10px] px-2.5 py-1 rounded-full bg-purple-50 text-brand-purple border border-brand-purple/20 hover:bg-brand-purple hover:text-white transition font-medium"
                            >
                              {sq}
                            </button>
                          ))}
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

              {/* Voice recognition status banner */}
              {isListening && (
                <div className="px-3 py-1.5 bg-rose-50 border-t border-rose-200 text-rose-700 text-[11px] font-semibold flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-rose-600 animate-spin" />
                    <span>Listening... speak items like "100 pvc chair", "20*40 pandal", "mandap"</span>
                  </div>
                  <button 
                    type="button"
                    onClick={toggleListening}
                    className="text-[10px] text-rose-800 underline font-bold"
                  >
                    Stop
                  </button>
                </div>
              )}

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
                  placeholder="Type or click mic to speak items (English ya हिन्दी)..."
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
                />

                {/* Voice Activation (Mic) Toggle */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2.5 rounded-xl transition-all ${
                    isListening 
                      ? 'bg-rose-500 text-white animate-pulse shadow-md ring-2 ring-rose-400' 
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-brand-purple'
                  }`}
                  title={isListening ? "Listening... click to stop" : "Voice input (Speak in Hindi or English)"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

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
