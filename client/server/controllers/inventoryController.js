const { getLocalDb, saveLocalStore } = require('../config/db');

// Ensure inventory array is initialized with seed items
const ensureInventoryInit = (db) => {
  if (!db.inventory || db.inventory.length === 0) {
    db.inventory = [
      {
        id: 'inv-chair-pvc',
        name: 'PVC Plastic Chairs',
        category: 'Chairs & Seating',
        totalQuantity: 800,
        availableQuantity: 720,
        reservedQuantity: 80,
        rentedQuantity: 0,
        damagedQuantity: 0,
        maintenanceStatus: 'Good',
        unit: 'pieces',
        dailyRate: 15,
        notes: 'Durable white PVC armless banquet chairs.',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'inv-chair-velvet',
        name: 'Velvet-Covered Banquet Chairs',
        category: 'Chairs & Seating',
        totalQuantity: 450,
        availableQuantity: 400,
        reservedQuantity: 50,
        rentedQuantity: 0,
        damagedQuantity: 5,
        maintenanceStatus: 'Good',
        unit: 'pieces',
        dailyRate: 45,
        notes: 'Chairs with tailored velvet slipcovers and golden bows.',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'inv-chair-highback',
        name: 'High-Back Covered Chairs',
        category: 'Chairs & Seating',
        totalQuantity: 250,
        availableQuantity: 220,
        reservedQuantity: 30,
        rentedQuantity: 0,
        damagedQuantity: 0,
        maintenanceStatus: 'Good',
        unit: 'pieces',
        dailyRate: 75,
        notes: 'High-back luxury banquet chairs for main VIP family tables.',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'inv-sofa-2seater',
        name: 'Two-Seater Maharaja Sofas',
        category: 'Chairs & Seating',
        totalQuantity: 40,
        availableQuantity: 32,
        reservedQuantity: 8,
        rentedQuantity: 0,
        damagedQuantity: 0,
        maintenanceStatus: 'Good',
        unit: 'pieces',
        dailyRate: 800,
        notes: 'Royal golden carved two-seater sofas with maroon/cream velvet cushions.',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'inv-table-set',
        name: 'Standard Table Set (2.5 × 5 ft)',
        category: 'Tables',
        totalQuantity: 120,
        availableQuantity: 105,
        reservedQuantity: 15,
        rentedQuantity: 0,
        damagedQuantity: 2,
        maintenanceStatus: 'Good',
        unit: 'sets',
        dailyRate: 75,
        notes: 'Rectangular catering and dining tables with linen covers.',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'inv-table-round',
        name: 'Round Tables with Cover',
        category: 'Tables',
        totalQuantity: 50,
        availableQuantity: 42,
        reservedQuantity: 8,
        rentedQuantity: 0,
        damagedQuantity: 0,
        maintenanceStatus: 'Good',
        unit: 'pieces',
        dailyRate: 200,
        notes: '5-foot round banquet tables for 8 guests with satin table covers.',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'inv-table-center',
        name: 'Centre Tables (Coffee Tables)',
        category: 'Tables',
        totalQuantity: 30,
        availableQuantity: 26,
        reservedQuantity: 4,
        rentedQuantity: 0,
        damagedQuantity: 0,
        maintenanceStatus: 'Good',
        unit: 'pieces',
        dailyRate: 400,
        notes: 'VIP lounge coffee tables with glass tops.',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'inv-winter-gadda',
        name: 'Winter Gadda Sets (Baithak)',
        category: 'Chairs & Seating',
        totalQuantity: 60,
        availableQuantity: 55,
        reservedQuantity: 5,
        rentedQuantity: 0,
        damagedQuantity: 0,
        maintenanceStatus: 'Good',
        unit: 'sets',
        dailyRate: 150,
        notes: 'Cotton quilted floor mattress with crisp white bedsheet and bolster pillows.',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'inv-jumbo-cooler',
        name: 'Jumbo Desert Coolers',
        category: 'Fans & Coolers',
        totalQuantity: 25,
        availableQuantity: 20,
        reservedQuantity: 5,
        rentedQuantity: 0,
        damagedQuantity: 2,
        maintenanceStatus: 'Needs Repair',
        unit: 'pieces',
        dailyRate: 1500,
        notes: 'Industrial metal coolers with high-airflow motors and submersible pumps.',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'inv-tent-normal',
        name: 'Normal Shamiana Tents (10,000 sq.ft)',
        category: 'Tents & Canopies',
        totalQuantity: 10000,
        availableQuantity: 8000,
        reservedQuantity: 2000,
        rentedQuantity: 0,
        damagedQuantity: 0,
        maintenanceStatus: 'Good',
        unit: 'sq.ft',
        dailyRate: 5,
        notes: 'Multi-color and royal maroon ceiling shamianas with sidewalls.',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'inv-tent-waterproof',
        name: 'Waterproof German Hangar Panels',
        category: 'Tents & Canopies',
        totalQuantity: 8000,
        availableQuantity: 6500,
        reservedQuantity: 1500,
        rentedQuantity: 0,
        damagedQuantity: 0,
        maintenanceStatus: 'Good',
        unit: 'sq.ft',
        dailyRate: 30,
        notes: 'Heavy curved aluminum German hangar with weatherproof white PVC sheet.',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'inv-carpet-red',
        name: 'Red Velvet Walkway Carpets',
        category: 'Wedding & Party Essentials',
        totalQuantity: 4000,
        availableQuantity: 3400,
        reservedQuantity: 600,
        rentedQuantity: 0,
        damagedQuantity: 0,
        maintenanceStatus: 'Good',
        unit: 'sq.ft',
        dailyRate: 3,
        notes: 'Ceremonial red passage runner and VIP carpet.',
        updatedAt: new Date().toISOString()
      }
    ];
  }

  if (!db.inventoryAuditLogs) {
    db.inventoryAuditLogs = [];
  }
};

