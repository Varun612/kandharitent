const express = require('express');
const router = express.Router();
const {
  getStaffList,
  createStaffMember,
  updateStaffMember,
  getAttendance,
  recordAttendance,
  calculateWages,
  recordWagePayment,
  getWagePayments
} = require('../controllers/staffController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.get('/', protectAdmin, getStaffList);
router.post('/', protectAdmin, createStaffMember);
router.put('/:id', protectAdmin, updateStaffMember);

router.get('/attendance', protectAdmin, getAttendance);
router.post('/attendance', protectAdmin, recordAttendance);

router.get('/wages', protectAdmin, calculateWages);
router.get('/wage-summary', protectAdmin, calculateWages);
router.get('/payments', protectAdmin, getWagePayments);
router.post('/payments', protectAdmin, recordWagePayment);

module.exports = router;
