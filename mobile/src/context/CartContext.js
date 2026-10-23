import React, { createContext, useContext, useState, useMemo } from 'react';
import { calculateOrderPricing } from '../services/pricingEngine';
import { api } from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [distanceKm, setDistanceKm] = useState(2.5);
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const addItem = (product, quantity = 1, customDimensions = {}) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          ...customDimensions
        };
        return updated;
      }
      return [...prev, { ...product, quantity, ...customDimensions }];
    });
  };

  const removeItem = (itemId) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    );
  };

  const applyCouponCode = async (code) => {
    setCouponError('');
    try {
      const roughSubtotal = items.reduce((acc, curr) => acc + (Number(curr.rentalPrice || curr.price || 0) * (curr.quantity || 1)), 0);
      const res = await api.validateCoupon(code.toUpperCase(), roughSubtotal);
      if (res && res.valid) {
        setCoupon(res);
        return { success: true, coupon: res };
      } else {
        const msg = res?.message || 'Invalid coupon code';
        setCouponError(msg);
        return { success: false, message: msg };
      }
    } catch (err) {
      const msg = err.message || 'Failed to validate coupon';
      setCouponError(msg);
      return { success: false, message: msg };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponError('');
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
    setCouponError('');
  };

  const pricing = useMemo(() => {
    return calculateOrderPricing({
      items,
      startDate,
      endDate,
      deliveryDistanceKm: distanceKm,
      coupon
    });
  }, [items, startDate, endDate, distanceKm, coupon]);

  const totalCount = useMemo(() => {
    return items.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        distanceKm,
        setDistanceKm,
        coupon,
        couponError,
        applyCouponCode,
        removeCoupon,
        pricing,
        totalCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
