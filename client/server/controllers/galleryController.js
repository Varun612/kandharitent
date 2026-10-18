const { isMongoConnected, getLocalDb, saveLocalStore } = require('../config/db');
const Gallery = require('../models/Gallery');

// GET /api/gallery - Retrieve gallery items, optional category filter
const getGalleryItems = async (req, res) => {
  try {
    const { category } = req.query;

    if (isMongoConnected()) {
      let query = {};
      if (category && category !== 'All') {
        query.category = category;
      }
      const items = await Gallery.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: items.length, data: items });
    }

    let items = [...getLocalDb().gallery];
    if (category && category !== 'All') {
      items = items.filter(it => it.category === category);
    }

    return res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    console.error('Error in getGalleryItems:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving gallery items' });
  }
};

// POST /api/gallery (Admin) - Add a new gallery item
const addGalleryItem = async (req, res) => {
  try {
    const { title, category, imageUrl, caption } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({ success: false, message: 'Image title and image URL are required' });
    }

    const newItem = {
      id: 'gal-' + Date.now(),
      title: title.trim(),
      category: category || 'Weddings',
      imageUrl: imageUrl.trim(),
      caption: caption ? caption.trim() : ''
    };

    if (isMongoConnected()) {
      const created = await Gallery.create(newItem);
      return res.status(201).json({ success: true, data: created, message: 'Photo added to gallery successfully' });
    }

    const db = getLocalDb();
    db.gallery.unshift(newItem);
    saveLocalStore();

    return res.status(201).json({ success: true, data: newItem, message: 'Photo added to gallery successfully' });
  } catch (error) {
    console.error('Error adding gallery item:', error);
    return res.status(500).json({ success: false, message: 'Server error adding gallery item' });
  }
};

// DELETE /api/gallery/:id (Admin) - Remove a gallery item
const deleteGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const deleted = await Gallery.findOneAndDelete({ $or: [{ id }, { _id: id }] });
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Gallery item not found' });
      }
      return res.json({ success: true, message: 'Gallery item removed successfully' });
    }

    const db = getLocalDb();
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
  deleteGalleryItem
};
