const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: {
    type: String,
    enum: [
      'Entrances',
      'Floral decoration',
      'Lighting',
      'Stage and mandap',
      'Tent structures',
      'Catering',
      'Lawn and venue',
      'Other events'
    ],
    required: true
  },
  imageUrl: { type: String, required: true },
  caption: { type: String, default: '' },
  featured: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Gallery', gallerySchema);
