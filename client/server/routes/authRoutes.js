const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAdminAuth, requireCustomerAuth, optionalAuth } = require('../middleware/authMiddleware');

// Customer Auth
router.post('/register', authController.customerRegister);
router.post('/customer-login', authController.customerLogin);
router.get('/my-enquiries', requireCustomerAuth, authController.getCustomerEnquiries);
router.get('/my-conversations', requireCustomerAuth, authController.getCustomerConversations);

// Admin Auth
router.post('/login', authController.adminLogin);
router.post('/reset-admin-password', authController.resetAdminPassword);
router.get('/stats', requireAdminAuth, authController.getDashboardStats);
router.get('/customers', requireAdminAuth, authController.getAllCustomers);

// Verify Token (Customer or Admin)
router.get('/verify', requireCustomerAuth, authController.verifyAuth);

module.exports = router;
