const { isMongoConnected, getLocalDb, saveLocalStore } = require('../config/db');
const Enquiry = require('../models/Enquiry');
const { calculateOrderPricing } = require('../services/pricingEngine');
const { createNotification } = require('./notificationController');

const BUSINESS_WHATSAPP = process.env.WHATSAPP_PHONE || '919305465848';

// Helper to generate pre-filled WhatsApp link
const generateWhatsAppLink = (enquiry) => {
  let message = `*Namaste Kandhari Tent & Caterers!* 🙏\n`;
  message += `I have submitted an enquiry on your website.\n\n`;
  message += `*Ref ID:* ${enquiry.id}\n`;
  message += `*Name:* ${enquiry.customerName}\n`;
  message += `*Phone:* ${enquiry.phone}\n`;
  if (enquiry.whatsappNumber && enquiry.whatsappNumber !== enquiry.phone) {
    message += `*WhatsApp:* ${enquiry.whatsappNumber}\n`;
  }
  message += `*Service:* ${enquiry.serviceRequired || 'Event Rentals'}\n`;
  message += `*Event Date:* ${enquiry.eventDate}\n`;
  if (enquiry.rentalDays && enquiry.rentalDays > 1) {
    message += `*Rental Duration:* ${enquiry.rentalDays} days (${enquiry.startDate} to ${enquiry.endDate})\n`;
  }
  message += `*Locality in Lucknow:* ${enquiry.locality || 'Kanpur Road'}\n`;

  if (enquiry.eventVenueAddress) {
    message += `*Venue/Address:* ${enquiry.eventVenueAddress}\n`;
  }

  if (enquiry.enquiryType === 'lawn') {
    message += `*Venue:* Dwarka Shri Lawn (Opp. Pillar No. 37)\n`;
    if (enquiry.guestCount) message += `*Guests:* ${enquiry.guestCount}\n`;
  } else if (enquiry.items && enquiry.items.length > 0) {
    message += `*Requested Rental Equipment:*\n`;
    enquiry.items.forEach((it, idx) => {
      const dim = it.dimensions ? ` (${it.dimensions})` : '';
      const total = it.lineTotal ? ` - ₹${it.lineTotal.toLocaleString('en-IN')}` : '';
      message += `  ${idx + 1}. ${it.name}${dim} - Qty: ${it.quantity}${total}\n`;
    });
    if (enquiry.grandTotal > 0) {
      message += `*Estimated Total:* ₹${enquiry.grandTotal.toLocaleString('en-IN')} (incl. cartage & labour)\n`;
    }
  }

  if (enquiry.budgetRange && enquiry.budgetRange !== 'Flexible') {
    message += `*Budget Range:* ${enquiry.budgetRange}\n`;
  }

  if (enquiry.notes) {
    message += `\n*Requirements/Notes:* ${enquiry.notes}\n`;
  }

  message += `\nPlease check availability and share a quotation. Thank you!`;
  return `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodeURIComponent(message)}`;
};

