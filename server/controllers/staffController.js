const { getLocalDb, saveLocalStore } = require('../config/db');

// Ensure staff array is initialized with seed workers
const ensureStaffInit = (db) => {
  if (!db.staff || db.staff.length === 0) {
    db.staff = [
      {
        id: 'staff-001',
        name: 'Ramu Kumar',
        category: 'Labourer',
        phone: '9839123401',
        startDate: '2025-01-15',
        dailyWage: 500,
        status: 'active',
        notes: 'Experienced tent pitching and pandal erection worker.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'staff-002',
        name: 'Shyam Lal',
        category: 'Labourer',
        phone: '9839123402',
        startDate: '2025-02-01',
        dailyWage: 500,
        status: 'active',
        notes: 'Chairs, tables and furniture arrangement specialist.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'staff-003',
        name: 'Mukesh Yadav',
        category: 'Driver',
        phone: '9839123403',
        startDate: '2024-11-10',
        dailyWage: 500,
        status: 'active',
        notes: 'Tata 407 & pickup delivery truck driver for Kanpur Road.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'staff-004',
        name: 'Dinesh Sharma',
        category: 'Fitter',
        phone: '9839123404',
        startDate: '2024-09-01',
        dailyWage: 500,
        status: 'active',
        notes: 'Iron truss stage fitter and German hangar structural specialist.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'staff-005',
        name: 'Bablu Verma',
        category: 'Labourer',
        phone: '9839123405',
        startDate: '2025-03-01',
        dailyWage: 500,
        status: 'active',
        notes: 'Catering counter loading, chafing dishes and logistics support.',
        createdAt: new Date().toISOString()
      }
    ];
  }

  if (!db.attendance) {
    db.attendance = [];
  }

  if (!db.wagePayments) {
    db.wagePayments = [];
  }

  if (!db.attendanceAuditLogs) {
    db.attendanceAuditLogs = [];
  }
};

/**
 * GET /api/staff
 * List all staff members (with optional category filter)
 */
const getStaffList = (req, res) => {
  try {
    const { category, role, status } = req.query;
    const db = getLocalDb();
    ensureStaffInit(db);

    let list = db.staff || [];
    if (status && status !== 'all') {
      list = list.filter(s => (s.status || 'Active').toLowerCase() === status.toLowerCase());
    }
    const filterCat = category || role;
    if (filterCat && filterCat !== 'all') {
      list = list.filter(s => (s.category || s.role || '').toLowerCase() === filterCat.toLowerCase());
    }

    return res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (error) {
    console.error('getStaffList error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving staff' });
  }
};

/**
 * POST /api/staff
 * Register a new staff member (Labourer, Driver, Fitter)
 */
const createStaffMember = (req, res) => {
  try {
    const { name, category, phone, startDate, dailyWage, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Staff name is required' });
    }

    const validCategories = ['Labourer', 'Driver', 'Fitter'];
    const assignedCategory = validCategories.find(c => c.toLowerCase() === (category || 'Labourer').toLowerCase()) || 'Labourer';

    const db = getLocalDb();
    ensureStaffInit(db);

    const newStaff = {
      id: 'staff-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      category: assignedCategory,
      phone: phone ? phone.trim() : '',
      startDate: startDate || new Date().toISOString().split('T')[0],
      dailyWage: Number(dailyWage) > 0 ? Number(dailyWage) : 500,
      status: 'active',
      notes: notes ? notes.trim() : '',
      createdAt: new Date().toISOString()
    };

    db.staff.push(newStaff);
    saveLocalStore();

    return res.status(201).json({
      success: true,
      message: `Registered ${newStaff.name} as ${newStaff.category} at ₹${newStaff.dailyWage}/day`,
      data: newStaff
    });
  } catch (error) {
    console.error('createStaffMember error:', error);
    return res.status(500).json({ success: false, message: 'Server error registering staff' });
  }
};

/**
 * PUT /api/staff/:id
 * Update staff details (wage, status, category, phone)
 */
const updateStaffMember = (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, phone, dailyWage, status, notes } = req.body;

    const db = getLocalDb();
    ensureStaffInit(db);

    const staff = db.staff.find(s => s.id === id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    if (name) staff.name = name.trim();
    if (category) {
      const valid = ['Labourer', 'Driver', 'Fitter'];
      if (valid.includes(category)) staff.category = category;
    }
    if (phone !== undefined) staff.phone = phone.trim();
    if (dailyWage !== undefined && Number(dailyWage) > 0) staff.dailyWage = Number(dailyWage);
    if (status) staff.status = status;
    if (notes !== undefined) staff.notes = notes.trim();
    staff.updatedAt = new Date().toISOString();

    saveLocalStore();
    return res.json({ success: true, message: 'Staff details updated', data: staff });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error updating staff' });
  }
};

