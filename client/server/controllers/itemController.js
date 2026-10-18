const { isMongoConnected, getLocalDb, saveLocalStore } = require('../config/db');
const Item = require('../models/Item');

// GET /api/items - Retrieve all items with search, category filtering & sorting
const getItems = async (req, res) => {
  try {
    const { search, category, status, sort, featured } = req.query;

    if (isMongoConnected()) {
      let query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      if (category && category !== 'all') {
        query.$or = [
          { category: category },
          { categoryId: category }
        ];
      }
      if (status && status !== 'all') {
        query.availabilityStatus = status;
      }
      if (featured === 'true') {
        query.featured = true;
      }

      let sortOption = { name: 1 };
      if (sort === 'name_desc') sortOption = { name: -1 };
      if (sort === 'popular') sortOption = { featured: -1, name: 1 };

      const items = await Item.find(query).sort(sortOption);
      return res.json({ success: true, count: items.length, data: items });
    }

    // LocalStore fallback
    let items = [...getLocalDb().items];

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(it => 
        it.name.toLowerCase().includes(q) || 
        it.description.toLowerCase().includes(q)
      );
    }

    if (category && category !== 'all') {
      const catLower = category.toLowerCase();
      items = items.filter(it => 
        (it.categoryId && it.categoryId.toLowerCase() === catLower) ||
        (it.category && it.category.toLowerCase() === catLower)
      );
    }

    if (status && status !== 'all') {
      items = items.filter(it => it.availabilityStatus === status);
    }

    if (featured === 'true') {
      items = items.filter(it => it.featured);
    }

    if (sort === 'name_desc') {
      items.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sort === 'popular') {
      items.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    } else {
      items.sort((a, b) => a.name.localeCompare(b.name));
    }

    return res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    console.error('Error in getItems:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving items' });
  }
};

// GET /api/items/categories - Retrieve list of available categories
const getCategories = async (req, res) => {
  try {
    const db = getLocalDb();
    return res.json({ success: true, data: db.categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error retrieving categories' });
  }
};

// GET /api/items/:id - Retrieve single item
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const item = await Item.findOne({ $or: [{ id }, { _id: id }] });
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found' });
      }
      return res.json({ success: true, data: item });
    }

    const item = getLocalDb().items.find(it => it.id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    return res.json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error retrieving item' });
  }
};

// POST /api/items (Admin) - Create new item
const createItem = async (req, res) => {
  try {
    const { name, category, description, availableQuantity, availabilityStatus, internalNotes, imageUrl, featured } = req.body;
    const newItemId = 'item-' + Date.now();
    const categoryId = category.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const itemData = {
      id: newItemId,
      name,
      category,
      categoryId,
      description,
      availableQuantity: parseInt(availableQuantity, 10) || 0,
      availabilityStatus: availabilityStatus || 'Available',
      internalNotes: internalNotes || '',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
      featured: !!featured
    };

    if (isMongoConnected()) {
      const createdItem = await Item.create(itemData);
      return res.status(201).json({ success: true, data: createdItem, message: 'Item added successfully' });
    }

    const db = getLocalDb();
    db.items.unshift(itemData);
    saveLocalStore();

    return res.status(201).json({ success: true, data: itemData, message: 'Item added successfully' });
  } catch (error) {
    console.error('Error creating item:', error);
    return res.status(500).json({ success: false, message: 'Server error creating item' });
  }
};

// PUT /api/items/:id (Admin) - Update existing item
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (isMongoConnected()) {
      const item = await Item.findOneAndUpdate(
        { $or: [{ id }, { _id: id }] },
        updates,
        { new: true }
      );
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found' });
      }
      return res.json({ success: true, data: item, message: 'Item updated successfully' });
    }

    const db = getLocalDb();
    const index = db.items.findIndex(it => it.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    db.items[index] = { ...db.items[index], ...updates };
    saveLocalStore();

    return res.json({ success: true, data: db.items[index], message: 'Item updated successfully' });
  } catch (error) {
    console.error('Error updating item:', error);
    return res.status(500).json({ success: false, message: 'Server error updating item' });
  }
};

// DELETE /api/items/:id (Admin) - Delete an item
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const deleted = await Item.findOneAndDelete({ $or: [{ id }, { _id: id }] });
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Item not found' });
      }
      return res.json({ success: true, message: 'Item removed successfully' });
    }

    const db = getLocalDb();
    const prevLength = db.items.length;
    db.items = db.items.filter(it => it.id !== id);
    if (db.items.length === prevLength) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    saveLocalStore();

    return res.json({ success: true, message: 'Item removed successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting item' });
  }
};

module.exports = {
  getItems,
  getCategories,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};
