import React, { useState, Suspense, lazy } from 'react';
import { Sparkles, Eye, Compass, Move3d, RotateCcw, Calendar, Phone, CheckCircle, MapPin, Layers } from 'lucide-react';
import HotspotDetailModal from './canvas/HotspotDetailModal';

// Lazy-load the Three.js WebGL Canvas scene so initial bundle stays lightweight
const WeddingScene = lazy(() => import('./canvas/WeddingScene'));

export const ThreeVenueExperience = ({ onOpenEnquiry }) => {
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [isClient, setIsClient] = useState(typeof window !== 'undefined');

  return (
    <section className="relative w-full bg-[#0a0212] border-y border-amber-500/20 py-12 sm:py-16 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs font-semibold tracking-wide uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Real-Time 3D Spatial Walkthrough</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              Explore Dwarka Shri Lawn in <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100">Interactive 3D</span>
            </h2>
            <p className="text-neutral-300 text-xs sm:text-sm max-w-2xl mt-2 leading-relaxed">
              Step into an illuminated twilight architectural simulation of our Kanpur Road venue. Inspect our handcrafted Royal Mandap, suspended fairy light canopies, and manicured celebration grounds from any angle.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-end">
            <button
              onClick={() => {
                if (onOpenEnquiry) onOpenEnquiry('Dwaraka Shree Lawn');
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-black" />
              <span>Check Lawn Availability</span>
            </button>
            <a
              href="tel:+919305465848"
              className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-200 border border-amber-500/30 font-semibold text-xs transition flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Call Helpline</span>
            </a>
          </div>
        </div>

        {/* 3D Canvas Container */}
        <div className="relative w-full rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl bg-[#0F0218]">
          {isClient && !hasError ? (
            <Suspense
              fallback={
                <div className="w-full h-[65vh] sm:h-[75vh] flex flex-col items-center justify-center bg-[#0F0218] text-center p-6 space-y-4">
                  <div className="w-12 h-12 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                  <p className="text-amber-200 text-sm font-serif">Loading 3D Twilight Venue Simulation...</p>
                  <p className="text-neutral-400 text-xs max-w-sm">
                    Rendering architectural pillars, fairy light canopy, and procedural atmospheric particles.
                  </p>
                </div>
              }
            >
              <WeddingScene onOpenHotspotDetail={(spot) => setSelectedHotspot(spot)} />
            </Suspense>
          ) : (
            <div className="relative w-full h-[65vh] sm:h-[75vh] flex items-center justify-center text-center p-6 bg-cover bg-center" style={{ backgroundImage: `url('/media/lawns/lawn-main.jpg')` }}>
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
              <div className="relative z-10 max-w-md space-y-3">
                <Sparkles className="w-8 h-8 text-amber-400 mx-auto" />
                <h3 className="text-xl font-serif font-bold text-white">Dwarka Shri Lawn, Kanpur Road</h3>
                <p className="text-xs text-neutral-300">
                  Lush open-air manicured grounds for up to 1,200 guests with complete tenting, floral mandap, and luxury catering.
                </p>
                <button
                  onClick={() => onOpenEnquiry && onOpenEnquiry('Dwaraka Shree Lawn')}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs"
                >
                  Book a Site Visit
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3D Feature Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Move3d className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">360° Free Orbit</h4>
              <p className="text-[11px] text-neutral-400">Rotate and zoom freely</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Vedic Royal Mandap</h4>
              <p className="text-[11px] text-neutral-400">Pillars, havan fire & dais</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Fairy Light Canopy</h4>
              <p className="text-[11px] text-neutral-400">Suspended twilight glow</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Interactive Pins</h4>
              <p className="text-[11px] text-neutral-400">Click pins for real photos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hotspot Photo Detail Modal */}
      {selectedHotspot && (
        <HotspotDetailModal
          hotspot={selectedHotspot}
          onClose={() => setSelectedHotspot(null)}
          onOpenEnquiry={() => {
            setSelectedHotspot(null);
            if (onOpenEnquiry) onOpenEnquiry(selectedHotspot.category);
          }}
        />
      )}
    </section>
  );
};

export default ThreeVenueExperience;