/**
 * GET /api/staff/attendance
 * Retrieve attendance records by date or date range
 */
const getAttendance = (req, res) => {
  try {
    const { date, startDate, endDate, staffId } = req.query;
    const db = getLocalDb();
    ensureStaffInit(db);

    let records = db.attendance || [];

    if (date) {
      records = records.filter(r => r.date === date);
    } else if (startDate && endDate) {
      records = records.filter(r => r.date >= startDate && r.date <= endDate);
    }

    if (staffId) {
      records = records.filter(r => r.staffId === staffId);
    }

    records.sort((a, b) => b.date.localeCompare(a.date));

    return res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error retrieving attendance' });
  }
};

/**
 * POST /api/staff/attendance
 * Mark or update daily attendance for a staff member
 * Prevents accidental duplicates; updates existing entry with audit trail
 */
const recordAttendance = (req, res) => {
  try {
    const { staffId, date, status, notes } = req.body;

    if (!staffId || !status) {
      return res.status(400).json({ success: false, message: 'staffId and status are required' });
    }

    const validStatuses = ['Present', 'Half-day', 'Absent', 'Leave'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Present, Half-day, Absent, or Leave' });
    }

    const targetDate = date || new Date().toISOString().split('T')[0];

    const db = getLocalDb();
    ensureStaffInit(db);

    const staffMember = db.staff.find(s => s.id === staffId);
    if (!staffMember) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    // Check for existing record on that date
    const existingIndex = db.attendance.findIndex(a => a.staffId === staffId && a.date === targetDate);

    const wageRate = staffMember.dailyWage || 500;
    const calcWage = status === 'Present' ? wageRate : (status === 'Half-day' ? Math.round(wageRate * 0.5) : 0);

    let record;
    if (existingIndex !== -1) {
      const prevStatus = db.attendance[existingIndex].status;
      db.attendance[existingIndex].status = status;
      db.attendance[existingIndex].calculatedWage = calcWage;
      db.attendance[existingIndex].dailyWage = wageRate;
      db.attendance[existingIndex].notes = notes || db.attendance[existingIndex].notes || '';
      db.attendance[existingIndex].updatedAt = new Date().toISOString();
      db.attendance[existingIndex].updatedBy = req.user ? req.user.email : 'admin';
      record = db.attendance[existingIndex];

      if (!db.attendanceAuditLogs) db.attendanceAuditLogs = [];
      db.attendanceAuditLogs.push({
        id: 'att-log-' + Date.now(),
        staffId,
        staffName: staffMember.name,
        date: targetDate,
        prevStatus,
        newStatus: status,
        action: 'corrected_attendance',
        timestamp: new Date().toISOString(),
        performedBy: req.user ? req.user.email : 'admin'
      });
    } else {
      record = {
        id: 'att-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
        staffId: staffMember.id,
        staffName: staffMember.name,
        staffCategory: staffMember.category || staffMember.role,
        role: staffMember.role || staffMember.category,
        date: targetDate,
        status,
        dailyWage: wageRate,
        calculatedWage: calcWage,
        notes: notes ? notes.trim() : '',
        recordedAt: new Date().toISOString(),
        recordedBy: req.user ? req.user.email : 'admin'
      };
      db.attendance.push(record);
    }

    saveLocalStore();

    return res.status(existingIndex !== -1 ? 200 : 201).json({
      success: true,
      message: `Marked ${staffMember.name} as ${status} on ${targetDate}`,
      data: record
    });
  } catch (error) {
    console.error('recordAttendance error:', error);
    return res.status(500).json({ success: false, message: 'Server error recording attendance' });
  }
};

/**
 * GET /api/staff/wages & /api/staff/wage-summary
 * Calculate wages for all or individual staff over a date or date range
 */
