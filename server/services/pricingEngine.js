/**
 * Central Server-Side Pricing Engine for Kandhari Tent & Caterers
 * Authoritative mathematical calculation of equipment rental, area-based tents & carpets,
 * distance-based cartage, weight-based labour, and admin adjustments.
 */

// Authoritative rates specified by the business owner
const CATALOGUE_RULES = {
  // A. Chairs and furniture
  'item-chair-pvc': {
    name: 'Plastic PVC Chair',
    unitRate: 15,
    billingUnit: 'per piece',
    durationSensitive: false
  },
  'item-chair-velvet': {
    name: 'Velvet Chair with Cover',
    unitRate: 45,
    billingUnit: 'per piece',
    durationSensitive: false
  },
  'item-chair-highback': {
    name: 'High-back Chair with Cover',
    unitRate: 75,
    billingUnit: 'per piece',
    durationSensitive: false
  },
  'item-table-set': {
    name: 'Table Set (2.5 × 5 feet)',
    unitRate: 75,
    billingUnit: 'per set',
    durationSensitive: false
  },
  'item-table-round': {
    name: 'Round Table with Cover',
    unitRate: 200,
    billingUnit: 'per piece per day',
    durationSensitive: true
  },
  'item-winter-gadda': {
    name: 'Winter Gadda Set',
    unitRate: 150,
    billingUnit: 'per set per day',
    durationSensitive: true
  },
  'item-table-center': {
    name: 'Centre Table',
    unitRate: 400,
    billingUnit: 'per piece',
    durationSensitive: false
  },
  'item-sofa-2seater': {
    name: 'Two-Seater Sofa',
    unitRate: 800,
    billingUnit: 'per piece per day',
    durationSensitive: true
  },
  'item-jumbo-cooler': {
    name: 'Jumbo Desert Cooler',
    unitRate: 1500,
    billingUnit: 'per piece per day',
    durationSensitive: true
  },

  // B. Normal tents and pandals (₹5/sq ft/day)
  'item-tent-normal': {
    name: 'Normal Tent / Pandal (Shamiana)',
    ratePerSqFt: 5,
    billingUnit: 'per sq ft per day',
    isAreaBased: true,
    durationSensitive: true,
    defaultDimensions: { length: 20, width: 30 } // 600 sq ft
  },

  // C. Halwai pandal (Configurable, default ₹5/sq ft/day)
  'item-tent-halwai': {
    name: 'Halwai Kitchen Pandal',
    ratePerSqFt: 5,
    billingUnit: 'per sq ft per day',
    isAreaBased: true,
    durationSensitive: true,
    defaultDimensions: { length: 10, width: 20 } // 200 sq ft
  },

  // D. Waterproof pandal (₹30/sq ft)
  'item-tent-waterproof': {
    name: 'Waterproof German Hangar Pandal',
    ratePerSqFt: 30,
    billingUnit: 'per sq ft',
    isAreaBased: true,
    durationSensitive: false, // Configurable billing duration
    defaultDimensions: { length: 20, width: 30 }
  },

  // E. Carpets (₹3/sq ft/day)
  'item-carpet-red': {
    name: 'Red Velvet / 3D Event Carpet',
    ratePerSqFt: 3,
    billingUnit: 'per sq ft per day',
    isAreaBased: true,
    durationSensitive: true,
    defaultDimensions: { length: 10, width: 20 } // 200 sq ft
  }
};

/**
 * Calculates rental duration in full calendar days.
 * Minimum is 1 day.
 */
function calculateRentalDays(startDate, endDate) {
  if (!startDate) return 1;
  if (!endDate || startDate === endDate) return 1;

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime <= 0) return 1;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  } catch {
    return 1;
  }
}

/**
 * Calculates pricing for a single item.
 */
function calculateLineItem(item, rentalDays) {
  const itemId = item.id || item.itemId || '';
  const rule = CATALOGUE_RULES[itemId] || 
               CATALOGUE_RULES[`item-${itemId}`] || 
               CATALOGUE_RULES[itemId.replace(/^item-/, '')] || 
               Object.values(CATALOGUE_RULES).find(r => (item.name && r.name.toLowerCase() === item.name.toLowerCase())) || 
               {};
  const isAreaBased = rule.isAreaBased || item.isAreaBased || (item.length && item.width);
  const quantity = Math.max(1, parseInt(item.quantity || 1, 10));
  const durationSensitive = rule.durationSensitive !== undefined ? rule.durationSensitive : (item.durationSensitive || false);
  const effectiveDays = durationSensitive ? rentalDays : 1;

  if (isAreaBased) {
    const length = parseFloat(item.length || (rule.defaultDimensions && rule.defaultDimensions.length) || 10);
    const width = parseFloat(item.width || (rule.defaultDimensions && rule.defaultDimensions.width) || 20);
    const areaSqFt = length * width;
    const ratePerSqFt = parseFloat(rule.ratePerSqFt !== undefined ? rule.ratePerSqFt : (item.ratePerSqFt || 5));
    const lineTotal = Math.round(areaSqFt * ratePerSqFt * effectiveDays * quantity);

    return {
      id: item.id,
      name: item.name || rule.name,
      category: item.category || 'Tents & Canopies',
      imageUrl: item.imageUrl,
      isAreaBased: true,
      length,
      width,
      dimensions: `${length} × ${width} ft`,
      areaSqFt,
      ratePerSqFt,
      billingUnit: rule.billingUnit || `${ratePerSqFt}/sq ft`,
      quantity,
      durationSensitive,
      rentalDays,
      effectiveDays,
      lineTotal
    };
  }

  // Unit-based pricing
  const unitRate = parseFloat(rule.unitRate !== undefined ? rule.unitRate : (item.unitRate !== undefined ? item.unitRate : (item.rentalPrice || item.rate || item.price || 0)));
  const lineTotal = Math.round(unitRate * quantity * effectiveDays);

  return {
    id: item.id,
    name: item.name || rule.name,
    category: item.category || 'Furniture & Seating',
    imageUrl: item.imageUrl,
    isAreaBased: false,
    unitRate,
    billingUnit: rule.billingUnit || `₹${unitRate} / piece`,
    quantity,
    durationSensitive,
    rentalDays,
    effectiveDays,
    lineTotal
  };
}

