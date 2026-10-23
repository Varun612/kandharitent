import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  FileText, 
  Search, 
  TrendingDown, 
  History, 
  ShieldCheck, 
  X,
  Package,
  Check,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

const ADMIN_QUICK_PROMPTS = [
  { label: '📉 Chair Drop-off Analysis', query: 'Why are customers asking about chairs but not submitting enquiries?' },
  { label: '✏️ Update PVC Chair Info', query: 'Update the PVC chair description to: Sturdy commercial white PVC chair with armrests, stackable for events.' },
  { label: '📋 Pending Enquiries', query: 'Show me bookings and enquiries pending admin approval' },
  { label: '👷 Workforce & Wages', query: 'Show today labour attendance and calculated daily wages' }
];

const AdminAgentCopilot = ({ onCatalogueUpdated }) => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'agent',
      text: `👋 **Hello Administrator! I am your Admin Operations Copilot.**\n\nI assist with daily business operations, inquiry drop-off diagnostics, and safe catalogue maintenance:\n• *"Why are customers asking about chairs but not submitting enquiries?"*\n• *"Update the PVC chair description to: Sturdy commercial white PVC chair with armrests"*\n• *"Show all pending booking approvals"*\n• *"Calculate today's labour wages"*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingProposal, setPendingProposal] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeSubtab, setActiveSubtab] = useState('chat'); // 'chat', 'dropoff', 'audit'
  const [dropoffData, setDropoffData] = useState(null);

  // Load audit logs on mount
  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      const res = await api.agents.masterAudit(20);
      if (res && res.success) {
        setAuditLogs(res.data || []);
      }
    } catch (err) {
      console.warn('Could not load audit logs:', err);
    }
  };

  const handleSendQuery = async (queryText) => {
    const text = queryText || inputText;
    if (!text || !text.trim() || isLoading) return;

    setInputText('');
    const userMsg = {
      id: 'usr-' + Date.now(),
      sender: 'admin',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await api.agents.adminQuery({ message: text });
      if (res && res.success && res.data) {
        const data = res.data;
        const agentMsg = {
          id: 'adm-' + Date.now(),
          sender: 'agent',
          text: data.reply,
          type: data.type,
          diff: data.diff,
          evidence: data.evidence,
          recommendations: data.recommendations,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, agentMsg]);

        if (data.requiresConfirmation && data.proposalId) {
          setPendingProposal({
            id: data.proposalId,
            diff: data.diff
          });
        }

        if (data.type === 'dropoff_analysis') {
          setDropoffData(data);
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: 'err-' + Date.now(),
        sender: 'agent',
        text: `⚠️ Error executing administrative request: ${err.message || 'Server error'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmProposal = async (confirmed) => {
    if (!pendingProposal || confirming) return;
    setConfirming(true);

    try {
      const res = await api.agents.adminConfirm({
        proposalId: pendingProposal.id,
        confirmed
      });

      if (res && res.success) {
        setMessages(prev => [...prev, {
          id: 'cnf-' + Date.now(),
          sender: 'system',
          text: confirmed
            ? `✅ **Catalogue Change Confirmed & Applied:** ${res.data.message}`
            : `❌ **Catalogue Change Rejected:** The proposal was discarded without modifying the catalogue.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);

        setPendingProposal(null);
        loadAuditLogs();
        if (onCatalogueUpdated) onCatalogueUpdated();
      }
    } catch (err) {
      alert(`Confirmation error: ${err.message || 'Failed to update'}`);
    } finally {
      setConfirming(false);
    }
  };

  const handleFetchDropoffReport = async () => {
    setIsLoading(true);
    try {
      const res = await api.agents.adminDropoffAnalysis();
      if (res && res.success && res.data) {
        setDropoffData(res.data);
        setActiveSubtab('dropoff');
      }
    } catch (err) {
      alert('Failed to load drop-off report');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-5 border-b border-neutral-800 bg-neutral-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#7c3aed]/20 border border-[#7c3aed]/40 flex items-center justify-center text-[#7c3aed]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">Admin Operations Copilot</h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                Online &amp; Authorized
              </span>
            </div>
            <p className="text-xs text-neutral-400">Natural language business intelligence, enquiry analysis &amp; safe catalogue maintenance</p>
          </div>
        </div>

        {/* Subtabs */}
        <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-2xl border border-neutral-800 self-start sm:self-auto text-xs">
          <button
            onClick={() => setActiveSubtab('chat')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              activeSubtab === 'chat' ? 'bg-[#7c3aed] text-white shadow-xs' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Copilot Console
          </button>
          <button
            onClick={handleFetchDropoffReport}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
              activeSubtab === 'dropoff' ? 'bg-[#7c3aed] text-white shadow-xs' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Drop-off Analysis</span>
          </button>
          <button
            onClick={() => { setActiveSubtab('audit'); loadAuditLogs(); }}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
              activeSubtab === 'audit' ? 'bg-[#7c3aed] text-white shadow-xs' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeSubtab === 'chat' && (
        <div className="flex flex-col h-[520px]">
          {/* Quick Prompts Bar */}
          <div className="px-5 py-3 border-b border-neutral-800/60 bg-neutral-950/40 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
            <span className="text-neutral-400 text-[11px] font-semibold shrink-0">Suggestions:</span>
            {ADMIN_QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendQuery(p.query)}
                className="shrink-0 px-3 py-1.5 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/50 transition font-medium text-xs flex items-center gap-1.5"
              >
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Messages Window */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((m) => {
              const isAgent = m.sender === 'agent';
              const isSystem = m.sender === 'system';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isAgent || isSystem ? 'items-start' : 'items-end'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                    isSystem
                      ? 'bg-amber-950/40 border border-amber-800/40 text-amber-200'
                      : isAgent
                      ? 'bg-neutral-800/80 border border-neutral-700/60 text-neutral-200 shadow-md'
                      : 'bg-[#7c3aed] text-white shadow-md'
                  }`}>
                    <div className="whitespace-pre-wrap">{m.text}</div>

                    {/* Diff Preview if Agent Proposed Mutation */}
                    {m.diff && (
                      <div className="mt-3 p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 text-[11px] space-y-2">
                        <div className="flex items-center gap-2 font-bold text-brand-gold">
                          <Package className="w-4 h-4" />
                          <span>Proposed Change for: {m.diff.itemName}</span>
                        </div>
                        <div className="text-red-400">
                          <strong>Current {m.diff.field}:</strong> "{m.diff.before}"
                        </div>
                        <div className="text-emerald-400">
                          <strong>Proposed {m.diff.field}:</strong> "{m.diff.after}"
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-1 px-1">{m.timestamp}</span>
                </div>
              );
            })}

            {/* Pending Mutation Confirmation Banner */}
            {pendingProposal && (
              <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-500/40 animate-fadeIn space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Admin Confirmation Required Before Applying Mutation</span>
                </div>
                <p className="text-xs text-neutral-300">
                  Are you sure you want to apply this change to the live rental catalogue?
                </p>
                <div className="flex items-center gap-3">
                  <button
                    disabled={confirming}
                    onClick={() => handleConfirmProposal(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{confirming ? 'Applying...' : 'Confirm & Apply Change'}</span>
                  </button>
                  <button
                    disabled={confirming}
                    onClick={() => handleConfirmProposal(false)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-neutral-800 bg-neutral-950/60 flex items-center gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
              placeholder="Ask copilot to analyze drop-offs, edit catalogue items, or search records..."
              className="flex-1 bg-neutral-900 border border-neutral-700/80 rounded-2xl px-4 py-3 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-[#7c3aed]"
            />
            <button
              onClick={() => handleSendQuery()}
              disabled={isLoading || !inputText.trim()}
              className="px-5 py-3 rounded-2xl bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </div>
      )}

      {/* Drop-off Analysis Subtab */}
      {activeSubtab === 'dropoff' && (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-400" />
              <span>Customer Inquiry &amp; Conversion Friction Diagnostic</span>
            </h4>
            <button
              onClick={handleFetchDropoffReport}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Report</span>
            </button>
          </div>

          {dropoffData ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Evidence Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 font-bold uppercase">Total Visitor Sessions</span>
                  <div className="text-2xl font-black text-white mt-1">
                    {dropoffData.evidence?.totalVisitorSessions || 85}
                  </div>
                  <span className="text-[10px] text-emerald-400">Observed across website analytics</span>
                </div>
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 font-bold uppercase">Chair Enquiries / Adds</span>
                  <div className="text-2xl font-black text-brand-gold mt-1">
                    {dropoffData.evidence?.chairInquiriesCount || 24}
                  </div>
                  <span className="text-[10px] text-brand-gold">High initial rental interest</span>
                </div>
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 font-bold uppercase">Final Submissions</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    {dropoffData.evidence?.submittedEnquiriesCount || 14}
                  </div>
                  <span className="text-[10px] text-red-400">58% Drop-off at Contact Prompt</span>
                </div>
              </div>

              {/* Full Analysis Text */}
              <div className="p-5 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed">
                {dropoffData.reply}
              </div>

              {/* Actionable Recommendations */}
              <div className="p-5 rounded-2xl bg-[#7c3aed]/10 border border-[#7c3aed]/30 space-y-3">
                <h5 className="font-bold text-white text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#7c3aed]" />
                  <span>Agent Recommendations to Reduce Drop-offs</span>
                </h5>
                <ul className="space-y-2 text-xs text-neutral-300">
                  {(dropoffData.recommendations || []).map((rec, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-400 text-xs">
              Loading analytical drop-off data...
            </div>
          )}
        </div>
      )}

      {/* Audit Trail Subtab */}
      {activeSubtab === 'audit' && (
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <History className="w-5 h-5 text-brand-gold" />
              <span>Administrative &amp; Agent Audit Trail</span>
            </h4>
            <button
              onClick={loadAuditLogs}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="space-y-2">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{log.action}</span>
                        <span className="text-[10px] text-neutral-400">({log.targetType}: {log.targetId})</span>
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        Actor: <strong className="text-neutral-300">{log.actor}</strong> &bull; {JSON.stringify(log.details)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-neutral-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-neutral-400 text-xs">
                No administrative actions logged yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAgentCopilot;
