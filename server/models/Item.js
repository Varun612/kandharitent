const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  categoryId: { type: String, required: true },
  description: { type: String, required: true },
  availableQuantity: { type: Number, default: 0, min: 0 },
  availabilityStatus: {
    type: String,
    enum: ['Available', 'Limited', 'Out of Stock'],
    default: 'Available'
  },
  internalNotes: { type: String, default: '' },
  imageUrl: { type: String, required: true },
  featured: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Item', itemSchema);
