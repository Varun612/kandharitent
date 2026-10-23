import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Eye, 
  MessageCircle, 
  Phone, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin,
  Award,
  Film,
  Camera
} from 'lucide-react';

export const HERO_SETUPS = [
  {
    id: 'hangar-wedding',
    tag: 'Grand Royal Wedding',
    title: 'Imperial German Hangar & Starlight Lawn',
    subtitle: 'All-weather luxury structures, crystal chandeliers, and regal velvet drapery',
    image: '/media/weddings/wedding-1.jpg',
    locality: 'Dwarka Shri Lawn, Kanpur Road',
    capacity: '1,000+ Guests'
  },
  {
    id: 'mandap-vedic',
    tag: 'Sacred Stage Architecture',
    title: 'Fresh Rose & Marigold Vedic Mandap',
    subtitle: 'Traditional wood-and-floral mandap crafted with fragrant marigold, mogra, and brass urlis',
    image: '/media/mandap/mandap-1.jpg',
    locality: 'Traditional Lucknowi Vedic Setup',
    capacity: 'Ceremonial Centerpiece'
  },
  {
    id: 'palace-stage',
    tag: 'Royal Stage Architecture',
    title: 'Carved Palace Arch & Sangeet Stage',
    subtitle: '30-foot elevated modular stage with royal gold archways, moving heads, and floral pillars',
    image: '/media/stage/stage-1.jpg',
    locality: 'Kanpur Road Benchmark',
    capacity: 'Modular Dimensions'
  },
  {
    id: 'lawn-panoramic',
    tag: 'Associated Event Venue',
    title: 'Dwarka Shri Lawn Panoramic Grounds',
    subtitle: 'Expansive natural open-air lawn opposite Pillar No. 37 with dedicated parking and bridal suites',
    image: '/media/lawns/lawn-main.jpg',
    locality: 'Opp. Pillar No. 37, Daroga Kheda',
    capacity: 'Up to 1,500 Guests'
  },
  {
    id: 'vip-seating',
    tag: 'Luxury Furniture & Seating',
    title: 'VIP Maharaja Sofas & Velvet Banqueting',
    subtitle: 'Plush velvet cushioned sofas, banquet seating, and tailored linen covers',
    image: '/media/seating/seating-1.jpg',
    locality: 'Complete In-House Inventory',
    capacity: '500+ Seating Capacity'
  }
];

