// server/routes/couponRoutes.js
const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public validation
router.post('/validate', couponController.validateCoupon);

// Admin management
router.get('/', couponController.getCoupons);
router.post('/', protectAdmin, couponController.createCoupon);
router.delete('/:id', protectAdmin, couponController.deleteCoupon);

module.exports = router;
