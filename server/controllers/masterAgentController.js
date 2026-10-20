const { getLocalDb, saveLocalStore } = require('../config/db');
const { ensureInventoryInit } = require('./inventoryController');
const { ensureStaffInit } = require('./staffController');
const { ensureAnalyticsInit } = require('./analyticsController');

/**
 * Controlled Tool Implementations
 */
const tools = {
  // 1. Website Analytics
  get_analytics: async (db) => {
    ensureAnalyticsInit(db);
    const todayStr = new Date().toISOString().split('T')[0];
    const todayEvents = (db.analyticsEvents || []).filter(e => e.date === todayStr);
    const uniqueSessions = new Set(todayEvents.map(e => e.sessionId)).size;
    const pageViews = todayEvents.filter(e => e.eventType === 'page_view').length;
    const cartAdds = todayEvents.filter(e => e.eventType === 'add_to_cart').length;
    const enquiries = (db.enquiries || []).filter(e => e.createdAt && e.createdAt.startsWith(todayStr));

    return {
      date: todayStr,
      totalVisitsToday: todayEvents.length,
      uniqueVisitorsToday: uniqueSessions,
      pageViewsToday: pageViews,
      cartEventsToday: cartAdds,
      enquiriesToday: enquiries.length,
      confirmedBookingsToday: enquiries.filter(e => e.status === 'Confirmed').length
    };
  },

  // 2. Bookings & Orders
  get_bookings: async (db, filter = 'today') => {
    const todayStr = new Date().toISOString().split('T')[0];
    const enquiries = db.enquiries || [];

    let matched = [];
    if (filter === 'pending') {
      matched = enquiries.filter(e => 
        e.status === 'Pending Admin Approval' || 
        e.status === 'Approved — Awaiting Customer Acceptance' ||
        e.status === 'Approved — Awaiting Payment'
      );
    } else if (filter === 'confirmed') {
      matched = enquiries.filter(e => e.status === 'Confirmed');
    } else {
      // today
      matched = enquiries.filter(e => e.createdAt && e.createdAt.startsWith(todayStr));
      if (matched.length === 0) {
        // Fallback to recent 5 bookings if none today
        matched = enquiries.slice(-5);
      }
    }

    return {
      filter,
      count: matched.length,
      bookings: matched.map(b => ({
        id: b.id || b.enquiryId,
        customerName: b.customerName,
        phone: b.phone,
        eventDate: b.eventDate,
        venue: b.eventVenue || b.locality,
        status: b.status,
        totalQuotation: b.financialBreakdown?.grandTotal || b.estimatedTotal || 0,
        advancePaid: b.advancePayment?.amountPaid || 0
      }))
    };
  },

  // 3. Payments Received
  get_payments: async (db) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const payments = db.payments || [];
    const todayPayments = payments.filter(p => p.createdAt && p.createdAt.startsWith(todayStr));
    const totalToday = todayPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

    const enquiries = db.enquiries || [];
    const awaitingPayment = enquiries.filter(e => e.status === 'Approved — Awaiting Payment');

    return {
      date: todayStr,
      paymentsReceivedTodayCount: todayPayments.length,
      totalAmountReceivedToday: totalToday,
      ordersAwaitingPaymentCount: awaitingPayment.length,
      recentPayments: (todayPayments.length > 0 ? todayPayments : payments.slice(-5)).map(p => ({
        id: p.id,
        enquiryId: p.enquiryId,
        amount: p.amount,
        method: p.method,
        status: p.status,
        reference: p.offlineReference || p.razorpayPaymentId || 'N/A'
      }))
    };
  },

  // 4. Unanswered Enquiries
  get_unanswered_enquiries: async (db) => {
    const enquiries = db.enquiries || [];
    const unanswered = enquiries.filter(e => 
      e.status === 'New' || 
      e.status === 'Pending Admin Approval'
    );

    return {
      count: unanswered.length,
      enquiries: unanswered.map(e => ({
        id: e.id || e.enquiryId,
        name: e.customerName,
        phone: e.phone,
        service: e.serviceRequired,
        eventDate: e.eventDate,
        submittedAt: e.createdAt
      }))
    };
  },

  // 5. Physical Inventory
  get_inventory: async (db, category) => {
    ensureInventoryInit(db);
    let items = db.inventory || [];
    if (category) {
      items = items.filter(i => i.category.toLowerCase().includes(category.toLowerCase()));
    }
    return {
      count: items.length,
      items: items.map(i => ({
        id: i.id,
        name: i.name,
        category: i.category,
        total: i.totalQuantity,
        available: i.availableQuantity,
        reserved: i.reservedQuantity,
        damaged: i.damagedQuantity,
        maintenanceStatus: i.maintenanceStatus,
        unit: i.unit,
        rate: i.dailyRate
      }))
    };
  },

  // 6. Staff & Attendance
  get_staff_and_attendance: async (db) => {
    ensureStaffInit(db);
    const todayStr = new Date().toISOString().split('T')[0];
    const staff = (db.staff || []).filter(s => s.status === 'active');
    const todayAtt = (db.attendance || []).filter(a => a.date === todayStr);

    const roster = staff.map(s => {
      const att = todayAtt.find(a => a.staffId === s.id);
      return {
        id: s.id,
        name: s.name,
        category: s.category,
        dailyWage: s.dailyWage || 500,
        statusToday: att ? att.status : 'Not Marked'
      };
    });

    const presentCount = todayAtt.filter(a => a.status === 'Present').length;
    const halfDayCount = todayAtt.filter(a => a.status === 'Half-day').length;
    const absentCount = todayAtt.filter(a => a.status === 'Absent').length;

    return {
      date: todayStr,
      totalStaff: staff.length,
      markedCount: todayAtt.length,
      presentCount,
      halfDayCount,
      absentCount,
      roster
    };
  },

  // 7. Calculate Wages
  calculate_wages: async (db) => {
    ensureStaffInit(db);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const todayStr = now.toISOString().split('T')[0];

    const staff = (db.staff || []).filter(s => s.status === 'active');
    const records = (db.attendance || []).filter(a => a.date >= startOfMonth && a.date <= todayStr);
    const payments = (db.wagePayments || []).filter(p => p.date >= startOfMonth && p.date <= todayStr);

    let grandEarned = 0;
    let grandPaid = 0;

    const breakdown = staff.map(s => {
      const staffAtt = records.filter(r => r.staffId === s.id);
      const staffPays = payments.filter(p => p.staffId === s.id);

      const present = staffAtt.filter(r => r.status === 'Present').length;
      const half = staffAtt.filter(r => r.status === 'Half-day').length;
      const payableDays = present + (half * 0.5);
      const earned = Math.round(payableDays * (s.dailyWage || 500));
      const paid = staffPays.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

      grandEarned += earned;
      grandPaid += paid;

      return {
        name: s.name,
        category: s.category,
        dailyWage: s.dailyWage || 500,
        payableDays,
        earned,
        paid,
        pending: Math.max(0, earned - paid)
      };
    });

    return {
      month: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
      grandEarned,
      grandPaid,
      grandPending: Math.max(0, grandEarned - grandPaid),
      breakdown
    };
  }
};

