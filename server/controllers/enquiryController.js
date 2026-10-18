const { isMongoConnected, getLocalDb, saveLocalStore } = require('../config/db');
const Enquiry = require('../models/Enquiry');

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
      message += `  ${idx + 1}. ${it.name} - Qty: ${it.quantity}\n`;
    });
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
      locality,
      eventVenueAddress,
      eventType,
      guestCount,
      budgetRange,
      items,
      notes,
      consentGiven
    } = req.body;

    const enquiryId = 'ENQ-' + Math.floor(100000 + Math.random() * 900000);

    const enquiryData = {
      id: enquiryId,
      customerId: (req.user ? req.user.id : null) || req.body.customerId || null,
      conversationId: req.body.conversationId || null,
      enquiryType: enquiryType || 'rental',
      customerName,
      phone,
      whatsappNumber: whatsappNumber || phone,
      email: email || '',
      preferredContactMethod: req.body.preferredContactMethod || 'Phone',
      serviceRequired: serviceRequired || 'Tent-house equipment rentals',
      servicesList: Array.isArray(req.body.servicesList) ? req.body.servicesList : (serviceRequired ? [serviceRequired] : []),
      eventDate,
      locality: locality || 'Kanpur Road, Lucknow',
      eventVenueAddress: eventVenueAddress || '',
      eventType: eventType || 'Wedding / Celebration',
      guestCount: parseInt(guestCount, 10) || 0,
      budgetRange: budgetRange || 'Flexible',
      items: Array.isArray(items) ? items : [],
      notes: notes || '',
      detailedRequirements: req.body.detailedRequirements || notes || '',
      consentGiven: consentGiven !== false,
      status: 'New',
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

    const allowedStatuses = ['New', 'Contacted', 'In Discussion', 'Quoted', 'Converted', 'Confirmed', 'Referred', 'Closed'];
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

module.exports = {
  submitEnquiry,
  getEnquiries,
  updateEnquiryStatus,
  exportEnquiriesCSV,
  deleteEnquiry
};
