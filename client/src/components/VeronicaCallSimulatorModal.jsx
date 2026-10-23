// client/src/components/VeronicaCallSimulatorModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, Volume2, Sparkles, Clock, Calendar, AlertCircle, CheckCircle, ShieldCheck, User } from 'lucide-react';

export default function VeronicaCallSimulatorModal({ isOpen, onClose, onCallCompleted }) {
  const [callerName, setCallerName] = useState('Vikram Verma');
  const [callerPhone, setCallerPhone] = useState('9876543210');
  const [callActive, setCallActive] = useState(false);
  const [callId, setCallId] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callResult, setCallResult] = useState(null);

  const transcriptEndRef = useRef(null);

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
          callerPhone: callerPhone.trim() || '9876543210'
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCallId(data.data.callId);
        setCallActive(true);
        setTranscript([
          {
            speaker: 'Veronica',
            text: data.data.greeting,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
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
        setTranscript(prev => [
          ...prev,
          {
            speaker: 'Veronica',
            text: data.data.replyText,
            timestamp: new Date().toLocaleTimeString(),
            actionTaken: data.data.actionTaken
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to send call message:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEndCall = async () => {
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
          notes: 'Call finished from in-browser simulator'
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-700 shadow-sm">
              <Phone className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-black text-xl text-neutral-900">Veronica AI Receptionist</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white uppercase tracking-wider">
                  Live Telephony
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Dwarka Shri Lawn &bull; Official Helpline &bull; 1800-890-3456
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center font-bold text-sm transition"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        {!callActive && !callResult ? (
          <div className="py-6 space-y-6">
            <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200/60 text-xs text-purple-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-purple-800">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Mandated Telephony Disclosure Policy</span>
              </div>
              <p className="text-neutral-600 leading-relaxed">
                Veronica explicitly identifies herself as an AI event receptionist for Kandhari Tent &amp; Caterers and Dwarka Shri Lawn at the start of every call. She books lawn walkthrough appointments, logs support tickets, and escalates to human management.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Caller Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="text"
                    value={callerName}
                    onChange={(e) => setCallerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter caller name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Caller Mobile Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="text"
                    value={callerPhone}
                    onChange={(e) => setCallerPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <button
                onClick={handleStartCall}
                disabled={isProcessing}
                className="w-full py-3.5 px-6 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
              >
                <Phone className="w-4 h-4" />
                <span>Simulate Inbound Call to 1800-890-3456</span>
              </button>
            </div>
          </div>
        ) : callActive ? (
          <div className="flex-1 flex flex-col min-h-0 py-4 space-y-4">
            {/* Status bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-bold text-neutral-800">Call Connected</span>
                <span className="text-neutral-400">&bull;</span>
                <span className="font-mono text-neutral-600">{callId}</span>
              </div>
              <div className="flex items-center gap-1 font-mono font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(callDuration)}</span>
              </div>
            </div>

            {/* Transcript scroll box */}
            <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-neutral-50/50 rounded-2xl border border-neutral-100 max-h-[380px]">
              {transcript.map((item, idx) => {
                const isVeronica = item.speaker === 'Veronica';
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isVeronica ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                        {isVeronica ? '🎙️ Veronica (AI Receptionist)' : `👤 ${callerName || 'Caller'}`}
                      </span>
                      <span className="text-[9px] text-neutral-400 font-mono">{item.timestamp}</span>
                    </div>
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] shadow-sm ${
                        isVeronica
                          ? 'bg-purple-600 text-white rounded-tl-none font-sans'
                          : 'bg-white text-neutral-800 border border-neutral-200 rounded-tr-none font-sans'
                      }`}
                    >
                      {item.text}
                      {item.actionTaken && (
                        <div className="mt-2 pt-1.5 border-t border-purple-400/50 text-[10px] font-mono flex items-center gap-1 text-purple-100">
                          <CheckCircle className="w-3 h-3 text-amber-300" />
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
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Quick Test Prompts:
              </span>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <button
                  onClick={() => handleSendMessage('I want to book an appointment to see the lawn on 15 November')}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-purple-100 text-neutral-700 hover:text-purple-700 transition"
                >
                  📅 Book Lawn Visit
                </button>
                <button
                  onClick={() => handleSendMessage('What is the capacity and parking at Dwarka Shri Lawn?')}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-purple-100 text-neutral-700 hover:text-purple-700 transition"
                >
                  🌿 Venue Details
                </button>
                <button
                  onClick={() => handleSendMessage('Need waterproof German hangar tent rate for 500 guests')}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-purple-100 text-neutral-700 hover:text-purple-700 transition"
                >
                  ⛺ Tent Quotation
                </button>
                <button
                  onClick={() => handleSendMessage('I have an urgent complaint regarding damaged chairs')}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-rose-100 text-neutral-700 hover:text-rose-700 transition"
                >
                  ⚠️ File Complaint Ticket
                </button>
                <button
                  onClick={() => handleSendMessage('Please connect me to the owner Mr. Kandhari')}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-amber-100 text-neutral-700 hover:text-amber-700 transition"
                >
                  📞 Human Escalation
                </button>
              </div>
            </div>

            {/* Speech input bar & End Call button */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Speak or type caller message..."
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isProcessing || !inputMessage.trim()}
                className="py-2.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition disabled:opacity-50"
              >
                Send
              </button>
              <button
                onClick={handleEndCall}
                disabled={isProcessing}
                className="py-2.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>End Call</span>
              </button>
            </div>
          </div>
        ) : (
          /* Post-call summary */
          <div className="py-6 space-y-5">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Call Successfully Completed &amp; Archived</span>
              </div>
              <p className="text-neutral-600">
                The call transcript, customer details, and any generated appointments or tickets have been persisted to the admin operations database.
              </p>
            </div>

            {callResult?.appointment && (
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs space-y-1">
                <span className="font-bold text-purple-900 block">Scheduled Lawn Walkthrough:</span>
                <p><strong>Appointment ID:</strong> {callResult.appointment.appointmentId}</p>
                <p><strong>Date &amp; Time:</strong> {callResult.appointment.date} at {callResult.appointment.time}</p>
                <p><strong>Venue:</strong> {callResult.appointment.venue}</p>
              </div>
            )}

            {callResult?.ticket && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1">
                <span className="font-bold text-amber-900 block">Support Ticket Logged:</span>
                <p><strong>Ticket ID:</strong> {callResult.ticket.ticketId}</p>
                <p><strong>Severity:</strong> {callResult.ticket.severity}</p>
                <p><strong>Issue:</strong> {callResult.ticket.issue}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
              <button
                onClick={() => { setCallResult(null); setTranscript([]); }}
                className="py-2.5 px-5 rounded-xl border border-neutral-300 text-neutral-700 font-bold text-xs hover:bg-neutral-50 transition"
              >
                New Simulation Call
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition"
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
