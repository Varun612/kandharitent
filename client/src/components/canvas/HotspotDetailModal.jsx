import React from 'react';
import { X, Calendar, MessageCircle, Phone, Sparkles, MapPin, CheckCircle } from 'lucide-react';

export const HotspotDetailModal = ({ hotspot, onClose, onOpenEnquiry }) => {
  if (!hotspot) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-brand-card rounded-3xl overflow-hidden shadow-2xl border border-brand-gold/40 flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition"
          aria-label="Close detail modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Header */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-brand-dark">
          <img
            src={hotspot.mediaPath}
            alt={hotspot.title}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-80" />
          
          <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-gold text-brand-dark inline-block mb-1">
              {hotspot.category}
            </span>
            <h3 className="text-2xl font-serif font-bold text-white tracking-wide">
              {hotspot.title}
            </h3>
            <p className="text-xs text-brand-goldLight font-medium">
              {hotspot.subtitle}
            </p>
          </div>
        </div>

        {/* Body Details */}
        <div className="p-6 space-y-5">
          <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
            {hotspot.description}
          </p>

          <div className="p-3.5 bg-brand-cream rounded-2xl border border-brand-border space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-primary">
              <Sparkles className="w-4 h-4 text-brand-gold shrink-0" />
              <span>Kandhari Tent & Caterers Execution Guarantee</span>
            </div>
            <p className="text-[11px] text-neutral-600 leading-normal">
              Every stage, mandap, and light installation is custom engineered for weather resistance, luxury fabric draping, and flawless aesthetic alignment with your celebration theme.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                onClose();
                if (onOpenEnquiry) onOpenEnquiry();
              }}
              className="py-3 px-4 rounded-xl royal-gradient hover:opacity-95 text-white font-bold text-xs shadow-royal flex items-center justify-center gap-2 transition"
            >
              <Calendar className="w-4 h-4 text-brand-gold" />
              <span>Inquire for Your Date</span>
            </button>

            <a
              href="https://wa.me/919305465848?text=Namaste%20Kandhari%20Tent!%20I%20am%20exploring%20the%203D%20website%20and%20would%20like%20to%20discuss%20decor%20and%20lawn%20booking."
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Booking Desk</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotspotDetailModal;
