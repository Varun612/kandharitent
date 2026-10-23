const { isMongoConnected, getLocalDb, saveLocalStore } = require('../config/db');
const { createNotification } = require('./notificationController');

const SEED_PARTNERS = [
  {
    id: 'part-del-1',
    name: 'Ramesh Yadav',
    phone: '+91 98390 11223',
    vehicleType: 'Mahindra Bolero Maxi Truck',
    vehicleNumber: 'UP 32 BK 4821',
    maxLoadCapacity: '1.5 Tonnes',
    baseHub: 'Kanpur Road Depot (Opp. Pillar 37)',
    status: 'Available',
    tripsCompleted: 42,
    rating: '4.9',
    createdAt: new Date().toISOString()
  },
  {
    id: 'part-del-2',
    name: 'Satish Kumar',
    phone: '+91 98390 22334',
    vehicleType: 'Tata Ace Gold / Chhota Hathi',
    vehicleNumber: 'UP 32 CN 7749',
    maxLoadCapacity: '750 Kg (Chairs & Sofas)',
    baseHub: 'Transport Nagar Depot',
    status: 'Available',
    tripsCompleted: 68,
    rating: '4.8',
    createdAt: new Date().toISOString()
  },
  {
    id: 'part-del-3',
    name: 'Mahendra Singh',
    phone: '+91 98390 33445',
    vehicleType: '14ft Eicher Heavy Canter',
    vehicleNumber: 'UP 32 EL 1938',
    maxLoadCapacity: '4.0 Tonnes (German Hangar & Truss)',
    baseHub: 'Kanpur Road Depot (Opp. Pillar 37)',
    status: 'Available',
    tripsCompleted: 35,
    rating: '5.0',
    createdAt: new Date().toISOString()
  }
];

const ensurePartnersInit = (db) => {
  if (!db.deliveryPartners || !Array.isArray(db.deliveryPartners) || db.deliveryPartners.length === 0) {
    db.deliveryPartners = [...SEED_PARTNERS];
  }
};

/**
 * 1. GET /api/delivery-partners
 * Returns list of all delivery fleet drivers and vehicles
 */
const getDeliveryPartners = (req, res) => {
  try {
    const db = getLocalDb();
    ensurePartnersInit(db);

    const { status } = req.query;
    let list = db.deliveryPartners;
    if (status && status !== 'all') {
      list = list.filter(p => p.status.toLowerCase() === status.toLowerCase());
    }

    return res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (error) {
    console.error('getDeliveryPartners error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve delivery fleet' });
  }
};

/**
 * 2. POST /api/delivery-partners (Admin)
 * Register a new delivery partner
 */
const createDeliveryPartner = (req, res) => {
  try {
    const { name, phone, vehicleType, vehicleNumber, maxLoadCapacity, baseHub, status } = req.body || {};

    if (!name || !name.trim() || !phone || !phone.trim() || !vehicleNumber || !vehicleNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Driver name, contact number, and vehicle registration number are required.'
      });
    }

    const db = getLocalDb();
    ensurePartnersInit(db);

    const id = 'part-del-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 4);
    const newPartner = {
      id,
      name: name.trim(),
      phone: phone.trim(),
      vehicleType: (vehicleType || 'Tata Ace Gold / Utility Truck').trim(),
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      maxLoadCapacity: (maxLoadCapacity || '1.0 Tonne').trim(),
      baseHub: (baseHub || 'Kanpur Road Depot, Lucknow').trim(),
      status: status || 'Available',
      tripsCompleted: 0,
      rating: '5.0',
      createdAt: new Date().toISOString()
    };

    db.deliveryPartners.unshift(newPartner);
    saveLocalStore();

    return res.status(201).json({
      success: true,
      message: `Delivery partner "${newPartner.name}" registered successfully.`,
      data: newPartner
    });
  } catch (error) {
    console.error('createDeliveryPartner error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create delivery partner' });
  }
};

/**
 * 3. PUT /api/delivery-partners/:id (Admin)
 * Update existing delivery partner
 */
const updateDeliveryPartner = (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, vehicleType, vehicleNumber, maxLoadCapacity, baseHub, status } = req.body || {};

    const db = getLocalDb();
    ensurePartnersInit(db);

    const partner = db.deliveryPartners.find(p => p.id === id);
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Delivery partner not found.' });
    }

    if (name !== undefined) partner.name = name.trim();
    if (phone !== undefined) partner.phone = phone.trim();
    if (vehicleType !== undefined) partner.vehicleType = vehicleType.trim();
    if (vehicleNumber !== undefined) partner.vehicleNumber = vehicleNumber.trim().toUpperCase();
    if (maxLoadCapacity !== undefined) partner.maxLoadCapacity = maxLoadCapacity.trim();
    if (baseHub !== undefined) partner.baseHub = baseHub.trim();
    if (status !== undefined) partner.status = status;
    partner.updatedAt = new Date().toISOString();

    saveLocalStore();

    return res.json({
      success: true,
      message: 'Delivery partner updated successfully.',
      data: partner
    });
  } catch (error) {
    console.error('updateDeliveryPartner error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update delivery partner' });
  }
};

