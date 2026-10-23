// server/controllers/settingsController.js
// Central Business Settings Controller

const { getLocalDb, saveLocalStore } = require('../config/db');

const DEFAULT_SETTINGS = {
  businessName: 'Kandhari Tent & Caterers',
  signatureVenue: 'Dwarka Shri Lawn',
  address: 'Opp. Pillar No. 37, Daroga Kheda, Kanpur Road, Lucknow, Uttar Pradesh 226008',
  tollFreeNumber: process.env.BUSINESS_TOLL_FREE_NUMBER || '1800-890-3456',
  tollFreeActive: true,
  publicWhatsApp: process.env.PUBLIC_WHATSAPP_PHONE || '9118008903456',
  minOrderValue: 5000,
  standardAdvancePercentage: 50,
  taxRatePercent: 18,
  aiReceptionist: {
    name: 'Veronica',
    active: true,
    disclosureMandatory: true,
    model: 'gemini-2.5-flash',
    voiceLanguage: 'en-IN'
  },
  venueCapacity: {
    maxGuests: 1200,
    parkingBays: 200,
    bridalSuites: 2,
    generatorKVA: 62.5
  },
  updatedAt: new Date().toISOString()
};

const getSettings = (req, res) => {
  try {
    const db = getLocalDb();
    if (!db.settings) {
      db.settings = { ...DEFAULT_SETTINGS };
      saveLocalStore();
    }
    return res.json({
      success: true,
      data: db.settings
    });
  } catch (error) {
    console.error('getSettings error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve business settings' });
  }
};

const updateSettings = (req, res) => {
  try {
    const db = getLocalDb();
    if (!db.settings) db.settings = { ...DEFAULT_SETTINGS };

    const updates = req.body || {};
    db.settings = {
      ...db.settings,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    saveLocalStore();

    return res.json({
      success: true,
      message: 'Business settings updated successfully',
      data: db.settings
    });
  } catch (error) {
    console.error('updateSettings error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update business settings' });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
