const mongoose = require('mongoose');

const amenitySchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: 'CheckCircle' }
});

const venueImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  caption: { type: String, default: '' }
});

const venueSchema = new mongoose.Schema({
  name: { type: String, default: 'Dwarka Shri Lawn' },
  brandTagline: { type: String, default: 'Dwarka Shri Lawn (Managed by Kandhari Tent & Caterers)' },
  headline: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, default: 'Opp. Pillar No. 37, Daroga Kheda, Kanpur Road, Lucknow, Uttar Pradesh' },
  city: { type: String, default: 'Lucknow' },
  state: { type: String, default: 'Uttar Pradesh' },
  phoneNumbers: [{ type: String }],
  primaryPhone: { type: String, default: () => process.env.BUSINESS_TOLL_FREE_NUMBER || '' },
  whatsappPhone: { type: String, default: () => process.env.PUBLIC_WHATSAPP_PHONE || '' },
  email: { type: String, default: 'contact@kandharitent.com' },
  suitableEvents: [{ type: String }],
  amenities: [amenitySchema],
  images: [venueImageSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Venue', venueSchema);
