const { isMongoConnected, getLocalDb, saveLocalStore } = require('../config/db');
const Gallery = require('../models/Gallery');

// GET /api/gallery - Retrieve gallery items, optional category filter
const getGalleryItems = async (req, res) => {
  try {
    const { category, section, featuredOnly } = req.query;
    const filterCat = category || section;

    const db = getLocalDb();
    let items = db.gallery ? [...db.gallery] : [];

    // Filter by active status (default show active)
    items = items.filter(it => it.active !== false);

    if (filterCat && filterCat !== 'All') {
      items = items.filter(it => 
        (it.category && it.category.toLowerCase() === filterCat.toLowerCase()) ||
        (it.categorySlug && it.categorySlug.toLowerCase() === filterCat.toLowerCase())
      );
    }

    if (featuredOnly === 'true') {
      items = items.filter(it => it.featured === true);
    }

    const categories = db.galleryCategories || [
      'Actual wedding and reception setups',
      'Dwarka Shri Lawn venue and grounds',
      'Stage and mandap designs',
      'Tent structures and canopy layouts',
      'Seating and furniture arrangements',
      'Floral and lighting decor',
      'Catering and food counters'
    ];

    return res.json({
      success: true,
      count: items.length,
      categories,
      data: items
    });
  } catch (error) {
    console.error('Error in getGalleryItems:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving gallery items' });
  }
};

// POST /api/gallery (Admin) - Add a new gallery item
const addGalleryItem = async (req, res) => {
  try {
    const { title, category, categorySlug, imageUrl, caption, eventType, tags, featured } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({ success: false, message: 'Image title and image URL are required' });
    }

    const newItem = {
      id: 'gal-' + Date.now(),
      title: title.trim(),
      category: category || 'Actual wedding and reception setups',
      categorySlug: categorySlug || (category || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      eventType: eventType || 'Wedding',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : ['Wedding']),
      imageUrl: imageUrl.trim(),
      caption: caption ? caption.trim() : '',
      featured: Boolean(featured),
      active: true,
      createdAt: new Date().toISOString()
    };

    const db = getLocalDb();
    if (!db.gallery) db.gallery = [];
    db.gallery.unshift(newItem);
    saveLocalStore();

    return res.status(201).json({ success: true, data: newItem, message: 'Photo added to gallery successfully' });
  } catch (error) {
    console.error('Error adding gallery item:', error);
    return res.status(500).json({ success: false, message: 'Server error adding gallery item' });
  }
};

// PUT /api/gallery/:id (Admin) - Update existing gallery item
const updateGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = getLocalDb();

    if (!db.gallery) db.gallery = [];

    const idx = db.gallery.findIndex(it => it.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }

    db.gallery[idx] = {
      ...db.gallery[idx],
      ...updates
    };

    saveLocalStore();

    return res.json({
      success: true,
      data: db.gallery[idx],
      message: 'Gallery item updated successfully'
    });
  } catch (error) {
    console.error('Error updating gallery item:', error);
    return res.status(500).json({ success: false, message: 'Server error updating gallery item' });
  }
};

// DELETE /api/gallery/:id (Admin) - Remove a gallery item
const deleteGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getLocalDb();

    if (!db.gallery) db.gallery = [];

    const prev = db.gallery.length;
    db.gallery = db.gallery.filter(it => it.id !== id);

    if (db.gallery.length === prev) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }

    saveLocalStore();

    return res.json({ success: true, message: 'Gallery item removed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error deleting gallery item' });
  }
};

module.exports = {
  getGalleryItems,
  addGalleryItem,
  updateGalleryItem,
  deleteGalleryItem
};
