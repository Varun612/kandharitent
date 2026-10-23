import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Bot, 
  UserCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  History, 
  RotateCcw, 
  ShieldCheck, 
  Activity, 
  Layers, 
  RefreshCw,
  Send,
  Zap,
  Check,
  X
} from 'lucide-react';
import { api } from '../services/api';

const MASTER_QUICK_INSTRUCTIONS = [
  { label: '🪑 Improve Chair Rules (Client Agent)', text: 'Improve the way the Client Agent recommends chairs' },
  { label: '📉 Explain Failed Bookings (Admin Agent)', text: 'Change the admin agent so that it explains failed bookings' },
  { label: '🎪 Promote Waterproof Hangars', text: 'Instruct Client Agent to highlight German waterproof hangar tents during rainy season queries' }
];

const MasterAgentWorkspace = () => {
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [instructionText, setInstructionText] = useState('');
  const [pendingProposal, setPendingProposal] = useState(null);
  const [applying, setApplying] = useState(false);
  const [selectedAgentForHistory, setSelectedAgentForHistory] = useState('client_agent');
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    setIsLoading(true);
    try {
      const res = await api.agents.masterOverview();
      if (res && res.success && res.data) {
        setOverview(res.data);
      }
    } catch (err) {
      console.warn('Failed to load master overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProposeRule = async (customText) => {
    const text = customText || instructionText;
    if (!text || !text.trim() || applying) return;

    setInstructionText('');
    setApplying(true);
    setStatusMessage(null);

    try {
      const res = await api.agents.masterProposeRule({ instruction: text });
      if (res && res.success && res.proposal) {
        setPendingProposal(res.proposal);
      }
    } catch (err) {
      alert(`Error synthesizing rule proposal: ${err.message || 'Server error'}`);
    } finally {
      setApplying(false);
    }
  };

  const handleApplyProposal = async (approved) => {
    if (!pendingProposal || applying) return;
    setApplying(true);

    try {
      const res = await api.agents.masterApplyRule({
        proposalId: pendingProposal.id,
        approved
      });

      if (res && res.success) {
        setStatusMessage({
          type: approved ? 'success' : 'info',
          text: approved
            ? `✅ Rule Approved & Deployed: ${res.data.message}`
            : '❌ Configuration change proposal rejected and discarded.'
        });
        setPendingProposal(null);
        await loadOverview();
      }
    } catch (err) {
      alert(`Failed to apply rule: ${err.message || 'Execution error'}`);
    } finally {
      setApplying(false);
    }
  };

  const handleRollback = async (targetAgent, toVersion) => {
    if (!confirm(`Are you sure you want to roll back ${targetAgent} to version ${toVersion}?`)) return;

    try {
      const res = await api.agents.masterRollbackRule({ targetAgent, toVersion });
      if (res && res.success) {
        alert(res.data.message);
        loadOverview();
      }
    } catch (err) {
      alert(`Rollback failed: ${err.message}`);
    }
  };

  const agents = overview?.agents || {};
  const clientAgent = agents.client_agent;
  const adminAgent = agents.admin_agent;
  const masterAgent = agents.master_agent;
  const handoffs = overview?.handoffs || [];
  const recentEvents = overview?.recentEvents || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-serif font-bold text-white">Master Agent Orchestration &amp; Supervision</h2>
            <span className="text-[10px] bg-[#7c3aed]/20 text-[#a78bfa] border border-[#7c3aed]/40 px-2.5 py-0.5 rounded-full font-bold">
              Owner-Level Control
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Autonomous multi-agent orchestration, inter-agent handoff monitoring, and natural-language prompt rule versioning.
          </p>
        </div>
        <button
          onClick={loadOverview}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/60 text-neutral-300 text-xs font-bold flex items-center gap-2 self-start sm:self-auto transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Sync Status</span>
        </button>
      </div>

      {/* Status Message Notification */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
          statusMessage.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            : 'bg-neutral-900 border-neutral-700 text-neutral-300'
        }`}>
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. THREE-AGENT HEALTH & STATUS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Agent A: Client Agent */}
        <div className="p-5 rounded-3xl bg-neutral-900/90 border border-neutral-800 hover:border-[#7c3aed]/40 transition shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                A
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Client Agent</h3>
                <span className="text-[10px] text-blue-400 font-semibold">Customer Assistant</span>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              {clientAgent?.version || 'v1.0'}
            </span>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            {clientAgent?.role || 'Customer-facing rental advisor & enquiry coordinator.'}
          </p>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-neutral-800">
            <div className="p-2 rounded-xl bg-neutral-950">
              <span className="text-neutral-400 block text-[10px]">Conversations</span>
              <strong className="text-white text-base">{clientAgent?.metrics?.totalConversations || 0}</strong>
            </div>
            <div className="p-2 rounded-xl bg-neutral-950">
              <span className="text-neutral-400 block text-[10px]">Cart Actions</span>
              <strong className="text-brand-gold text-base">{clientAgent?.metrics?.cartActions || 0}</strong>
            </div>
            <div className="p-2 rounded-xl bg-neutral-950">
              <span className="text-neutral-400 block text-[10px]">Items Rec.</span>
              <strong className="text-white text-base">{clientAgent?.metrics?.itemsRecommended || 0}</strong>
            </div>
            <div className="p-2 rounded-xl bg-neutral-950">
              <span className="text-neutral-400 block text-[10px]">Escalations</span>
              <strong className="text-red-400 text-base">{clientAgent?.metrics?.escalations || 0}</strong>
            </div>
          </div>
        </div>

        {/* Agent B: Admin Agent */}
        <div className="p-5 rounded-3xl bg-neutral-900/90 border border-neutral-800 hover:border-[#7c3aed]/40 transition shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                B
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Admin Agent</h3>
                <span className="text-[10px] text-amber-400 font-semibold">Operations Copilot</span>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              {adminAgent?.version || 'v1.0'}
            </span>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            {adminAgent?.role || 'Administrative copilot for bookings, drop-offs, and catalogue edits.'}
          </p>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-neutral-800">
            <div className="p-2 rounded-xl bg-neutral-950">
              <span className="text-neutral-400 block text-[10px]">Queries Handled</span>
              <strong className="text-white text-base">{adminAgent?.metrics?.queriesHandled || 0}</strong>
            </div>
            <div className="p-2 rounded-xl bg-neutral-950">
              <span className="text-neutral-400 block text-[10px]">Proposals</span>
              <strong className="text-amber-400 text-base">{adminAgent?.metrics?.catalogueProposals || 0}</strong>
            </div>
            <div className="p-2 rounded-xl bg-neutral-950">
              <span className="text-neutral-400 block text-[10px]">Applied Changes</span>
              <strong className="text-emerald-400 text-base">{adminAgent?.metrics?.catalogueUpdatesExecuted || 0}</strong>
            </div>
            <div className="p-2 rounded-xl bg-neutral-950">
              <span className="text-neutral-400 block text-[10px]">Drop-off Reports</span>
              <strong className="text-blue-400 text-base">{adminAgent?.metrics?.dropoffAnalyses || 0}</strong>
            </div>
          </div>
        </div>

        {/* Agent C: Master Agent */}
        <div className="p-5 rounded-3xl bg-neutral-900/90 border border-[#7c3aed]/40 transition shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#7c3aed]/20 border border-[#7c3aed]/30 flex items-center justify-center text-[#a78bfa] font-bold">
                C
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Master Agent</h3>
                <span className="text-[10px] text-[#a78bfa] font-semibold">Owner Supervisor</span>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              {masterAgent?.version || 'v1.0'}
            </span>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            {masterAgent?.role || 'Owner-level orchestration, supervision, and prompt rule versioning.'}
          </p>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-neutral-800">
            <div className="p-2 rounded-xl bg-neutral-950">
              <span className="text-neutral-400 block text-[10px]">Rules Deployed</span>
              <strong className="text-white text-base">{masterAgent?.metrics?.ruleUpdatesApplied || 0}</strong>
            </div>
            <div className="p-2 rounded-xl bg-neutral-950">
              <span className="text-neutral-400 block text-[10px]">Handoffs Tracked</span>
              <strong className="text-emerald-400 text-base">{handoffs.length}</strong>
            </div>
            <div className="p-2 rounded-xl bg-neutral-950">
              <span className="text-neutral-400 block text-[10px]">Event Bus Stream</span>
              <strong className="text-brand-gold text-base">{recentEvents.length}</strong>
            </div>
            <div className="p-2 rounded-xl bg-neutral-950">
              <span className="text-neutral-400 block text-[10px]">System Errors</span>
              <strong className="text-emerald-400 text-base">0</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. NATURAL LANGUAGE PROMPT & RULE MODIFIER */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#7c3aed]" />
          <h3 className="font-bold text-white text-base">Modify Agent Rules &amp; Instructions via Natural Language</h3>
        </div>
        <p className="text-xs text-neutral-400">
          State in ordinary language how you want to alter either the Client Agent or Admin Agent. The Master Agent will detect the target agent, synthesize a proposed rule update, generate an immutable version bump, and ask for your approval.
        </p>

        {/* Quick Example Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-neutral-400 text-[11px] font-semibold shrink-0">Try asking:</span>
          {MASTER_QUICK_INSTRUCTIONS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleProposeRule(chip.text)}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/50 transition font-medium text-xs"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-3 pt-2">
          <input
            type="text"
            value={instructionText}
            onChange={(e) => setInstructionText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleProposeRule()}
            placeholder='e.g., "Improve the way the Client Agent recommends chairs" or "Change the admin agent so that it explains failed bookings"'
            className="flex-1 bg-neutral-950 border border-neutral-700/80 rounded-2xl px-4 py-3 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-[#7c3aed]"
          />
          <button
            onClick={() => handleProposeRule()}
            disabled={applying || !instructionText.trim()}
            className="px-5 py-3 rounded-2xl bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition"
          >
            <Zap className="w-4 h-4" />
            <span>Propose Rule Update</span>
          </button>
        </div>

        {/* PROPOSAL PREVIEW CARD (When Synthesized) */}
        {pendingProposal && (
          <div className="mt-4 p-5 rounded-2xl bg-neutral-950 border border-[#7c3aed]/50 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#7c3aed]" />
                <h4 className="font-bold text-white text-sm">
                  Proposed Version Bump: {pendingProposal.targetAgentName} ({pendingProposal.currentVersion} &rarr; <span className="text-brand-gold">{pendingProposal.proposedVersion}</span>)
                </h4>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                Awaiting Owner Approval
              </span>
            </div>

            <p className="text-xs text-neutral-300">
              <strong>Owner Instruction:</strong> "{pendingProposal.instruction}"
            </p>

            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs space-y-2">
              <span className="text-[11px] text-brand-gold font-bold uppercase block">New Rule to be Injected:</span>
              <p className="text-emerald-300 font-mono text-[11px] bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800/40">
                + {pendingProposal.newRuleAdded}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                disabled={applying}
                onClick={() => handleApplyProposal(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{applying ? 'Deploying...' : 'Approve & Deploy New Version'}</span>
              </button>
              <button
                disabled={applying}
                onClick={() => handleApplyProposal(false)}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs flex items-center gap-2 transition"
              >
                <X className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. INTER-AGENT HANDOFFS & EVENT BUS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Inter-Agent Handoff Stream */}
        <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-emerald-400" />
              <span>Inter-Agent Handoff Stream</span>
            </h4>
            <span className="text-[10px] text-neutral-400">{handoffs.length} Handoffs Recorded</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {handoffs.length > 0 ? (
              handoffs.map((h) => (
                <div key={h.id} className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800/80 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="text-blue-400">{h.sourceAgent}</span> &rarr; <span className="text-amber-400">{h.targetAgent || 'admin_agent'}</span>
                    </span>
                    <span className="text-[10px] text-neutral-400">{new Date(h.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-neutral-300 text-[11px]">
                    <strong>Event:</strong> {h.eventType} &bull; {h.data?.reason || h.data?.customerMessage || 'Handoff dispatched'}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-neutral-400 text-xs">
                No active handoffs currently pending.
              </div>
            )}
          </div>
        </div>

        {/* Version History & Rollback Viewer */}
        <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-brand-gold" />
              <span>Agent Version History &amp; Rollback</span>
            </h4>
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setSelectedAgentForHistory('client_agent')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                  selectedAgentForHistory === 'client_agent' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Client
              </button>
              <button
                onClick={() => setSelectedAgentForHistory('admin_agent')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                  selectedAgentForHistory === 'admin_agent' ? 'bg-amber-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {(agents[selectedAgentForHistory]?.versionHistory || []).map((ver, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800/80 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-gold">{ver.version}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-400">{new Date(ver.updatedAt).toLocaleDateString()}</span>
                    {idx > 0 && (
                      <button
                        onClick={() => handleRollback(selectedAgentForHistory, ver.version)}
                        className="text-[10px] text-red-400 hover:text-red-300 font-bold flex items-center gap-0.5"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Rollback</span>
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-neutral-300 text-[11px]">{ver.changeSummary}</p>
                <span className="text-[10px] text-neutral-400 block">Author: {ver.author}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterAgentWorkspace;
