import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Phone,
  Ruler,
  Lock
} from 'lucide-react';
import { useEnquiry } from '../context/EnquiryContext';
import { useAuth } from '../context/AuthContext';

const ItemDetailModal = ({ item, onClose }) => {
  const { addItem } = useEnquiry();
  const { isCustomerAuthenticated, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const isArea = !!(item && (item.isAreaBased || item.ratePerSqFt || (item.category && item.category.includes('Tent')) || (item.category && item.category.includes('Carpet'))));
  const ratePerSqFt = item?.ratePerSqFt || 5;

  // Pre-configured standard dimensions by item ID or category
  const getDefaultPreset = () => {
    if (!item) return { length: 20, width: 30, label: '20 × 30 ft (600 sq ft)' };
    if (item.id === 'item-carpet-red') return { length: 10, width: 20, label: '10 × 20 ft (200 sq ft)' };
    if (item.id === 'item-tent-halwai') return { length: 10, width: 20, label: '10 × 20 ft (200 sq ft)' };
    return { length: 20, width: 30, label: '20 × 30 ft (600 sq ft)' };
  };

  const defaultPreset = getDefaultPreset();
  const [selectedDimensionPreset, setSelectedDimensionPreset] = useState(defaultPreset.label);
  const [customLength, setCustomLength] = useState(defaultPreset.length);
  const [customWidth, setCustomWidth] = useState(defaultPreset.width);
  const [quantity, setQuantity] = useState(1);

  if (!item) return null;

  // Calculate effective dimensions & area
  const effectiveLength = selectedDimensionPreset === 'Custom' ? customLength : (
    selectedDimensionPreset.includes('10 × 20') ? 10 :
    selectedDimensionPreset.includes('10 × 40') ? 10 :
    selectedDimensionPreset.includes('20 × 20') ? 20 :
    selectedDimensionPreset.includes('20 × 30') ? 20 :
    selectedDimensionPreset.includes('30 × 40') ? 30 :
    selectedDimensionPreset.includes('30 × 50') ? 30 :
    selectedDimensionPreset.includes('40 × 60') ? 40 : defaultPreset.length
  );

  const effectiveWidth = selectedDimensionPreset === 'Custom' ? customWidth : (
    selectedDimensionPreset.includes('10 × 20') ? 20 :
    selectedDimensionPreset.includes('10 × 40') ? 40 :
    selectedDimensionPreset.includes('20 × 20') ? 20 :
    selectedDimensionPreset.includes('20 × 30') ? 30 :
    selectedDimensionPreset.includes('30 × 40') ? 40 :
    selectedDimensionPreset.includes('30 × 50') ? 50 :
    selectedDimensionPreset.includes('40 × 60') ? 60 : defaultPreset.width
  );

  const totalAreaSqFt = effectiveLength * effectiveWidth;
  const dimensionString = `${effectiveLength} × ${effectiveWidth} ft`;

  // Calculated preview amount
  const lineItemTotal = isArea
    ? Math.round(totalAreaSqFt * ratePerSqFt * quantity)
    : Math.round((item.rentalPrice || item.rate || 0) * quantity);

  const handleAdd = () => {
    const config = isArea ? {
      dimensions: dimensionString,
      length: effectiveLength,
      width: effectiveWidth
    } : {};

    addItem(item, quantity, config);
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
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-neutral-100 flex flex-col md:flex-row max-h-[92vh]">
        
        {/* Left: Image */}
        <div className="relative md:w-1/2 aspect-4/3 md:aspect-auto bg-neutral-100">
          <img
            src={item.imageUrl}
            alt={item.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/media/rich-decor/decor-1.jpg';
            }}
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
        <div className="p-6 md:w-1/2 flex flex-col justify-between overflow-y-auto space-y-4">
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

            {/* Authoritative Rate Display */}
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/70 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-neutral-500 block">Rate</span>
                <span className="text-lg font-serif font-bold text-brand-primary">
                  {isArea ? `₹${ratePerSqFt} / sq ft` : `₹${(item.rentalPrice || 0).toLocaleString('en-IN')}`}
                </span>
                <span className="text-[11px] text-neutral-500 ml-1">
                  {item.billingUnit ? `(${item.billingUnit})` : (isArea ? 'per day' : 'per piece')}
                </span>
              </div>
              {item.availableQuantity > 0 && (
                <span className="text-xs text-neutral-400 font-medium">
                  {item.availableQuantity} units stock
                </span>
              )}
            </div>

            {/* Area / Dimension Configurator */}
            {isArea && (
              <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                  <Ruler className="w-4 h-4 text-brand-gold" />
                  <span>Select Dimensions & Size</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {item.id === 'item-carpet-red' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setSelectedDimensionPreset('10 × 20 ft (200 sq ft)')}
                        className={`p-2 rounded-xl border text-left font-medium transition ${
                          selectedDimensionPreset === '10 × 20 ft (200 sq ft)'
                            ? 'bg-brand-primary text-white border-brand-primary'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        10 × 20 ft (200 sq ft)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDimensionPreset('10 × 40 ft (400 sq ft)')}
                        className={`p-2 rounded-xl border text-left font-medium transition ${
                          selectedDimensionPreset === '10 × 40 ft (400 sq ft)'
                            ? 'bg-brand-primary text-white border-brand-primary'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        10 × 40 ft (400 sq ft)
                      </button>
                    </>
                  ) : item.id === 'item-tent-waterproof' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setSelectedDimensionPreset('20 × 30 ft (600 sq ft)')}
                        className={`p-2 rounded-xl border text-left font-medium transition ${
                          selectedDimensionPreset === '20 × 30 ft (600 sq ft)'
                            ? 'bg-brand-primary text-white border-brand-primary'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        20 × 30 ft (600 sq ft)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDimensionPreset('30 × 50 ft (1500 sq ft)')}
                        className={`p-2 rounded-xl border text-left font-medium transition ${
                          selectedDimensionPreset === '30 × 50 ft (1500 sq ft)'
                            ? 'bg-brand-primary text-white border-brand-primary'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        30 × 50 ft (1500 sq ft)
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setSelectedDimensionPreset('20 × 30 ft (600 sq ft)')}
                        className={`p-2 rounded-xl border text-left font-medium transition ${
                          selectedDimensionPreset === '20 × 30 ft (600 sq ft)'
                            ? 'bg-brand-primary text-white border-brand-primary'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        20 × 30 ft (600 sq ft)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDimensionPreset('20 × 20 ft (400 sq ft)')}
                        className={`p-2 rounded-xl border text-left font-medium transition ${
                          selectedDimensionPreset === '20 × 20 ft (400 sq ft)'
                            ? 'bg-brand-primary text-white border-brand-primary'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        20 × 20 ft (400 sq ft)
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedDimensionPreset('Custom')}
                    className={`col-span-2 p-2 rounded-xl border text-center font-medium transition ${
                      selectedDimensionPreset === 'Custom'
                        ? 'bg-brand-primary text-white border-brand-primary'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    Custom Dimensions (Enter L × W)
                  </button>
                </div>

                {selectedDimensionPreset === 'Custom' && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-0.5">Length (ft)</label>
                      <input
                        type="number"
                        min="5"
                        max="200"
                        value={customLength}
                        onChange={(e) => setCustomLength(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-0.5">Width (ft)</label>
                      <input
                        type="number"
                        min="5"
                        max="200"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs bg-white"
                      />
                    </div>
                  </div>
                )}

                <div className="text-[11px] text-neutral-600 flex justify-between pt-1 border-t border-amber-200/50">
                  <span>Selected: <strong>{dimensionString}</strong> ({totalAreaSqFt} sq ft)</span>
                  <span>₹{ratePerSqFt}/sq ft</span>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Item Description
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-neutral-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-600">
                Quantity:
              </span>
              
              <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-neutral-700 hover:text-brand-purple shadow-xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-neutral-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-neutral-700 hover:text-brand-purple shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Live Amount Preview */}
            <div className="bg-brand-cream/60 p-2.5 rounded-xl border border-brand-gold/30 flex items-center justify-between">
              <span className="text-xs text-neutral-600 font-medium">Estimated Item Cost:</span>
              <span className="text-base font-serif font-bold text-brand-primary">
                ₹{lineItemTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={item.availabilityStatus === 'Out of Stock'}
              className="w-full py-3 px-4 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              <span>Add {quantity} to Rental Cart (₹{lineItemTotal.toLocaleString('en-IN')})</span>
            </button>

            <div className="text-center">
              <a
                href="/contact"
                className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-brand-purple transition"
              >
                <Phone className="w-3.5 h-3.5 text-brand-gold" />
                <span>Toll-Free Booking Desk: 1800-890-3456</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ItemDetailModal;
