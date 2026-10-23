const { isMongoConnected, getLocalDb, saveLocalStore } = require('../config/db');
const Enquiry = require('../models/Enquiry');
const { calculateOrderPricing } = require('../services/pricingEngine');
const { createNotification } = require('./notificationController');

const BUSINESS_WHATSAPP = process.env.PUBLIC_WHATSAPP_PHONE || process.env.WHATSAPP_PHONE || '';

const LUCKNOW_DEPOT = {
  name: 'Kandhari Tent House & Dwarka Shri Lawn Hub',
  address: 'Opp. Pillar No. 37, Daroga Kheda, Kanpur Road, Lucknow, UP 226008',
  lat: 26.7645,
  lng: 80.8842
};

const LUCKNOW_GEO_LOCATIONS = {
  'Kanpur Road / Daroga Kheda': { lat: 26.7645, lng: 80.8842, distanceKm: 0.5, transitMinutes: 3 },
  'Transport Nagar / Amausi': { lat: 26.7725, lng: 80.8750, distanceKm: 2.2, transitMinutes: 8 },
  'Alambagh / Singar Nagar': { lat: 26.8125, lng: 80.9015, distanceKm: 6.8, transitMinutes: 16 },
  'Krishna Nagar / Ashiyana': { lat: 26.7915, lng: 80.8980, distanceKm: 4.5, transitMinutes: 12 },
  'Charbagh / Station Road': { lat: 26.8315, lng: 80.9230, distanceKm: 9.4, transitMinutes: 22 },
  'Hazratganj / Central Lucknow': { lat: 26.8500, lng: 80.9499, distanceKm: 12.8, transitMinutes: 28 },
  'Gomti Nagar / Vibhuti Khand': { lat: 26.8605, lng: 80.9990, distanceKm: 18.5, transitMinutes: 38 },
  'Gomti Nagar Extension / Shaheed Path': { lat: 26.8150, lng: 81.0150, distanceKm: 16.2, transitMinutes: 32 },
  'Indira Nagar / Munshi Pulia': { lat: 26.8850, lng: 80.9850, distanceKm: 19.6, transitMinutes: 42 },
  'Mahanagar / Nishatganj': { lat: 26.8720, lng: 80.9560, distanceKm: 15.4, transitMinutes: 35 },
  'Aliganj / Kapoorthala': { lat: 26.8870, lng: 80.9380, distanceKm: 16.8, transitMinutes: 36 },
  'Jankipuram / Ring Road': { lat: 26.9150, lng: 80.9400, distanceKm: 21.0, transitMinutes: 45 },
  'Vikas Nagar / Tedhi Pulia': { lat: 26.8980, lng: 80.9520, distanceKm: 18.9, transitMinutes: 40 },
  'Chowk / Old City / Thakurganj': { lat: 26.8680, lng: 80.9020, distanceKm: 14.2, transitMinutes: 34 },
  'Rajajipuram / Talkatora': { lat: 26.8320, lng: 80.8870, distanceKm: 8.9, transitMinutes: 20 },
  'Vrindavan Yojana / Raebareli Road': { lat: 26.7750, lng: 80.9550, distanceKm: 9.8, transitMinutes: 22 },
  'Telibagh / SGPGI': { lat: 26.7860, lng: 80.9420, distanceKm: 8.5, transitMinutes: 19 },
  'Sarojini Nagar / Banthra': { lat: 26.7450, lng: 80.8550, distanceKm: 4.8, transitMinutes: 12 },
  'Sultanpur Road / IT City / Arjunganj': { lat: 26.8080, lng: 81.0020, distanceKm: 15.8, transitMinutes: 32 },
  'Faizabad Road / Chinhat': { lat: 26.8780, lng: 81.0450, distanceKm: 22.5, transitMinutes: 48 },
  'Dubagga / Hardoi Road': { lat: 26.8700, lng: 80.8500, distanceKm: 13.5, transitMinutes: 30 }
};

