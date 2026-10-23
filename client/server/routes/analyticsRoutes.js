const express = require('express');
const router = express.Router();
const {
  logAnalyticsEvent,
  getAnalyticsSummary,
  recordItemView,
  getLiveViews
} = require('../controllers/analyticsController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public tracking endpoints (used by client browser with session ID)
router.post('/event', logAnalyticsEvent);
router.post('/item-view', recordItemView);
router.get('/live-views', getLiveViews);

// Admin summary endpoint
router.get('/summary', protectAdmin, getAnalyticsSummary);

module.exports = router;
