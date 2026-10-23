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
      },
      {
        id: 'staff-006',
        name: 'Ramprakash',
        category: 'Labourer',
        phone: '9839123406',
        startDate: '2025-01-01',
        dailyWage: 500,
        status: 'active',
        notes: 'Primary Daya attendance register worker - loading and tent pitching.',
        createdAt: new Date().toISOString()
      }
    ];
  }

  // Ensure Ramprakash exists if staff was already populated
  if (db.staff && !db.staff.find(s => s.name === 'Ramprakash')) {
    db.staff.push({
      id: 'staff-006',
      name: 'Ramprakash',
      category: 'Labourer',
      phone: '9839123406',
      startDate: '2025-01-01',
      dailyWage: 500,
      status: 'active',
      notes: 'Primary Daya attendance register worker - loading and tent pitching.',
      createdAt: new Date().toISOString()
    });
  }

  if (!db.attendance) {
    db.attendance = [];
  }

  if (!db.wagePayments) {
    db.wagePayments = [];
  }

  if (!db.staffAdvances) {
    db.staffAdvances = [];
  }

  if (!db.staffPayroll) {
    db.staffPayroll = [];
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


/**
 * GET /api/staff/attendance-grid
 * Returns the Daya-style 1..31 monthly attendance grid for all employees
 */
const getAttendanceGrid = (req, res) => {
  try {
    const { year, month } = req.query;
    const now = new Date();
    const targetYear = parseInt(year, 10) || now.getFullYear();
    const targetMonth = parseInt(month, 10) || (now.getMonth() + 1); // 1-indexed

    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    const monthStr = targetMonth.toString().padStart(2, '0');
    const startStr = `${targetYear}-${monthStr}-01`;
    const endStr = `${targetYear}-${monthStr}-${daysInMonth.toString().padStart(2, '0')}`;

    const db = getLocalDb();
    ensureStaffInit(db);

    const staffList = (db.staff || []).filter(s => s.status !== 'inactive');
    const monthAttendance = (db.attendance || []).filter(a => a.date >= startStr && a.date <= endStr);
    const monthAdvances = (db.staffAdvances || []).filter(adv => adv.date >= startStr && adv.date <= endStr);

    const grid = staffList.map(emp => {
      const empAtt = monthAttendance.filter(a => a.staffId === emp.id);
      const empAdv = monthAdvances.filter(adv => adv.staffId === emp.id);
      const totalAdvance = empAdv.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);

      const daysMap = {};
      let presentCount = 0;
      let halfDayCount = 0;
      let absentCount = 0;
      let leaveCount = 0;
      let holidayCount = 0;

      for (let d = 1; d <= daysInMonth; d++) {
        const dStr = `${targetYear}-${monthStr}-${d.toString().padStart(2, '0')}`;
        const rec = empAtt.find(a => a.date === dStr);
        let mark = '-';
        if (rec) {
          if (rec.status === 'Present') { mark = 'P'; presentCount++; }
          else if (rec.status === 'Half-day' || rec.status === 'Half Day') { mark = '1/2'; halfDayCount++; }
          else if (rec.status === 'Absent') { mark = 'A'; absentCount++; }
          else if (rec.status === 'Leave') { mark = 'L'; leaveCount++; }
          else if (rec.status === 'Holiday') { mark = 'H'; holidayCount++; }
        }
        daysMap[d] = mark;
      }

      const payableUnits = presentCount + (halfDayCount * 0.5);
      const dailyWage = emp.dailyWage || 500;
      const grossWages = Math.round(payableUnits * dailyWage);
      const advancesDeducted = Math.min(totalAdvance, grossWages);
      const netPayable = Math.max(0, grossWages - advancesDeducted);
      const carryForwardAdvance = Math.max(0, totalAdvance - grossWages);

      return {
        id: emp.id,
        workerId: emp.id,
        staffId: emp.id,
        name: emp.name,
        workerName: emp.name,
        category: emp.category || 'Labourer',
        dailyWage,
        days: daysMap,
        presentCount,
        halfDayCount,
        absentCount,
        leaveCount,
        holidayCount,
        payableUnits,
        grossWages,
        totalAdvance,
        advancesDeducted,
        netPayable,
        carryForwardAdvance,
        advancesList: empAdv
      };
    });

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = monthNames[targetMonth - 1] || 'Current Month';

    return res.json({
      success: true,
      year: targetYear,
      month: targetMonth,
      monthName,
      daysInMonth,
      workers: grid,
      grid,
      data: { workers: grid, grid }
    });
  } catch (error) {
    console.error('getAttendanceGrid error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving attendance grid' });
  }
};

