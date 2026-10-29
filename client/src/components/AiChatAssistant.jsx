import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useEnquiry } from '../context/EnquiryContext';
import { 
  MessageSquare, X, Send, Sparkles, RefreshCw, 
  CheckCircle, ArrowRight, Image as ImageIcon, MapPin, 
  Calendar, Phone, ExternalLink, ChevronDown, Minimize2, Maximize2,
  Lock, Mail, User, ShieldCheck, Edit3, AlertCircle, ShoppingBag, Plus,
  Mic, MicOff, HeartHandshake, Volume2, VolumeX, Square, RotateCcw, AudioLines
} from 'lucide-react';

// Extract phone and details from text
const extractLeadInfo = (text) => {
  const phoneMatch = text.match(/(?:(?:\+|0{0,2})91[\s-]*)?([6-9]\d{9})/);
  const phone = phoneMatch ? phoneMatch[1] : null;

  let eventType = null;
  const lower = text.toLowerCase();
  if (lower.includes('chautha') || lower.includes('shradh') || lower.includes('condolence') || lower.includes('death')) eventType = 'Condolence / Chautha';
  else if (lower.includes('shaadi') || lower.includes('wedding')) eventType = 'Wedding';
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
// Strictly adheres to Kandhari Event Concierge instructions: 2-3 short sentences, 5 categories, no upselling on bereavement.
const getClientAiResponse = (text) => {
  const lower = text.toLowerCase();
  const info = extractLeadInfo(text);

  // Category A: Bereavement & Condolence (Priority Rule)
  const isBereavement = ['chautha', 'shradh', 'terhavi', 'condolence', 'passed away', 'death', 'expired', 'guzar gaye', 'shanti path', 'shok sabha', 'rip', 'funeral'].some(kw => lower.includes(kw));
  if (isBereavement) {
    if (info.phone) {
      return {
        text: `I'm very sorry for your loss. We have recorded your callback number (${info.phone}) and our team will coordinate with you immediately. You can also reach our direct desk at +91 9305465848.`,
        isUrgent: true,
        category: 'A',
        actionSuggestions: ['Call +91 9305465848', 'Send Urgent Enquiry']
      };
    }
    return {
      text: "I'm very sorry for your loss. I'll help you communicate the arrangements as quickly and respectfully as possible; what date and time is the gathering?",
      isUrgent: true,
      category: 'A',
      actionSuggestions: ['Today / Tonight (Urgent)', 'Tomorrow', 'Chairs & Mattresses', 'Request a Callback']
    };
  }

  // Category B: Birthday & Celebrations
  if (lower.includes('birthday') || lower.includes('bday') || lower.includes('janamdin') || lower.includes('anniversary')) {
    return {
      text: "Let's make your celebration special! What date is the event, and approximately how many guests are you expecting?",
      category: 'B',
      actionSuggestions: ['Princess Theme', 'Jungle Theme', 'Cartoon Theme', 'Check Availability']
    };
  }

  // Category C: Lawn & Weddings
  if (lower.includes('lawn') || lower.includes('dwarka') || lower.includes('dwaraka') || lower.includes('wedding') || lower.includes('shaadi') || lower.includes('reception')) {
    return {
      text: "Planning an event at Dwaraka Shree Lawn? What date are you considering, and approximately how many guests will attend?",
      category: 'C',
      actionSuggestions: ['Check Availability', 'Arrange a Site Visit', 'Include Royal Catering']
    };
  }

  // Category D: Catering
  if (lower.includes('cater') || lower.includes('menu') || lower.includes('food') || lower.includes('khana')) {
    return {
      text: "At Kandhari Tent & Caterers, our banqueting covers 17 printed brochure courses including live Awadhi chaat and barbecue. Rates are ₹650/person for >500 guests and ₹750/person for 250–500 guests. What event date and estimated guest count are you planning for?",
      category: 'D',
      actionSuggestions: ['Design Menu on Catering Page', 'Check Availability', 'Request a Quote']
    };
  }

  // Category D: Equipment / Tent Rental
  if (lower.includes('chair') || lower.includes('sofa') || lower.includes('table') || lower.includes('tent') || lower.includes('hangar') || lower.includes('cooler') || lower.includes('rent')) {
    return {
      text: "Certainly, I can help with tent and equipment requirements. What items do you need, for which date, and in which locality?",
      category: 'D',
      actionSuggestions: ['German Hangar Tent', 'VIP & Banquet Chairs', 'Coolers & Mist Fans', 'Request a Quote']
    };
  }

  // Contact / Human request
  if (lower.includes('human') || lower.includes('call') || lower.includes('number') || lower.includes('contact') || info.phone) {
    return {
      text: "You can reach our team directly at +91 9305465848. Or share your phone number, and we will arrange an immediate callback.",
      actionSuggestions: ['Call +91 9305465848', 'Request a Callback', 'Send Enquiry']
    };
  }

  // General Fallback (Category E)
  return {
    text: "I can help with event planning, venue enquiries, or tent and equipment rental. What are you looking to arrange?",
    category: 'E',
    actionSuggestions: ['Condolence / Chautha', 'Birthday Celebration', 'Wedding / Lawn Booking', 'Tent / Equipment Rental']
  };
};

const getWelcomeMessage = (pathname = '/') => {
  if (pathname.includes('/lawn')) {
    return {
      content: "Welcome to Dwaraka Shree Lawn. Are you planning a wedding, reception, or another event? Share your preferred date and approximate guest count, and I'll help you with the next step.",
      category: 'C',
      actionSuggestions: [
        'Wedding & Reception',
        'Sangeet & Mehendi',
        'Arrange a Site Visit',
        'Check Date Availability'
      ]
    };
  }
  if (pathname.includes('/catalogue')) {
    return {
      content: "Looking for event equipment? Tell me what you're arranging and your event date, and I'll help identify the relevant items and availability.",
      category: 'D',
      actionSuggestions: [
        'German Hangar Tents',
        'VIP & Banquet Chairs',
        'Coolers & Mist Fans',
        'Full Stage & Mandap Setup'
      ]
    };
  }
  if (pathname.includes('/catering')) {
    return {
      content: "Welcome to our Royal Catering Desk. What event date and estimated guest count are you planning for?",
      category: 'D',
      actionSuggestions: [
        '>500 Guests (₹650/pp)',
        '250-500 Guests (₹750/pp)',
        'Design Custom Menu',
        'Check Availability'
      ]
    };
  }
  return {
    content: "Welcome to Kandhari Event Concierge! What can I help you arrange today?",
    category: 'E',
    actionSuggestions: [
      '🕊️ Condolence / Chautha / Shradh',
      '🎂 Birthday / Social Celebration',
      '🎪 Wedding / Lawn Booking',
      '⛺ Tent / Equipment Rental',
      '📋 Other Event / Enquiry'
    ]
  };
};

const createInitialState = (id = 'conv-init-' + Date.now(), pathname = '/') => {
  const welcome = getWelcomeMessage(pathname);
  return {
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
        content: welcome.content,
        actionSuggestions: welcome.actionSuggestions,
        category: welcome.category,
        timestamp: new Date()
      }
    ]
  };
};

