import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Send, 
  MessageCircle, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Building,
  Users,
  CreditCard,
  Truck,
  Wrench,
  Clock,
  Ruler
} from 'lucide-react';
import { useEnquiry } from '../context/EnquiryContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LUCKNOW_LOCALITIES, SERVICES_LIST } from '../data/seedItems';

const calculateRentalDays = (start, end) => {
  if (!start) return 1;
  if (!end || start === end) return 1;
  try {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  } catch {
    return 1;
  }
};

const getLineItemTotal = (it, days) => {
  const qty = it.quantity || 1;
  const isArea = it.isAreaBased || (it.length && it.width);
  const effectiveDays = it.durationSensitive ? days : 1;
  if (isArea) {
    const area = it.areaSqFt || (it.length * it.width) || 200;
    const rate = it.ratePerSqFt || 5;
    return Math.round(area * rate * effectiveDays * qty);
  }
  const unitRate = it.unitRate || 0;
  return Math.round(unitRate * effectiveDays * qty);
};

const estimateLogistics = (items, distanceKm = 3, isReturning = false) => {
  let cartage = distanceKm <= 2 && isReturning ? 400 : (500 + Math.max(0, distanceKm - 3) * 50);
  let labour = 500;
  let chairs = 0;
  let heavy = 0;
  let hasTent = false;
  items.forEach(it => {
    const name = (it.name || '').toLowerCase();
    const id = (it.id || '').toLowerCase();
    const q = it.quantity || 1;
    if (name.includes('tent') || name.includes('pandal') || id.includes('tent')) hasTent = true;
    if (name.includes('chair') || id.includes('chair')) chairs += q;
    if (name.includes('sofa') || name.includes('cooler') || id.includes('sofa') || id.includes('cooler')) heavy += q;
  });
  if (hasTent) labour += 500;
  if (chairs > 100) labour += 400;
  else if (chairs > 50) labour += 200;
  if (heavy > 2) labour += 300;
  return { cartage, labour };
};

