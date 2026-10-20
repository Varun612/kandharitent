const express = require('express');
const router = express.Router();
const { 
  handleAgentQuery, 
  confirmAgentAction,
  getConversations,
  getMemories,
  createMemory,
  updateMemory,
  deleteMemory,
  getWorkflows,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow
} = require('../controllers/masterAgentController');
const { requireAdminAuth } = require('../middleware/authMiddleware');

router.post('/query', requireAdminAuth, handleAgentQuery);
router.post('/confirm', requireAdminAuth, confirmAgentAction);

// Layer A: Conversations
router.get('/conversations', requireAdminAuth, getConversations);

// Layer B: Business Memory
router.get('/memories', requireAdminAuth, getMemories);
router.post('/memories', requireAdminAuth, createMemory);
router.put('/memories/:id', requireAdminAuth, updateMemory);
router.delete('/memories/:id', requireAdminAuth, deleteMemory);

// Layer C: Learned Workflows
router.get('/workflows', requireAdminAuth, getWorkflows);
router.post('/workflows', requireAdminAuth, createWorkflow);
router.put('/workflows/:id', requireAdminAuth, updateWorkflow);
router.delete('/workflows/:id', requireAdminAuth, deleteWorkflow);

module.exports = router;
