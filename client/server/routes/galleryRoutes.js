const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const { requireAdminAuth } = require('../middleware/authMiddleware');

// Public route to view gallery items
router.get('/', galleryController.getGalleryItems);

// Protected Admin routes
router.post('/', requireAdminAuth, galleryController.addGalleryItem);
router.put('/:id', requireAdminAuth, galleryController.updateGalleryItem);
router.delete('/:id', requireAdminAuth, galleryController.deleteGalleryItem);

module.exports = router;