const EnquiryDrawer = () => {
  const { 
    enquiryList, 
    removeItem, 
    updateQuantity, 
    clearList, 
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isDrawerOpen, 
    closeDrawer 
  } = useEnquiry();

  const { customerUser, isCustomerAuthenticated, openAuthModal } = useAuth();

  const [formData, setFormData] = useState({
    customerName: customerUser?.name || '',
    phone: customerUser?.phone || '',
    whatsappNumber: customerUser?.phone || '',
    email: customerUser?.email || '',
    serviceRequired: 'Tent-house equipment rentals',
    locality: 'Kanpur Road / Daroga Kheda',
    eventVenueAddress: '',
    guestCount: 200,
    budgetRange: 'Flexible',
    deliveryDistanceKm: 3,
    isReturningCustomer: false,
    notes: '',
    consentGiven: true
  });

  // Pre-fill user data if auth state loads or changes
  useEffect(() => {
    if (customerUser) {
      setFormData(prev => ({
        ...prev,
        customerName: prev.customerName || customerUser.name || '',
        phone: prev.phone || customerUser.phone || '',
        whatsappNumber: prev.whatsappNumber || customerUser.phone || '',
        email: prev.email || customerUser.email || ''
      }));
    }
  }, [customerUser]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await api.validateCoupon(couponCode, subtotal);
      if (res.success && res.data) {
        setAppliedCoupon(res.data);
      }
    } catch (err) {
      setCouponError(err.message || 'Invalid or expired coupon code');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  if (!isDrawerOpen) return null;

  const rentalDays = calculateRentalDays(startDate, endDate);
  const subtotal = enquiryList.reduce((sum, it) => sum + getLineItemTotal(it, rentalDays), 0);
  const { cartage, labour } = estimateLogistics(enquiryList, formData.deliveryDistanceKm, formData.isReturningCustomer);
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + (enquiryList.length > 0 ? (cartage + labour) : 0));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanPhone = formData.phone.replace(/[\s-]/g, '');
    const phoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setErrorMessage('Please enter a valid 10-digit Indian phone number (e.g. 9876543210).');
      return;
    }

    if (!startDate) {
      setErrorMessage('Please select the rental start date.');
      return;
    }

    if (!formData.consentGiven) {
      setErrorMessage('Please check the consent box to allow us to contact you regarding your quotation.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        enquiryType: enquiryList.length > 0 ? 'rental' : 'general',
        customerName: formData.customerName.trim(),
        phone: cleanPhone,
        whatsappNumber: formData.whatsappNumber ? formData.whatsappNumber.replace(/[\s-]/g, '') : cleanPhone,
        email: formData.email.trim(),
        serviceRequired: formData.serviceRequired,
        eventDate: startDate,
        startDate: startDate,
        endDate: endDate || startDate,
        rentalDays,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        discount: discountAmount,
        deliveryDistanceKm: formData.deliveryDistanceKm,
        isReturningCustomer: formData.isReturningCustomer,
        locality: formData.locality,
        eventVenueAddress: formData.eventVenueAddress.trim(),
        guestCount: parseInt(formData.guestCount, 10) || 0,
        budgetRange: formData.budgetRange,
        items: enquiryList.map(it => ({
          itemId: it.id,
          name: it.name,
          quantity: it.quantity,
          dimensions: it.dimensions || '',
          length: it.length || 0,
          width: it.width || 0,
          areaSqFt: it.areaSqFt || 0,
          unitRate: it.unitRate || 0,
          ratePerSqFt: it.ratePerSqFt || 0,
          billingUnit: it.billingUnit || '',
          isAreaBased: it.isAreaBased || false,
          durationSensitive: it.durationSensitive || false
        })),
        notes: formData.notes.trim(),
        consentGiven: formData.consentGiven
      };

      const res = await api.submitEnquiry(payload);

      if (res.success) {
        setSubmissionSuccess({
          referenceId: res.referenceId,
          whatsappLink: res.whatsappLink,
          message: res.message
        });
        clearList();
      } else {
        setErrorMessage(res.message || 'Could not submit your enquiry. Please call us directly.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Network error submitting enquiry. Please submit a callback request online.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetDrawer = () => {
    setSubmissionSuccess(null);
    setErrorMessage('');
    closeDrawer();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col">
          
          {/* Drawer Header */}
          <div className="royal-gradient px-6 py-5 text-white flex items-center justify-between border-b border-purple-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-gold" />
              <div>
                <h2 className="text-lg font-serif font-bold tracking-tight">
                  Event Enquiry & Quote Request
                </h2>
                <p className="text-xs text-brand-goldLight">
                  Direct Coordination for Lucknow Celebrations
                </p>
              </div>
            </div>
            <button 
              onClick={resetDrawer}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              aria-label="Close drawer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {submissionSuccess ? (
              <div className="text-center py-8 space-y-5 animate-fadeIn">
                <div className="w-16 h-16 bg-amber-50 border border-brand-gold/30 rounded-full flex items-center justify-center mx-auto text-brand-gold shadow-sm">
                  <CheckCircle className="w-9 h-9 text-brand-primary" />
                </div>
                
                <h3 className="text-xl font-serif font-bold text-brand-primary">
                  Inquiry Received Successfully
                </h3>

                <div className="p-4 bg-brand-cream/70 border border-brand-border rounded-2xl max-w-sm mx-auto shadow-xs text-left space-y-2">
                  <p className="text-xs text-neutral-700 leading-relaxed">
                    Thank you for contacting <strong>Kandhari Tent & Caterers</strong>! Your inquiry has been received successfully. Our team will review your requirements and get in touch with you shortly.
                  </p>
                  <p className="text-[11px] text-neutral-500 border-t border-brand-border/60 pt-2">
                    📍 Event coordination desk on Kanpur Road (Opp. Pillar No. 37), Lucknow.
                  </p>
                </div>

                {submissionSuccess.whatsappLink && (
                  <div className="pt-2">
                    <a
                      href={submissionSuccess.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-md transition flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Open WhatsApp with Inquiry Summary</span>
                    </a>
                    <p className="text-[11px] text-neutral-500 mt-2">
                      Opens WhatsApp to send your prefilled details directly to our desk (Official Desk)
                    </p>
                  </div>
                )}

                <button
                  onClick={resetDrawer}
                  className="mt-3 px-6 py-2.5 rounded-xl border border-brand-border text-brand-primary hover:bg-brand-cream text-xs font-semibold transition"
                >
                  Continue Exploring
                </button>
              </div>
            ) : (
              <>
                {/* 1. Date Selection Section */}
                <div className="bg-brand-cream/80 p-3.5 rounded-2xl border border-brand-gold/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-brand-primary">
                      <Calendar className="w-4 h-4 text-brand-gold" />
                      <span>Rental Dates & Duration</span>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-primary text-white">
                      {rentalDays} {rentalDays === 1 ? 'Day' : 'Days'} Duration
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={startDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          if (endDate && e.target.value > endDate) {
                            setEndDate(e.target.value);
                          }
                        }}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-neutral-300 text-xs bg-white focus:ring-2 focus:ring-brand-purple/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        min={startDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-neutral-300 text-xs bg-white focus:ring-2 focus:ring-brand-purple/20 outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-neutral-500">
                    Single-day celebrations: leave End Date empty or same. Multi-day functions apply daily equipment rates.
                  </p>
                </div>

                {/* 2. Selected Rental Items Section */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      Selected Rental Equipment ({enquiryList.length})
                    </h3>
                    {enquiryList.length > 0 && (
                      <button
                        type="button"
                        onClick={clearList}
                        className="text-xs text-rose-600 hover:text-rose-700 font-medium transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear All</span>
                      </button>
                    )}
                  </div>

                  {enquiryList.length === 0 ? (
                    <div className="text-center py-6 px-4 bg-brand-cream/60 rounded-2xl border border-dashed border-neutral-300">
                      <ShoppingBag className="w-8 h-8 text-neutral-300 mx-auto mb-1.5" />
                      <p className="text-xs text-neutral-600 font-medium">No items currently in rental list.</p>
                      <p className="text-[11px] text-neutral-400">Browse catalogue to add tents, chairs, sofas, or coolers.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 divide-y divide-neutral-100 max-h-60 overflow-y-auto pr-1">
                      {enquiryList.map((item) => {
                        const lineTotal = getLineItemTotal(item, rentalDays);
                        const itemKey = item.itemKey || item.id;
                        return (
                          <div key={itemKey} className="pt-3 first:pt-0 flex items-start gap-3">
                            <img 
                              src={item.imageUrl} 
                              alt={item.name} 
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/media/rich-decor/decor-1.jpg';
                              }}
                              className="w-12 h-12 object-cover rounded-xl shrink-0 border border-neutral-200 mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-serif font-bold text-neutral-900 truncate" title={item.name}>
                                {item.name}
                              </h4>
                              {item.dimensions && (
                                <div className="mt-0.5">
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100/80 text-amber-900 rounded font-bold text-[10px]">
                                    <Ruler className="w-2.5 h-2.5 text-amber-700" />
                                    <span>{item.dimensions} ({item.areaSqFt} sq ft)</span>
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[11px] font-bold text-brand-primary">
                                  ₹{lineTotal.toLocaleString('en-IN')}
                                </span>
                                <span className="text-[10px] text-neutral-400">
                                  {item.isAreaBased ? `(₹${item.ratePerSqFt}/sq ft)` : `(₹${item.unitRate}/unit)`}
                                  {item.durationSensitive && rentalDays > 1 ? ` × ${rentalDays}d` : ''}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg shrink-0">
                              <button
                                type="button"
                                onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                                className="w-5 h-5 flex items-center justify-center rounded bg-white text-neutral-600 hover:text-brand-purple shadow-xs"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="w-6 text-center text-xs font-bold text-neutral-800">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                                className="w-5 h-5 flex items-center justify-center rounded bg-white text-neutral-600 hover:text-brand-purple shadow-xs"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(itemKey)}
                              className="p-1 text-neutral-400 hover:text-rose-600 transition shrink-0 mt-0.5"
                              aria-label="Remove item"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. Pricing Summary Breakdown */}
                {enquiryList.length > 0 && (
                  <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/80 space-y-2.5 text-xs">
                    <div className="flex justify-between text-neutral-700">
                      <span>Equipment Rental Subtotal:</span>
                      <span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between items-center text-neutral-700">
                      <div className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Estimated Cartage (~3 km base):</span>
                      </div>
                      <span className="font-semibold">₹{cartage.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between items-center text-neutral-700">
                      <div className="flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Estimated Labour & Setup:</span>
                      </div>
                      <span className="font-semibold">₹{labour.toLocaleString('en-IN')}</span>
                    </div>

                    {/* Promotional Coupon Entry */}
                    <div className="pt-2 border-t border-neutral-200/70 space-y-2">
                      <label className="block text-[11px] font-semibold text-neutral-700">
                        Have a promotional coupon?
                      </label>
                      {!appliedCoupon ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => {
                              setCouponCode(e.target.value.toUpperCase());
                              if (couponError) setCouponError('');
                            }}
                            placeholder="e.g. WELCOME100 or FIRST200"
                            className="flex-1 px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7c3aed]"
                          />
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={couponLoading || !couponCode.trim()}
                            className="px-3 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                          >
                            {couponLoading ? 'Checking...' : 'Apply'}
                          </button>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                          <div className="text-xs text-emerald-800">
                            <span className="font-bold">✓ {appliedCoupon.code}</span> applied: Saved <strong>₹{appliedCoupon.discountAmount}</strong>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="text-xs font-bold text-rose-600 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      {couponError && (
                        <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>
                      )}
                      {appliedCoupon && (
                        <div className="flex justify-between text-emerald-700 font-semibold pt-1">
                          <span>Coupon Discount ({appliedCoupon.code}):</span>
                          <span>- ₹{appliedCoupon.discountAmount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>

                    {/* Returning Customer Rule Toggle */}
                    <div className="pt-2 border-t border-neutral-200/70 flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer text-[11px] text-neutral-600">
                        <input
                          type="checkbox"
                          name="isReturningCustomer"
                          checked={formData.isReturningCustomer}
                          onChange={handleChange}
                          className="w-3.5 h-3.5 rounded text-brand-primary"
                        />
                        <span>Returning Customer (~2 km discount: ₹400 cartage)</span>
                      </label>
                    </div>

                    <div className="pt-2 border-t border-neutral-200 flex justify-between items-baseline text-sm font-serif font-bold text-brand-primary">
                      <span>Total Estimated Quotation:</span>
                      <span className="text-base text-brand-primary">₹{grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 italic">
                      * Official quotation with confirmed cartage & crew count will be issued after venue verification.
                    </p>
                  </div>
                )}

                {/* 4. Comprehensive Customer Information Form */}
                <form onSubmit={handleSubmit} className="pt-4 border-t border-neutral-200 space-y-4">
                  <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-brand-gold" />
                    <span>Customer & Delivery Details</span>
                  </h3>

                  {!isCustomerAuthenticated ? (
                    <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-amber-900">
                        <User className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Sign in to track your booking approval status and pay online.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openAuthModal({ reason: 'Sign in to link this quotation directly to your customer portal.' })}
                        className="shrink-0 px-3 py-1 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold rounded-lg text-[11px] transition-colors"
                      >
                        Sign In
                      </button>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs text-emerald-800">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Signed in as <strong>{customerUser?.name}</strong></span>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Portal Active</span>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Customer Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        name="customerName"
                        required
                        value={formData.customerName}
                        onChange={handleChange}
                        placeholder="e.g. Ramesh Chandra"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                      />
                    </div>
                  </div>

                  {/* Mobile & WhatsApp Numbers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        10-Digit Mobile *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="e.g. 9876543210"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        WhatsApp Number (Optional)
                      </label>
                      <div className="relative">
                        <MessageCircle className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          name="whatsappNumber"
                          value={formData.whatsappNumber}
                          onChange={handleChange}
                          placeholder="Leave blank if same"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Service Required & Locality within Lucknow */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Primary Service Required
                      </label>
                      <select
                        name="serviceRequired"
                        value={formData.serviceRequired}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none bg-white font-medium text-neutral-800"
                      >
                        {SERVICES_LIST.map((srv) => (
                          <option key={srv} value={srv}>{srv}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Locality in Lucknow *
                      </label>
                      <select
                        name="locality"
                        value={formData.locality}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none bg-white font-medium text-neutral-800"
                      >
                        {LUCKNOW_LOCALITIES.map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Event Venue or Address */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Event Venue Name or Specific Address (if known)
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        name="eventVenueAddress"
                        value={formData.eventVenueAddress}
                        onChange={handleChange}
                        placeholder="e.g. Dwarka Shri Lawn / Hotel / Private Plot"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                      />
                    </div>
                  </div>

                  {/* Expected Guests & Budget Range */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Expected Guests
                      </label>
                      <div className="relative">
                        <Users className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                        <input
                          type="number"
                          name="guestCount"
                          min="0"
                          step="50"
                          value={formData.guestCount}
                          onChange={handleChange}
                          placeholder="e.g. 250"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Approx Budget Range (Optional)
                      </label>
                      <select
                        name="budgetRange"
                        value={formData.budgetRange}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none bg-white"
                      >
                        <option value="Flexible">Flexible / Discuss on Call</option>
                        <option value="Under ₹50,000">Under ₹50,000</option>
                        <option value="₹50,000 – ₹1,50,000">₹50,000 – ₹1,50,000</option>
                        <option value="₹1,50,000 – ₹3,00,000">₹1,50,000 – ₹3,00,000</option>
                        <option value="₹3,00,000+">₹3,00,000+</option>
                      </select>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Additional Requirements / Notes
                    </label>
                    <textarea
                      name="notes"
                      rows={2}
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="e.g. Special color theme, delivery timing, sound setup, or generator requirements..."
                      className="w-full p-2.5 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                    />
                  </div>

                  {/* Consent Checkbox */}
                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="consentCheck"
                      name="consentGiven"
                      required
                      checked={formData.consentGiven}
                      onChange={handleChange}
                      className="w-4 h-4 text-brand-purple rounded mt-0.5"
                    />
                    <label htmlFor="consentCheck" className="text-[11px] text-neutral-600 leading-tight">
                      I consent to be contacted by <strong>Kandhari Tent & Caterers</strong> via phone/WhatsApp regarding this enquiry and understand that this submission does not confirm a booking until verified.
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 rounded-xl royal-gradient hover:opacity-95 text-white font-bold text-xs shadow-royal flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-brand-gold" />
                          <span>Submit Event Enquiry</span>
                        </>
                      )}
                    </button>

                    <a
                      href="/contact"
                      className="w-full py-2.5 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <Phone className="w-3.5 h-3.5 text-brand-gold" />
                      <span>Toll-Free Booking Desk: 1800-XXX-XXXX</span>
                    </a>
                  </div>
                </form>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default EnquiryDrawer;
