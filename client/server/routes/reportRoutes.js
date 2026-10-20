const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { requireAdminAuth } = require('../middleware/authMiddleware');

router.get('/summary', requireAdminAuth, reportController.getReportSummary);
router.get('/export-csv', requireAdminAuth, reportController.exportReportCSV);
router.get('/printable-html', requireAdminAuth, reportController.getPrintableReportHtml);

module.exports = router;
