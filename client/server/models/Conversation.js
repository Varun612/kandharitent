const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  intent: { type: String, default: null },
  galleryCategory: { type: String, default: null },
  galleryImages: [{
    id: String,
    title: String,
    imageUrl: String,
    caption: String,
    category: String
  }],
  timestamp: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customerId: { type: String, default: null }, // If authenticated customer
  status: {
    type: String,
    enum: ['active', 'submitted', 'closed'],
    default: 'active'
  },
  recognizedIntent: { type: String, default: 'general_inquiry' },
  // Structured state collected so far
  collectedState: {
    customerName: { type: String, default: '' },
    phone: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' },
    preferredContactMethod: { type: String, default: 'Phone' },
    eventType: { type: String, default: '' },
    eventDate: { type: String, default: '' },
    locality: { type: String, default: '' },
    guestCount: { type: Number, default: 0 },
    selectedServices: [{ type: String }],
    budget: { type: String, default: '' },
    specialRequests: { type: String, default: '' },
    enquiryReference: { type: String, default: null },
    consentGiven: { type: Boolean, default: false }
  },
  messages: [chatMessageSchema],
  lastActivityAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Conversation', conversationSchema);