/**
 * 4. DELETE /api/delivery-partners/:id (Admin)
 * Remove a delivery partner from fleet
 */
const deleteDeliveryPartner = (req, res) => {
  try {
    const { id } = req.params;
    const db = getLocalDb();
    ensurePartnersInit(db);

    const prevCount = db.deliveryPartners.length;
    db.deliveryPartners = db.deliveryPartners.filter(p => p.id !== id);

    if (db.deliveryPartners.length === prevCount) {
      return res.status(404).json({ success: false, message: 'Delivery partner not found.' });
    }

    saveLocalStore();

    return res.json({
      success: true,
      message: 'Delivery partner removed successfully.'
    });
  } catch (error) {
    console.error('deleteDeliveryPartner error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete delivery partner' });
  }
};

/**
 * 5. POST /api/delivery-partners/assign (Admin)
 * Assigns a delivery driver to an approved order (Zomato-like workflow)
 */
const assignPartnerToOrder = async (req, res) => {
  try {
    const { enquiryId, partnerId, estimatedDeliveryTime, notes } = req.body || {};

    if (!enquiryId || !partnerId) {
      return res.status(400).json({ success: false, message: 'enquiryId and partnerId are required.' });
    }

    const db = getLocalDb();
    ensurePartnersInit(db);

    const enquiry = (db.enquiries || []).find(e => e.id === enquiryId);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Rental order not found.' });
    }

    const partner = db.deliveryPartners.find(p => p.id === partnerId);
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Selected delivery partner not found.' });
    }

    // Attach partner details
    enquiry.deliveryPartner = {
      id: partner.id,
      name: partner.name,
      phone: partner.phone,
      vehicleType: partner.vehicleType,
      vehicleNumber: partner.vehicleNumber,
      baseHub: partner.baseHub,
      rating: partner.rating || '4.9'
    };

    enquiry.deliveryStatus = 'Assigned';
    enquiry.status = 'Delivery Partner Assigned';
    enquiry.estimatedDeliveryTime = estimatedDeliveryTime || 'Punctual morning setup on event date';
    enquiry.deliveryNotes = notes || '';
    enquiry.deliveryAssignedAt = new Date().toISOString();

    if (!enquiry.deliveryTimeline) {
      enquiry.deliveryTimeline = [];
    }

    enquiry.deliveryTimeline.push({
      status: 'Delivery Partner Assigned',
      note: `Delivery assigned to ${partner.name} (${partner.vehicleType} - ${partner.vehicleNumber})`,
      timestamp: new Date().toISOString()
    });

    // Mark driver on trip
    partner.status = 'On Trip';
    partner.currentEnquiryId = enquiry.id;

    saveLocalStore();

    // Notify customer (Zomato-like live update)
    await createNotification({
      customerId: enquiry.customerId,
      enquiryId: enquiry.id,
      title: '🚚 Delivery Partner Assigned!',
      message: `Your rental order has been assigned to ${partner.name} (${partner.vehicleType} - ${partner.vehicleNumber}). Contact: ${partner.phone}. Expected setup: ${enquiry.estimatedDeliveryTime}.`,
      type: 'delivery_update'
    });

    return res.json({
      success: true,
      message: `Delivery partner ${partner.name} assigned to order ${enquiry.id}.`,
      data: enquiry
    });
  } catch (error) {
    console.error('assignPartnerToOrder error:', error);
    return res.status(500).json({ success: false, message: 'Failed to assign delivery partner' });
  }
};

/**
 * 6. POST /api/delivery-partners/update-status (Admin or Driver)
 * Updates real-time dispatch and setup status
 */
const updateOrderDeliveryStatus = async (req, res) => {
  try {
    const { enquiryId, status, note, currentLocation } = req.body || {};

    if (!enquiryId || !status) {
      return res.status(400).json({ success: false, message: 'enquiryId and status are required.' });
    }

    const db = getLocalDb();
    ensurePartnersInit(db);

    const enquiry = (db.enquiries || []).find(e => e.id === enquiryId);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Rental order not found.' });
    }

    enquiry.deliveryStatus = status;
    enquiry.status = status;
    enquiry.deliveryCurrentLocation = currentLocation || enquiry.deliveryCurrentLocation || 'Kanpur Road Hub';

    if (!enquiry.deliveryTimeline) {
      enquiry.deliveryTimeline = [];
    }

    enquiry.deliveryTimeline.push({
      status,
      note: note || `Order status updated to: ${status}`,
      location: currentLocation || '',
      timestamp: new Date().toISOString()
    });

    if (status === 'Delivered & Installed' || status === 'Delivered') {
      enquiry.deliveredAt = new Date().toISOString();
    }

    if (status === 'Completed & Returned' || status === 'Completed') {
      enquiry.completedAt = new Date().toISOString();
      if (enquiry.deliveryPartner?.id) {
        const partner = db.deliveryPartners.find(p => p.id === enquiry.deliveryPartner.id);
        if (partner) {
          partner.status = 'Available';
          partner.currentEnquiryId = null;
          partner.tripsCompleted = (partner.tripsCompleted || 0) + 1;
        }
      }
    }

    saveLocalStore();

    // Trigger customer notification
    await createNotification({
      customerId: enquiry.customerId,
      enquiryId: enquiry.id,
      title: `Status: ${status}`,
      message: note || `Your rental delivery for ${enquiry.eventDate} is now: ${status}.`,
      type: 'delivery_update'
    });

    return res.json({
      success: true,
      message: `Delivery status updated to ${status}`,
      data: enquiry
    });
  } catch (error) {
    console.error('updateOrderDeliveryStatus error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update delivery status' });
  }
};

