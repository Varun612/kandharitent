const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venueController');
const { requireAdminAuth } = require('../middleware/authMiddleware');

// Public route to view venue details
router.get('/', venueController.getVenueDetails);

// Protected Admin routes
router.put('/', requireAdminAuth, venueController.updateVenueDetails);
router.post('/amenities', requireAdminAuth, venueController.addAmenity);
router.delete('/amenities/:id', requireAdminAuth, venueController.deleteAmenity);

module.exports = router;