/**
 * POST /api/staff/attendance/bulk
 * Mark bulk attendance for a specific date across staff
 */
const recordBulkAttendance = (req, res) => {
  try {
    const db = getLocalDb();
    ensureStaffInit(db);

    // Format 1: Multi-day grid entry for a single worker { workerId/staffId, year, month, days: { [day]: mark } }
    if (req.body.days && (req.body.workerId || req.body.staffId)) {
      const staffId = req.body.workerId || req.body.staffId;
      const worker = db.staff.find(s => s.id === staffId);
      if (!worker) {
        return res.status(404).json({ success: false, message: 'Worker not found' });
      }

      const y = parseInt(req.body.year, 10) || new Date().getFullYear();
      const m = parseInt(req.body.month, 10) || (new Date().getMonth() + 1);
      const mStr = m.toString().padStart(2, '0');
      const daysObj = req.body.days;

      let totalUnits = 0;
      Object.keys(daysObj).forEach(d => {
        const dStr = parseInt(d, 10).toString().padStart(2, '0');
        const dateStr = `${y}-${mStr}-${dStr}`;
        const rawMark = daysObj[d]; // e.g. 'P', '1/2', 'A', 'L', 'H'

        let status = 'Absent';
        let units = 0;
        if (rawMark === 'P' || rawMark === 'Present') {
          status = 'Present';
          units = 1.0;
        } else if (rawMark === '1/2' || rawMark === 'Half-day' || rawMark === 'Half Day') {
          status = 'Half-day';
          units = 0.5;
        } else if (rawMark === 'L' || rawMark === 'Leave') {
          status = 'Leave';
          units = 0;
        } else if (rawMark === 'H' || rawMark === 'Holiday') {
          status = 'Holiday';
          units = 0;
        }
        totalUnits += units;

        const wageRate = worker.dailyWage || 500;
        const calcWage = Math.round(units * wageRate);

        const existingIdx = db.attendance.findIndex(a => a.staffId === staffId && a.date === dateStr);
        if (existingIdx !== -1) {
          db.attendance[existingIdx].status = status;
          db.attendance[existingIdx].mark = rawMark;
          db.attendance[existingIdx].calculatedWage = calcWage;
          db.attendance[existingIdx].updatedAt = new Date().toISOString();
        } else {
          db.attendance.push({
            id: `att-${staffId}-${dateStr}`,
            staffId,
            staffName: worker.name,
            date: dateStr,
            status,
            mark: rawMark,
            dailyWage: wageRate,
            calculatedWage: calcWage,
            createdAt: new Date().toISOString()
          });
        }
      });

      saveLocalStore();
      return res.json({
        success: true,
        message: 'Bulk attendance recorded successfully',
        workerId: staffId,
        totalUnits,
        daysUpdated: Object.keys(daysObj).length
      });
    }

    // Format 2: Single date across multiple staff members
    const { date, records } = req.body;
    if (!date || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'date and records array are required' });
    }

    const saved = [];
    records.forEach(item => {
      const { staffId, status, notes } = item;
      const staffMember = db.staff.find(s => s.id === staffId);
      if (!staffMember) return;

      const wageRate = staffMember.dailyWage || 500;
      const calcWage = status === 'Present' ? wageRate : (status === 'Half-day' ? Math.round(wageRate * 0.5) : 0);
      const existingIdx = db.attendance.findIndex(a => a.staffId === staffId && a.date === date);

      if (existingIdx !== -1) {
        db.attendance[existingIdx].status = status;
        db.attendance[existingIdx].calculatedWage = calcWage;
        db.attendance[existingIdx].notes = notes || '';
        db.attendance[existingIdx].updatedAt = new Date().toISOString();
        saved.push(db.attendance[existingIdx]);
      } else {
        const newRecord = {
          id: 'att-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
          staffId,
          staffName: staffMember.name,
          date,
          status,
          dailyWage: wageRate,
          calculatedWage: calcWage,
          notes: notes || '',
          recordedAt: new Date().toISOString(),
          recordedBy: req.user ? req.user.email : 'admin'
        };
        db.attendance.push(newRecord);
        saved.push(newRecord);
      }
    });

    saveLocalStore();
    return res.json({ success: true, count: saved.length, data: saved });
  } catch (error) {
    console.error('recordBulkAttendance error:', error);
    return res.status(500).json({ success: false, message: 'Server error in bulk attendance' });
  }
};

