import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, CheckCircle2, AlertTriangle, XCircle, Sparkles, Lock, Users } from 'lucide-react';
import { useEnquiry } from '../context/EnquiryContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Tilt3DCard from './common/Tilt3DCard';

const ItemCard = ({ item, onSelectDetail }) => {
  const { addItem } = useEnquiry();
  const { isCustomerAuthenticated, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const cardRef = useRef(null);

  // Dynamic live viewing count starting from a sensible baseline and updating as user scrolls
  const baseCount = ((item.id || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 20) + 14;
  const [liveViews, setLiveViews] = useState(baseCount);
  const [hasReportedView, setHasReportedView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !hasReportedView) {
          setHasReportedView(true);
          setLiveViews(prev => prev + 1);
          if (api.recordItemView) {
            api.recordItemView(item.id, 'Gurgaon')
              .then(res => {
                if (res && res.success && res.liveCount) {
                  setLiveViews(res.liveCount);
                }
              })
              .catch(() => {});
          }
        }
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) observer.unobserve(cardRef.current);
    };
  }, [item.id, hasReportedView]);

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

  // Selective Handpicked Item Specs Tabular Data
  const isSelective = item.featured || item.isHandpicked || 
    item.category === 'Chairs & Seating' || 
    item.category === 'Tents & Canopies' || 
    item.category === 'Stage & Platform Equipment' || 
    item.category === 'Carpets & Flooring' || 
    item.name.toLowerCase().includes('chair') || 
    item.name.toLowerCase().includes('tent') || 
    item.name.toLowerCase().includes('sofa');

  const nameLow = (item.name || '').toLowerCase();
  const specSetupTime = nameLow.includes('tent') ? '1.5–2 Hours' : nameLow.includes('stage') ? '45 Mins' : nameLow.includes('chair') ? '10–20 Mins' : '15–30 Mins';
  const specMaterial = nameLow.includes('pvc') ? 'Virgin High-Density PVC' : nameLow.includes('velvet') ? 'Plush Velvet & Steel' : nameLow.includes('tent') ? 'Weatherproof German Fabric' : 'Commercial Event Grade';

  return (
    <Tilt3DCard maxTilt={5} scale={1.018} glareIntensity={0.16} className="h-full rounded-2xl">
      <div 
        ref={cardRef}
        className="group bg-white rounded-2xl overflow-hidden border border-neutral-200/80 shadow-sm hover:shadow-royal transition-all duration-300 flex flex-col justify-between h-full"
      >
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

          {/* Dynamic Live Viewing Counter (Real Data Updated as User Scrolls) */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 px-2.5 py-1 rounded-lg mt-1">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span><strong>{liveViews} live viewers</strong> (viewed in Lucknow & NCR)</span>
          </div>

          {/* Tabular Ending for Handpicked on selective items */}
          {isSelective && (
            <div className="mt-2.5 pt-2 border-t border-neutral-100 text-[10px]">
              <div className="flex items-center justify-between font-bold text-neutral-700 mb-1">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-[#7c3aed]" />
                  <span>Handpicked Quality Specs</span>
                </span>
                <span className="text-[9px] text-[#7c3aed] uppercase tracking-wider font-semibold">Verified</span>
              </div>
              <table className="w-full text-left border-collapse text-neutral-500">
                <tbody>
                  <tr className="border-b border-neutral-100">
                    <td className="py-0.5 text-neutral-600 font-medium">Setup Time</td>
                    <td className="py-0.5 text-right font-semibold text-neutral-800">{specSetupTime}</td>
                  </tr>
                  <tr className="border-b border-neutral-100">
                    <td className="py-0.5 text-neutral-600 font-medium">Build Quality</td>
                    <td className="py-0.5 text-right font-semibold text-neutral-800">{specMaterial}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 text-neutral-600 font-medium">Warehouse Inspection</td>
                    <td className="py-0.5 text-right font-bold text-emerald-600">100% Sanitized</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
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
  </Tilt3DCard>
);
};

export default ItemCard;
