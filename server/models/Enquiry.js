const mongoose = require('mongoose');

const requestedItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitRate: { type: Number, default: 0 },
  ratePerSqFt: { type: Number, default: 0 },
  billingUnit: { type: String, default: '' },
  isAreaBased: { type: Boolean, default: false },
  length: { type: Number, default: 0 },
  width: { type: Number, default: 0 },
  dimensions: { type: String, default: '' },
  areaSqFt: { type: Number, default: 0 },
  durationSensitive: { type: Boolean, default: false },
  rentalDays: { type: Number, default: 1 },
  effectiveDays: { type: Number, default: 1 },
  lineTotal: { type: Number, default: 0 }
}, { _id: false });

const enquirySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customerId: { type: String, default: null }, // Linked customer user id if authenticated
  conversationId: { type: String, default: null }, // Linked AI chat conversation id if generated from chat
  enquiryType: {
    type: String,
    enum: ['rental', 'lawn', 'general', 'catering', 'site_visit', 'chat'],
    default: 'rental'
  },
  customerName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  whatsappNumber: { type: String, trim: true, default: '' },
  email: { type: String, trim: true, default: '' },
  preferredContactMethod: {
    type: String,
    enum: ['Phone', 'WhatsApp', 'Email'],
    default: 'Phone'
  },
  serviceRequired: {
    type: String,
    default: 'Tent-house equipment rentals'
  },
  servicesList: [{ type: String }], // Array of services required for multi-service requests
  eventDate: { type: String, required: true },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  rentalDays: { type: Number, default: 1 },
  locality: { type: String, default: 'Kanpur Road, Lucknow' },
  eventVenueAddress: { type: String, default: '' },
  eventType: { type: String, default: 'Wedding / Celebration' },
  guestCount: { type: Number, default: 0 },
  budgetRange: { type: String, default: 'Flexible' },
  items: [requestedItemSchema],
  lineItems: [requestedItemSchema],
  subtotal: { type: Number, default: 0 },
  cartage: { type: Number, default: 0 },
  labour: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  discountReason: { type: String, default: '' },
  manualAdjustment: { type: Number, default: 0 },
  adjustmentReason: { type: String, default: '' },
  grandTotal: { type: Number, default: 0 },
  advancePaid: { type: Number, default: 0 },
  balanceDue: { type: Number, default: 0 },
  quotationNumber: { type: String, default: '' },
  quotationDate: { type: String, default: '' },
  quotationNotes: { type: String, default: '' },
  notes: { type: String, default: '' },
  detailedRequirements: { type: String, default: '' },
  consentGiven: { type: Boolean, default: true },
  status: {
    type: String,
    enum: [
      'New',
      'Under Review',
      'Quotation Prepared',
      'Confirmed',
      'Advance Pending',
      'Partially Paid',
      'Fully Paid',
      'Completed',
      'Cancelled',
      'Contacted',
      'In Discussion',
      'Quoted',
      'Converted',
      'Referred',
      'Closed'
    ],
    default: 'New'
  },
  referredTo: { type: String, default: '' },
  nextFollowUpDate: { type: String, default: '' },
  internalNotes: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Enquiry', enquirySchema);
