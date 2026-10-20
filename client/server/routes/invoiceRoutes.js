const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { requireAdminAuth } = require('../middleware/authMiddleware');

router.get('/', requireAdminAuth, invoiceController.getInvoices);
router.get('/:id', requireAdminAuth, invoiceController.getInvoiceById);
router.post('/', requireAdminAuth, invoiceController.generateInvoice);
router.post('/generate', requireAdminAuth, invoiceController.generateInvoice);

module.exports = router;
