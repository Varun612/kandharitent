import React, { createContext, useContext, useState, useEffect } from 'react';

const EnquiryContext = createContext();

export const EnquiryProvider = ({ children }) => {
  const [enquiryList, setEnquiryList] = useState(() => {
    try {
      const saved = localStorage.getItem('kandhari_enquiry_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [startDate, setStartDate] = useState(() => {
    return localStorage.getItem('kandhari_rental_start_date') || '';
  });

  const [endDate, setEndDate] = useState(() => {
    return localStorage.getItem('kandhari_rental_end_date') || '';
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeModalItem, setActiveModalItem] = useState(null);

  // Sync dates
  useEffect(() => {
    if (startDate) localStorage.setItem('kandhari_rental_start_date', startDate);
    else localStorage.removeItem('kandhari_rental_start_date');
  }, [startDate]);

  useEffect(() => {
    if (endDate) localStorage.setItem('kandhari_rental_end_date', endDate);
    else localStorage.removeItem('kandhari_rental_end_date');
  }, [endDate]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kandhari_enquiry_cart', JSON.stringify(enquiryList));
    } catch (e) {
      console.warn('Could not save enquiry cart to localStorage', e);
    }
  }, [enquiryList]);

  // Listen for pending items added after login
  useEffect(() => {
    const handlePendingAdd = (e) => {
      if (e.detail) {
        const { item, quantity, dimensions, length, width } = e.detail;
        addItem(item, quantity || 1, { dimensions, length, width });
      }
    };
    window.addEventListener('kandhari-add-pending-item', handlePendingAdd);
    return () => window.removeEventListener('kandhari-add-pending-item', handlePendingAdd);
  }, []);

  const addItem = (item, quantity = 1, config = {}) => {
    setEnquiryList(prev => {
      const length = config.length || item.defaultDimensions?.length || 0;
      const width = config.width || item.defaultDimensions?.width || 0;
      const dimensions = config.dimensions || (length && width ? `${length} × ${width} ft` : '');
      const itemKey = dimensions ? `${item.id}-${dimensions}` : item.id;
      
      const existingIndex = prev.findIndex(it => (it.itemKey || it.id) === itemKey);

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, {
          itemKey,
          id: item.id,
          name: item.name,
          category: item.category,
          imageUrl: item.imageUrl,
          quantity: quantity,
          unitRate: item.rentalPrice || item.rate || 0,
          ratePerSqFt: item.ratePerSqFt || 0,
          billingUnit: item.billingUnit || '',
          isAreaBased: !!(item.isAreaBased || (length && width)),
          dimensions,
          length,
          width,
          areaSqFt: length * width,
          durationSensitive: item.durationSensitive || false
        }];
      }
    });
    setIsDrawerOpen(true);
  };

  const removeItem = (itemKeyOrId) => {
    setEnquiryList(prev => prev.filter(it => (it.itemKey || it.id) !== itemKeyOrId));
  };

  const updateQuantity = (itemKeyOrId, newQuantity) => {
    const qty = parseInt(newQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      removeItem(itemKeyOrId);
      return;
    }
    setEnquiryList(prev => prev.map(it => (it.itemKey || it.id) === itemKeyOrId ? { ...it, quantity: qty } : it));
  };

  const clearList = () => {
    setEnquiryList([]);
  };

  const totalItemsCount = enquiryList.reduce((sum, it) => sum + (it.quantity || 1), 0);

  return (
    <EnquiryContext.Provider value={{
      enquiryList,
      addItem,
      removeItem,
      updateQuantity,
      clearList,
      totalItemsCount,
      startDate,
      setStartDate,
      endDate,
      setEndDate,
      isDrawerOpen,
      setIsDrawerOpen,
      openDrawer: () => setIsDrawerOpen(true),
      closeDrawer: () => setIsDrawerOpen(false),
      activeModalItem,
      setActiveModalItem
    }}>
      {children}
    </EnquiryContext.Provider>
  );
};

export const useEnquiry = () => {
  const context = useContext(EnquiryContext);
  if (!context) {
    throw new Error('useEnquiry must be used within an EnquiryProvider');
  }
  return context;
};

