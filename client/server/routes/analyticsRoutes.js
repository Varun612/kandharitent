const express = require('express');
const router = express.Router();
const {
  logAnalyticsEvent,
  getAnalyticsSummary
} = require('../controllers/analyticsController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public tracking endpoint (used by client browser with session ID)
router.post('/event', logAnalyticsEvent);

// Admin summary endpoint
router.get('/summary', protectAdmin, getAnalyticsSummary);

module.exports = router;
