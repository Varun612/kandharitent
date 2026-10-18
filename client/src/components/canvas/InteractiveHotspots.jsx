import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { Sparkles, Eye, MapPin, Layers } from 'lucide-react';

const HOTSPOTS = [
  {
    id: 'mandap',
    title: 'The Royal Mandap',
    subtitle: 'Carved Pillars & Fresh Floral Artistry',
    position: [0, 3.2, 0],
    view: 'mandap',
    category: 'Stage & Mandap',
    description: 'Custom handcrafted 4-pillar mandap with marigold garlands, sacred havan dais, and ceremonial seating.',
    mediaPath: '/media/mandap/mandap-1.jpg'
  },
  {
    id: 'canopy',
    title: 'Fairy Light Canopy',
    subtitle: 'Suspended Warm Filament Glow & Chandelier',
    position: [0, 7.5, 0],
    view: 'canopy',
    category: 'Lighting & Decor',
    description: 'Hundreds of suspended warm ambient fairy lights with faceted crystal chandeliers casting twilight radiance.',
    mediaPath: '/media/rich-decor/IMG_3962.JPG'
  },
  {
    id: 'lawn',
    title: 'Dwarka Shri Lawn',
    subtitle: 'Kanpur Road, Lucknow (Up to 1,000+ Guests)',
    position: [8, 1.8, 4],
    view: 'lawn',
    category: 'Lawn Venue',
    description: 'Expansive lush open-air celebration venue opposite Pillar No. 37 with dedicated parking and bridal suites.',
    mediaPath: '/media/lawns/lawn-main.jpg'
  },
  {
    id: 'entrance',
    title: 'Grand Welcome Arch',
    subtitle: 'Royal Gateway & Illuminated Pathway',
    position: [0, 4.2, 18],
    view: 'entrance',
    category: 'Entrance Gate',
    description: 'Majestic archway decorated with floral bells and warm lantern lights welcoming guests in grand Lucknow style.',
    mediaPath: '/media/gate/gate-1.jpg'
  }
];

/**
 * Interactive 3D pins placed inside the scene using Drei Html
 */
export const InteractiveHotspots = ({ onSelectView, onOpenDetail }) => {
  const [activePin, setActivePin] = useState(null);

  return (
    <group>
      {HOTSPOTS.map((spot) => (
        <group key={spot.id} position={spot.position}>
          <Html
            center
            distanceFactor={18}
            className="select-none pointer-events-auto"
          >
            <div 
              className="relative group cursor-pointer"
              onMouseEnter={() => setActivePin(spot.id)}
              onMouseLeave={() => setActivePin(null)}
            >
              {/* Pulsing 3D Pin Button */}
              <button
                onClick={() => {
                  if (onSelectView) onSelectView(spot.view);
                  if (onOpenDetail) onOpenDetail(spot);
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-luxury ${
                  activePin === spot.id 
                    ? 'bg-brand-primary scale-125 ring-4 ring-brand-gold/60 text-brand-goldLight' 
                    : 'bg-brand-plum/90 hover:bg-brand-primary text-brand-gold border border-brand-gold/50'
                }`}
                title={`Explore ${spot.title}`}
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
              </button>

              {/* Tooltip Card (Revealed on hover or when pin is active) */}
              <div 
                className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-3.5 bg-brand-dark/95 backdrop-blur-md rounded-2xl border border-brand-gold/40 shadow-2xl transition-all duration-300 z-50 ${
                  activePin === spot.id 
                    ? 'opacity-100 translate-y-0 pointer-events-auto' 
                    : 'opacity-0 translate-y-2 pointer-events-none'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-gold/20 text-brand-goldLight border border-brand-gold/30">
                    {spot.category}
                  </span>
                </div>
                <h4 className="text-xs font-serif font-bold text-white tracking-wide">
                  {spot.title}
                </h4>
                <p className="text-[11px] text-neutral-300 mt-1 line-clamp-2 leading-relaxed">
                  {spot.description}
                </p>

                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectView) onSelectView(spot.view);
                    }}
                    className="text-[10px] text-brand-gold hover:text-white font-semibold flex items-center gap-1 transition"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Focus Camera</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenDetail) onOpenDetail(spot);
                    }}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-brand-accent hover:bg-brand-accentLight text-white font-semibold transition"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
};

export default InteractiveHotspots;
