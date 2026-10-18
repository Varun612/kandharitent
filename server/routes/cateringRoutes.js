const express = require('express');
const router = express.Router();
const cateringController = require('../controllers/cateringController');
const { requireAdminAuth } = require('../middleware/authMiddleware');

// Public endpoints
router.get('/menu', cateringController.getCateringMenu);
router.get('/categories', cateringController.getCateringCategories);
router.get('/packages', cateringController.getCateringPackages);
router.post('/enquire', cateringController.submitCateringEnquiry);
router.post('/enquiries', cateringController.submitCateringEnquiry);

// Admin dish management endpoints
router.post('/items', requireAdminAuth, cateringController.addCateringItem);
router.put('/items/:id', requireAdminAuth, cateringController.updateCateringItem);
router.delete('/items/:id', requireAdminAuth, cateringController.deleteCateringItem);

module.exports = router;
