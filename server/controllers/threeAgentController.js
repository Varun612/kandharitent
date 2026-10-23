/**
 * Three-Agent System Controller
 * Handles HTTP requests for Client Agent, Admin Agent, and Master Agent.
 */

const threeAgentService = require('../services/threeAgentService');
const { getLocalDb } = require('../config/db');

// ==========================================
// CLIENT AGENT HANDLERS
// ==========================================

const handleClientChat = (req, res) => {
  try {
    const { message, conversationHistory = [], activeCart = [] } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'message string is required' });
    }

    const result = threeAgentService.processClientMessage({
      message,
      conversationHistory,
      activeCart
    });

    return res.json({
      success: true,
      agent: 'client_agent',
      data: result
    });
  } catch (error) {
    console.error('handleClientChat error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Client Agent error' });
  }
};

const handleClientCartAction = (req, res) => {
  try {
    const { actionType, item, quantity = 1 } = req.body || {};
    if (!actionType) {
      return res.status(400).json({ success: false, message: 'actionType is required' });
    }

    threeAgentService.recordAgentEvent({
      sourceAgent: 'client_agent',
      eventType: 'cart_action',
      data: { actionType, item, quantity }
    });

    return res.json({
      success: true,
      message: `Cart action "${actionType}" recorded successfully`,
      actionType,
      item,
      quantity
    });
  } catch (error) {
    console.error('handleClientCartAction error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Cart action error' });
  }
};

const handleClientEscalation = (req, res) => {
  try {
    const { customerPhone, customerName, reason, cartSummary } = req.body || {};

    const event = threeAgentService.recordAgentEvent({
      sourceAgent: 'client_agent',
      targetAgent: 'admin_agent',
      eventType: 'escalation_to_admin',
      data: {
        customerPhone,
        customerName,
        reason: reason || 'Customer requested direct human contact',
        cartSummary
      },
      severity: 'high'
    });

    return res.status(201).json({
      success: true,
      message: 'Escalation ticket created and dispatched to admin desk',
      escalationId: event.id,
      emergencyHelp: {
        tollFree: '1800-890-3456',
        whatsapp: 'https://wa.me/9118008903456?text=Namaste%20Mr.%20Kandhari,%20I%20have%20an%20urgent%20event%20booking%20query'
      }
    });
  } catch (error) {
    console.error('handleClientEscalation error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Escalation error' });
  }
};

// ==========================================
// ADMIN AGENT HANDLERS
// ==========================================

const handleAdminQuery = (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'message string is required' });
    }

    const result = threeAgentService.processAdminMessage({ message });

    return res.json({
      success: true,
      agent: 'admin_agent',
      data: result
    });
  } catch (error) {
    console.error('handleAdminQuery error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Admin Agent query error' });
  }
};

const handleAdminConfirm = async (req, res) => {
  try {
    const { proposalId, confirmed = true } = req.body || {};
    if (!proposalId) {
      return res.status(400).json({ success: false, message: 'proposalId is required' });
    }

    const result = await threeAgentService.confirmAdminAction({
      proposalId,
      confirmed: !!confirmed
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('handleAdminConfirm error:', error);
    return res.status(400).json({ success: false, message: error.message || 'Confirmation failed' });
  }
};

const handleAdminDropoffAnalysis = (req, res) => {
  try {
    const result = threeAgentService.processAdminMessage({
      message: 'Why are customers asking about chairs but not submitting enquiries?'
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('handleAdminDropoffAnalysis error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Dropoff analysis error' });
  }
};

// ==========================================
// MASTER AGENT HANDLERS
// ==========================================

const handleMasterOverview = (req, res) => {
  try {
    const overview = threeAgentService.getSystemOverview();
    return res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('handleMasterOverview error:', error);
    return res.status(500).json({ success: false, message: error.message || 'System overview error' });
  }
};

const handleMasterProposeRule = (req, res) => {
  try {
    const { instruction, targetAgent } = req.body || {};
    if (!instruction || typeof instruction !== 'string') {
      return res.status(400).json({ success: false, message: 'instruction string is required' });
    }

    const proposal = threeAgentService.proposeRuleUpdate({
      instruction,
      targetAgentOverride: targetAgent
    });

    return res.status(201).json({
      success: true,
      message: 'Rule proposal synthesized with version diff for owner approval',
      proposal
    });
  } catch (error) {
    console.error('handleMasterProposeRule error:', error);
    return res.status(400).json({ success: false, message: error.message || 'Failed to synthesize rule proposal' });
  }
};

const handleMasterApplyRule = (req, res) => {
  try {
    const { proposalId, approved = true } = req.body || {};
    if (!proposalId) {
      return res.status(400).json({ success: false, message: 'proposalId is required' });
    }

    const result = threeAgentService.applyRuleUpdate({
      proposalId,
      approved: !!approved
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('handleMasterApplyRule error:', error);
    return res.status(400).json({ success: false, message: error.message || 'Failed to apply rule update' });
  }
};

const handleMasterRollbackRule = (req, res) => {
  try {
    const { targetAgent, toVersion } = req.body || {};
    if (!targetAgent || !toVersion) {
      return res.status(400).json({ success: false, message: 'targetAgent and toVersion are required' });
    }

    const result = threeAgentService.rollbackAgentConfig({
      targetAgent,
      toVersion
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('handleMasterRollbackRule error:', error);
    return res.status(400).json({ success: false, message: error.message || 'Failed to roll back rule' });
  }
};

const handleMasterEvents = (req, res) => {
  try {
    const db = getLocalDb();
    threeAgentService.ensureAgentsInit(db);

    const limit = parseInt(req.query.limit, 10) || 50;
    const events = (db.agentEvents || []).slice(0, limit);

    return res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('handleMasterEvents error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve events' });
  }
};

const handleMasterAudit = (req, res) => {
  try {
    const db = getLocalDb();
    threeAgentService.ensureAgentsInit(db);

    const limit = parseInt(req.query.limit, 10) || 50;
    const logs = (db.agentAuditLogs || []).slice(0, limit);

    return res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('handleMasterAudit error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve audit logs' });
  }
};

module.exports = {
  handleClientChat,
  handleClientCartAction,
  handleClientEscalation,
  handleAdminQuery,
  handleAdminConfirm,
  handleAdminDropoffAnalysis,
  handleMasterOverview,
  handleMasterProposeRule,
  handleMasterApplyRule,
  handleMasterRollbackRule,
  handleMasterEvents,
  handleMasterAudit
};