const AiChatAssistant = () => {
  const location = useLocation();
  const currentPath = location?.pathname || '/';
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversation, setConversation] = useState(() => createInitialState('conv-init-' + Date.now(), typeof window !== 'undefined' ? window.location.pathname : '/'));
  const [messages, setMessages] = useState(() => createInitialState('conv-init-' + Date.now(), typeof window !== 'undefined' ? window.location.pathname : '/').messages);
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

  // Voice Concierge Engine State (Speech-to-Text & Text-to-Speech)
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceState, setVoiceState] = useState('idle'); // 'idle' | 'listening' | 'thinking' | 'speaking' | 'error'
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Stop ongoing speech synthesis immediately
  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setCurrentlySpeakingId(null);
    if (voiceState === 'speaking') {
      setVoiceState('idle');
    }
  };

  // Speak assistant response aloud with fluent Indian English / Hindi voice
  const speakResponse = (text, messageId = null) => {
    if (isAudioMuted || typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();

      // Clean text for speech: remove markdown symbols, bullets, bracketed links, emojis
      const cleanText = (text || '')
        .replace(/[*#_~`>]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/[🕊️🎂🎪⛺📋✨👑📍📞💡⭐]/g, '')
        .replace(/₹(\d+)/g, 'Rupees $1')
        .replace(/\b([6-9]\d{9})\b/g, (num) => num.split('').join(' '))
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Select natural voice (prefers Indian English, Hindi, or pleasant female/male voice)
      const voices = window.speechSynthesis.getVoices() || [];
      const preferredVoice = voices.find(v => 
        v.lang === 'hi-IN' || 
        v.lang === 'en-IN' || 
        v.name.toLowerCase().includes('india') || 
        v.name.toLowerCase().includes('hindi') ||
        v.name.toLowerCase().includes('swara') ||
        v.name.toLowerCase().includes('heera')
      ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.rate = 0.95; // Warm, dignified cadence
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setCurrentlySpeakingId(messageId);
        setVoiceState('speaking');
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentlySpeakingId(null);
        setVoiceState('idle');
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis event notice:', e);
        setIsSpeaking(false);
        setCurrentlySpeakingId(null);
        setVoiceState('idle');
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis could not speak:', err);
      setIsSpeaking(false);
      setCurrentlySpeakingId(null);
      setVoiceState('idle');
    }
  };

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  // Listen for custom event to open chat with specific conversation, category, or service intent
  useEffect(() => {
    const handleOpenChat = (event) => {
      setIsOpen(true);
      setIsMinimized(false);

      if (event.detail?.eventType) {
        setConversation(prev => ({
          ...prev,
          collectedState: {
            ...(prev?.collectedState || {}),
            eventType: event.detail.eventType
          }
        }));
      }

      if (event.detail?.conversationId) {
        loadConversation(event.detail.conversationId);
      } else if (event.detail?.initialMessage) {
        initAndSendMessage(event.detail.initialMessage);
      }

      if (event.detail?.mode === 'voice') {
        setTimeout(() => {
          toggleListening();
        }, 400);
      }
    };

    window.addEventListener('open-ai-chat', handleOpenChat);
    return () => window.removeEventListener('open-ai-chat', handleOpenChat);
  }, []);

  // Voice Dictation (Web Speech API with live transcript and error handling)
  const toggleListening = () => {
    stopSpeaking(); // Interrupt ongoing assistant speech
    setVoiceError('');

    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      setVoiceState('idle');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError("Voice recognition is not supported in this browser. Please type your query.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceState('listening');
        setLiveTranscript('');
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const spoken = final || interim;
        if (spoken) {
          setLiveTranscript(spoken);
          setInputText(spoken);
        }
        if (final) {
          setIsListening(false);
          setVoiceState('thinking');
          setTimeout(() => {
            handleSend(final);
            setLiveTranscript('');
          }, 250);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition notice:', event.error);
        setIsListening(false);
        setVoiceState('idle');
        if (event.error === 'not-allowed') {
          setVoiceError('Microphone permission was denied. Please allow microphone access.');
        } else if (event.error === 'no-speech') {
          setVoiceError('No speech was detected. Please tap the mic and speak again.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (voiceState === 'listening') {
          setVoiceState('idle');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Could not start speech recognition:', e);
      setIsListening(false);
      setVoiceState('idle');
      setVoiceError('Unable to activate microphone. Please type your request.');
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
    const fresh = createInitialState('conv-' + Date.now(), currentPath);
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

// Contextual Visual Enrichment based on event intent (Phase 6)
const getContextualVisuals = (userText = '', replyText = '') => {
  const combined = (userText + ' ' + replyText).toLowerCase();
  
  if (combined.includes('lawn') || combined.includes('dwarka') || combined.includes('dwaraka') || combined.includes('venue')) {
    return [
      { id: 'v-lawn-1', imageUrl: '/media/lawns/lawn-main.jpg', title: 'Dwarka Shri Lawn Grounds (800–1000 Pax)' },
      { id: 'v-lawn-2', imageUrl: '/media/weddings/wedding-1.jpg', title: 'Grand Wedding & Hangar Layout' }
    ];
  }
  if (combined.includes('mandap') || combined.includes('stage') || combined.includes('phera')) {
    return [
      { id: 'v-mandap-1', imageUrl: '/media/mandap/mandap-1.jpg', title: 'Vedic Rose & Marigold Mandap' },
      { id: 'v-stage-1', imageUrl: '/media/stage/stage-1.jpg', title: '30ft Elevated Carved Palace Stage' }
    ];
  }
  if (combined.includes('birthday') || combined.includes('bday') || combined.includes('party')) {
    return [
      { id: 'v-bday-1', imageUrl: '/media/rich-decor/decor-2.jpg', title: 'Themed Birthday Balloon & Light Decor' }
    ];
  }
  if (combined.includes('cater') || combined.includes('menu') || combined.includes('khana') || combined.includes('chaat') || combined.includes('plate')) {
    return [
      { id: 'v-cat-1', imageUrl: '/media/catering/catering-1.jpg', title: 'Laser-Cut Illuminated Buffet Line' },
      { id: 'v-cat-2', imageUrl: '/media/catering/catering-2.jpg', title: 'Starlight Open-Air Food Counters' }
    ];
  }
  if (combined.includes('hangar') || combined.includes('tent') || combined.includes('waterproof') || combined.includes('pandal')) {
    return [
      { id: 'v-tent-1', imageUrl: '/media/rich-decor/decor-1.jpg', title: 'Waterproof German Hangar Pavilion' }
    ];
  }
  return null;
};

  const handleSend = async (textToSend = inputText, convId = null) => {
    const text = (textToSend || '').trim();
    if (!text || loading) return;

    stopSpeaking(); // Interrupt ongoing voice response

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

        const contextualVisuals = (!agentData.galleryPhotos || agentData.galleryPhotos.length === 0) 
          ? getContextualVisuals(text, agentData.reply)
          : null;

        const assistantMsg = {
          id: 'ast-' + Date.now(),
          role: 'assistant',
          content: agentData.reply,
          suggestedQuestions: agentData.suggestedQuestions,
          actionSuggestions: agentData.actionSuggestions || agentData.suggestedQuestions,
          recommendedItems: agentData.recommendedItems,
          galleryPhotos: agentData.galleryPhotos || contextualVisuals,
          action: agentData.action,
          category: agentData.category,
          isUrgent: agentData.isUrgent,
          timestamp: new Date()
        };

        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== tempUserMsg.id);
          return [...filtered, tempUserMsg, assistantMsg];
        });

        // Speak aloud using Voice Concierge TTS
        speakResponse(assistantMsg.content, assistantMsg.id);

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
        const assistantWithVisuals = {
          ...res.assistantMessage,
          id: res.assistantMessage.id || ('ast-' + Date.now()),
          actionSuggestions: res.assistantMessage.actionSuggestions || res.assistantMessage.suggestedQuestions,
          galleryImages: res.assistantMessage.galleryImages || getContextualVisuals(text, res.assistantMessage.content)
        };

        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== tempUserMsg.id);
          return [...filtered, res.userMessage, assistantWithVisuals];
        });

        // Speak response aloud
        speakResponse(assistantWithVisuals.content, assistantWithVisuals.id);

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
      const contextualVisuals = getContextualVisuals(text, fallbackResult.text);

      const assistantMsg = {
        id: 'ast-' + Date.now(),
        role: 'assistant',
        content: fallbackResult.text,
        actionSuggestions: fallbackResult.actionSuggestions,
        galleryPhotos: contextualVisuals,
        category: fallbackResult.category,
        isUrgent: fallbackResult.isUrgent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Speak fallback response aloud
      speakResponse(assistantMsg.content, assistantMsg.id);

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

  // Dynamic Quick Action Chips matching page context
  const quickActions = currentPath.includes('/lawn')
    ? [
        'Check Lawn Availability',
        'Arrange a Site Visit',
        'Wedding & Reception Packages',
        'Lawn Capacity & Photos',
        'Include Awadhi Catering'
      ]
    : currentPath.includes('/catalogue')
    ? [
        'German Hangar Tent',
        'VIP Chairs & Sofas',
        'Coolers & Mist Fans',
        'Mandap & Stage Decor',
        'Add Items to Enquiry'
      ]
    : currentPath.includes('/catering')
    ? [
        'Catering Rates (₹650/₹750)',
        'Awadhi Live Chaat Counter',
        '17 Course Royal Menu',
        'Schedule Food Tasting'
      ]
    : [
        '🕊️ Condolence / Chautha',
        '🎂 Birthday Celebration',
        '🎪 Wedding / Lawn Booking',
        '⛺ Tent / Equipment Rental',
        '📞 Direct Helpline (+91 9305465848)'
      ];

  const isCategoryAActive = 
    conversation?.recognizedIntent === 'bereavement_urgent' || 
    messages.some(m => m.category === 'A' || m.isUrgent);

  return (
    <>
      {/* Floating Trigger Button with Luxury Voice Concierge Orb */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2.5 bg-[#140726] text-amber-200 px-4 py-2.5 rounded-full shadow-2xl border border-amber-500/40 text-xs font-semibold hover:border-amber-400 transition-all cursor-pointer group"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>Voice &amp; Text AI Concierge</span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono">
              Hi/En
            </span>
          </button>

          <button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#1b072e] via-[#4A0E2E] to-[#8C1D40] text-amber-300 shadow-2xl hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 border-2 border-amber-400/50 relative cursor-pointer"
            title="Open Kandhari Voice & Text Concierge"
          >
            <MessageSquare className="w-6 h-6 text-amber-200" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#140726]" />
            <span className="absolute inset-0 rounded-full border border-amber-400/30 animate-ping opacity-40" />
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
              <div className="w-9 h-9 rounded-xl bg-brand-purple/40 border border-brand-gold/30 flex items-center justify-center text-brand-gold relative">
                <Sparkles className="w-4 h-4" />
                {isSpeaking && <span className="listening-pulse-ring" />}
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold leading-tight">
                  Kandhari Event Concierge
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-300">
                  <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                  <span>{isSpeaking ? 'Speaking response...' : 'Voice & Text Active'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-neutral-300">
              {/* Spoken Voice Mute / Unmute Button */}
              <button
                type="button"
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  setIsAudioMuted(!isAudioMuted);
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  isAudioMuted 
                    ? 'text-neutral-400 hover:text-white hover:bg-white/10' 
                    : 'text-amber-300 hover:text-white hover:bg-white/10'
                }`}
                title={isAudioMuted ? "Unmute Voice AI Responses (Speech is currently OFF)" : "Mute Voice AI Responses (Speech is currently ON)"}
              >
                {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <a
                href="tel:+919305465848"
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-amber-300"
                title="Direct Helpline (+91 9305465848)"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/919305465848?text=Namaste!%20I%20am%20chatting%20with%20Kandhari%20Event%20Concierge%20and%20need%20assistance%20for%20my%20event."
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-emerald-400"
                title="Official WhatsApp Support (+91 9305465848)"
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
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div className="flex-1 flex flex-col relative overflow-hidden">
              
              {/* Live Spoken Voice Waveform Banner */}
              {isSpeaking && (
                <div className="bg-[#140726] text-amber-200 border-b border-amber-500/30 px-3.5 py-2 flex items-center justify-between text-xs animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center h-4">
                      <span className="voice-wave-bar" />
                      <span className="voice-wave-bar" />
                      <span className="voice-wave-bar" />
                      <span className="voice-wave-bar" />
                      <span className="voice-wave-bar" />
                    </div>
                    <span className="text-[11px] font-bold text-amber-300">Speaking response aloud...</span>
                  </div>
                  <button
                    type="button"
                    onClick={stopSpeaking}
                    className="px-2.5 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold flex items-center gap-1 border border-white/20 cursor-pointer"
                    title="Stop speaking"
                  >
                    <Square className="w-2.5 h-2.5 fill-current" />
                    <span>Stop</span>
                  </button>
                </div>
              )}

              {/* Voice Notice / Error Banner */}
              {voiceError && (
                <div className="bg-rose-900/90 text-white text-xs px-3.5 py-2 flex items-center justify-between border-b border-rose-500/30">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                    <span>{voiceError}</span>
                  </div>
                  <button 
                    onClick={() => setVoiceError('')}
                    className="text-[10px] underline hover:text-rose-200"
                  >
                    Dismiss
                  </button>
                </div>
              )}
              
              {/* Category A Bereavement Priority Banner */}
              {isCategoryAActive && (
                <div className="bg-stone-100 border-b border-stone-300 px-3 py-2 flex items-center justify-between text-xs text-stone-800">
                  <div className="flex items-center gap-1.5 font-medium">
                    <HeartHandshake className="w-4 h-4 text-stone-700 shrink-0" />
                    <span>🕊️ Priority Condolence Desk • Direct Helpline:</span>
                    <a href="tel:+919305465848" className="font-bold underline text-stone-900">+91 9305465848</a>
                  </div>
                  <a
                    href="tel:+919305465848"
                    className="px-2.5 py-1 bg-stone-900 text-white rounded-lg text-[10px] font-semibold hover:bg-black transition-colors shrink-0 ml-2"
                  >
                    Call Helpline
                  </a>
                </div>
              )}

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

                      {/* Display Action Suggestions & Conversion Next Steps */}
                      {((msg.actionSuggestions && msg.actionSuggestions.length > 0) || (msg.suggestedQuestions && msg.suggestedQuestions.length > 0)) && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {(msg.actionSuggestions || msg.suggestedQuestions || []).map((actionText, i) => {
                            const lowerAction = actionText.toLowerCase();
                            const isCall = actionText.includes('9305465848') || lowerAction.includes('call') || lowerAction.includes('helpline');
                            const isEnquiry = lowerAction.includes('send enquiry') || lowerAction.includes('submit enquiry');
                            const isEdit = lowerAction.includes('edit details');
                            const isCateringPage = lowerAction.includes('catering page');
                            const isSiteVisit = lowerAction.includes('site visit');

                            return (
                              <button
                                key={i}
                                onClick={() => {
                                  if (isCall) {
                                    window.open('tel:+919305465848');
                                  } else if (isEnquiry) {
                                    handleInitiateSubmission();
                                  } else if (isEdit) {
                                    prepareReviewForm();
                                    setReviewModalOpen(true);
                                  } else if (isCateringPage) {
                                    setIsOpen(false);
                                    navigate('/catering');
                                  } else {
                                    handleSend(actionText);
                                  }
                                }}
                                className={`text-[10px] px-2.5 py-1 rounded-full border transition font-medium flex items-center gap-1 ${
                                  isCall
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-600 hover:text-white'
                                    : isEnquiry
                                    ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-brand-primary hover:text-white'
                                    : 'bg-purple-50 text-brand-purple border-brand-purple/20 hover:bg-brand-purple hover:text-white'
                                }`}
                              >
                                {isCall && <Phone className="w-2.5 h-2.5" />}
                                {isSiteVisit && <MapPin className="w-2.5 h-2.5" />}
                                <span>{actionText}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-1 px-1">
                      {msg.role === 'assistant' && (
                        <button
                          type="button"
                          onClick={() => speakResponse(msg.content, msg.id)}
                          className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 font-medium transition cursor-pointer ${
                            currentlySpeakingId === msg.id 
                              ? 'text-amber-700 bg-amber-100/80 font-bold shadow-xs' 
                              : 'text-neutral-500 hover:text-brand-purple hover:bg-neutral-100'
                          }`}
                          title="Read message aloud"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>{currentlySpeakingId === msg.id ? 'Speaking...' : 'Listen'}</span>
                        </button>
                      )}
                      <span className="text-[9px] text-neutral-400">
                        {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
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

              {/* Voice recognition status banner with live speech transcript */}
              {isListening && (
                <div className="px-3.5 py-2 bg-gradient-to-r from-rose-900 to-[#24081c] text-white text-[11px] font-semibold flex items-center justify-between border-t border-rose-500/40 animate-pulse">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping shrink-0" />
                    <Mic className="w-4 h-4 text-rose-300 shrink-0" />
                    <span className="truncate text-rose-100">
                      {liveTranscript ? `"${liveTranscript}"` : 'Listening... Speak in Hindi or English (e.g. "Lawn booking", "100 chairs")'}
                    </span>
                  </div>
                  <button 
                    type="button"
                    onClick={toggleListening}
                    className="text-[10px] px-2.5 py-1 rounded-md bg-white/20 hover:bg-white/30 text-white font-bold shrink-0 ml-2"
                  >
                    Done
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