/**
 * GET /api/staff/advances - List employee advances
 */
const getAdvances = (req, res) => {
  try {
    const { staffId, workerId, status, startDate, endDate } = req.query;
    const targetId = workerId || staffId;
    const db = getLocalDb();
    ensureStaffInit(db);

    let list = db.staffAdvances || [];
    if (targetId) list = list.filter(a => a.staffId === targetId || a.workerId === targetId);
    if (status && status !== 'all') list = list.filter(a => a.status === status);
    if (startDate && endDate) list = list.filter(a => a.date >= startDate && a.date <= endDate);

    list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    const totalAdvances = list.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
    const totalOutstanding = list.reduce((sum, a) => sum + (Number(a.outstandingBalance !== undefined ? a.outstandingBalance : a.balance) || 0), 0);

    return res.json({
      success: true,
      count: list.length,
      totalAdvances,
      totalOutstanding,
      data: list
    });
  } catch (error) {
    console.error('getAdvances error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving advances' });
  }
};

/**
 * POST /api/staff/advances - Record a new employee advance (e.g. ₹500, ₹100, ₹5000)
 */
const recordAdvance = (req, res) => {
  try {
    const { staffId, workerId, workerName, amount, date, notes } = req.body;
    const targetId = workerId || staffId;
    if (!targetId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid staffId/workerId and positive advance amount required' });
    }

    const db = getLocalDb();
    ensureStaffInit(db);

    const staffMember = db.staff.find(s => s.id === targetId || s.name === workerName || (targetId && s.id.includes(targetId)));
    const targetName = staffMember ? staffMember.name : (workerName || 'Staff Member');
    const actualId = staffMember ? staffMember.id : targetId;

    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const advanceId = `ADV-${year}-${rand}`;

    const numAmount = Number(amount);
    const newAdvance = {
      id: advanceId,
      advanceNumber: advanceId,
      staffId: actualId,
      workerId: actualId,
      staffName: targetName,
      workerName: targetName,
      amount: numAmount,
      date: date || new Date().toISOString().split('T')[0],
      recordedBy: req.user ? req.user.email : 'admin',
      notes: notes ? notes.trim() : 'Staff cash advance',
      status: 'outstanding',
      amountRecovered: 0,
      recoveredAmount: 0,
      balance: numAmount,
      outstandingBalance: numAmount,
      createdAt: new Date().toISOString()
    };

    db.staffAdvances.push(newAdvance);
    saveLocalStore();

    return res.status(201).json({
      success: true,
      message: `Recorded advance of ₹${newAdvance.amount} to ${targetName}`,
      data: newAdvance
    });
  } catch (error) {
    console.error('recordAdvance error:', error);
    return res.status(500).json({ success: false, message: 'Server error recording advance' });
  }
};

/**
 * DELETE /api/staff/advances/:id - Delete / reverse an outstanding advance
 */
const deleteAdvance = (req, res) => {
  try {
    const { id } = req.params;
    const db = getLocalDb();
    ensureStaffInit(db);

    const idx = (db.staffAdvances || []).findIndex(a => a.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Advance transaction not found' });
    }

    const adv = db.staffAdvances[idx];
    if (adv.status === 'settled' || (adv.amountRecovered && adv.amountRecovered > 0)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an advance that has already been partially or fully settled in finalized payroll.'
      });
    }

    const removed = db.staffAdvances.splice(idx, 1)[0];
    saveLocalStore();

    return res.json({ success: true, message: `Deleted advance transaction ${removed.id}`, data: removed });
  } catch (error) {
    console.error('deleteAdvance error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting advance' });
  }
};

