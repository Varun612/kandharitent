const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');
const { requireAdminAuth, optionalAuth } = require('../middleware/authMiddleware');
const { validateEnquiryInput } = require('../middleware/validation');

// Public route to submit an enquiry (optionalAuth links customer if logged in)
router.post('/', optionalAuth, validateEnquiryInput, enquiryController.submitEnquiry);

// Protected Admin routes
router.get('/export/csv', requireAdminAuth, enquiryController.exportEnquiriesCSV);
router.get('/', requireAdminAuth, enquiryController.getEnquiries);
router.put('/:id/status', requireAdminAuth, enquiryController.updateEnquiryStatus);
router.put('/:id/quotation', requireAdminAuth, enquiryController.updateEnquiryQuotation);
router.delete('/:id', requireAdminAuth, enquiryController.deleteEnquiry);
router.get('/:id', optionalAuth, enquiryController.getEnquiryById);

module.exports = router;
