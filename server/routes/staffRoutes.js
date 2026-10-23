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
  getWagePayments,
  getAttendanceGrid,
  recordBulkAttendance,
  getAdvances,
  recordAdvance,
  deleteAdvance,
  getPayroll,
  finalizePayroll,
  updatePayrollStatus
} = require('../controllers/staffController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.get('/', protectAdmin, getStaffList);
router.post('/', protectAdmin, createStaffMember);
router.put('/:id', protectAdmin, updateStaffMember);

router.get('/attendance', protectAdmin, getAttendance);
router.post('/attendance', protectAdmin, recordAttendance);
router.get('/attendance-grid', protectAdmin, getAttendanceGrid);
router.post('/attendance/bulk', protectAdmin, recordBulkAttendance);

router.get('/advances', protectAdmin, getAdvances);
router.post('/advances', protectAdmin, recordAdvance);
router.delete('/advances/:id', protectAdmin, deleteAdvance);

router.get('/payroll', protectAdmin, getPayroll);
router.post('/payroll/finalize', protectAdmin, finalizePayroll);
router.put('/payroll/:id/status', protectAdmin, updatePayrollStatus);

router.get('/wages', protectAdmin, calculateWages);
router.get('/wage-summary', protectAdmin, calculateWages);
router.get('/payments', protectAdmin, getWagePayments);
router.post('/payments', protectAdmin, recordWagePayment);

module.exports = router;
