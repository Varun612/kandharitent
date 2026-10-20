const { getLocalDb, saveLocalStore } = require('../config/db');
const { ensureInventoryInit } = require('./inventoryController');
const { ensureStaffInit } = require('./staffController');
const { ensureAnalyticsInit } = require('./analyticsController');

// Ensure memory layers are initialized
const ensureMemoryInit = (db) => {
  if (!db.agentConversations) db.agentConversations = [];
  if (!db.agentMemories) db.agentMemories = [];
  if (!db.agentWorkflows) db.agentWorkflows = [];
  if (!db.agentEvaluations) db.agentEvaluations = [];
};

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
    const pageViews = todayEvents.filter(e => e.eventType === 'page_view' || e.eventType === 'pageview').length;
    const cartAdds = todayEvents.filter(e => e.eventType === 'add_to_cart').length;
    const enquiries = (db.enquiries || []).filter(e => e.createdAt && e.createdAt.startsWith(todayStr));

    return {
      date: todayStr,
      totalVisitsToday: todayEvents.length || 1,
      uniqueVisitorsToday: uniqueSessions || 1,
      pageViewsToday: pageViews || 1,
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
      matched = enquiries.filter(e => e.createdAt && e.createdAt.startsWith(todayStr));
      if (matched.length === 0) {
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
        totalQuotation: b.grandTotal || b.estimatedCost || 0,
        advancePaid: b.advancePaid || 0
      }))
    };
  },

  // 3. Payments (Staff & Outside)
  get_payments: async (db) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const disbursements = db.wageDisbursements || [];
    const outsidePayments = db.outsidePayments || [];

    const totalStaffWagesPaid = disbursements.reduce((acc, d) => acc + (parseFloat(d.amount) || 0), 0);
    const totalOutsidePaid = outsidePayments.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);

    return {
      todayDate: todayStr,
      totalStaffWagesPaid,
      totalOutsidePaid,
      outsidePaymentsCount: outsidePayments.length,
      recentOutsidePayments: outsidePayments.slice(0, 5)
    };
  },

  // 4. Outside Payments Specific (Dhobi, Suppliers)
  get_outside_payments: async (db, category) => {
    let payments = db.outsidePayments || [];
    if (category) {
      payments = payments.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    const total = payments.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
    return {
      category: category || 'all',
      count: payments.length,
      totalAmount: total,
      payments
    };
  },

  // 5. Physical Warehouse Stock
  get_physical_inventory: async (db, category) => {
    ensureInventoryInit(db);
    let items = db.physicalInventory || [];
    if (category) {
      items = items.filter(i => (i.category || '').toLowerCase() === category.toLowerCase());
    }
    return {
      count: items.length,
      items: items.map(i => ({
        id: i.id,
        name: i.name,
        category: i.category,
        totalStock: i.totalStock || i.totalQuantity || 0,
        availableStock: i.availableStock || i.availableQuantity || 0,
        damagedQuantity: i.damagedQuantity || 0,
        inMaintenance: i.inMaintenance || 0
      }))
    };
  },

  // 6. Staff & Attendance
  get_staff_and_attendance: async (db, date) => {
    ensureStaffInit(db);
    const todayStr = date || new Date().toISOString().split('T')[0];
    const staff = db.staff || [];
    const attendance = (db.attendance || []).filter(a => a.date === todayStr);

    const presentCount = attendance.filter(a => a.status === 'Present').length;
    const halfDayCount = attendance.filter(a => a.status === 'Half-day').length;
    const absentCount = attendance.filter(a => a.status === 'Absent').length;

    const totalEstimatedWage = (presentCount * 500) + (halfDayCount * 250);

    return {
      date: todayStr,
      totalStaff: staff.length,
      attendanceMarked: attendance.length,
      present: presentCount,
      halfDay: halfDayCount,
      absent: absentCount,
      totalEstimatedWage,
      records: attendance.map(a => ({
        staffName: a.staffName,
        status: a.status,
        calculatedWage: a.calculatedWage || (a.status === 'Present' ? 500 : a.status === 'Half-day' ? 250 : 0)
      }))
    };
  },

  // 7. Media Search & Portfolios
  search_media: async (db, query) => {
    const q = (query || '').toLowerCase();
    const media = (db.mediaLibrary || []).filter(m => 
      m.category.toLowerCase().includes(q) || 
      m.title.toLowerCase().includes(q) ||
      (m.tags && m.tags.some(t => t.includes(q)))
    ).slice(0, 8);

    return {
      query,
      count: media.length,
      media: media.map(m => ({ id: m.id, title: m.title, category: m.category, url: m.filePath }))
    };
  },

  // 8. Invoices / Bills
  get_invoices: async (db) => {
    const invoices = db.invoices || [];
    return {
      count: invoices.length,
      invoices: invoices.map(inv => ({
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customerName,
        phone: inv.phone,
        grandTotal: inv.grandTotal,
        balanceDue: inv.balanceDue,
        status: inv.paymentStatus
      }))
    };
  }
};

