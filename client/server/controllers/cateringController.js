const { isMongoConnected, getLocalDb, saveLocalStore } = require('../config/db');

/**
 * GET /api/catering/menu
 * Returns full catering categories with selection rules and dishes list.
 */
const getCateringMenu = async (req, res) => {
  try {
    const { category, activeOnly = 'true' } = req.query;
    const db = getLocalDb();

    let categories = db.cateringCategories || [];
    let items = db.cateringMenu || [];

    if (activeOnly === 'true') {
      items = items.filter(it => it.isActive !== false);
    }

    if (category && category !== 'All') {
      items = items.filter(it => it.category === category || it.categorySlug === category);
    }

    // Sort items by order
    items.sort((a, b) => (a.order || 0) - (b.order || 0));

    return res.json({
      success: true,
      count: items.length,
      categories,
      data: items
    });
  } catch (error) {
    console.error('Error in getCateringMenu:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving catering menu' });
  }
};

/**
 * GET /api/catering/categories
 * Returns catering categories with selection allowance rules
 */
const getCateringCategories = async (req, res) => {
  try {
    const db = getLocalDb();
    const categories = db.cateringCategories || [];
    return res.json({ success: true, data: categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error retrieving categories' });
  }
};

/**
 * POST /api/catering/items (Admin)
 * Add a new dish to the catering menu
 */
const addCateringItem = async (req, res) => {
  try {
    const { name, category, categorySlug, description, selectionRule, maxSelect, dietary, isPopular, order } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Dish name and category are required' });
    }

    const db = getLocalDb();
    if (!db.cateringMenu) db.cateringMenu = [];

    const newItem = {
      id: 'cat-dish-' + Date.now(),
      name: name.trim(),
      category: category.trim(),
      categorySlug: categorySlug || category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description ? description.trim() : '',
      selectionRule: selectionRule || 'Any 2',
      maxSelect: Number(maxSelect) || 2,
      dietary: dietary || 'Veg',
      isPopular: Boolean(isPopular),
      isActive: true,
      order: Number(order) || (db.cateringMenu.length + 1)
    };

    db.cateringMenu.push(newItem);
    saveLocalStore();

    return res.status(201).json({
      success: true,
      data: newItem,
      message: 'Catering dish added successfully'
    });
  } catch (error) {
    console.error('Error adding catering item:', error);
    return res.status(500).json({ success: false, message: 'Server error adding dish' });
  }
};

/**
 * PUT /api/catering/items/:id (Admin)
 * Update existing catering dish
 */
const updateCateringItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = getLocalDb();

    if (!db.cateringMenu) db.cateringMenu = [];

    const idx = db.cateringMenu.findIndex(it => it.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Dish not found' });
    }

    db.cateringMenu[idx] = {
      ...db.cateringMenu[idx],
      ...updates
    };

    saveLocalStore();

    return res.json({
      success: true,
      data: db.cateringMenu[idx],
      message: 'Dish updated successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error updating dish' });
  }
};

/**
 * DELETE /api/catering/items/:id (Admin)
 * Deactivate or remove dish from menu
 */
const deleteCateringItem = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getLocalDb();

    if (!db.cateringMenu) db.cateringMenu = [];

    const prevCount = db.cateringMenu.length;
    db.cateringMenu = db.cateringMenu.filter(it => it.id !== id);

    if (db.cateringMenu.length === prevCount) {
      return res.status(404).json({ success: false, message: 'Dish not found' });
    }

    saveLocalStore();

    return res.json({
      success: true,
      message: 'Dish removed successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error deleting dish' });
  }
};

/**
 * POST /api/catering/enquire
 * Customer submits chosen catering menu for quotation
 * Integrated with customer auth & notifications; NO customer-facing ticket numbers.
 */
const submitCateringEnquiry = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      phone,
      whatsappNumber,
      customerEmail,
      email,
      eventDate,
      guestCount,
      eventVenue,
      locality,
      selectedDishes,
      specialInstructions,
      userId
    } = req.body;

    const finalPhone = (customerPhone || phone || whatsappNumber || '').toString().trim();
    const finalEmail = (customerEmail || email || '').toString().trim();

    if (!customerName || !finalPhone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone number are required to request a catering quotation'
      });
    }

    const dishesList = Array.isArray(selectedDishes) ? selectedDishes : [];

    const enquiryRecord = {
      id: 'ENQ-' + Date.now(),
      customerName: customerName.trim(),
      customerPhone: finalPhone,
      phone: finalPhone,
      customerEmail: finalEmail,
      email: finalEmail,
      serviceType: 'Catering & Banquet Service',
      serviceRequired: 'Awadhi Royal Catering & Banquet Menu',
      eventDate: eventDate || '',
      guestCount: Number(guestCount) || 200,
      locality: eventVenue || locality || 'Dwarka Shri Lawn, Kanpur Road',
      specialInstructions: specialInstructions || '',
      status: 'New',
      source: 'Catering Menu Builder',
      userId: userId || null,
      customMenu: dishesList,
      totalDishesSelected: dishesList.length,
      createdAt: new Date().toISOString(),
      notes: `Custom catering quotation requested for ${guestCount || 'unspecified'} guests with ${dishesList.length} selected dishes.`
    };

    const db = getLocalDb();
    if (!db.enquiries) db.enquiries = [];
    db.enquiries.unshift(enquiryRecord);
    saveLocalStore();

    // Reassuring confirmation without exposing internal reference/ticket numbers
    return res.status(201).json({
      success: true,
      message: 'Thank you for contacting Kandhari Tent & Caterers! Your catering inquiry has been received successfully. Our catering manager will review your chosen menu and get in touch with you shortly with a tailored quotation.',
      data: {
        customerName: enquiryRecord.customerName,
        eventDate: enquiryRecord.eventDate,
        guestCount: enquiryRecord.guestCount,
        dishesCount: dishesList.length
      }
    });
  } catch (error) {
    console.error('Error submitting catering enquiry:', error);
    return res.status(500).json({ success: false, message: 'Server error processing catering enquiry' });
  }
};

module.exports = {
  getCateringMenu,
  getCateringCategories,
  addCateringItem,
  updateCateringItem,
  deleteCateringItem,
  submitCateringEnquiry
};