// POST /api/enquiries - Submit an enquiry (public)
const submitEnquiry = async (req, res) => {
  try {
    const {
      enquiryType,
      customerName,
      phone,
      whatsappNumber,
      email,
      serviceRequired,
      eventDate,
      startDate,
      endDate,
      locality,
      eventVenueAddress,
      eventType,
      guestCount,
      budgetRange,
      items,
      deliveryDistanceKm,
      isReturningCustomer,
      notes,
      consentGiven
    } = req.body;

    const enquiryId = 'ENQ-' + Math.floor(100000 + Math.random() * 900000);
    const effStartDate = startDate || eventDate;
    const effEndDate = endDate || startDate || eventDate;

    // Calculate official server-side pricing if rental items are present
    let pricing = null;
    let computedItems = Array.isArray(items) ? items : [];

    if (computedItems.length > 0) {
      pricing = calculateOrderPricing({
        items: computedItems,
        startDate: effStartDate,
        endDate: effEndDate,
        deliveryDistanceKm: deliveryDistanceKm || 3,
        isReturningCustomer: isReturningCustomer || false
      });
      computedItems = pricing.lineItems;
    }

    const enquiryData = {
      id: enquiryId,
      customerId: req.user ? req.user.id : null,
      conversationId: req.body.conversationId || null,
      enquiryType: enquiryType || 'rental',
      customerName,
      phone,
      whatsappNumber: whatsappNumber || phone,
      email: email || '',
      preferredContactMethod: req.body.preferredContactMethod || 'Phone',
      serviceRequired: serviceRequired || 'Tent-house equipment rentals',
      servicesList: Array.isArray(req.body.servicesList) ? req.body.servicesList : (serviceRequired ? [serviceRequired] : []),
      eventDate: eventDate || effStartDate,
      startDate: effStartDate,
      endDate: effEndDate,
      rentalDays: pricing ? pricing.rentalDays : 1,
      locality: locality || 'Kanpur Road, Lucknow',
      eventVenueAddress: eventVenueAddress || '',
      eventType: eventType || 'Wedding / Celebration',
      guestCount: parseInt(guestCount, 10) || 0,
      budgetRange: budgetRange || 'Flexible',
      items: computedItems,
      lineItems: computedItems,
      subtotal: pricing ? pricing.subtotal : 0,
      cartage: pricing ? pricing.cartage : 0,
      labour: pricing ? pricing.labour : 0,
      discount: 0,
      discountReason: '',
      manualAdjustment: 0,
      adjustmentReason: '',
      grandTotal: pricing ? pricing.grandTotal : 0,
      advancePaid: 0,
      balanceDue: pricing ? pricing.grandTotal : 0,
      quotationNumber: '',
      quotationDate: '',
      quotationNotes: '',
      notes: notes || '',
      detailedRequirements: req.body.detailedRequirements || notes || '',
      consentGiven: consentGiven !== false,
      status: 'Pending Admin Approval',
      referredTo: '',
      nextFollowUpDate: '',
      internalNotes: '',
      createdAt: new Date().toISOString()
    };

    const whatsappLink = generateWhatsAppLink(enquiryData);

    if (isMongoConnected()) {
      const created = await Enquiry.create(enquiryData);
      return res.status(201).json({
        success: true,
        referenceId: enquiryId,
        data: created,
        whatsappLink,
        message: 'Your enquiry has been received successfully! Our team will contact you shortly to discuss requirements and confirm availability.'
      });
    }

    const db = getLocalDb();
    db.enquiries.unshift(enquiryData);
    saveLocalStore();

    return res.status(201).json({
      success: true,
      referenceId: enquiryId,
      data: enquiryData,
      whatsappLink,
      message: 'Your enquiry has been received successfully! Our team will contact you shortly to discuss requirements and confirm availability.'
    });
  } catch (error) {
    console.error('Error submitting enquiry:', error);
    return res.status(500).json({ success: false, message: 'Server error saving your enquiry. Please call us directly.' });
  }
};

// GET /api/enquiries (Admin) - List all enquiries with search, service, locality & status filtering
const getEnquiries = async (req, res) => {
  try {
    const { status, type, service, locality, search } = req.query;

    if (isMongoConnected()) {
      let query = {};
      if (status && status !== 'all') {
        query.status = status;
      }
      if (type && type !== 'all') {
        query.enquiryType = type;
      }
      if (service && service !== 'all') {
        query.serviceRequired = service;
      }
      if (locality && locality !== 'all') {
        query.locality = locality;
      }
      if (search) {
        query.$or = [
          { customerName: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { id: { $regex: search, $options: 'i' } },
          { locality: { $regex: search, $options: 'i' } }
        ];
      }

      const enquiries = await Enquiry.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: enquiries.length, data: enquiries });
    }

    let enquiries = [...getLocalDb().enquiries];

    if (status && status !== 'all') {
      enquiries = enquiries.filter(e => e.status === status);
    }

    if (type && type !== 'all') {
      enquiries = enquiries.filter(e => e.enquiryType === type);
    }

    if (service && service !== 'all') {
      enquiries = enquiries.filter(e => e.serviceRequired === service);
    }

    if (locality && locality !== 'all') {
      enquiries = enquiries.filter(e => e.locality === locality);
    }

    if (search) {
      const q = search.toLowerCase();
      enquiries = enquiries.filter(e => 
        e.customerName.toLowerCase().includes(q) ||
        e.phone.includes(q) ||
        (e.id && e.id.toLowerCase().includes(q)) ||
        (e.locality && e.locality.toLowerCase().includes(q))
      );
    }

    return res.json({ success: true, count: enquiries.length, data: enquiries });
  } catch (error) {
    console.error('Error in getEnquiries:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving enquiries' });
  }
};

