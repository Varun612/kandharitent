const express = require('express');
const router = express.Router();
const {
  getDeliveryPartners,
  createDeliveryPartner,
  updateDeliveryPartner,
  deleteDeliveryPartner,
  assignPartnerToOrder,
  connectDriverRequest,
  driverApproveOrder,
  updateOrderDeliveryStatus,
  getOrderTrackingInfo
} = require('../controllers/deliveryPartnerController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public route to view fleet info or driver status
router.get('/', getDeliveryPartners);

// Public Zomato-style tracking endpoint
router.get('/track/:id', getOrderTrackingInfo);

// Admin fleet management
router.post('/', protectAdmin, createDeliveryPartner);
router.put('/:id', protectAdmin, updateDeliveryPartner);
router.delete('/:id', protectAdmin, deleteDeliveryPartner);

// Assignment and dispatch status tracking
router.post('/assign', protectAdmin, assignPartnerToOrder);
router.post('/connect-driver', protectAdmin, connectDriverRequest);
router.post('/approve-order', protectAdmin, driverApproveOrder);
router.post('/update-status', protectAdmin, updateOrderDeliveryStatus);

module.exports = router;