/**
 * GET /api/inventory
 * List all physical inventory stock items
 */
const getInventory = (req, res) => {
  try {
    const db = getLocalDb();
    ensureInventoryInit(db);
    return res.json({
      success: true,
      count: db.inventory.length,
      data: db.inventory,
      auditLogs: (db.inventoryAuditLogs || []).slice(-20).reverse()
    });
  } catch (error) {
    console.error('getInventory error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving inventory' });
  }
};

/**
 * POST /api/inventory/adjust
 * Record a stock adjustment (Addition, Damage, Maintenance, Correction)
 */
const adjustInventory = (req, res) => {
  try {
    const { itemId, action, adjustmentType, quantity, reason, notes, maintenanceStatus } = req.body;
    const adjType = action || adjustmentType;
    const db = getLocalDb();
    ensureInventoryInit(db);

    const item = db.inventory.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive quantity required' });
    }

    const prevTotal = item.totalQuantity;
    const prevAvailable = item.availableQuantity;
    const prevDamaged = item.damagedQuantity;

    switch (adjType) {
      case 'add_stock':
        item.totalQuantity += qty;
        item.availableQuantity += qty;
        break;

      case 'record_damage':
        if (item.availableQuantity < qty) {
          return res.status(400).json({
            success: false,
            message: `Cannot record ${qty} damaged units. Only ${item.availableQuantity} currently available in stock.`
          });
        }
        item.availableQuantity -= qty;
        item.damagedQuantity = (item.damagedQuantity || 0) + qty;
        if (maintenanceStatus) item.maintenanceStatus = maintenanceStatus;
        break;

      case 'repair_completed':
        if ((item.damagedQuantity || 0) < qty) {
          return res.status(400).json({
            success: false,
            message: `Cannot return ${qty} units from repair. Only ${item.damagedQuantity || 0} marked as damaged.`
          });
        }
        item.damagedQuantity = Math.max(0, (item.damagedQuantity || 0) - qty);
        item.availableQuantity += qty;
        if (item.damagedQuantity === 0) item.maintenanceStatus = 'Good';
        break;

      case 'correction':
        item.totalQuantity = qty;
        item.availableQuantity = Math.max(0, qty - (item.reservedQuantity || 0) - (item.damagedQuantity || 0));
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid adjustment type: ' + adjType });
    }

    item.updatedAt = new Date().toISOString();

    const logEntry = {
      id: 'log-' + Date.now(),
      itemId: item.id,
      itemName: item.name,
      action: adjType,
      adjustmentType: adjType,
      quantity: qty,
      reason: reason || notes || 'Admin stock update',
      notes: notes || reason || 'Admin stock update',
      previousState: { total: prevTotal, available: prevAvailable, damaged: prevDamaged },
      newState: { total: item.totalQuantity, available: item.availableQuantity, damaged: item.damagedQuantity },
      performedBy: req.user ? (req.user.email || req.user.username) : 'Admin',
      timestamp: new Date().toISOString()
    };

    if (!db.inventoryAuditLogs) db.inventoryAuditLogs = [];
    db.inventoryAuditLogs.push(logEntry);
    saveLocalStore();

    return res.json({
      success: true,
      message: `Inventory updated for ${item.name}`,
      item,
      data: item,
      log: logEntry
    });
  } catch (error) {
    console.error('adjustInventory error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating inventory' });
  }
};

/**
 * PUT /api/inventory/:id
 * Edit inventory item details
 */
const updateInventoryItem = (req, res) => {
  try {
    const { id } = req.params;
    const { name, dailyRate, notes, maintenanceStatus } = req.body;
    const db = getLocalDb();
    ensureInventoryInit(db);

    const item = db.inventory.find(i => i.id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    if (name) item.name = name.trim();
    if (dailyRate !== undefined) item.dailyRate = Number(dailyRate);
    if (notes !== undefined) item.notes = notes.trim();
    if (maintenanceStatus) item.maintenanceStatus = maintenanceStatus;
    item.updatedAt = new Date().toISOString();

    saveLocalStore();
    return res.json({ success: true, message: 'Item details saved', data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error updating item' });
  }
};

/**
 * GET /api/inventory/logs
 * Retrieve inventory audit trail logs
 */
const getInventoryLogs = (req, res) => {
  try {
    const db = getLocalDb();
    ensureInventoryInit(db);
    return res.json({
      success: true,
      count: (db.inventoryAuditLogs || []).length,
      data: (db.inventoryAuditLogs || []).slice(-50).reverse()
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error retrieving logs' });
  }
};

module.exports = {
  getInventory,
  adjustInventory,
  updateInventoryItem,
  getInventoryLogs,
  ensureInventoryInit
};
