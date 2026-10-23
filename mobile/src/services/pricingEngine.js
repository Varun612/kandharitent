/**
 * Kandhari Tent & Caterers - Pricing Engine (Shared across Web & Mobile)
 * Calculates standard rental pricing, area-based pandals, duration multipliers,
 * distance band cartage/labour, and promotional coupon discounts.
 */

export const calculateDaysBetween = (start, end) => {
  if (!start) return 1;
  const s = new Date(start);
  const e = end ? new Date(end) : s;
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 1;
  const diffTime = Math.abs(e.setHours(0, 0, 0, 0) - s.setHours(0, 0, 0, 0));
  const days = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, days);
};

export const calculateOrderPricing = ({
  items = [],
  startDate,
  endDate,
  deliveryDistanceKm = 2.5,
  coupon = null
}) => {
  const days = calculateDaysBetween(startDate, endDate);
  let subtotal = 0;
  let hasTent = false;

  const itemized = (items || []).map((item) => {
    let lineTotal = 0;
    const qty = Number(item.quantity) || 1;
    const isArea = Boolean(item.isAreaBased || item.ratePerSqFt);

    if (item.categoryId === 'tents-canopies' || item.id?.includes('tent') || item.name?.toLowerCase().includes('tent') || item.name?.toLowerCase().includes('pandal')) {
      hasTent = true;
    }

    if (isArea) {
      const length = Number(item.length || item.customLength) || 20;
      const width = Number(item.width || item.customWidth) || 30;
      const rate = Number(item.ratePerSqFt) || 5;
      const area = length * width;
      const singleDayTotal = area * rate;
      lineTotal = singleDayTotal * (item.durationSensitive !== false ? days : 1) * qty;
      return {
        ...item,
        areaSqFt: area,
        ratePerSqFt: rate,
        days: item.durationSensitive !== false ? days : 1,
        lineTotal
      };
    } else {
      const unitPrice = Number(item.rentalPrice || item.price || item.unitPrice) || 0;
      lineTotal = unitPrice * qty * (item.durationSensitive !== false ? days : 1);
      return {
        ...item,
        unitPrice,
        days: item.durationSensitive !== false ? days : 1,
        lineTotal
      };
    }
  });

  subtotal = itemized.reduce((acc, curr) => acc + (curr.lineTotal || 0), 0);

  // Distance Bands
  const dist = Number(deliveryDistanceKm) || 2.5;
  let cartage = 500;
  let labour = 500;
  let distanceBand = '0-3 km (Local Daroga Kheda / Kanpur Road)';

  if (dist <= 3) {
    cartage = 500;
    labour = 500;
    distanceBand = '0-3 km (Local Daroga Kheda / Kanpur Road)';
  } else if (dist <= 7) {
    cartage = 1000;
    labour = 1000;
    distanceBand = '3-7 km (Krishna Nagar / Alambagh / Transport Nagar)';
  } else {
    cartage = 1500;
    labour = 1500;
    distanceBand = '>7 km (Extended Lucknow Outskirts - Provisional)';
  }

  // Tent rigging additional labour
  if (hasTent) {
    labour += 500;
  }

  // Coupon discount
  let discount = 0;
  let couponCode = null;
  if (coupon && coupon.valid) {
    couponCode = coupon.code;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = Number(coupon.discountValue) || 0;
    }
  }

  const grandTotal = Math.max(0, subtotal + cartage + labour - discount);

  return {
    days,
    itemized,
    subtotal,
    cartage,
    labour,
    distanceBand,
    discount,
    couponCode,
    grandTotal
  };
};