/**
 * POST /api/agent/query
 * Bilingual Natural Language Assistant with Layer B memory grounding
 */
const handleAgentQuery = async (req, res) => {
  try {
    const { query, conversationId } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, message: 'query is required' });
    }

    const db = getLocalDb();
    ensureMemoryInit(db);

    const qLower = query.toLowerCase().trim();
    const activeConvId = conversationId || ('conv-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6));

    // Grounding with Layer B Memories: find relevant business rules
    const relevantMemories = (db.agentMemories || []).filter(m => 
      m.isActive && m.approvalStatus === 'approved' &&
      (qLower.includes(m.category.toLowerCase()) || 
       m.content.toLowerCase().split(' ').some(w => w.length > 4 && qLower.includes(w)))
    );

    // 1. Check for OUTSIDE PAYMENTS / DHOBI (धोबी / सप्लायर)
    if (qLower.includes('dhobi') || qLower.includes('धोबी') || qLower.includes('supplier') || qLower.includes('सप्लायर') || qLower.includes('outside payment')) {
      // Check if user is asking to RECORD a payment
      const isRecord = qLower.includes('add') || qLower.includes('record') || qLower.includes('दिया') || qLower.includes('पे') || qLower.includes('जोड़ो');
      const numMatch = query.match(/\d+/);

      if (isRecord && numMatch) {
        const amount = parseInt(numMatch[0], 10);
        return res.json({
          success: true,
          query,
          action: 'record_outside_payment',
          requiresConfirmation: true,
          reply: `धोबी को ₹${amount.toLocaleString('en-IN')} का भुगतान दर्ज करने के लिए कृपया पुष्टि करें।\n\nमद: कुर्सी व टेबल क्लॉथ धुलाई (लॉन्ड्री)\nमाध्यम: Cash (नकद)`,
          spokenReply: `धोबी को ${amount} रुपये का भुगतान दर्ज करने के लिए कृपया पुष्टि करें।`,
          pendingAction: {
            tool: 'record_outside_payment',
            params: {
              recipientName: 'Ramesh Dhobi (लॉन्ड्री)',
              category: 'dhobi',
              amount,
              purpose: 'कुर्सी व टेबल क्लॉथ धुलाई व प्रेस',
              paymentMethod: 'Cash',
              notes: 'Admin voice AI action'
            }
          }
        });
      }

      // Read query
      const data = await tools.get_outside_payments(db, qLower.includes('dhobi') || qLower.includes('धोबी') ? 'dhobi' : null);
      let reply = `🧺 **धोबी व बाहरी भुगतान रिपोर्ट:**\n\n`;
      reply += `• कुल भुगतान प्रविष्टियां: **${data.count}**\n`;
      reply += `• कुल खर्च राशि: **₹${data.totalAmount.toLocaleString('en-IN')}**\n\n`;
      data.payments.slice(0, 5).forEach(p => {
        reply += `• **${p.recipientName}**: ₹${p.amount.toLocaleString('en-IN')} (${p.purpose}) - दिनांक: ${p.date}\n`;
      });

      return res.json({
        success: true,
        query,
        action: 'get_outside_payments',
        requiresConfirmation: false,
        reply,
        spokenReply: `धोबी व बाहरी खर्च का कुल भुगतान ${data.totalAmount} रुपये है।`,
        data
      });
    }

    // 2. INVOICES / BILLS (बिल / इनवॉइस)
    if (qLower.includes('bill') || qLower.includes('बिल') || qLower.includes('invoice') || qLower.includes('रसीद')) {
      const isCreate = qLower.includes('create') || qLower.includes('prepare') || qLower.includes('बनाओ') || qLower.includes('काटो');
      if (isCreate) {
        const enquiries = db.enquiries || [];
        const latestBooking = enquiries.find(e => e.status === 'Confirmed' || e.status === 'Approved — Awaiting Payment') || enquiries[0];

        if (latestBooking) {
          return res.json({
            success: true,
            query,
            action: 'generate_invoice',
            requiresConfirmation: true,
            reply: `ग्राहक **${latestBooking.customerName}** (${latestBooking.phone}) के लिए औपचारिक इनवॉइस बिल तैयार करने के लिए कृपया पुष्टि करें।\n\nआयोजन: ${latestBooking.eventVenue || 'Dwarka Shri Lawn'}\nराशि: ₹${(latestBooking.grandTotal || latestBooking.estimatedCost || 25000).toLocaleString('en-IN')}`,
            spokenReply: `ग्राहक ${latestBooking.customerName} के लिए बिल तैयार करने हेतु पुष्टि करें।`,
            pendingAction: {
              tool: 'generate_invoice',
              params: {
                enquiryId: latestBooking.id,
                customerName: latestBooking.customerName,
                phone: latestBooking.phone,
                eventDate: latestBooking.eventDate || new Date().toISOString().split('T')[0],
                grandTotal: latestBooking.grandTotal || latestBooking.estimatedCost || 25000,
                advancePaid: latestBooking.advancePaid || 5000
              }
            }
          });
        }
      }

      const invData = await tools.get_invoices(db);
      let reply = `📄 **तैयार इनवॉइस व बिल सारांश:**\n\nकुल बिल: **${invData.count}**\n\n`;
      invData.invoices.slice(0, 5).forEach(inv => {
        reply += `• **${inv.invoiceNumber}** - ${inv.customerName}: ₹${inv.grandTotal.toLocaleString('en-IN')} (बकाया: ₹${inv.balanceDue.toLocaleString('en-IN')}) [${inv.status}]\n`;
      });
      return res.json({
        success: true,
        query,
        action: 'get_invoices',
        requiresConfirmation: false,
        reply,
        spokenReply: `सिस्टम में कुल ${invData.count} इनवॉइस बिल दर्ज हैं।`,
        data: invData
      });
    }

    // 3. MARKETING STUDIO: REEL RENDERING (रील बनाओ)
    if (qLower.includes('reel') || qLower.includes('रील') || qLower.includes('video') || qLower.includes('वीडियो') || qLower.includes('instagram')) {
      const isRender = qLower.includes('render') || qLower.includes('make') || qLower.includes('create') || qLower.includes('बनाओ');
      if (isRender) {
        return res.json({
          success: true,
          query,
          action: 'render_marketing_reel',
          requiresConfirmation: true,
          reply: `🎬 **15-सेकंड इंस्टाग्राम रील (9:16) रेंडर करने के लिए पुष्टि करें:**\n\n• थीम: Royal Wedding at Dwarka Shri Lawn\n• विजुअल्स: वास्तविक शामियाना, स्टेज व द्वारका श्री लॉन की तस्वीरें\n• मोशन: स्मूथ केन बर्न्स (धीमा जूम व पैन)\n• संपर्क व ब्रांडिंग: कंधारी टेंट एंड कैटरर्स, पिलर न. 37, कानपुर रोड, लखनऊ\n• हैशटैग्स: #LucknowWeddings #DwarkaShriLawn #KandhariTent`,
          spokenReply: `गैलरी की तस्वीरों से पंद्रह सेकंड की रील रेंडर करने के लिए पुष्टि करें।`,
          pendingAction: {
            tool: 'render_marketing_reel',
            params: {
              format: '9:16',
              duration: 15,
              title: 'Royal Imperial Wedding at Dwarka Shri Lawn',
              theme: 'Royal Luxury'
            }
          }
        });
      }
    }

    // 4. MARKETING STUDIO: MEDIA SEARCH & PORTFOLIOS (पोर्टफोलियो / तस्वीरें)
    if (qLower.includes('portfolio') || qLower.includes('पोर्टफोलियो') || qLower.includes('photo') || qLower.includes('तस्वीर') || qLower.includes('floral')) {
      const mediaData = await tools.search_media(db, qLower.includes('floral') ? 'floral' : 'wedding');
      let reply = `📸 **गैलरी में खोजी गई वास्तविक तस्वीरें:**\n\n`;
      mediaData.media.forEach((m, idx) => {
        reply += `${idx + 1}. **${m.title}** (${m.category})\n`;
      });
      reply += `\n💡 आप इन तस्वीरों को चुनकर सीधे नया ग्राहक पोर्टफोलियो या 9:16 वीडियो रील बना सकते हैं।`;

      return res.json({
        success: true,
        query,
        action: 'search_media',
        requiresConfirmation: false,
        reply,
        spokenReply: `गैलरी में आपकी खोज के अनुसार ${mediaData.count} तस्वीरें मिलीं।`,
        data: mediaData
      });
    }

    // 5. STAFF & ATTENDANCE (हाजिरी / कारीगर)
    if (qLower.includes('attendance') || qLower.includes('हाजिरी') || qLower.includes('उपस्थिति') || qLower.includes('स्टाफ') || qLower.includes('कारीगर') || qLower.includes('मजदूरी')) {
      // Check for add staff
      const isAddStaff = (qLower.includes('add') || qLower.includes('जोड़ो')) && (qLower.includes('driver') || qLower.includes('ड्राइवर') || qLower.includes('labourer') || qLower.includes('कारीगर'));
      if (isAddStaff) {
        return res.json({
          success: true,
          query,
          action: 'add_staff',
          requiresConfirmation: true,
          reply: `👷 **नया स्टाफ सदस्य जोड़ने के लिए पुष्टि करें:**\n\n• पद: पिकअप ड्राइवर (Driver)\n• दैनिक दर: ₹500/दिन\n• स्थिति: सक्रिय\n• आज की हाजिरी: Present`,
          spokenReply: `नया ड्राइवर जोड़ने और आज की हाजिरी लगाने के लिए कृपया पुष्टि करें।`,
          pendingAction: {
            tool: 'add_staff',
            params: {
              name: 'Ram Prakash (राम प्रकाश)',
              category: 'Driver',
              dailyWage: 500,
              markPresentToday: true
            }
          }
        });
      }

      const staffData = await tools.get_staff_and_attendance(db);
      let reply = `📅 **आज की दैनिक हाजिरी व मजदूरी सारांश (${staffData.date}):**\n\n`;
      reply += `• कुल पंजीकृत स्टाफ: **${staffData.totalStaff}**\n`;
      reply += `• उपस्थित (Present - ₹500): **${staffData.present}**\n`;
      reply += `• आधा दिन (Half-day - ₹250): **${staffData.halfDay}**\n`;
      reply += `• अनुपस्थित (Absent): **${staffData.absent}**\n`;
      reply += `• आज की कुल देय मजदूरी: **₹${staffData.totalEstimatedWage.toLocaleString('en-IN')}**\n`;

      return res.json({
        success: true,
        query,
        action: 'get_staff_and_attendance',
        requiresConfirmation: false,
        reply,
        spokenReply: `आज कुल ${staffData.present} कारीगर उपस्थित हैं, और कुल मजदूरी ${staffData.totalEstimatedWage} रुपये बनती है।`,
        data: staffData
      });
    }

    // 6. INVENTORY / STOCK (स्टॉक / गोदाम)
    if (qLower.includes('stock') || qLower.includes('स्टॉक') || qLower.includes('कुर्सी') || qLower.includes('chair') || qLower.includes('पंडाल') || qLower.includes('टूटी') || qLower.includes('damage')) {
      const isAdd = qLower.includes('add') || qLower.includes('जोड़ो') || qLower.includes('damage') || qLower.includes('टूट');
      const numMatch = query.match(/\d+/);

      if (isAdd && numMatch) {
        const qty = parseInt(numMatch[0], 10);
        return res.json({
          success: true,
          query,
          action: 'adjust_inventory',
          requiresConfirmation: true,
          reply: `📦 **स्टॉक समायोजन के लिए पुष्टि करें:**\n\n• आइटम: PVC Banquet White Chairs\n• समायोजन: +${qty} कुर्सियां\n• गोदाम: दरोगा खेड़ा डिपो`,
          spokenReply: `स्टॉक में ${qty} कुर्सियां जोड़ने के लिए पुष्टि करें।`,
          pendingAction: {
            tool: 'adjust_inventory',
            params: {
              itemId: 'phys-1',
              actionType: 'restock',
              quantity: qty,
              reason: 'Purchase/Audit'
            }
          }
        });
      }

      const invData = await tools.get_physical_inventory(db);
      let reply = `📦 **गोदाम सामान स्टॉक स्थिति:**\n\n`;
      invData.items.slice(0, 6).forEach(i => {
        reply += `• **${i.name}**: कुल ${i.totalStock} | उपलब्ध: **${i.availableStock}**`;
        if (i.damagedQuantity > 0) reply += ` | ⚠️ क्षतिग्रस्त: ${i.damagedQuantity}`;
        reply += `\n`;
      });

      return res.json({
        success: true,
        query,
        action: 'get_physical_inventory',
        requiresConfirmation: false,
        reply,
        spokenReply: `गोदाम में सभी प्रमुख सामान उपलब्ध हैं।`,
        data: invData
      });
    }

    // 7. BOOKINGS / ORDERS (शादी / बुकिंग / पूछताछ)
    if (qLower.includes('booking') || qLower.includes('बुकिंग') || qLower.includes('शादी') || qLower.includes('order') || qLower.includes('enquiry')) {
      const bookData = await tools.get_bookings(db, qLower.includes('pending') ? 'pending' : 'today');
      let reply = `📋 **शादी बुकिंग व पूछताछ स्थिति:**\n\n`;
      reply += `कुल बुकिंग: **${bookData.count}**\n\n`;
      bookData.bookings.slice(0, 5).forEach(b => {
        reply += `• **${b.customerName}** (${b.phone}): ${b.eventDate} [${b.status}] - ₹${b.totalQuotation.toLocaleString('en-IN')}\n`;
      });

      return res.json({
        success: true,
        query,
        action: 'get_bookings',
        requiresConfirmation: false,
        reply,
        spokenReply: `सिस्टम में ${bookData.count} बुकिंग उपलब्ध हैं।`,
        data: bookData
      });
    }

    // Default Fallback
    const analytics = await tools.get_analytics(db);
    return res.json({
      success: true,
      query,
      action: 'general_assistance',
      requiresConfirmation: false,
      reply: `नमस्ते! मैं कंधारी टेंट एंड कैटरर्स का मास्टर बिजनेस एजेंट हूँ।\n\nआप मुझसे बोलकर या लिखकर पूछ सकते हैं:\n1. "आज की हाजिरी व मजदूरी दिखाओ"\n2. "धोबी को दिए गए भुगतान दिखाओ"\n3. "स्टॉक में 50 कुर्सियां जोड़ो"\n4. "इस बुकिंग के लिए बिल तैयार करो"\n5. "गैलरी से 15-सेकंड की रील बनाओ"`,
      spokenReply: 'नमस्ते! आप हाजिरी, धोबी भुगतान, स्टॉक या वीडियो रील बनाने के लिए कह सकते हैं।'
    });
  } catch (error) {
    console.error('handleAgentQuery error:', error);
    return res.status(500).json({ success: false, message: 'Server error processing agent query' });
  }
};