/**
 * 7. GET /api/delivery-partners/track/:id (Public)
 * Live Zomato-style order tracking endpoint
 */
const getOrderTrackingInfo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Order ID is required.' });
    }

    let enquiry = null;
    const db = getLocalDb();
    ensurePartnersInit(db);

    // Search local DB first
    enquiry = (db.enquiries || []).find(e => e.id?.toLowerCase() === id.toLowerCase() || e._id?.toString() === id);

    // If not found and MongoDB connected
    if (!enquiry && isMongoConnected && isMongoConnected()) {
      try {
        const EnquiryModel = require('../models/Enquiry');
        enquiry = await EnquiryModel.findOne({ $or: [{ id }, { _id: id }] }).lean();
      } catch (err) {
        console.error('Mongo tracking search error:', err);
      }
    }

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: `Order or Ticket #${id} not found. Please verify your reference number.`
      });
    }

    // Ensure calculated pricing breakdown is explicit
    const subtotal = enquiry.subtotal || (Array.isArray(enquiry.items) ? enquiry.items.reduce((s, it) => s + (it.lineTotal || ((it.unitRate || 0) * (it.quantity || 1)) || 0), 0) : 0);
    const cartage = enquiry.cartage !== undefined ? enquiry.cartage : 500;
    const labour = enquiry.labour !== undefined ? enquiry.labour : 500;
    const gst = enquiry.gst !== undefined ? enquiry.gst : Math.round((subtotal + cartage + labour) * 0.18);
    const grandTotal = enquiry.grandTotal || (subtotal + cartage + labour + gst);

    return res.json({
      success: true,
      data: {
        id: enquiry.id,
        status: enquiry.status || 'Pending Admin Approval',
        deliveryStatus: enquiry.deliveryStatus || (enquiry.status === 'Rejected' ? 'Rejected' : (enquiry.status?.includes('Approved') ? 'Approved' : 'Pending Approval')),
        customerName: enquiry.customerName,
        phone: enquiry.phone,
        whatsappNumber: enquiry.whatsappNumber,
        locality: enquiry.locality || 'Kanpur Road, Lucknow',
        eventVenueAddress: enquiry.eventVenueAddress || 'Lucknow, Uttar Pradesh',
        landmark: enquiry.landmark || enquiry.eventVenueAddress || 'Near Kanpur Road / Daroga Kheda',
        eventDate: enquiry.eventDate || enquiry.startDate,
        startDate: enquiry.startDate || enquiry.eventDate,
        endDate: enquiry.endDate || enquiry.startDate || enquiry.eventDate,
        rentalDays: enquiry.rentalDays || 1,
        items: enquiry.items || enquiry.lineItems || [],
        subtotal,
        cartage,
        labour,
        gst,
        grandTotal,
        advancePaid: enquiry.advancePaid || 0,
        balanceDue: enquiry.balanceDue !== undefined ? enquiry.balanceDue : grandTotal,
        paymentStatus: enquiry.paymentStatus || (enquiry.advancePaid > 0 ? 'Partially Paid' : 'Pending Payment'),
        deliveryPartner: enquiry.deliveryPartner || null,
        estimatedDeliveryTime: enquiry.estimatedDeliveryTime || 'Scheduled for punctual morning delivery on event date',
        deliveryTimeline: enquiry.deliveryTimeline || [
          {
            status: 'Order Placed',
            note: 'Order received and awaiting admin review.',
            timestamp: enquiry.createdAt || new Date().toISOString()
          }
        ],
        rejectionReason: enquiry.rejectionReason || null,
        createdAt: enquiry.createdAt
      }
    });
  } catch (error) {
    console.error('getOrderTrackingInfo error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve order tracking info.' });
  }
};

module.exports = {
  getDeliveryPartners,
  createDeliveryPartner,
  updateDeliveryPartner,
  deleteDeliveryPartner,
  assignPartnerToOrder,
  updateOrderDeliveryStatus,
  getOrderTrackingInfo
};