// PUT /api/enquiries/:id/status (Admin) - Update enquiry status, next follow-up date, referral & notes
const updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, internalNotes, nextFollowUpDate, referredTo } = req.body;

    const allowedStatuses = [
      'Pending Admin Approval',
      'Approved — Awaiting Customer Acceptance',
      'Approved — Awaiting Payment',
      'Payment Pending',
      'Paid',
      'Confirmed',
      'Rejected',
      'Cancelled',
      'Refund Pending',
      'Refunded',
      'New',
      'Contacted',
      'In Discussion',
      'Quoted',
      'Converted',
      'Referred',
      'Closed'
    ];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid enquiry status' });
    }

    if (isMongoConnected()) {
      const updatePayload = {};
      if (status) updatePayload.status = status;
      if (internalNotes !== undefined) updatePayload.internalNotes = internalNotes;
      if (nextFollowUpDate !== undefined) updatePayload.nextFollowUpDate = nextFollowUpDate;
      if (referredTo !== undefined) updatePayload.referredTo = referredTo;

      const updated = await Enquiry.findOneAndUpdate(
        { $or: [{ id }, { _id: id }] },
        updatePayload,
        { new: true }
      );
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Enquiry not found' });
      }
      return res.json({ success: true, data: updated, message: 'Enquiry updated successfully' });
    }

    const db = getLocalDb();
    const index = db.enquiries.findIndex(e => e.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    if (status) db.enquiries[index].status = status;
    if (internalNotes !== undefined) db.enquiries[index].internalNotes = internalNotes;
    if (nextFollowUpDate !== undefined) db.enquiries[index].nextFollowUpDate = nextFollowUpDate;
    if (referredTo !== undefined) db.enquiries[index].referredTo = referredTo;
    saveLocalStore();

    return res.json({ success: true, data: db.enquiries[index], message: 'Enquiry updated successfully' });
  } catch (error) {
    console.error('Error updating enquiry status:', error);
    return res.status(500).json({ success: false, message: 'Server error updating enquiry' });
  }
};