/**
 * Natural language intent parser
 */
const parseIntent = (text) => {
  const t = text.toLowerCase().trim();

  // 1. Add stock to inventory (WRITE OPERATION - HIGHEST PRECEDENCE)
  // e.g. "Add 100 PVC chairs to inventory", "100 velvet chair add karo", "स्टॉक में 50 सफेद कुर्सियां जोड़ो"
  if (/(?:add|badhao|jodo|जोड़ो|बढ़ाओ)/i.test(t) && (/\d+/.test(t)) && (/stock|chair|table|sofa|tent|cooler|carpet|कुर्सी|कुर्सियां|मेज|स्टॉक/i.test(t))) {
    const qtyMatch = t.match(/(\d+)/);
    const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 10;
    const kw = (/chair|kursi|कुर्सी/i.test(t)) ? 'chair' : ((/sofa|सोफा/i.test(t)) ? 'sofa' : ((/cooler|कूलर/i.test(t)) ? 'cooler' : ((/tent|टेंट/i.test(t)) ? 'tent' : 'chair')));
    return {
      type: 'write_proposal',
      action: 'adjust_inventory',
      params: { adjustmentType: 'add_stock', quantity: qty, keyword: kw }
    };
  }

  // 2. Record damage to inventory (WRITE OPERATION)
  // e.g. "5 chairs damage", "10 कुर्सियां टूटी दर्ज करो", "damage 10 chairs"
  if (/(?:damage|toot|kharab|टूटा|नुकसान|खराब)/i.test(t) && (/\d+/.test(t))) {
    const qtyMatch = t.match(/(\d+)/);
    const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
    const kw = (/chair|kursi|कुर्सी/i.test(t)) ? 'chair' : ((/sofa|सोफा/i.test(t)) ? 'sofa' : ((/cooler|कूलर/i.test(t)) ? 'cooler' : 'chair'));
    return {
      type: 'write_proposal',
      action: 'adjust_inventory',
      params: { adjustmentType: 'record_damage', quantity: qty, keyword: kw }
    };
  }

  // 3. Mark attendance (WRITE OPERATION)
  // e.g. "राम प्रसाद को आज उपस्थित लगाओ", "Mark Ramu present", "Ramu ki attendance lagao"
  if (/(?:attendance|haziri|हाजिरी|उपस्थित|प्रेजेंट)/i.test(t) && /(?:lagao|mark|लगाओ|दर्ज|करो|लगा)/i.test(t)) {
    const status = /absent|gair hazir|अनुपस्थित/i.test(t) ? 'Absent' : (/half|aadha|आधा/i.test(t) ? 'Half-day' : 'Present');
    let staffName = 'Ram Prasad Yadav';
    const db = getLocalDb();
    if (db && db.staff) {
      const found = db.staff.find(s => t.includes(s.name.toLowerCase()) || (s.name.split(' ')[0] && t.includes(s.name.split(' ')[0].toLowerCase())));
      if (found) staffName = found.name;
    }
    return {
      type: 'write_proposal',
      action: 'record_attendance',
      params: { staffName: staffName || 'Ram Prasad Yadav', status }
    };
  }

  // 4. Add new labourer / staff (WRITE OPERATION)
  // e.g. "Add a new labourer named Ramesh", "Ramesh ko labourer add karo"
  if (/(?:add a new|add new|naya staff|naya labourer|नया कारीगर|नया स्टाफ)/i.test(t)) {
    return {
      type: 'write_proposal',
      action: 'add_staff',
      params: { name: 'New Staff Member', category: 'Labourer', dailyWage: 500 }
    };
  }

  // Visitor analytics
  if (/visitor|traffic|visit|view|viewers|kitne log|aaj kitne visitor|aaj kitne customer/i.test(t)) {
    return { type: 'query', tool: 'get_analytics' };
  }

  // Pending bookings / Orders awaiting approval
  if (/pending|approval|awaiting approval|need approval|kiska approval|konsi booking bachi/i.test(t)) {
    return { type: 'query', tool: 'get_bookings', param: 'pending' };
  }

  // Awaiting payment
  if (/awaiting payment|payment baki|payment pending/i.test(t)) {
    return { type: 'query', tool: 'get_payments' };
  }

  // Today's bookings
  if (/booking|order|event|बुकिंग|शादी|aaj ki booking|aaj ka order/i.test(t)) {
    return { type: 'query', tool: 'get_bookings', param: 'today' };
  }

  // Payments received today
  if (/payment|revenue|collection|kitna paisa|kitna payment/i.test(t)) {
    return { type: 'query', tool: 'get_payments' };
  }

  // Unanswered enquiries
  if (/enquir|inquir|unanswered|jawab nahi|kin logo ne pucha/i.test(t)) {
    return { type: 'query', tool: 'get_unanswered_enquiries' };
  }

  // Show inventory stock
  if (/inventory|stock|kursi|chair|table|sofa|cooler|tent|सामान|स्टॉक/i.test(t)) {
    return { type: 'query', tool: 'get_inventory' };
  }

  // Show attendance today
  if (/attendance|haziri|haazri|kaun kaun aaya|aaj ki attendance|हाजिरी/i.test(t)) {
    return { type: 'query', tool: 'get_staff_and_attendance' };
  }

  // Calculate wages / labour cost
  if (/wage|salary|mazdoori|hisaab|labour cost|kharcha|मजदूरी/i.test(t)) {
    return { type: 'query', tool: 'calculate_wages' };
  }

  // PDF report request
  if (/report|pdf|print|download/i.test(t)) {
    return { type: 'report_request' };
  }

  // Fallback: general query
  return { type: 'general' };
};

