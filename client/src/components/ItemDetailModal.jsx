import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  ShoppingBag, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  HelpCircle,
  Phone
} from 'lucide-react';
import { useEnquiry } from '../context/EnquiryContext';

const ItemDetailModal = ({ item, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useEnquiry();

  if (!item) return null;

  const handleAdd = () => {
    addItem(item, quantity);
    onClose();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Currently Available</span>
          </span>
        );
      case 'Limited':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Limited Stock Available</span>
          </span>
        );
      case 'Out of Stock':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
            <XCircle className="w-3.5 h-3.5 text-neutral-400" />
            <span>Reserved for Upcoming Dates</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-brand-purple">
            <span>Enquire for Dates</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-neutral-100 flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Left: Image */}
        <div className="relative md:w-1/2 aspect-4/3 md:aspect-auto bg-neutral-100">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-black/65 text-white backdrop-blur-md">
              {item.category}
            </span>
          </div>
          {item.featured && (
            <div className="absolute bottom-4 left-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-gold text-brand-dark uppercase tracking-wider shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Popular Choice</span>
              </span>
            </div>
          )}
        </div>

        {/* Right: Details & Actions */}
        <div className="p-6 md:w-1/2 flex flex-col justify-between overflow-y-auto space-y-5">
          <div className="space-y-3">
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="text-xs font-semibold text-brand-purple uppercase tracking-wider">
                  Kandhari Rental Inventory
                </p>
                <h2 className="text-xl font-serif font-bold text-neutral-900 mt-1">
                  {item.name}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>{getStatusBadge(item.availabilityStatus)}</div>

            <div className="pt-2">
              <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Item Description
              </h4>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Inventory Note */}
            <div className="bg-brand-cream/80 border border-brand-gold/30 rounded-xl p-3 text-xs text-neutral-700 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-brand-primary">
                <HelpCircle className="w-4 h-4 text-brand-gold" />
                <span>Rental & Delivery Policy</span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-normal">
                Includes on-site delivery, placement, and post-event retrieval across Lucknow. Custom multi-day discounts available.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-neutral-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-600">
                Quantity to Request:
              </span>
              
              <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-neutral-700 hover:text-brand-purple shadow-xs"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-bold text-neutral-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-neutral-700 hover:text-brand-purple shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={item.availabilityStatus === 'Out of Stock'}
              className="w-full py-3 px-4 rounded-xl royal-gradient hover:opacity-95 text-white font-semibold text-sm shadow-royal flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <ShoppingBag className="w-4 h-4 text-brand-gold" />
              <span>Add {quantity} to Enquiry List</span>
            </button>

            <div className="text-center">
              <a
                href="tel:9305465848"
                className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-brand-purple transition"
              >
                <Phone className="w-3.5 h-3.5 text-brand-gold" />
                <span>Questions? Call our booking desk: 9305465848</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ItemDetailModal;
