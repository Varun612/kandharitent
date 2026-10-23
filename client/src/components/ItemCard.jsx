import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, CheckCircle2, AlertTriangle, XCircle, Sparkles, Lock } from 'lucide-react';
import { useEnquiry } from '../context/EnquiryContext';
import { useAuth } from '../context/AuthContext';

const ItemCard = ({ item, onSelectDetail }) => {
  const { addItem } = useEnquiry();
  const { isCustomerAuthenticated, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const handleAddItem = (e) => {
    e.stopPropagation();
    addItem(item, 1);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Available</span>
          </span>
        );
      case 'Limited':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Limited Stock</span>
          </span>
        );
      case 'Out of Stock':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
            <XCircle className="w-3 h-3 text-neutral-400" />
            <span>Reserved</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-brand-purple">
            <span>Enquire</span>
          </span>
        );
    }
  };

  const isArea = item.isAreaBased || item.ratePerSqFt;
  const priceDisplay = isArea
    ? `₹${item.ratePerSqFt || 5} / sq ft`
    : (item.rentalPrice ? `₹${item.rentalPrice.toLocaleString('en-IN')}` : 'Quote on request');

  const unitDisplay = isArea
    ? (item.billingUnit || 'per sq ft')
    : (item.billingUnit || 'per piece');

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-neutral-200/80 shadow-sm hover:shadow-royal transition-all duration-300 flex flex-col justify-between h-full">
      {/* Image & Badges */}
      <div className="relative aspect-4/3 overflow-hidden bg-neutral-100">
        <img
          src={item.imageUrl}
          alt={item.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/media/rich-decor/decor-1.jpg';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-black/60 text-white backdrop-blur-md">
            {item.category}
          </span>
        </div>

        {/* Top-Right Badges: Availability + Handpicked & Popular */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
          {getStatusBadge(item.availabilityStatus)}
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-white shadow-xs tracking-wider">
              <span>🔥 Popular</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#7c3aed] text-white shadow-xs tracking-wider">
              <span>✨ Handpicked</span>
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 
            onClick={() => onSelectDetail(item)}
            className="text-base font-serif font-bold text-neutral-900 group-hover:text-brand-purple transition cursor-pointer line-clamp-1"
            title={item.name}
          >
            {item.name}
          </h3>

          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {/* Social proof badge */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-900 bg-amber-50/90 border border-amber-200/70 px-2.5 py-1 rounded-lg mt-1">
            <Eye className="w-3.5 h-3.5 text-amber-600 animate-pulse shrink-0" />
            <span><strong>3 more people</strong> viewed today in Lucknow</span>
          </div>
        </div>

        {/* Pricing Notice & Actions */}
        <div className="pt-3 border-t border-neutral-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-serif font-bold text-brand-primary">
                {priceDisplay}
              </span>
              <span className="text-[10px] text-neutral-400">
                {unitDisplay}
              </span>
            </div>
            <span className="text-[11px] text-neutral-400 font-medium">
              Qty: {item.availableQuantity > 0 ? `${item.availableQuantity} units` : 'Available'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSelectDetail(item)}
              className="py-2 px-3 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Eye className="w-3.5 h-3.5 text-neutral-500" />
              <span>Details</span>
            </button>

            <button
              onClick={handleAddItem}
              disabled={item.availabilityStatus === 'Out of Stock'}
              title="Add to rental cart"
              className="py-2 px-3 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