function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function resolveLocationInfo(locality, customCoords = null) {
  let matched = null;
  if (locality) {
    for (const [key, val] of Object.entries(LUCKNOW_GEO_LOCATIONS)) {
      if (locality.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(locality.toLowerCase())) {
        matched = { key, ...val };
        break;
      }
    }
  }
  if (!matched) {
    matched = { key: locality || 'Lucknow', lat: 26.8467, lng: 80.9462, distanceKm: 12.0, transitMinutes: 28 };
  }

  const destCoords = customCoords && customCoords.lat ? customCoords : { lat: matched.lat, lng: matched.lng };
  const dist = customCoords && customCoords.lat
    ? calculateHaversineDistance(LUCKNOW_DEPOT.lat, LUCKNOW_DEPOT.lng, customCoords.lat, customCoords.lng)
    : matched.distanceKm;

  return {
    origin: LUCKNOW_DEPOT,
    destination: {
      address: locality || 'Lucknow, Uttar Pradesh',
      lat: destCoords.lat,
      lng: destCoords.lng
    },
    distanceKm: dist,
    transitMinutes: Math.max(5, Math.round(dist * 2.2 + 5))
  };
}

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

    // Resolve Geolocation & Route distance from Lucknow Depot
    const locationInfo = resolveLocationInfo(locality || eventVenueAddress || 'Kanpur Road, Lucknow', req.body.coords || null);
    const effectiveDistanceKm = deliveryDistanceKm || locationInfo.distanceKm || 3;

    // Calculate official server-side pricing if rental items are present
    let pricing = null;
    let computedItems = Array.isArray(items) ? items : [];

    if (computedItems.length > 0) {
      pricing = calculateOrderPricing({
        items: computedItems,
        startDate: effStartDate,
        endDate: effEndDate,
        deliveryDistanceKm: effectiveDistanceKm,
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
      eventVenueAddress: eventVenueAddress || locality || 'Kanpur Road, Lucknow',
      locationInfo: {
        origin: locationInfo.origin,
        destination: locationInfo.destination,
        distanceKm: locationInfo.distanceKm,
        transitMinutes: locationInfo.transitMinutes
      },
      distanceKm: locationInfo.distanceKm,
      transitMinutes: locationInfo.transitMinutes,
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
      deliveryStatus: 'Pending Approval',
      referredTo: '',
      nextFollowUpDate: '',
      internalNotes: '',
      createdAt: new Date().toISOString()
    };

    const whatsappLink = generateWhatsAppLink(enquiryData);

    // 1. Notify Customer if authenticated (Immediate portal notification)
    if (enquiryData.customerId) {
      try {
        await createNotification({
          customerId: enquiryData.customerId,
          enquiryId: enquiryId,
          title: '📋 Order Enquiry Sent',
          message: `Your rental order enquiry #${enquiryId} has been sent and is awaiting admin approval.`,
          type: 'enquiry_submitted'
        });
      } catch (notifErr) {
        console.warn('Customer notification warning:', notifErr.message);
      }
    }

    // 2. Client Agent communicates to Admin Agent via shared Event Bus
    try {
      const { recordAgentEvent } = require('../services/threeAgentService');
      recordAgentEvent({
        sourceAgent: 'client_agent',
        targetAgent: 'admin_agent',
        eventType: 'new_order_enquiry',
        severity: 'high',
        data: {
          enquiryId,
          customerId: enquiryData.customerId,
          customerName: enquiryData.customerName,
          phone: enquiryData.phone,
          guestCount: enquiryData.guestCount,
          locality: enquiryData.locality,
          grandTotal: enquiryData.grandTotal,
          distanceKm: locationInfo.distanceKm,
          itemsCount: (enquiryData.items || []).length,
          actionRequired: 'prompt_admin_decision',
          promptText: `New order enquiry #${enquiryId} received from ${enquiryData.customerName} for ${enquiryData.locality} (Headcount: ${enquiryData.guestCount || 'Flexible'}, Total: ₹${(enquiryData.grandTotal || 0).toLocaleString('en-IN')}, Distance: ${locationInfo.distanceKm} km). Please review and Accept or Reject.`
        }
      });
    } catch (agentErr) {
      console.warn('Agent event recording warning:', agentErr.message);
    }

    // 3. Record Operational Metadata for Master Agent Self-Training
    try {
      const db = getLocalDb();
      if (!db.masterAgentTrainingData) {
        db.masterAgentTrainingData = [];
      }
      db.masterAgentTrainingData.unshift({
        enquiryId,
        customerId: enquiryData.customerId,
        locality: enquiryData.locality,
        destinationCoords: locationInfo.destination,
        distanceKm: locationInfo.distanceKm,
        transitMinutes: locationInfo.transitMinutes,
        guestCount: enquiryData.guestCount,
        grandTotal: enquiryData.grandTotal,
        itemTypes: (enquiryData.items || []).map(i => i.name),
        status: 'submitted',
        createdAt: new Date().toISOString()
      });
    } catch (trainErr) {
      console.warn('Master Agent training storage warning:', trainErr.message);
    }

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

// GET /api/enquiries/:id/route - Geolocation, Haversine distance, and route from Lucknow Depot
const getEnquiryRouteInfo = async (req, res) => {
  try {
    const { id } = req.params;
    let enquiry = null;
    const db = getLocalDb();
    enquiry = (db.enquiries || []).find(e => e.id === id || e._id?.toString() === id);

    if (!enquiry && isMongoConnected()) {
      enquiry = await Enquiry.findOne({ $or: [{ id }, { _id: id }] }).lean();
    }

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    const locationInfo = enquiry.locationInfo || resolveLocationInfo(enquiry.locality || enquiry.eventVenueAddress);
    return res.json({
      success: true,
      enquiryId: enquiry.id,
      customerName: enquiry.customerName,
      phone: enquiry.phone,
      locality: enquiry.locality,
      eventVenueAddress: enquiry.eventVenueAddress,
      guestCount: enquiry.guestCount,
      grandTotal: enquiry.grandTotal,
      locationInfo
    });
  } catch (error) {
    console.error('Error in getEnquiryRouteInfo:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve enquiry route info' });
  }
};

module.exports = {
  submitEnquiry,
  getEnquiries,
  getEnquiryById,
  getEnquiryRouteInfo,
  updateEnquiryStatus,
  updateEnquiryQuotation,
  exportEnquiriesCSV,
  deleteEnquiry,
  reviewEnquiry,
  acceptQuotation
};