const HeroRealPhotography = ({ onOpenDrawer, onScrollToCelebrations }) => {
  const [activeSetupIndex, setActiveSetupIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isVideoMode, setIsVideoMode] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    if (mediaQuery.matches) {
      setIsVideoMode(false);
    }
    const handler = (e) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches) setIsVideoMode(false);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Auto-advance setup spotlight every 6 seconds if user hasn't interacted and video is off
  useEffect(() => {
    if (!isAutoPlaying || isVideoMode) return;
    const interval = setInterval(() => {
      setActiveSetupIndex((prev) => (prev + 1) % HERO_SETUPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isVideoMode]);

  const currentSetup = HERO_SETUPS[activeSetupIndex];

  return (
    <section className="relative w-full min-h-[620px] sm:min-h-[720px] lg:min-h-[780px] bg-brand-dark flex flex-col justify-between overflow-hidden">
      
      {/* Background Photography & Video Layers */}
      <div className="absolute inset-0 z-0">
        {/* Cinematic Video Reel Layer */}
        {isVideoMode && !prefersReducedMotion && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000"
            poster={currentSetup.image}
          >
            <source src="/media/videos/night-decor-reel.mp4" type="video/mp4" />
          </video>
        )}

        {/* Photography Slideshow (Active when isVideoMode is false or user prefers reduced motion) */}
        {(!isVideoMode || prefersReducedMotion) && HERO_SETUPS.map((setup, index) => (
          <div
            key={setup.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
              index === activeSetupIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            } transition-transform duration-[6000ms]`}
          >
            <img
              src={setup.image}
              alt={setup.title}
              className="w-full h-full object-cover object-center"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}

        {/* Radiant, High-Visibility Overlays that preserve photography and video brilliance */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/85 via-transparent to-black/25 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/75 via-brand-dark/35 to-transparent pointer-events-none" />
      </div>

      {/* Top Brand Banner & Trust Badges */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 w-full">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-gold/20 pb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-brand-gold/40 text-brand-goldLight text-xs sm:text-sm font-semibold tracking-wide shadow-luxury">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
            <span>Kandhari Tent & Caterers &bull; Dwarka Shri Lawn</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] sm:text-xs text-neutral-300">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-gold" />
              <span className="hidden sm:inline">Kanpur Road</span> Opp. Pillar No. 37, Lucknow
            </span>
            <span className="hidden md:inline text-neutral-500">&bull;</span>
            <span className="hidden md:flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>DRDO Approved Contractor</span>
            </span>

            <button
              type="button"
              onClick={() => setIsVideoMode(!isVideoMode)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                isVideoMode
                  ? 'bg-brand-gold text-brand-dark border-brand-gold shadow-md font-bold'
                  : 'bg-black/50 text-neutral-300 hover:text-white border-white/20 hover:border-brand-gold/40'
              }`}
              title={isVideoMode ? "Switch to Real Event Photography" : "Switch to Cinematic Night Video Reel"}
            >
              {isVideoMode ? (
                <>
                  <Camera className="w-3.5 h-3.5" />
                  <span>Photo Gallery</span>
                </>
              ) : (
                <>
                  <Film className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
                  <span>Night Reel</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Editorial Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 w-full flex-1 flex flex-col justify-center">
        <div className="max-w-2xl lg:max-w-3xl space-y-4 sm:space-y-5 animate-fade-in bg-black/45 backdrop-blur-md p-6 sm:p-9 rounded-3xl border border-white/20 shadow-2xl">
          
          {/* Active Setup Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-brand-primary/90 border border-brand-gold/40 text-brand-goldLight text-xs font-bold uppercase tracking-widest shadow-md">
            <span>{currentSetup.tag}</span>
            <span className="text-brand-gold">&bull;</span>
            <span className="text-white/90 text-[11px] font-normal">{currentSetup.locality}</span>
          </div>

          {/* Majestic Heading */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-white leading-[1.2] drop-shadow-xl">
            {currentSetup.title}
          </h1>

          {/* Subtitle / Description */}
          <p className="text-xs sm:text-sm lg:text-base text-neutral-100 leading-relaxed max-w-2xl font-medium drop-shadow-md">
            {currentSetup.subtitle}
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={onOpenDrawer}
              className="px-6 py-3.5 rounded-xl royal-gradient text-white font-bold text-xs sm:text-sm shadow-luxury hover:opacity-95 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 border border-brand-gold/30"
            >
              <Calendar className="w-4 h-4 text-brand-gold" />
              <span>Plan Your Event</span>
            </button>

            <button
              onClick={onScrollToCelebrations}
              className="px-6 py-3.5 rounded-xl bg-brand-cream/90 hover:bg-white text-brand-primary font-bold text-xs sm:text-sm shadow-md transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Eye className="w-4 h-4 text-brand-primary" />
              <span>Explore Real Setups</span>
            </button>

            <a
              href="https://wa.me/??text=Namaste%20Kandhari%20Tent!%20I%20am%20exploring%20your%20wedding%20website%20and%20would%20like%20to%20discuss%20decor%2C%20catering%2C%20and%20lawn%20booking."
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Desk</span>
            </a>

            <a
              href="/contact"
              className="px-4 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-brand-gold" />
              <span>Toll-Free Desk</span>
            </a>
          </div>

          {/* Genuine Trust Badges Row */}
          <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-5 text-[11px] sm:text-xs text-neutral-300/90">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold shrink-0" />
              <span>100% Real Lucknow Work</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold shrink-0" />
              <span>Punctual On-Site Execution</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold shrink-0" />
              <span>Direct Family Commitment</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-brand-gold shrink-0" />
              <span>GST & Tender Compliant</span>
            </span>
          </div>

        </div>
      </div>

      {/* Bottom Setup Switcher Strip */}
      <div className="relative z-10 w-full bg-brand-dark/90 backdrop-blur-md border-t border-brand-gold/25 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="text-[11px] font-bold text-brand-gold uppercase tracking-wider hidden md:block">
            Genuine Setup Showcases:
          </div>

          {/* Thumbnail / Tabs Selector */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 w-full sm:w-auto">
            {HERO_SETUPS.map((setup, idx) => (
              <button
                key={setup.id}
                onClick={() => {
                  setActiveSetupIndex(idx);
                  setIsAutoPlaying(false);
                }}
                className={`group px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  idx === activeSetupIndex
                    ? 'bg-brand-gold text-brand-dark font-bold shadow-md scale-102'
                    : 'bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span className="truncate max-w-[130px] sm:max-w-none">{setup.tag}</span>
              </button>
            ))}
          </div>

          <div className="text-[10px] text-neutral-400 font-medium hidden lg:block">
            {currentSetup.capacity}
          </div>

        </div>
      </div>

    </section>
  );
};

export default HeroRealPhotography;
