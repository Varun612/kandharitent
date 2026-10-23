// server/controllers/couponController.js
// Authoritative coupon management and discount validation engine

const { getLocalDb, saveLocalStore } = require('../config/db');

const ensureCouponsInit = (db) => {
  if (!db.coupons) {
    db.coupons = [
      {
        id: 'cpn-welcome100',
        code: 'WELCOME100',
        discountType: 'fixed',
        discountValue: 100,
        minOrderValue: 2000,
        description: 'First-time customer discount of ₹100 on rental bookings over ₹2,000',
        active: true,
        expiryDate: '2026-12-31',
        usedCount: 0,
        maxUses: 1000
      },
      {
        id: 'cpn-first200',
        code: 'FIRST200',
        discountType: 'fixed',
        discountValue: 200,
        minOrderValue: 5000,
        description: 'First-time grand event discount of ₹200 on bookings over ₹5,000',
        active: true,
        expiryDate: '2026-12-31',
        usedCount: 0,
        maxUses: 500
      },
      {
        id: 'cpn-earlybird10',
        code: 'EARLYBIRD10',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscount: 1500,
        minOrderValue: 10000,
        description: '10% Early Bird Discount (up to ₹1,500) for advance bookings over ₹10,000',
        active: true,
        expiryDate: '2026-12-31',
        usedCount: 0,
        maxUses: 200
      }
    ];
  }
};

/**
 * GET /api/coupons - List all coupons (Admin)
 */
const getCoupons = (req, res) => {
  try {
    const db = getLocalDb();
    ensureCouponsInit(db);
    return res.json({
      success: true,
      count: db.coupons.length,
      data: db.coupons
    });
  } catch (error) {
    console.error('getCoupons error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving coupons' });
  }
};

/**
 * POST /api/coupons/validate - Validate coupon code against subtotal (Public / Customer)
 */
const validateCoupon = (req, res) => {
  try {
    const { code, subtotal, orderAmount, amount } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, valid: false, message: 'Please enter a coupon code' });
    }

    const orderSubtotal = Number(subtotal || orderAmount || amount) || 0;
    const cleanCode = code.trim().toUpperCase();

    const db = getLocalDb();
    ensureCouponsInit(db);

    const coupon = db.coupons.find(c => c.code.toUpperCase() === cleanCode);
    if (!coupon) {
      return res.status(404).json({ success: false, valid: false, message: `Coupon "${cleanCode}" is invalid or does not exist.` });
    }

    if (!coupon.active) {
      return res.status(400).json({ success: false, valid: false, message: `Coupon "${cleanCode}" is currently inactive.` });
    }

    // Check expiry
    if (coupon.expiryDate) {
      const today = new Date().toISOString().split('T')[0];
      if (coupon.expiryDate < today) {
        return res.status(400).json({ success: false, valid: false, message: `Coupon "${cleanCode}" expired on ${coupon.expiryDate}.` });
      }
    }

    // Check usage limits
    if (coupon.maxUses && (coupon.usedCount || 0) >= coupon.maxUses) {
      return res.status(400).json({ success: false, valid: false, message: `Coupon "${cleanCode}" has reached its maximum usage limit.` });
    }

    // Check minimum order value
    if (coupon.minOrderValue && orderSubtotal < coupon.minOrderValue) {
      return res.status(200).json({
        success: false,
        valid: false,
        message: `Coupon "${cleanCode}" requires a minimum rental subtotal of ₹${coupon.minOrderValue.toLocaleString('en-IN')}. (Current: ₹${orderSubtotal.toLocaleString('en-IN')})`
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((orderSubtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      // Fixed discount
      discountAmount = coupon.discountValue;
    }

    // Ensure discount does not exceed subtotal
    discountAmount = Math.min(discountAmount, orderSubtotal);

    return res.json({
      success: true,
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      subtotal: orderSubtotal,
      finalTotal: Math.max(0, orderSubtotal - discountAmount),
      description: coupon.description,
      message: `Coupon "${cleanCode}" applied successfully! You saved ₹${discountAmount.toLocaleString('en-IN')}.`,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        subtotal: orderSubtotal,
        finalTotal: Math.max(0, orderSubtotal - discountAmount),
        description: coupon.description
      }
    });
  } catch (error) {
    console.error('validateCoupon error:', error);
    return res.status(500).json({ success: false, message: 'Server error validating coupon' });
  }
};

/**
 * POST /api/coupons - Create a new coupon (Admin)
 */
const createCoupon = (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscount, description, expiryDate, maxUses } = req.body;
    if (!code || !discountValue) {
      return res.status(400).json({ success: false, message: 'Coupon code and discountValue are required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const db = getLocalDb();
    ensureCouponsInit(db);

    if (db.coupons.some(c => c.code.toUpperCase() === cleanCode)) {
      return res.status(400).json({ success: false, message: `Coupon with code "${cleanCode}" already exists` });
    }

    const newCoupon = {
      id: 'cpn-' + Date.now().toString(36),
      code: cleanCode,
      discountType: discountType === 'percentage' ? 'percentage' : 'fixed',
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      description: description ? description.trim() : `Discount coupon ${cleanCode}`,
      active: true,
      expiryDate: expiryDate || '2026-12-31',
      usedCount: 0,
      maxUses: Number(maxUses) || 500,
      createdAt: new Date().toISOString()
    };

    db.coupons.push(newCoupon);
    saveLocalStore();

    return res.status(201).json({
      success: true,
      message: `Created coupon ${cleanCode}`,
      data: newCoupon
    });
  } catch (error) {
    console.error('createCoupon error:', error);
    return res.status(500).json({ success: false, message: 'Server error creating coupon' });
  }
};

/**
 * DELETE /api/coupons/:id - Delete a coupon (Admin)
 */
const deleteCoupon = (req, res) => {
  try {
    const { id } = req.params;
    const db = getLocalDb();
    ensureCouponsInit(db);

    const idx = db.coupons.findIndex(c => c.id === id || c.code.toUpperCase() === id.toUpperCase());
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    const removed = db.coupons.splice(idx, 1)[0];
    saveLocalStore();

    return res.json({ success: true, message: `Deleted coupon ${removed.code}`, data: removed });
  } catch (error) {
    console.error('deleteCoupon error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting coupon' });
  }
};

module.exports = {
  getCoupons,
  validateCoupon,
  createCoupon,
  deleteCoupon
};
