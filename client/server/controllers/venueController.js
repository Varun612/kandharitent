const { isMongoConnected, getLocalDb, saveLocalStore } = require('../config/db');
const Venue = require('../models/Venue');

// GET /api/venue - Public endpoint to retrieve venue & lawn details
const getVenueDetails = async (req, res) => {
  try {
    if (isMongoConnected()) {
      let venue = await Venue.findOne();
      if (!venue) {
        const db = getLocalDb();
        venue = await Venue.create(db.venue);
      }
      return res.json({ success: true, data: venue });
    }

    const db = getLocalDb();
    return res.json({ success: true, data: db.venue });
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

module.exports = {
  getVenueDetails,
  updateVenueDetails,
  addAmenity,
  deleteAmenity
};