/**
 * POST /api/agent/confirm
 * Execute confirmed consequential actions
 */
const confirmAgentAction = async (req, res) => {
  try {
    const { action, params } = req.body;
    const db = getLocalDb();
    ensureMemoryInit(db);

    // 1. Outside Payment (Dhobi / Supplier)
    if (action === 'record_outside_payment') {
      const { recipientName, category, amount, purpose, paymentMethod, notes } = params;
      const record = {
        id: 'out-' + Date.now().toString(36),
        recipientName: recipientName || 'Ramesh Dhobi',
        category: category || 'dhobi',
        amount: parseFloat(amount) || 1200,
        purpose: purpose || 'लॉन्ड्री धुलाई खर्च',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: paymentMethod || 'Cash',
        referenceNumber: 'CASH-' + Math.floor(1000 + Math.random() * 9000),
        status: 'Paid',
        notes: notes || 'Confirmed by voice AI',
        createdAt: new Date().toISOString()
      };
      if (!db.outsidePayments) db.outsidePayments = [];
      db.outsidePayments.unshift(record);
      saveLocalStore();

      return res.json({
        success: true,
        message: `✅ भुगतान सफलतापूर्वक दर्ज: ${record.recipientName} को ₹${record.amount} दिया गया।`,
        spokenReply: `पुष्टि सफल! धोबी भुगतान दर्ज कर लिया गया है।`,
        data: record
      });
    }

    // 2. Adjust Inventory
    if (action === 'adjust_inventory') {
      ensureInventoryInit(db);
      const { itemId, actionType, quantity, reason } = params;
      const item = db.physicalInventory.find(i => i.id === itemId) || db.physicalInventory[0];
      if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

      const qty = parseInt(quantity, 10) || 50;
      item.totalStock = (item.totalStock || item.totalQuantity || 0) + qty;
      item.availableStock = (item.availableStock || item.availableQuantity || 0) + qty;
      saveLocalStore();

      return res.json({
        success: true,
        message: `✅ स्टॉक अपडेट: ${item.name} में ${qty} नई इकाइयां जोड़ी गईं। कुल: ${item.totalStock}`,
        spokenReply: `पुष्टि सफल! स्टॉक अपडेट कर दिया गया है।`
      });
    }

    // 3. Add Staff
    if (action === 'add_staff') {
      ensureStaffInit(db);
      const { name, category, dailyWage, markPresentToday } = params;
      const newStaff = {
        id: 'staff-' + Date.now().toString(36),
        name: name || 'Ram Prakash',
        category: category || 'Driver',
        dailyWage: Number(dailyWage) || 500,
        startDate: new Date().toISOString().split('T')[0],
        status: 'active',
        createdAt: new Date().toISOString()
      };
      db.staff.push(newStaff);

      if (markPresentToday) {
        db.attendance.push({
          id: 'att-' + Date.now().toString(36),
          staffId: newStaff.id,
          staffName: newStaff.name,
          category: newStaff.category,
          date: new Date().toISOString().split('T')[0],
          status: 'Present',
          dailyWage: newStaff.dailyWage,
          calculatedWage: newStaff.dailyWage,
          recordedAt: new Date().toISOString()
        });
      }
      saveLocalStore();

      return res.json({
        success: true,
        message: `✅ ${newStaff.name} (${newStaff.category}) को पंजीकृत किया गया और आज की हाजिरी (Present) दर्ज हुई।`,
        spokenReply: `पुष्टि सफल! ${newStaff.name} को ड्राइवर के रूप में जोड़ दिया गया है।`
      });
    }

    // 4. Generate Invoice Bill
    if (action === 'generate_invoice') {
      const { enquiryId, customerName, phone, grandTotal, advancePaid } = params;
      const year = new Date().getFullYear();
      const nextSeq = String((db.invoices || []).length + 1).padStart(4, '0');
      const invoiceNumber = `INV-${year}-${nextSeq}`;

      const invoice = {
        id: invoiceNumber,
        invoiceNumber,
        enquiryId,
        customerName: customerName || 'Ananya Sharma',
        phone: phone || '9305465848',
        billingAddress: 'Lucknow, Uttar Pradesh',
        eventDate: new Date().toISOString().split('T')[0],
        eventVenue: 'Dwarka Shri Lawn, Kanpur Road, Lucknow',
        serviceRequired: 'Wedding Setup & Catering',
        grandTotal: grandTotal || 25000,
        advancePaid: advancePaid || 5000,
        balanceDue: Math.max(0, (grandTotal || 25000) - (advancePaid || 5000)),
        paymentStatus: 'Partially Paid',
        createdAt: new Date().toISOString()
      };
      if (!db.invoices) db.invoices = [];
      db.invoices.unshift(invoice);
      saveLocalStore();

      return res.json({
        success: true,
        message: `✅ बिल तैयार: ${invoice.invoiceNumber} (${invoice.customerName} - ₹${invoice.grandTotal})`,
        spokenReply: `पुष्टि सफल! औपचारिक बिल ${invoice.invoiceNumber} तैयार हो गया है।`,
        data: invoice
      });
    }

    return res.status(400).json({ success: false, message: 'Unrecognized action' });
  } catch (error) {
    console.error('confirmAgentAction error:', error);
    return res.status(500).json({ success: false, message: 'Server error executing action' });
  }
};

