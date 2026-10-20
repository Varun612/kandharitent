const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venueController');
const { requireAdminAuth } = require('../middleware/authMiddleware');

// Public route to view venue details
router.get('/', venueController.getVenueDetails);
router.get('/reels', venueController.getLawnReels);
router.get('/video', venueController.getVenueVideo);

// Protected Admin routes
router.put('/', requireAdminAuth, venueController.updateVenueDetails);
router.put('/reels/:id', requireAdminAuth, venueController.updateLawnReel);
router.post('/amenities', requireAdminAuth, venueController.addAmenity);
router.delete('/amenities/:id', requireAdminAuth, venueController.deleteAmenity);

module.exports = router;