const calculateWages = (req, res) => {
  try {
    const { startDate, endDate, date, staffId } = req.query;
    const db = getLocalDb();
    ensureStaffInit(db);

    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const defaultEnd = now.toISOString().split('T')[0];

    const start = date || startDate || defaultStart;
    const end = date || endDate || defaultEnd;

    let targetStaff = db.staff || [];
    if (staffId) {
      targetStaff = targetStaff.filter(s => s.id === staffId);
    }

    const records = (db.attendance || []).filter(a => a.date >= start && a.date <= end);
    const payments = (db.wagePayments || []).filter(p => p.date >= start && p.date <= end);

    let grandTotalWages = 0;
    let grandTotalPaid = 0;
    let grandTotalPending = 0;
    let totalPresent = 0;
    let totalHalfDay = 0;
    let totalAbsent = 0;
    let totalLeave = 0;

    const breakdown = targetStaff.map(s => {
      const staffAtt = records.filter(r => r.staffId === s.id);
      const staffPays = payments.filter(p => p.staffId === s.id);

      const presentCount = staffAtt.filter(r => r.status === 'Present').length;
      const halfDayCount = staffAtt.filter(r => r.status === 'Half-day').length;
      const absentCount = staffAtt.filter(r => r.status === 'Absent').length;
      const leaveCount = staffAtt.filter(r => r.status === 'Leave').length;

      totalPresent += presentCount;
      totalHalfDay += halfDayCount;
      totalAbsent += absentCount;
      totalLeave += leaveCount;

      const payableDays = presentCount + (halfDayCount * 0.5);
      const totalEarned = Math.round(payableDays * (s.dailyWage || 500));
      const totalPaid = staffPays.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
      const pendingWage = Math.max(0, totalEarned - totalPaid);

      grandTotalWages += totalEarned;
      grandTotalPaid += totalPaid;
      grandTotalPending += pendingWage;

      return {
        staffId: s.id,
        name: s.name,
        category: s.category || s.role,
        role: s.role || s.category,
        dailyWage: s.dailyWage || 500,
        presentDays: presentCount,
        halfDays: halfDayCount,
        absentDays: absentCount,
        leaveDays: leaveCount,
        payableDays,
        totalEarned,
        totalPaid,
        pendingWage,
        recentPayments: staffPays
      };
    });

    return res.json({
      success: true,
      period: { start, end },
      summary: {
        totalStaff: targetStaff.length,
        totalWage: grandTotalWages,
        grandTotalWages,
        grandTotalPaid,
        grandTotalPending,
        presentCount: totalPresent,
        halfDayCount: totalHalfDay,
        absentCount: totalAbsent,
        leaveCount: totalLeave
      },
      data: {
        totalWage: grandTotalWages,
        grandTotalWages,
        grandTotalPaid,
        grandTotalPending,
        presentCount: totalPresent,
        halfDayCount: totalHalfDay,
        absentCount: totalAbsent,
        leaveCount: totalLeave,
        breakdown
      }
    });
  } catch (error) {
    console.error('calculateWages error:', error);
    return res.status(500).json({ success: false, message: 'Server error calculating wages' });
  }
};

/**
 * POST /api/staff/payments
 * Record an authorised wage disbursement (Cash, UPI, Cheque)
 */
const recordWagePayment = (req, res) => {
  try {
    const { staffId, amount, paymentMode, paymentMethod, reference, referenceNumber, date, notes } = req.body;

    if (!staffId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid staffId and positive amount required' });
    }

    const db = getLocalDb();
    ensureStaffInit(db);

    const staffMember = db.staff.find(s => s.id === staffId);
    if (!staffMember) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    const paymentRecord = {
      id: 'wpay-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      staffId: staffMember.id,
      staffName: staffMember.name,
      amount: Number(amount),
      paymentMode: paymentMode || paymentMethod || 'Cash',
      paymentMethod: paymentMethod || paymentMode || 'Cash',
      reference: reference || referenceNumber || 'Wage Disbursement',
      referenceNumber: referenceNumber || reference || 'Wage Disbursement',
      date: date || new Date().toISOString().split('T')[0],
      notes: notes ? notes.trim() : '',
      recordedAt: new Date().toISOString(),
      disbursedAt: new Date().toISOString(),
      recordedBy: req.user ? req.user.email : 'admin'
    };

    if (!db.wagePayments) db.wagePayments = [];
    db.wagePayments.push(paymentRecord);
    saveLocalStore();

    return res.status(201).json({
      success: true,
      message: `Recorded payment of ₹${paymentRecord.amount} to ${staffMember.name} via ${paymentRecord.paymentMode}`,
      data: paymentRecord
    });
  } catch (error) {
    console.error('recordWagePayment error:', error);
    return res.status(500).json({ success: false, message: 'Server error recording payment' });
  }
};

/**
 * GET /api/staff/payments
 * List wage payment disbursement receipts
 */
const getWagePayments = (req, res) => {
  try {
    const db = getLocalDb();
    ensureStaffInit(db);
    const payments = (db.wagePayments || []).slice(-50).reverse();
    return res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error retrieving wage payments' });
  }
};

module.exports = {
  getStaffList,
  createStaffMember,
  updateStaffMember,
  getAttendance,
  recordAttendance,
  calculateWages,
  recordWagePayment,
  getWagePayments,
  ensureStaffInit
};
