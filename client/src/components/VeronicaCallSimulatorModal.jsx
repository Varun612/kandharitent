// client/src/components/VeronicaCallSimulatorModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Clock, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  ShieldCheck, 
  User, 
  MessageCircle,
  X
} from 'lucide-react';

export default function VeronicaCallSimulatorModal({ isOpen, onClose, onCallCompleted }) {
  const [callerName, setCallerName] = useState('Valued Guest');
  const [callerPhone, setCallerPhone] = useState('9305465848');
  const [callActive, setCallActive] = useState(false);
  const [callId, setCallId] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callResult, setCallResult] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);

  const transcriptEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        if (text) {
          handleSendMessage(text);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    let timer;
    if (callActive) {
      timer = setInterval(() => {
        setCallDuration(d => d + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callActive]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  if (!isOpen) return null;

  const speakAloud = (text) => {
    if (!isAudioEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang.includes('IN') || v.lang.includes('hi'));
      if (preferred) utterance.voice = preferred;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Microphone speech recognition is not supported in this browser. Please type your message.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Speech recognition start error:', e);
      }
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartCall = async () => {
    try {
      setIsProcessing(true);
      setCallDuration(0);
      setCallResult(null);
      const res = await fetch('/api/receptionist/call/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerName: callerName.trim() || 'Valued Guest',
          callerPhone: callerPhone.trim() || '9305465848'
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCallId(data.data.callId);
        setCallActive(true);
        const greetingText = data.data.greeting || 'Namaste! I am Veronica, AI receptionist for Kandhari Tent House and Dwarka Shri Lawn. How may I assist you today?';
        setTranscript([
          {
            speaker: 'Veronica',
            text: greetingText,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
        speakAloud(greetingText);
      }
    } catch (err) {
      console.error('Failed to start Veronica call:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || !callId || isProcessing) return;

    const userEntry = {
      speaker: 'Caller',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    setTranscript(prev => [...prev, userEntry]);
    setInputMessage('');
    setIsProcessing(true);

    try {
      const res = await fetch('/api/receptionist/call/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callId,
          message: text.trim()
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        const replyText = data.data.replyText || 'Thank you. I have noted that requirement.';
        setTranscript(prev => [
          ...prev,
          {
            speaker: 'Veronica',
            text: replyText,
            timestamp: new Date().toLocaleTimeString(),
            actionTaken: data.data.actionTaken
          }
        ]);
        speakAloud(replyText);
      }
    } catch (err) {
      console.error('Failed to send call message:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEndCall = async () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (!callId) {
      setCallActive(false);
      return;
    }
    try {
      setIsProcessing(true);
      const res = await fetch('/api/receptionist/call/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callId,
          notes: 'Call finished from in-browser voice session'
        })
      });
      const data = await res.json();
      setCallActive(false);
      if (data.success) {
        setCallResult(data.data?.summary || { status: 'completed' });
        if (onCallCompleted) onCallCompleted();
      }
    } catch (err) {
      console.error('Failed to end call:', err);
      setCallActive(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#10081d] text-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border-2 border-amber-500/40 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-sm">
              <Phone className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-black text-lg text-white">Veronica AI Voice Receptionist</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-black uppercase tracking-wider">
                  Live Voice
                </span>
              </div>
              <p className="text-xs text-amber-300 font-medium">
                Kandhari Tent House &bull; Dwarka Shri Lawn &bull; Helpline +91 9305465848
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className={`p-2 rounded-xl border transition ${
                isAudioEnabled ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-neutral-800 text-neutral-400 border-neutral-700'
              }`}
              title={isAudioEnabled ? "Audio On" : "Muted"}
            >
              {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center font-bold text-sm transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Human Direct Numbers Banner */}
        <div className="my-3 p-3 rounded-2xl bg-[#180d2b] border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-neutral-300 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Direct Family Lines:</span>
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <a href="tel:9305465848" className="font-mono font-bold text-amber-300 hover:underline">
              9305465848
            </a>
            <span className="text-neutral-500">&bull;</span>
            <a href="tel:7355059566" className="font-mono font-bold text-neutral-300 hover:underline">
              7355059566
            </a>
            <span className="text-neutral-500">&bull;</span>
            <a href="tel:9307908994" className="font-mono font-bold text-neutral-300 hover:underline">
              9307908994
            </a>
          </div>
        </div>

        {/* Content Body */}
        {!callActive && !callResult ? (
          <div className="py-4 space-y-5">
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs text-neutral-300 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Real In-Browser Voice Telephony</span>
              </div>
              <p className="leading-relaxed">
                Veronica answers enquiries, checks lawn dates at Dwarka Shri Lawn on Kanpur Road, estimates guest headcount, and connects directly to the Kandhari family desk. You can speak with your microphone or type naturally.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Your Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="text"
                    value={callerName}
                    onChange={(e) => setCallerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Contact Mobile Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="text"
                    value={callerPhone}
                    onChange={(e) => setCallerPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={handleStartCall}
                disabled={isProcessing}
                className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Start In-Browser Voice Call with Veronica</span>
              </button>
            </div>
          </div>
        ) : callActive ? (
          <div className="flex-1 flex flex-col min-h-0 py-2 space-y-3">
            {/* Connected status bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 rounded-2xl border border-neutral-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-bold text-white">Call In Progress</span>
                <span className="text-neutral-600">&bull;</span>
                <span className="font-mono text-amber-300">{callId}</span>
              </div>
              <div className="flex items-center gap-1 font-mono font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(callDuration)}</span>
              </div>
            </div>

            {/* Transcript scroll box */}
            <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-black/40 rounded-2xl border border-neutral-800 max-h-[300px]">
              {transcript.map((item, idx) => {
                const isVeronica = item.speaker === 'Veronica';
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isVeronica ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        {isVeronica ? '🎙️ Veronica (AI Receptionist)' : `👤 ${callerName || 'Caller'}`}
                      </span>
                      <span className="text-[9px] text-neutral-500 font-mono">{item.timestamp}</span>
                    </div>
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] shadow-md ${
                        isVeronica
                          ? 'bg-[#1e0e37] text-amber-200 rounded-tl-none border border-amber-500/30'
                          : 'bg-amber-500 text-black font-semibold rounded-tr-none'
                      }`}
                    >
                      {item.text}
                      {item.actionTaken && (
                        <div className="mt-2 pt-1.5 border-t border-amber-500/30 text-[10px] font-mono flex items-center gap-1 text-emerald-300">
                          <CheckCircle className="w-3 h-3" />
                          <span>Action: {item.actionTaken}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={transcriptEndRef} />
            </div>

            {/* Quick Test Presets */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Quick Prompts:
              </span>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <button
                  onClick={() => handleSendMessage('I want to book an appointment to see the lawn on 15 November')}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 transition"
                >
                  📅 Book Lawn Visit
                </button>
                <button
                  onClick={() => handleSendMessage('What is the capacity and parking at Dwarka Shri Lawn?')}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 transition"
                >
                  🌿 Venue Details
                </button>
                <button
                  onClick={() => handleSendMessage('Need waterproof German hangar tent rate for 500 guests')}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 transition"
                >
                  🎪 Tent Quotation
                </button>
              </div>
            </div>

            {/* Speech input bar & End Call button */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={toggleMic}
                className={`p-2.5 rounded-xl border transition ${
                  isListening
                    ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-amber-400 border-neutral-700'
                }`}
                title={isListening ? "Listening... click to stop" : "Speak via Microphone"}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={isListening ? "Listening to your voice..." : "Type or speak your reply..."}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={isProcessing || !inputMessage.trim()}
                className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                Send
              </button>

              <button
                onClick={handleEndCall}
                disabled={isProcessing}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>End</span>
              </button>
            </div>
          </div>
        ) : (
          /* Post-call summary */
          <div className="py-6 space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-200 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-300 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Call Successfully Completed &amp; Recorded</span>
              </div>
              <p className="text-neutral-300">
                Your call summary and booking details have been securely logged with our Kanpur Road operations desk.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
              <button
                onClick={() => { setCallResult(null); setTranscript([]); }}
                className="py-2.5 px-5 rounded-xl border border-neutral-700 text-neutral-300 font-bold text-xs hover:bg-neutral-800 transition"
              >
                New Voice Call
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition"
              >
                Close Window
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
