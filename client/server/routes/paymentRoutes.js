const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { requireAdminAuth, requireCustomerAuth, optionalAuth } = require('../middleware/authMiddleware');

// Customer payment endpoints
router.post('/create-order', optionalAuth, paymentController.createPaymentOrder);
router.post('/verify', optionalAuth, paymentController.verifyPayment);
router.get('/history/:enquiryId', optionalAuth, paymentController.getPaymentHistory);

// Public Webhook (verified via Razorpay HMAC signature header)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// Admin offline payment recording
router.post('/record-offline', requireAdminAuth, paymentController.recordOfflinePayment);
router.get('/outside', requireAdminAuth, paymentController.getOutsidePayments);
router.post('/outside', requireAdminAuth, paymentController.recordOutsidePayment);

module.exports = router;