/**
 * GET /api/staff/payroll - Calculate payroll for period or list finalized payroll runs
 */
const getPayroll = (req, res) => {
  try {
    const { periodStart, periodEnd } = req.query;
    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const defaultEnd = now.toISOString().split('T')[0];

    const start = periodStart || defaultStart;
    const end = periodEnd || defaultEnd;

    const db = getLocalDb();
    ensureStaffInit(db);

    const staffList = (db.staff || []).filter(s => s.status !== 'inactive');
    const records = (db.attendance || []).filter(a => a.date >= start && a.date <= end);
    const outstandingAdvances = (db.staffAdvances || []).filter(adv => adv.balance > 0 && adv.date <= end);

    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    const breakdown = staffList.map(s => {
      const staffAtt = records.filter(r => r.staffId === s.id);
      const presentCount = staffAtt.filter(r => r.status === 'Present').length;
      const halfDayCount = staffAtt.filter(r => r.status === 'Half-day' || r.status === 'Half Day').length;
      const absentCount = staffAtt.filter(r => r.status === 'Absent').length;
      const leaveCount = staffAtt.filter(r => r.status === 'Leave').length;

      const payableUnits = presentCount + (halfDayCount * 0.5);
      const dailyWage = s.dailyWage || 500;
      const grossWage = Math.round(payableUnits * dailyWage);

      // Advances available for deduction for this employee
      const empAdvances = outstandingAdvances.filter(adv => adv.staffId === s.id);
      const totalEligibleAdvance = empAdvances.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
      const advanceDeducted = Math.min(totalEligibleAdvance, grossWage);
      const netPayable = Math.max(0, grossWage - advanceDeducted);
      const carryForwardAdvance = Math.max(0, totalEligibleAdvance - grossWage);

      totalGross += grossWage;
      totalDeductions += advanceDeducted;
      totalNet += netPayable;

      return {
        staffId: s.id,
        name: s.name,
        category: s.category || 'Labourer',
        dailyWage,
        presentCount,
        halfDayCount,
        absentCount,
        leaveCount,
        payableUnits,
        grossWage,
        totalEligibleAdvance,
        advanceDeducted,
        netPayable,
        carryForwardAdvance,
        advances: empAdvances
      };
    });

    const finalizedRuns = (db.staffPayroll || []).slice(-10).reverse();

    return res.json({
      success: true,
      period: { start, end },
      summary: {
        totalStaff: staffList.length,
        totalGross,
        totalDeductions,
        totalNet
      },
      breakdown,
      finalizedRuns
    });
  } catch (error) {
    console.error('getPayroll error:', error);
    return res.status(500).json({ success: false, message: 'Server error calculating payroll' });
  }
};

/**
 * POST /api/staff/payroll/finalize - Finalize and freeze a payroll period, updating advances ledger idempotently
 */
