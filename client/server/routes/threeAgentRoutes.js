/**
 * Three-Agent System Routes
 * Kandhari Tent & Caterers & Dwarka Shri Lawn, Lucknow
 */

const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/threeAgentController');

const { requireAdminAuth, optionalAuth } = require('../middleware/authMiddleware');

// 1. Client Agent Routes (Public / Customer Authenticated)
router.post('/client/chat', optionalAuth, handleClientChat);
router.post('/client/cart-action', optionalAuth, handleClientCartAction);
router.post('/client/escalate', optionalAuth, handleClientEscalation);

// 2. Admin Agent Routes (Protected Administrator Auth)
router.post('/admin/query', requireAdminAuth, handleAdminQuery);
router.post('/admin/confirm', requireAdminAuth, handleAdminConfirm);
router.get('/admin/dropoff-analysis', requireAdminAuth, handleAdminDropoffAnalysis);

// 3. Master Agent Routes (Protected Owner / Administrator Auth)
router.get('/master/overview', requireAdminAuth, handleMasterOverview);
router.post('/master/rules/propose', requireAdminAuth, handleMasterProposeRule);
router.post('/master/rules/apply', requireAdminAuth, handleMasterApplyRule);
router.post('/master/rules/rollback', requireAdminAuth, handleMasterRollbackRule);
router.get('/master/events', requireAdminAuth, handleMasterEvents);
router.get('/master/audit', requireAdminAuth, handleMasterAudit);

module.exports = router;