/**
 * POST /api/agent/query
 * Process typed or voice commands for the admin Master Agent
 */
const handleAgentQuery = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, message: 'Query cannot be empty' });
    }

    const db = getLocalDb();
    const intent = parseIntent(query);

    // 1. Read-only queries against real records
    if (intent.type === 'query' && tools[intent.tool]) {
      const data = await tools[intent.tool](db, intent.param);
      let reply = '';
      let spokenReply = '';

      if (intent.tool === 'get_analytics') {
        reply = `📊 **Website Traffic Today (${data.date}):**\n- **Unique Visitors:** ${data.uniqueVisitorsToday}\n- **Total Page Views:** ${data.pageViewsToday}\n- **Cart Additions:** ${data.cartEventsToday}\n- **Enquiries Received Today:** ${data.enquiriesToday}`;
        spokenReply = `Today, your website has welcomed ${data.uniqueVisitorsToday} unique visitors with ${data.pageViewsToday} page views and ${data.enquiriesToday} customer enquiries.`;
      } else if (intent.tool === 'get_bookings') {
        reply = `📝 **Bookings Summary (${intent.param || 'today'}):**\n- **Total Matching:** ${data.count}\n` + 
          data.bookings.map(b => `• **${b.customerName}** (${b.phone}) — Event: ${b.eventDate} | Venue: ${b.venue} | Status: **${b.status}** | Total: ₹${b.totalQuotation}`).join('\n');
        spokenReply = `Found ${data.count} bookings for ${intent.param || 'today'}. Statuses and quotations are displayed on your screen.`;
      } else if (intent.tool === 'get_payments') {
        reply = `💰 **Payments & Receivables Summary:**\n- **Payments Captured Today:** ₹${data.totalAmountReceivedToday} (${data.paymentsReceivedTodayCount} transactions)\n- **Orders Awaiting Payment:** ${data.ordersAwaitingPaymentCount} bookings ready for payment.`;
        spokenReply = `Today, you have received ₹${data.totalAmountReceivedToday} in payments. There are ${data.ordersAwaitingPaymentCount} approved bookings awaiting payment.`;
      } else if (intent.tool === 'get_unanswered_enquiries') {
        reply = `📬 **Unanswered Enquiries (${data.count} total):**\n` +
          data.enquiries.map(e => `• **${e.name}** (${e.phone}) — ${e.service} on ${e.eventDate}`).join('\n');
        spokenReply = `You have ${data.count} pending customer enquiries awaiting review.`;
      } else if (intent.tool === 'get_inventory') {
        reply = `📦 **Physical Inventory Status (${data.count} items tracked):**\n` +
          data.items.slice(0, 8).map(i => `• **${i.name}:** Total: ${i.total} ${i.unit} | Available: ${i.available} | Damaged: ${i.damaged} (${i.maintenanceStatus})`).join('\n');
        spokenReply = `Current stock levels loaded. You have ${data.count} equipment types registered with live availability.`;
      } else if (intent.tool === 'get_staff_and_attendance') {
        reply = `👷 **Today's Staff Attendance (${data.date}):**\n- **Present:** ${data.presentCount} | **Half-Day:** ${data.halfDayCount} | **Absent:** ${data.absentCount}\n` +
          data.roster.map(r => `• **${r.name}** (${r.category}) &rarr; **${r.statusToday}** (Wage: ₹${r.dailyWage}/day)`).join('\n');
        spokenReply = `Today, ${data.presentCount} staff members are marked present and ${data.halfDayCount} half-day out of ${data.totalStaff} total staff.`;
      } else if (intent.tool === 'calculate_wages') {
        reply = `💵 **Wage Calculations for ${data.month}:**\n- **Total Wages Earned:** ₹${data.grandEarned}\n- **Total Wages Paid:** ₹${data.grandPaid}\n- **Pending Wages:** ₹${data.grandPending}\n` +
          data.breakdown.map(b => `• **${b.name}** (${b.category}): ${b.payableDays} days &rarr; Earned ₹${b.earned} | Paid ₹${b.paid} | Balance: **₹${b.pending}**`).join('\n');
        spokenReply = `Total wages for this month are ₹${data.grandEarned}. Outstanding balance to be disbursed is ₹${data.grandPending}.`;
      }

      return res.json({
        success: true,
        reply,
        spokenReply,
        data,
        requiresConfirmation: false
      });
    }

    // 2. Write operations requiring user confirmation
    if (intent.type === 'write_proposal') {
      let confirmationDetails = {};

      if (intent.action === 'adjust_inventory') {
        ensureInventoryInit(db);
        const { adjustmentType, quantity, keyword } = intent.params;

        // Find matching item
        const kw = (keyword || '').toLowerCase();
        const matchedItem = db.inventory.find(i => 
          i.name.toLowerCase().includes(kw) || 
          i.id.toLowerCase().includes(kw)
        ) || db.inventory[0];

        const actionText = adjustmentType === 'add_stock' ? 'स्टॉक जोड़ें / Add Stock' : 'टूटा हुआ सामान दर्ज करें / Record Damaged';
        const descHindi = adjustmentType === 'add_stock'
          ? `क्या आप ${matchedItem.name} में ${quantity} ${matchedItem.unit} नया स्टॉक जोड़ना चाहते हैं?`
          : `क्या आप ${matchedItem.name} में ${quantity} ${matchedItem.unit} नुकसान/डैमेज मार्क करना चाहते हैं?`;

        confirmationDetails = {
          tool: 'adjust_inventory',
          action: 'adjust_inventory',
          params: {
            itemId: matchedItem.id,
            adjustmentType,
            quantity,
            notes: `Master Agent Voice: ${query}`
          },
          summary: `${actionText}: ${quantity} ${matchedItem.unit} of ${matchedItem.name}`,
          promptHindi: descHindi,
          currentTotal: matchedItem.totalQuantity,
          newEstimatedTotal: adjustmentType === 'add_stock' ? (matchedItem.totalQuantity + quantity) : matchedItem.totalQuantity
        };

        return res.json({
          success: true,
          reply: `⚠️ **Confirmation Required:**\n${confirmationDetails.summary}\n${descHindi}\n\n*Press Confirm to execute this change.*`,
          spokenReply: `Please confirm: Do you want to ${adjustmentType === 'add_stock' ? 'add' : 'record damage for'} ${quantity} ${matchedItem.name}?`,
          requiresConfirmation: true,
          pendingAction: confirmationDetails
        });
      }

      if (intent.action === 'record_attendance') {
        ensureStaffInit(db);
        const { staffName, status } = intent.params;
        const matchedStaff = db.staff.find(s => s.name.toLowerCase().includes(staffName.toLowerCase())) || db.staff[0];

        const todayStr = new Date().toISOString().split('T')[0];
        const descHindi = `क्या आप ${matchedStaff.name} की आज (${todayStr}) की हाजिरी "${status}" लगाना चाहते हैं?`;

        confirmationDetails = {
          tool: 'record_attendance',
          action: 'record_attendance',
          params: {
            staffId: matchedStaff.id,
            date: todayStr,
            status,
            notes: `Master Agent: ${query}`
          },
          summary: `Mark Attendance: ${matchedStaff.name} as ${status} (${todayStr})`,
          promptHindi: descHindi
        };

        return res.json({
          success: true,
          reply: `⚠️ **Confirmation Required:**\n${confirmationDetails.summary}\n${descHindi}\n\n*Press Confirm to save attendance.*`,
          spokenReply: `Please confirm marking ${matchedStaff.name} as ${status} today.`,
          requiresConfirmation: true,
          pendingAction: confirmationDetails
        });
      }

      if (intent.action === 'add_staff') {
        const { name, category, dailyWage } = intent.params;
        const descHindi = `क्या आप नए ${category} ${name} को दैनिक वेतन ₹${dailyWage} पर रजिस्टर करना चाहते हैं?`;

        confirmationDetails = {
          tool: 'add_staff',
          action: 'add_staff',
          params: { name, category, dailyWage, startDate: new Date().toISOString().split('T')[0] },
          summary: `Register Staff: ${name} (${category}) at ₹${dailyWage}/day`,
          promptHindi: descHindi
        };

        return res.json({
          success: true,
          reply: `⚠️ **Confirmation Required:**\n${confirmationDetails.summary}\n${descHindi}\n\n*Press Confirm to register this staff member.*`,
          spokenReply: `Please confirm registering ${name} as a ${category} at ₹${dailyWage} per day.`,
          requiresConfirmation: true,
          pendingAction: confirmationDetails
        });
      }
    }

    // 3. Report generation request
    if (intent.type === 'report_request') {
      const todayStr = new Date().toISOString().split('T')[0];
      return res.json({
        success: true,
        reply: `📄 **Official Report Ready:**\nYou can download or print today's official business records directly:\n- [Print Executive Booking & Billing Report](/api/reports/printable-html?startDate=${todayStr}&endDate=${todayStr})\n- [Export Complete Orders CSV](/api/reports/export-csv)`,
        spokenReply: `Your official printable report is ready. You can download or print it now.`,
        requiresConfirmation: false,
        reportUrl: `/api/reports/printable-html?startDate=${todayStr}&endDate=${todayStr}`
      });
    }

    // Default friendly assistant response
    return res.json({
      success: true,
      reply: `🙏 **Namaste! I am your Kandhari Business Assistant.**\n\nYou can speak or type commands like:\n- *"Show me today's website visitors"*\n- *"List pending bookings that need approval"*\n- *"Show me payments received today"*\n- *"Add 100 PVC chairs to inventory"*\n- *"Mark attendance for Ramu today"*\n- *"Calculate this month's wages"*\n- *"Generate a PDF report for today's bookings"*`,
      spokenReply: `Namaste! I am your Kandhari business manager. You can ask me for today's visitors, bookings, staff attendance, or stock updates.`,
      requiresConfirmation: false
    });
  } catch (error) {
    console.error('handleAgentQuery error:', error);
    return res.status(500).json({ success: false, message: 'Server error processing agent query' });
  }
};