/**
 * Estimates baseline cartage and labour based on distance, bulk, and returning customer rules.
 */
function estimateCartageAndLabour({ items = [], distanceKm = 3, isReturningCustomer = false }) {
  const km = Math.max(1, parseFloat(distanceKm || 3));

  // Cartage calculation
  let baseCartage = 500;
  if (km <= 2 && isReturningCustomer) {
    baseCartage = 400; // ~2km returning customer discount rule
  } else if (km > 3) {
    baseCartage = 500 + Math.round((km - 3) * 50); // Additional ₹50/km beyond 3km
  }

  // Labour calculation based on workload/weight
  let baseLabour = 500;
  let totalHeavyItems = 0;
  let totalChairs = 0;
  let hasTent = false;

  items.forEach(it => {
    const qty = parseInt(it.quantity || 1, 10);
    const id = (it.id || '').toLowerCase();
    const name = (it.name || '').toLowerCase();

    if (id.includes('sofa') || name.includes('sofa')) totalHeavyItems += qty * 2;
    if (id.includes('cooler') || name.includes('cooler')) totalHeavyItems += qty * 2;
    if (id.includes('tent') || name.includes('tent') || id.includes('pandal')) hasTent = true;
    if (id.includes('chair') || name.includes('chair')) totalChairs += qty;
  });

  if (hasTent) {
    baseLabour += 500; // Tent rigging requires 2+ helpers
  }
  if (totalChairs > 100) {
    baseLabour += 400;
  } else if (totalChairs > 50) {
    baseLabour += 200;
  }
  if (totalHeavyItems > 4) {
    baseLabour += 300;
  }

  return {
    estimatedCartage: Math.min(3000, baseCartage),
    estimatedLabour: Math.min(5000, baseLabour)
  };
}

/**
 * Main Pricing Engine Calculator
 * Processes complete order, applies rules, overrides, and returns line-item breakdown.
 */
function calculateOrderPricing({
  items = [],
  startDate,
  endDate,
  deliveryDistanceKm = 3,
  isReturningCustomer = false,
  adminOverrides = {}
}) {
  const rentalDays = calculateRentalDays(startDate, endDate);
  
  // Calculate each line item
  const lineItems = items.map(it => calculateLineItem(it, rentalDays));
  const subtotal = lineItems.reduce((acc, curr) => acc + curr.lineTotal, 0);

  // Estimate baseline logistics
  const { estimatedCartage, estimatedLabour } = estimateCartageAndLabour({
    items,
    distanceKm: deliveryDistanceKm,
    isReturningCustomer
  });

  // Apply admin confirmed amounts or baseline estimates
  const cartage = adminOverrides.cartage !== undefined 
    ? parseFloat(adminOverrides.cartage) 
    : estimatedCartage;

  const labour = adminOverrides.labour !== undefined 
    ? parseFloat(adminOverrides.labour) 
    : estimatedLabour;

  const discount = Math.max(0, parseFloat(adminOverrides.discount || 0));
  const manualAdjustment = parseFloat(adminOverrides.manualAdjustment || 0);

  const grandTotal = Math.max(0, Math.round(subtotal + cartage + labour - discount + manualAdjustment));

  return {
    rentalDays,
    startDate,
    endDate: endDate || startDate,
    lineItems,
    subtotal,
    cartage,
    labour,
    estimatedCartage,
    estimatedLabour,
    isCartageOverridden: adminOverrides.cartage !== undefined,
    isLabourOverridden: adminOverrides.labour !== undefined,
    discount,
    discountReason: adminOverrides.discountReason || (discount > 0 ? 'Customer discount' : null),
    manualAdjustment,
    adjustmentReason: adminOverrides.adjustmentReason || null,
    grandTotal,
    advancePaid: parseFloat(adminOverrides.advancePaid || 0),
    balanceDue: Math.max(0, grandTotal - parseFloat(adminOverrides.advancePaid || 0))
  };
}

module.exports = {
  CATALOGUE_RULES,
  calculateRentalDays,
  calculateLineItem,
  estimateCartageAndLabour,
  calculateOrderPricing
};
