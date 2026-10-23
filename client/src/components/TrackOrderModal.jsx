import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Truck, ArrowRight, X, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

const TrackOrderModal = ({ isOpen, onClose, onOpenRentalCatalogue }) => {
  const [manualOrderId, setManualOrderId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    const cleanId = manualOrderId.trim();
    if (!cleanId) {
      setErrorMsg('Please enter your Order Reference (e.g. ENQ-124249)');
      return;
    }
    onClose();
    navigate(`/track/${cleanId}`);
  };

  const handleGoToCatalogue = () => {
    onClose();
    if (onOpenRentalCatalogue) {
      onOpenRentalCatalogue();
    } else {
      navigate('/catalogue');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#11081e] text-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-2 border-amber-500/40 relative overflow-hidden space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <Truck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif font-black text-lg text-white">
                Track Rental Order
              </h3>
              <p className="text-xs text-amber-300 font-medium">
                Live Dispatch &amp; Delivery Milestones
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center font-bold transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Empty Cart Notification Box */}
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/40">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-amber-200">
              No Active Order Found in Cart
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed">
              You haven&apos;t added items to your cart or completed a rental booking yet. Please add rental items from our catalogue to submit an enquiry and track your delivery.
            </p>
          </div>

          <button
            onClick={handleGoToCatalogue}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Rental Catalogue &bull; Add Items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Manual Existing Reference Lookup (in case user already has reference like ENQ-123456) */}
        <div className="pt-2 border-t border-neutral-800 space-y-3">
          <span className="text-[11px] text-neutral-400 uppercase tracking-wider block font-semibold text-center">
            Already have an Order Reference from WhatsApp/Call?
          </span>
          <form onSubmit={handleTrackSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualOrderId}
              onChange={(e) => {
                setManualOrderId(e.target.value);
                setErrorMsg('');
              }}
              placeholder="e.g. ENQ-124249"
              className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-bold text-xs border border-neutral-600 transition"
            >
              Track
            </button>
          </form>
          {errorMsg && (
            <p className="text-[11px] text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errorMsg}</span>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default TrackOrderModal;