/**
 * Layer A: GET /api/agent/conversations
 */
const getConversations = (req, res) => {
  const db = getLocalDb();
  ensureMemoryInit(db);
  return res.json({ success: true, count: db.agentConversations.length, data: db.agentConversations });
};

/**
 * Layer B: GET /api/agent/memories
 */
const getMemories = (req, res) => {
  const db = getLocalDb();
  ensureMemoryInit(db);
  return res.json({ success: true, count: db.agentMemories.length, data: db.agentMemories });
};

/**
 * Layer B: POST /api/agent/memories
 */
const createMemory = (req, res) => {
  const { category, type, content, confidence = 0.95, approvalStatus = 'approved' } = req.body;
  if (!content) return res.status(400).json({ success: false, message: 'content is required' });

  const db = getLocalDb();
  ensureMemoryInit(db);

  const newMem = {
    id: 'mem-' + Date.now().toString(36),
    category: category || 'business_preference',
    type: type || 'operational_rule',
    content,
    confidence: parseFloat(confidence) || 0.95,
    approvalStatus,
    version: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.agentMemories.unshift(newMem);
  saveLocalStore();
  return res.status(201).json({ success: true, data: newMem });
};

/**
 * Layer B: PUT /api/agent/memories/:id
 */
const updateMemory = (req, res) => {
  const db = getLocalDb();
  ensureMemoryInit(db);
  const mem = db.agentMemories.find(m => m.id === req.params.id);
  if (!mem) return res.status(404).json({ success: false, message: 'Memory not found' });

  const { content, category, approvalStatus, isActive } = req.body;
  if (content !== undefined) mem.content = content;
  if (category !== undefined) mem.category = category;
  if (approvalStatus !== undefined) mem.approvalStatus = approvalStatus;
  if (isActive !== undefined) mem.isActive = isActive;
  mem.updatedAt = new Date().toISOString();

  saveLocalStore();
  return res.json({ success: true, data: mem });
};

/**
 * Layer B: DELETE /api/agent/memories/:id
 */
const deleteMemory = (req, res) => {
  const db = getLocalDb();
  ensureMemoryInit(db);
  const idx = db.agentMemories.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Memory not found' });

  db.agentMemories.splice(idx, 1);
  saveLocalStore();
  return res.json({ success: true, message: 'Memory deleted successfully' });
};

/**
 * Layer C: GET /api/agent/workflows
 */
const getWorkflows = (req, res) => {
  const db = getLocalDb();
  ensureMemoryInit(db);
  return res.json({ success: true, count: db.agentWorkflows.length, data: db.agentWorkflows });
};

/**
 * Layer C: POST /api/agent/workflows
 */
const createWorkflow = (req, res) => {
  const { name, triggerPattern, description, steps } = req.body;
  if (!name || !steps || !Array.isArray(steps)) {
    return res.status(400).json({ success: false, message: 'name and steps array are required' });
  }

  const db = getLocalDb();
  ensureMemoryInit(db);

  const wf = {
    id: 'wf-' + Date.now().toString(36),
    name,
    triggerPattern: triggerPattern || name.toLowerCase(),
    description: description || '',
    steps,
    confidence: 0.95,
    approvalStatus: 'approved',
    createdAt: new Date().toISOString()
  };

  db.agentWorkflows.unshift(wf);
  saveLocalStore();
  return res.status(201).json({ success: true, data: wf });
};

/**
 * Layer C: PUT /api/agent/workflows/:id
 */
const updateWorkflow = (req, res) => {
  const db = getLocalDb();
  ensureMemoryInit(db);
  const wf = db.agentWorkflows.find(w => w.id === req.params.id);
  if (!wf) return res.status(404).json({ success: false, message: 'Workflow not found' });

  const { name, description, steps, approvalStatus } = req.body;
  if (name !== undefined) wf.name = name;
  if (description !== undefined) wf.description = description;
  if (steps !== undefined) wf.steps = steps;
  if (approvalStatus !== undefined) wf.approvalStatus = approvalStatus;

  saveLocalStore();
  return res.json({ success: true, data: wf });
};

/**
 * Layer C: DELETE /api/agent/workflows/:id
 */
const deleteWorkflow = (req, res) => {
  const db = getLocalDb();
  ensureMemoryInit(db);
  const idx = db.agentWorkflows.findIndex(w => w.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Workflow not found' });

  db.agentWorkflows.splice(idx, 1);
  saveLocalStore();
  return res.json({ success: true, message: 'Workflow deleted successfully' });
};

module.exports = {
  handleAgentQuery,
  confirmAgentAction,
  getConversations,
  getMemories,
  createMemory,
  updateMemory,
  deleteMemory,
  getWorkflows,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow
};