// GET /api/enquiries/export/csv (Admin) - Export enquiries to CSV for Excel / Google Sheets
const exportEnquiriesCSV = async (req, res) => {
  try {
    let enquiries = [];
    if (isMongoConnected()) {
      enquiries = await Enquiry.find().sort({ createdAt: -1 });
    } else {
      enquiries = [...getLocalDb().enquiries];
    }

    const headers = [
      'Ref ID',
      'Created Date',
      'Customer Name',
      'Phone',
      'WhatsApp',
      'Email',
      'Service Required',
      'Event Date',
      'Locality',
      'Venue Address',
      'Event Type',
      'Guests',
      'Budget',
      'Status',
      'Next Follow-Up',
      'Referred To',
      'Internal Notes',
      'Customer Notes',
      'Requested Items'
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = enquiries.map(e => {
      const itemsStr = (e.items || []).map(it => `${it.name} (Qty: ${it.quantity})`).join('; ');
      return [
        escapeCsv(e.id),
        escapeCsv(e.createdAt ? new Date(e.createdAt).toLocaleDateString() : ''),
        escapeCsv(e.customerName),
        escapeCsv(e.phone),
        escapeCsv(e.whatsappNumber || e.phone),
        escapeCsv(e.email),
        escapeCsv(e.serviceRequired),
        escapeCsv(e.eventDate),
        escapeCsv(e.locality),
        escapeCsv(e.eventVenueAddress),
        escapeCsv(e.eventType),
        escapeCsv(e.guestCount),
        escapeCsv(e.budgetRange),
        escapeCsv(e.status),
        escapeCsv(e.nextFollowUpDate),
        escapeCsv(e.referredTo),
        escapeCsv(e.internalNotes),
        escapeCsv(e.notes),
        escapeCsv(itemsStr)
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=kandhari_enquiries_${Date.now()}.csv`);
    return res.send(csvContent);
  } catch (error) {
    console.error('Error generating CSV:', error);
    return res.status(500).json({ success: false, message: 'Server error generating CSV export' });
  }
};

// DELETE /api/enquiries/:id (Admin)
const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const deleted = await Enquiry.findOneAndDelete({ $or: [{ id }, { _id: id }] });
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Enquiry not found' });
      }
      return res.json({ success: true, message: 'Enquiry removed' });
    }

    const db = getLocalDb();
    const prev = db.enquiries.length;
    db.enquiries = db.enquiries.filter(e => e.id !== id);
    if (db.enquiries.length === prev) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    saveLocalStore();

    return res.json({ success: true, message: 'Enquiry removed' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error deleting enquiry' });
  }
};

// GET /api/enquiries/:id - Customer (own) or Admin access
const getEnquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    let enquiry = null;

    if (isMongoConnected()) {
      enquiry = await Enquiry.findOne({ $or: [{ id }, { _id: id }] });
    } else {
      const db = getLocalDb();
      enquiry = (db.enquiries || []).find(e => e.id === id);
    }

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required to view enquiry details.' });
    }

    // Admin can view any enquiry
    if (req.user.role === 'admin') {
      return res.json({ success: true, data: enquiry });
    }

    // Customer can only view their own enquiry
    if (enquiry.customerId && enquiry.customerId === req.user.id) {
      return res.json({ success: true, data: enquiry });
    }

    // If enquiry is unclaimed (customerId is null/empty), allow if phone/email matches customer
    if (!enquiry.customerId) {
      const matchesPhone = req.user.phone && enquiry.phone === req.user.phone;
      const matchesEmail = req.user.email && enquiry.email && enquiry.email.toLowerCase() === req.user.email.toLowerCase();
      if (matchesPhone || matchesEmail) {
        return res.json({ success: true, data: enquiry });
      }
    }

    return res.status(403).json({ success: false, message: 'Forbidden. You do not have permission to view this enquiry.' });
  } catch (error) {
    console.error('Error fetching enquiry by ID:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving enquiry' });
  }
};

// PUT /api/enquiries/:id/quotation (Admin) - Update quotation line items, cartage, labour, discounts, advance, and status
const updateEnquiryQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      lineItems,
      cartage,
      labour,
      discount,
      discountReason,
      manualAdjustment,
      adjustmentReason,
      advancePaid,
      status,
      quotationNotes
    } = req.body;

    let enquiry = null;
    const isMongo = isMongoConnected();
    if (isMongo) {
      enquiry = await Enquiry.findOne({ $or: [{ id }, { _id: id }] });
    } else {
      const db = getLocalDb();
      enquiry = (db.enquiries || []).find(e => e.id === id);
    }

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry / Order not found' });
    }

    const items = Array.isArray(lineItems) ? lineItems : (enquiry.lineItems || enquiry.items || []);
    
    // Compute line items totals
    const calculatedItems = items.map(it => {
      const qty = Math.max(1, parseInt(it.quantity || 1, 10));
      let lineTotal = parseFloat(it.lineTotal || 0);
      if (!lineTotal && it.unitRate) {
        lineTotal = Math.round(qty * parseFloat(it.unitRate) * (it.effectiveDays || 1));
      } else if (!lineTotal && it.ratePerSqFt && it.areaSqFt) {
        lineTotal = Math.round(it.areaSqFt * parseFloat(it.ratePerSqFt) * (it.effectiveDays || 1) * qty);
      }
      return {
        ...it,
        quantity: qty,
        lineTotal: Math.round(lineTotal)
      };
    });

    const subtotal = calculatedItems.reduce((acc, it) => acc + (it.lineTotal || 0), 0);
    const finalCartage = cartage !== undefined ? parseFloat(cartage) : (enquiry.cartage || 0);
    const finalLabour = labour !== undefined ? parseFloat(labour) : (enquiry.labour || 0);
    const finalDiscount = discount !== undefined ? Math.max(0, parseFloat(discount)) : (enquiry.discount || 0);
    const finalAdjustment = manualAdjustment !== undefined ? parseFloat(manualAdjustment) : (enquiry.manualAdjustment || 0);
    const grandTotal = Math.max(0, Math.round(subtotal + finalCartage + finalLabour - finalDiscount + finalAdjustment));
    const finalAdvance = advancePaid !== undefined ? Math.max(0, parseFloat(advancePaid)) : (enquiry.advancePaid || 0);
    const balanceDue = Math.max(0, grandTotal - finalAdvance);

    const updateFields = {
      items: calculatedItems,
      lineItems: calculatedItems,
      subtotal,
      cartage: finalCartage,
      labour: finalLabour,
      discount: finalDiscount,
      discountReason: discountReason !== undefined ? discountReason : (enquiry.discountReason || ''),
      manualAdjustment: finalAdjustment,
      adjustmentReason: adjustmentReason !== undefined ? adjustmentReason : (enquiry.adjustmentReason || ''),
      grandTotal,
      advancePaid: finalAdvance,
      balanceDue,
      status: status || enquiry.status || 'Quotation Prepared',
      quotationNotes: quotationNotes !== undefined ? quotationNotes : (enquiry.quotationNotes || ''),
      quotationNumber: enquiry.quotationNumber || `QTN-${Date.now().toString().slice(-6)}`,
      quotationDate: enquiry.quotationDate || new Date().toISOString().split('T')[0]
    };

    if (isMongo) {
      const updated = await Enquiry.findOneAndUpdate(
        { $or: [{ id }, { _id: id }] },
        updateFields,
        { new: true }
      );
      return res.json({ success: true, data: updated, message: 'Quotation updated successfully' });
    }

    const db = getLocalDb();
    const index = db.enquiries.findIndex(e => e.id === id);
    db.enquiries[index] = { ...db.enquiries[index], ...updateFields };
    saveLocalStore();

    return res.json({ success: true, data: db.enquiries[index], message: 'Quotation updated successfully' });
  } catch (error) {
    console.error('Error updating quotation:', error);
    return res.status(500).json({ success: false, message: 'Server error updating quotation' });
  }
};

// PUT /api/enquiries/:id/review (Admin)
// Approves (with or without revised quotation) or rejects enquiry
const reviewEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason, internalNotes, quotationData } = req.body;

    const db = getLocalDb();
    const index = db.enquiries.findIndex(e => e.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Enquiry / Order not found' });
    }

    const enquiry = db.enquiries[index];

    if (action === 'reject') {
      enquiry.status = 'Rejected';
      enquiry.rejectionReason = rejectionReason || 'Dates or requested equipment unavailable.';
      if (internalNotes) enquiry.internalNotes = internalNotes;
      saveLocalStore();

      await createNotification({
        customerId: enquiry.customerId,
        enquiryId: enquiry.id,
        title: 'Booking Request Update',
        message: `Your booking request for ${enquiry.eventDate} could not be confirmed. Reason: ${enquiry.rejectionReason}`,
        type: 'status_update'
      });

      return res.json({ success: true, message: 'Enquiry rejected', data: enquiry });
    }

    if (action === 'approve') {
      // If admin provided revised quotationData (e.g. edited line items or adjustments)
      if (quotationData && (quotationData.lineItems || quotationData.manualAdjustment || quotationData.discount)) {
        const items = Array.isArray(quotationData.lineItems) ? quotationData.lineItems : (enquiry.lineItems || enquiry.items || []);
        const calculatedItems = items.map(it => {
          const qty = Math.max(1, parseInt(it.quantity || 1, 10));
          let lineTotal = parseFloat(it.lineTotal || 0);
          if (!lineTotal && it.unitRate) {
            lineTotal = Math.round(qty * parseFloat(it.unitRate) * (it.effectiveDays || 1));
          } else if (!lineTotal && it.ratePerSqFt && it.areaSqFt) {
            lineTotal = Math.round(it.areaSqFt * parseFloat(it.ratePerSqFt) * (it.effectiveDays || 1) * qty);
          }
          return { ...it, quantity: qty, lineTotal: Math.round(lineTotal) };
        });

        const subtotal = calculatedItems.reduce((acc, it) => acc + (it.lineTotal || 0), 0);
        const cartage = quotationData.cartage !== undefined ? parseFloat(quotationData.cartage) : (enquiry.cartage || 0);
        const labour = quotationData.labour !== undefined ? parseFloat(quotationData.labour) : (enquiry.labour || 0);
        const discount = quotationData.discount !== undefined ? parseFloat(quotationData.discount) : (enquiry.discount || 0);
        const adjustment = quotationData.manualAdjustment !== undefined ? parseFloat(quotationData.manualAdjustment) : (enquiry.manualAdjustment || 0);
        const grandTotal = Math.max(0, Math.round(subtotal + cartage + labour - discount + adjustment));

        enquiry.items = calculatedItems;
        enquiry.lineItems = calculatedItems;
        enquiry.subtotal = subtotal;
        enquiry.cartage = cartage;
        enquiry.labour = labour;
        enquiry.discount = discount;
        enquiry.manualAdjustment = adjustment;
        enquiry.grandTotal = grandTotal;
        enquiry.balanceDue = Math.max(0, grandTotal - (enquiry.advancePaid || 0));
        enquiry.quotationNotes = quotationData.quotationNotes || enquiry.quotationNotes || '';
        enquiry.status = 'Approved — Awaiting Customer Acceptance';

        saveLocalStore();

        await createNotification({
          customerId: enquiry.customerId,
          enquiryId: enquiry.id,
          title: 'Revised Quotation Prepared 📋',
          message: `Your booking quotation for ${enquiry.eventDate} has been prepared with tailored items & rates (Total: ₹${grandTotal.toLocaleString('en-IN')}). Please review and accept to unlock payment.`,
          type: 'quotation_revised'
        });

        return res.json({ success: true, message: 'Quotation revised and approved. Awaiting customer acceptance.', data: enquiry });
      }

      // Approved as-is without revisions
      enquiry.status = 'Approved — Awaiting Payment';
      if (internalNotes) enquiry.internalNotes = internalNotes;
      saveLocalStore();

      await createNotification({
        customerId: enquiry.customerId,
        enquiryId: enquiry.id,
        title: 'Booking Request Approved! ✨',
        message: `Your booking request for ${enquiry.eventDate} is approved! You can now proceed to secure your date with online payment.`,
        type: 'status_update'
      });

      return res.json({ success: true, message: 'Enquiry approved. Awaiting payment.', data: enquiry });
    }

    return res.status(400).json({ success: false, message: 'Invalid review action. Use "approve" or "reject".' });
  } catch (err) {
    console.error('Error reviewing enquiry:', err);
    return res.status(500).json({ success: false, message: 'Server error reviewing enquiry' });
  }
};

// PUT /api/enquiries/:id/accept-quotation (Customer)
// Customer reviews and accepts revised quotation
const acceptQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getLocalDb();
    const enquiry = (db.enquiries || []).find(e => e.id === id);

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    // Ownership check
    if (req.user && req.user.role === 'customer') {
      const isOwner =
        (enquiry.customerId && enquiry.customerId === req.user.id) ||
        (enquiry.email && enquiry.email.toLowerCase() === req.user.email?.toLowerCase()) ||
        (enquiry.phone && (enquiry.phone === req.user.phone || enquiry.whatsappNumber === req.user.phone));

      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Unauthorized access to this order.' });
      }
    }

    enquiry.status = 'Approved — Awaiting Payment';
    enquiry.quotationAcceptedAt = new Date().toISOString();
    saveLocalStore();

    await createNotification({
      customerId: enquiry.customerId,
      enquiryId: enquiry.id,
      title: 'Quotation Accepted! 💳',
      message: `You accepted the quotation for ${enquiry.eventDate}. Online payment via Razorpay / UPI is now unlocked.`,
      type: 'info'
    });

    return res.json({
      success: true,
      message: 'Quotation accepted successfully. You can now make payment.',
      data: enquiry
    });
  } catch (err) {
    console.error('Error accepting quotation:', err);
    return res.status(500).json({ success: false, message: 'Server error accepting quotation' });
  }
};

module.exports = {
  submitEnquiry,
  getEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  updateEnquiryQuotation,
  exportEnquiriesCSV,
  deleteEnquiry,
  reviewEnquiry,
  acceptQuotation
};

