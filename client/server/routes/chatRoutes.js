const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { optionalAuth, requireAdminAuth } = require('../middleware/authMiddleware');

// Start new conversation (guest or logged-in customer)
router.post('/conversation/new', optionalAuth, chatController.startConversation);

// Get conversation history by ID (supports resuming stored context)
router.get('/conversation/:conversationId', optionalAuth, chatController.getConversation);

// Send message & receive AI reply with 5-photo gallery if requested
router.post('/conversation/:conversationId/message', optionalAuth, chatController.sendMessage);

// Submit official enquiry directly from accumulated conversation state
router.post('/conversation/:conversationId/submit', optionalAuth, chatController.submitEnquiryFromChat);

module.exports = router;
