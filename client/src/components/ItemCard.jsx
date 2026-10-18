import React from 'react';
import { Plus, Eye, CheckCircle2, AlertTriangle, XCircle, Sparkles } from 'lucide-react';
import { useEnquiry } from '../context/EnquiryContext';

const ItemCard = ({ item, onSelectDetail }) => {
  const { addItem } = useEnquiry();

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

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-neutral-200/80 shadow-sm hover:shadow-royal transition-all duration-300 flex flex-col justify-between">
      {/* Image & Badges */}
      <div className="relative aspect-4/3 overflow-hidden bg-neutral-100">
        <img
          src={item.imageUrl}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-black/60 text-white backdrop-blur-md">
            {item.category}
          </span>
        </div>

        {/* Availability Badge */}
        <div className="absolute top-3 right-3">
          {getStatusBadge(item.availabilityStatus)}
        </div>

        {item.featured && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-gold text-brand-dark uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3 h-3" />
              <span>Popular Choice</span>
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 
            onClick={() => onSelectDetail(item)}
            className="text-base font-serif font-bold text-neutral-900 group-hover:text-brand-purple transition cursor-pointer line-clamp-1"
            title={item.name}
          >
            {item.name}
          </h3>

          <p className="mt-1.5 text-xs text-neutral-500 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Pricing Notice & Actions */}
        <div className="pt-3 border-t border-neutral-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-primary font-bold bg-amber-50/80 px-2.5 py-1 rounded-md border border-amber-200/60">
              Custom Quote on Request
            </span>
            <span className="text-[11px] text-neutral-400 font-medium">
              Qty: {item.availableQuantity > 0 ? `${item.availableQuantity} units` : 'On order'}
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
              onClick={() => addItem(item, 1)}
              disabled={item.availabilityStatus === 'Out of Stock'}
              className="py-2 px-3 rounded-xl royal-gradient hover:opacity-95 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5 text-brand-gold" />
              <span>Add to List</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