const finalizePayroll = (req, res) => {
  try {
    let { periodStart, periodEnd, year, month, notes } = req.body;
    if ((!periodStart || !periodEnd) && year && month) {
      const y = parseInt(year, 10);
      const m = parseInt(month, 10);
      const daysInMonth = new Date(y, m, 0).getDate();
      const mStr = m.toString().padStart(2, '0');
      periodStart = `${y}-${mStr}-01`;
      periodEnd = `${y}-${mStr}-${daysInMonth.toString().padStart(2, '0')}`;
    }

    if (!periodStart || !periodEnd) {
      return res.status(400).json({ success: false, message: 'periodStart and periodEnd or year and month are required' });
    }

    const db = getLocalDb();
    ensureStaffInit(db);

    const currentYear = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const payrollRunId = `PAY-${currentYear}-${rand}`;

    const staffList = (db.staff || []).filter(s => s.status !== 'inactive');
    const records = (db.attendance || []).filter(a => a.date >= periodStart && a.date <= periodEnd);
    const outstandingAdvances = (db.staffAdvances || []).filter(adv => {
      const bal = adv.outstandingBalance !== undefined ? adv.outstandingBalance : (adv.balance || 0);
      return bal > 0 && adv.date <= periodEnd;
    });

    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;
    const employeeSettlements = [];

    staffList.forEach(s => {
      const staffAtt = records.filter(r => r.staffId === s.id);
      const presentCount = staffAtt.filter(r => r.status === 'Present').length;
      const halfDayCount = staffAtt.filter(r => r.status === 'Half-day' || r.status === 'Half Day').length;

      const payableUnits = presentCount + (halfDayCount * 0.5);
      const dailyWage = s.dailyWage || 500;
      const grossWage = Math.round(payableUnits * dailyWage);

      // Deduct advances sequentially up to grossWage
      const empAdvances = outstandingAdvances.filter(adv => adv.staffId === s.id || adv.workerId === s.id);
      let remainingGross = grossWage;
      let empDeducted = 0;
      const deductedAdvIds = [];

      empAdvances.forEach(adv => {
        if (remainingGross <= 0) return;
        const curBal = adv.outstandingBalance !== undefined ? adv.outstandingBalance : (adv.balance || 0);
        const deductFromThis = Math.min(curBal, remainingGross);
        if (adv.outstandingBalance !== undefined) adv.outstandingBalance -= deductFromThis;
        if (adv.balance !== undefined) adv.balance -= deductFromThis;
        adv.recoveredAmount = (adv.recoveredAmount || adv.amountRecovered || 0) + deductFromThis;
        adv.amountRecovered = adv.recoveredAmount;
        adv.status = ((adv.outstandingBalance || 0) === 0 && (adv.balance || 0) === 0) ? 'recovered' : 'partially_recovered';
        adv.settledAt = new Date().toISOString();
        adv.payrollRunId = payrollRunId;
        empDeducted += deductFromThis;
        remainingGross -= deductFromThis;
        deductedAdvIds.push({ advanceId: adv.id, deducted: deductFromThis });
      });

      const netPayable = Math.max(0, grossWage - empDeducted);
      totalGross += grossWage;
      totalDeductions += empDeducted;
      totalNet += netPayable;

      employeeSettlements.push({
        staffId: s.id,
        workerId: s.id,
        name: s.name,
        workerName: s.name,
        category: s.category || 'Labourer',
        dailyWage,
        payableUnits,
        grossWage,
        grossWages: grossWage,
        advanceDeducted: empDeducted,
        deductedAdvances: empDeducted,
        netPayable,
        netSalary: netPayable,
        deductedAdvanceDetails: deductedAdvIds
      });
    });

    const payrollRun = {
      id: payrollRunId,
      periodStart,
      periodEnd,
      finalizedAt: new Date().toISOString(),
      finalizedBy: req.user ? req.user.email : 'admin',
      totalStaff: staffList.length,
      totalGross,
      totalDeductions,
      totalNet,
      status: 'Finalized',
      notes: notes || 'Monthly staff payroll settlement',
      settlements: employeeSettlements
    };

    db.staffPayroll.push(payrollRun);
    saveLocalStore();

    return res.status(200).json({
      success: true,
      message: `Finalized payroll run ${payrollRunId} (Net: ₹${totalNet.toLocaleString('en-IN')})`,
      count: employeeSettlements.length,
      data: employeeSettlements,
      payrollRun
    });
  } catch (error) {
    console.error('finalizePayroll error:', error);
    return res.status(500).json({ success: false, message: 'Server error finalizing payroll' });
  }
};

/**
 * PUT /api/staff/payroll/:id/status - Update payroll settlement status (Finalized -> Paid)
 */
const updatePayrollStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const db = getLocalDb();
    ensureStaffInit(db);

    const run = (db.staffPayroll || []).find(p => p.id === id);
    if (!run) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    if (status) run.status = status;
    run.updatedAt = new Date().toISOString();
    saveLocalStore();

    return res.json({ success: true, message: `Updated payroll ${id} status to ${status}`, data: run });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error updating payroll status' });
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
  ensureStaffInit,
  getAttendanceGrid,
  recordBulkAttendance,
  getAdvances,
  recordAdvance,
  deleteAdvance,
  getPayroll,
  finalizePayroll,
  updatePayrollStatus
};
