const mongoose = require('mongoose');

const requestedItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 }
});

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
  locality: { type: String, default: 'Kanpur Road, Lucknow' },
  eventVenueAddress: { type: String, default: '' },
  eventType: { type: String, default: 'Wedding / Celebration' },
  guestCount: { type: Number, default: 0 },
  budgetRange: { type: String, default: 'Flexible' },
  items: [requestedItemSchema],
  notes: { type: String, default: '' },
  detailedRequirements: { type: String, default: '' },
  consentGiven: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'In Discussion', 'Quoted', 'Converted', 'Closed'],
    default: 'New'
  },
  referredTo: { type: String, default: '' },
  nextFollowUpDate: { type: String, default: '' },
  internalNotes: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Enquiry', enquirySchema);
