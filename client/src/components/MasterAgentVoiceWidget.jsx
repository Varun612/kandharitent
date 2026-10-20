import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  FileText, 
  RefreshCw,
  XCircle,
  HelpCircle,
  Bot
} from 'lucide-react';
import { api } from '../services/api';

const QUICK_PROMPTS = [
  { label: '📊 आज के विज़िटर', query: "Show me today's website visitors" },
  { label: '📝 आज की बुकिंग', query: "Show me all bookings for today" },
  { label: '⏳ पेंडिंग अप्रूवल', query: "List pending bookings that need approval" },
  { label: '💰 आज का पेमेंट', query: "Show me payments received today" },
  { label: '👷 आज की हाजिरी', query: "Show today's labour attendance" },
  { label: '📦 सामान का स्टॉक', query: "Show me the physical inventory status" },
  { label: '💵 महीने की मजदूरी', query: "Calculate this month's wages" },
  { label: '📄 आज की रिपोर्ट', query: "Generate a PDF report for today's bookings" }
];

const MasterAgentVoiceWidget = ({ onDataChanged }) => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'agent',
      text: `🙏 **नमस्ते! मैं आपका कंधारी बिजनेस मैनेजर हूँ।**\n\nआप मुझसे बोलकर या लिखकर व्यापार से जुड़ा कोई भी सवाल पूछ सकते हैं:\n• *"आज के विज़िटर दिखाओ"*\n• *"आज की बुकिंग और पेंडिंग आर्डर बताओ"*\n• *"आज कितना पेमेंट आया?"*\n• *"रामू की आज की हाजिरी लगाओ"*\n• *"100 PVC कुर्सी स्टॉक में जोड़ो"*\n• *"इस महीने की मजदूरी का हिसाब करो"*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const [languageMode, setLanguageMode] = useState('hi-IN'); // 'hi-IN' or 'en-IN'

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize Web Speech API for voice recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = languageMode;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          handleSendQuery(transcript);
        }
      };

      recognition.onerror = (err) => {
        console.warn('Speech recognition error:', err.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [languageMode]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingConfirmation]);

  // Voice speech synthesis
  const speakText = (text) => {
    if (isAudioMuted || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*_#`•]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = languageMode;
      utterance.rate = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleListening = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge, or type your message below.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn('Error starting speech recognition:', err);
      }
    }
  };

  const handleSendQuery = async (queryText) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend || isLoading) return;

    setInputText('');
    stopSpeaking();

    // Append user message
    const userMsg = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await api.queryMasterAgent({ query: textToSend });
      if (res.success) {
        const agentMsg = {
          id: 'msg-' + (Date.now() + 1),
          sender: 'agent',
          text: res.reply || 'जानकारी लोड हो गई है।',
          reportUrl: res.reportUrl,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, agentMsg]);

        if (res.spokenReply) {
          speakText(res.spokenReply);
        }

        if (res.requiresConfirmation && res.pendingAction) {
          setPendingConfirmation(res.pendingAction);
        } else {
          setPendingConfirmation(null);
        }
      } else {
        setMessages(prev => [...prev, {
          id: 'msg-err-' + Date.now(),
          sender: 'agent',
          text: 'माफ़ कीजिये, कमांड प्रोसेस करने में कोई त्रुटि आई: ' + (res.message || 'Server error'),
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: 'msg-err-' + Date.now(),
        sender: 'agent',
        text: 'सर्वर से संपर्क नहीं हो पाया। कृपया नेटवर्क चेक करें।',
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingConfirmation || isLoading) return;
    setIsLoading(true);

    try {
      const res = await api.confirmMasterAgentAction({
        action: pendingConfirmation.action,
        params: pendingConfirmation.params
      });

      if (res.success) {
        setMessages(prev => [...prev, {
          id: 'msg-conf-' + Date.now(),
          sender: 'agent',
          text: res.message || '✅ बदलाव सफलतापूर्वक सेव कर दिया गया है।',
          isSuccess: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);

        if (res.spokenReply) {
          speakText(res.spokenReply);
        }

        setPendingConfirmation(null);
        if (onDataChanged) onDataChanged();
      } else {
        alert(res.message || 'Confirmation failed');
      }
    } catch (error) {
      alert('Failed to execute confirmed action');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAction = () => {
    setPendingConfirmation(null);
    setMessages(prev => [...prev, {
      id: 'msg-cancel-' + Date.now(),
      sender: 'agent',
      text: '❌ यह बदलाव रद्द (Cancel) कर दिया गया है। डाटा सुरक्षित है।',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    speakText('Operation cancelled.');
  };

  return (
    <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-xl overflow-hidden flex flex-col h-[750px]">
      
      {/* Header Banner */}
      <div className="royal-gradient p-5 sm:p-6 text-white flex flex-wrap items-center justify-between gap-4 border-b border-brand-gold/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-brand-gold/40 flex items-center justify-center text-brand-gold shadow-md">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-serif font-black tracking-tight text-white">
                Master AI Business Agent
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-gold text-brand-dark uppercase tracking-wider">
                Voice &amp; Tools
              </span>
            </div>
            <p className="text-xs text-brand-goldLight mt-0.5">
              कंधारी व द्वारका श्री लॉन का स्मार्ट व्यापार सहायक (बोलकर या लिखकर चलाएं)
            </p>
          </div>
        </div>

        {/* Audio Controls & Language Toggle */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            type="button"
            onClick={() => setLanguageMode(prev => prev === 'hi-IN' ? 'en-IN' : 'hi-IN')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition flex items-center gap-1.5"
            title="Switch Language"
          >
            <span>{languageMode === 'hi-IN' ? '🇮🇳 हिन्दी' : '🇬🇧 English'}</span>
          </button>

          {/* Mute/Unmute Speech Output */}
          <button
            type="button"
            onClick={() => {
              if (isSpeaking) stopSpeaking();
              setIsAudioMuted(!isAudioMuted);
            }}
            className={`p-2 rounded-xl border transition ${
              isAudioMuted 
                ? 'bg-rose-500/20 text-rose-300 border-rose-400/40' 
                : 'bg-white/10 text-brand-goldLight border-white/20 hover:bg-white/20'
            }`}
            title={isAudioMuted ? "Unmute Voice Output" : "Mute Voice Output"}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {isSpeaking && (
            <button
              type="button"
              onClick={stopSpeaking}
              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold animate-pulse"
            >
              Stop Voice
            </button>
          )}
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="bg-neutral-50 border-b border-neutral-200 px-4 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
          <span>सुझाव:</span>
        </span>
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendQuery(qp.query)}
            disabled={isLoading}
            className="px-3 py-1 rounded-xl text-xs font-semibold bg-white border border-neutral-200 hover:border-brand-primary text-neutral-700 hover:text-brand-primary whitespace-nowrap transition shadow-xs disabled:opacity-50"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-neutral-50/50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm shadow-xs leading-relaxed whitespace-pre-wrap ${
                m.sender === 'user'
                  ? 'royal-gradient text-white font-medium rounded-br-xs'
                  : m.isError
                  ? 'bg-rose-50 text-rose-900 border border-rose-200 rounded-bl-xs'
                  : m.isSuccess
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-bl-xs font-medium'
                  : 'bg-white text-neutral-800 border border-neutral-200/90 rounded-bl-xs'
              }`}
            >
              <div>{m.text}</div>
              
              {m.reportUrl && (
                <div className="mt-3 pt-3 border-t border-neutral-200 flex items-center gap-2">
                  <a
                    href={m.reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:opacity-95 shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-brand-gold" />
                    <span>प्रिंट / PDF रिपोर्ट खोलें</span>
                  </a>
                </div>
              )}
            </div>
            <span className="text-[10px] text-neutral-400 mt-1 px-1">{m.timestamp}</span>
          </div>
        ))}

        {/* Pending Action Confirmation Card (Safety Barrier for Write Operations) */}
        {pendingConfirmation && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-md space-y-3 animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-amber-950">
                  क्या आप यह बदलाव कन्फर्म करना चाहते हैं?
                </h4>
                <p className="text-xs text-amber-800 font-medium">
                  {pendingConfirmation.summary}
                </p>
                {pendingConfirmation.promptHindi && (
                  <p className="text-xs text-amber-900 italic font-semibold">
                    "{pendingConfirmation.promptHindi}"
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>हाँ, पुष्टि करें / Confirm</span>
              </button>

              <button
                type="button"
                onClick={handleCancelAction}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition"
              >
                <XCircle className="w-4 h-4" />
                <span>रद्द करें / Cancel</span>
              </button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-neutral-500 bg-white p-3 rounded-2xl border border-neutral-200 w-fit">
            <RefreshCw className="w-4 h-4 animate-spin text-brand-gold" />
            <span>डेटा लोड हो रहा है, कृपया प्रतीक्षा करें...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Recognition Pulse Overlay */}
      {isListening && (
        <div className="bg-amber-500/10 border-t border-b border-amber-300/40 p-3 px-6 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-bold text-amber-900">
              🎤 आवाज़ सुन रहे हैं... (बोलो जी, माइक चालू है)
            </span>
          </div>
          <button
            type="button"
            onClick={toggleListening}
            className="text-xs font-bold text-rose-600 hover:underline"
          >
            बोलना बंद करें (Stop)
          </button>
        </div>
      )}

      {/* Input Bar */}
      <div className="p-4 bg-white border-t border-neutral-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery();
          }}
          className="flex items-center gap-2"
        >
          {/* Big Voice Microphone Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md shrink-0 ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-300'
                : 'royal-gradient hover:opacity-95 text-brand-gold'
            }`}
            title={isListening ? "Listening... Click to stop" : "Click to Speak (माइक दबाकर बोलें)"}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* Typed Query Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? "बोल रहे हैं..." : "सवाल लिखें या माइक दबाकर बोलें (उदा: आज के विज़िटर दिखाओ)..."}
              className="w-full px-4 py-3 rounded-2xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent text-xs sm:text-sm bg-neutral-50/50"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="w-12 h-12 rounded-2xl royal-gradient hover:opacity-95 text-white flex items-center justify-center transition shadow-md disabled:opacity-40 shrink-0"
            title="Send Query"
          >
            <Send className="w-5 h-5 text-brand-gold" />
          </button>
        </form>
      </div>

    </div>
  );
};

export default MasterAgentVoiceWidget;