/**
 * POST /api/agent/confirm-action
 * Safely executes a verified write operation after explicit admin confirmation
 */
const confirmAgentAction = async (req, res) => {
  try {
    const { action, params } = req.body;
    const db = getLocalDb();

    if (action === 'adjust_inventory') {
      ensureInventoryInit(db);
      const { itemId, adjustmentType, quantity, notes } = params;
      const item = db.inventory.find(i => i.id === itemId);
      if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

      const qty = Number(quantity);
      if (adjustmentType === 'add_stock') {
        item.totalQuantity += qty;
        item.availableQuantity += qty;
      } else if (adjustmentType === 'record_damage') {
        item.availableQuantity = Math.max(0, item.availableQuantity - qty);
        item.damagedQuantity += qty;
        item.maintenanceStatus = 'Needs Repair';
      }
      item.updatedAt = new Date().toISOString();

      db.inventoryAuditLogs.push({
        id: 'log-' + Date.now(),
        itemId: item.id,
        itemName: item.name,
        adjustmentType,
        quantity: qty,
        notes: notes || 'Master Agent Confirmed Action',
        performedBy: req.user ? req.user.email : 'admin_mother',
        timestamp: new Date().toISOString()
      });
      saveLocalStore();

      return res.json({
        success: true,
        message: `✅ Successfully executed: ${item.name} total updated to ${item.totalQuantity} (Available: ${item.availableQuantity})`,
        spokenReply: `Confirmed and saved! ${item.name} stock has been successfully updated.`
      });
    }

    if (action === 'record_attendance') {
      ensureStaffInit(db);
      const { staffId, date, status, notes } = params;
      const staffMember = db.staff.find(s => s.id === staffId);
      if (!staffMember) return res.status(404).json({ success: false, message: 'Staff member not found' });

      const existingIndex = db.attendance.findIndex(a => a.staffId === staffId && a.date === date);
      if (existingIndex !== -1) {
        db.attendance[existingIndex].status = status;
        db.attendance[existingIndex].notes = notes;
      } else {
        db.attendance.push({
          id: 'att-' + Date.now().toString(36),
          staffId: staffMember.id,
          staffName: staffMember.name,
          staffCategory: staffMember.category,
          date,
          status,
          dailyWage: staffMember.dailyWage || 500,
          notes,
          recordedAt: new Date().toISOString(),
          recordedBy: req.user ? req.user.email : 'admin_mother'
        });
      }
      saveLocalStore();

      return res.json({
        success: true,
        message: `✅ Successfully recorded attendance: ${staffMember.name} marked as ${status} on ${date}`,
        spokenReply: `Confirmed and recorded! ${staffMember.name} has been marked as ${status}.`
      });
    }

    if (action === 'add_staff') {
      ensureStaffInit(db);
      const { name, category, dailyWage, startDate } = params;
      const newStaff = {
        id: 'staff-' + Date.now().toString(36),
        name: name.trim(),
        category: category || 'Labourer',
        dailyWage: Number(dailyWage) || 500,
        startDate: startDate || new Date().toISOString().split('T')[0],
        status: 'active',
        createdAt: new Date().toISOString()
      };
      db.staff.push(newStaff);
      saveLocalStore();

      return res.json({
        success: true,
        message: `✅ Successfully registered: ${newStaff.name} as ${newStaff.category} (Wage: ₹${newStaff.dailyWage}/day)`,
        spokenReply: `Confirmed! New staff member ${newStaff.name} has been added.`
      });
    }

    return res.status(400).json({ success: false, message: 'Unrecognized action' });
  } catch (error) {
    console.error('confirmAgentAction error:', error);
    return res.status(500).json({ success: false, message: 'Server error executing confirmed action' });
  }
};

module.exports = {
  handleAgentQuery,
  confirmAgentAction
};
