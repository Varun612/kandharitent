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

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeModalItem, setActiveModalItem] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kandhari_enquiry_cart', JSON.stringify(enquiryList));
    } catch (e) {
      console.warn('Could not save enquiry cart to localStorage', e);
    }
  }, [enquiryList]);

  const addItem = (item, quantity = 1) => {
    setEnquiryList(prev => {
      const existingIndex = prev.findIndex(it => it.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, {
          id: item.id,
          name: item.name,
          category: item.category,
          imageUrl: item.imageUrl,
          quantity: quantity
        }];
      }
    });
    setIsDrawerOpen(true);
  };

  const removeItem = (itemId) => {
    setEnquiryList(prev => prev.filter(it => it.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    const qty = parseInt(newQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      removeItem(itemId);
      return;
    }
    setEnquiryList(prev => prev.map(it => it.id === itemId ? { ...it, quantity: qty } : it));
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
