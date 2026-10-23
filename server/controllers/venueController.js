const { isMongoConnected, getLocalDb, saveLocalStore } = require('../config/db');
const Venue = require('../models/Venue');

const sanitizePublicVenue = (venue) => {
  if (!venue) return venue;
  const clone = typeof venue.toObject === 'function' ? venue.toObject() : { ...venue };
  clone.primaryPhone = '+91 9305465848';
  clone.secondaryPhone = '+91 7355059566';
  clone.coordinatorPhone = '+91 9307908994';
  clone.whatsappPhone = '919305465848';
  clone.phoneNumbers = ['+91 9305465848', '+91 7355059566', '+91 9307908994'];
  clone.founder = 'Shri Mahendra Kandhari';
  return clone;
};

// GET /api/venue - Public endpoint to retrieve venue & lawn details
const getVenueDetails = async (req, res) => {
  try {
    if (isMongoConnected()) {
      let venue = await Venue.findOne();
      if (!venue) {
        const db = getLocalDb();
        venue = await Venue.create(db.venue);
      }
      return res.json({ success: true, data: sanitizePublicVenue(venue) });
    }

    const db = getLocalDb();
    return res.json({ success: true, data: sanitizePublicVenue(db.venue) });
  } catch (error) {
    console.error('Error fetching venue details:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving venue details' });
  }
};

// PUT /api/venue (Admin) - Update venue details, description, amenities & photos
const updateVenueDetails = async (req, res) => {
  try {
    const updates = req.body;

    if (isMongoConnected()) {
      let venue = await Venue.findOne();
      if (!venue) {
        venue = await Venue.create(updates);
      } else {
        Object.assign(venue, updates);
        await venue.save();
      }
      return res.json({ success: true, data: venue, message: 'Venue details updated successfully' });
    }

    const db = getLocalDb();
    db.venue = { ...db.venue, ...updates };
    saveLocalStore();

    return res.json({ success: true, data: db.venue, message: 'Venue details updated successfully' });
  } catch (error) {
    console.error('Error updating venue details:', error);
    return res.status(500).json({ success: false, message: 'Server error updating venue details' });
  }
};

// POST /api/venue/amenities (Admin) - Add a new amenity
const addAmenity = async (req, res) => {
  try {
    const { title, description, icon } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Amenity title and description are required' });
    }

    const newAmenity = {
      id: 'amenity-' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      icon: icon || 'CheckCircle'
    };

    if (isMongoConnected()) {
      let venue = await Venue.findOne();
      if (!venue) {
        const db = getLocalDb();
        venue = await Venue.create(db.venue);
      }
      venue.amenities.push(newAmenity);
      await venue.save();
      return res.status(201).json({ success: true, data: venue.amenities, message: 'Amenity added successfully' });
    }

    const db = getLocalDb();
    if (!db.venue.amenities) db.venue.amenities = [];
    db.venue.amenities.push(newAmenity);
    saveLocalStore();

    return res.status(201).json({ success: true, data: db.venue.amenities, message: 'Amenity added successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error adding amenity' });
  }
};

// DELETE /api/venue/amenities/:id (Admin) - Delete an amenity
const deleteAmenity = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      let venue = await Venue.findOne();
      if (venue) {
        venue.amenities = venue.amenities.filter(a => a.id !== id);
        await venue.save();
      }
      return res.json({ success: true, message: 'Amenity removed successfully' });
    }

    const db = getLocalDb();
    if (db.venue.amenities) {
      db.venue.amenities = db.venue.amenities.filter(a => a.id !== id);
      saveLocalStore();
    }

    return res.json({ success: true, message: 'Amenity removed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error removing amenity' });
  }
};

// GET /api/venue/reels - Public endpoint to retrieve all 7 lawn reels
const getLawnReels = (req, res) => {
  try {
    const db = getLocalDb();
    const reels = (db.lawnReels || []).filter(r => r.isPublished !== false);
    return res.json({ success: true, count: reels.length, data: reels });
  } catch (error) {
    console.error('getLawnReels error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving lawn reels' });
  }
};

// PUT /api/venue/reels/:id - Admin endpoint to update reel title, description, or published status
const updateLawnReel = (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = getLocalDb();
    if (!db.lawnReels) db.lawnReels = [];

    const reel = db.lawnReels.find(r => r.id === id || r.filename === id);
    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    if (updates.title !== undefined) reel.title = updates.title;
    if (updates.description !== undefined) reel.description = updates.description;
    if (updates.category !== undefined) reel.category = updates.category;
    if (updates.isPublished !== undefined) reel.isPublished = updates.isPublished;
    if (updates.order !== undefined) reel.order = updates.order;

    saveLocalStore();
    return res.json({ success: true, data: reel, message: 'Reel updated successfully' });
  } catch (error) {
    console.error('updateLawnReel error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating reel' });
  }
};

// GET /api/venue/video - Public endpoint to retrieve raw venue source video info
const getVenueVideo = (req, res) => {
  try {
    const db = getLocalDb();
    return res.json({ success: true, data: db.venueVideo || null });
  } catch (error) {
    console.error('getVenueVideo error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving venue video' });
  }
};

module.exports = {
  getVenueDetails,
  updateVenueDetails,
  addAmenity,
  deleteAmenity,
  getLawnReels,
  updateLawnReel,
  getVenueVideo
};
