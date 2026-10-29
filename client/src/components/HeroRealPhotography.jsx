import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Camera,
  ArrowRight,
  Compass,
  Play,
  Pause
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

  // Auto-advance setup spotlight every 5.5 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveSetupIndex((prev) => (prev + 1) % HERO_SETUPS.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const currentSetup = HERO_SETUPS[activeSetupIndex];

  return (
    <section className="relative w-full min-h-[620px] sm:min-h-[720px] lg:min-h-[780px] bg-[#090312] flex flex-col justify-between overflow-hidden">
      
      {/* Background Scenic Real-Photography Layer (No Video in Background) */}
      <div className="absolute inset-0 z-0">
        {HERO_SETUPS.map((setup, index) => (
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

        {/* Floating Celebration Particles (Pure CSS Hardware-Accelerated) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="scenic-particle" style={{ top: '65%', left: '15%', animationDelay: '0s' }} />
          <div className="scenic-particle" style={{ top: '45%', left: '35%', animationDelay: '1.2s' }} />
          <div className="scenic-particle" style={{ top: '75%', left: '55%', animationDelay: '2.5s' }} />
          <div className="scenic-particle" style={{ top: '55%', left: '75%', animationDelay: '3.8s' }} />
          <div className="scenic-particle" style={{ top: '80%', left: '88%', animationDelay: '0.8s' }} />
        </div>

        {/* High-Contrast Obsidian & Royal Gold Framing Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090312] via-black/45 to-black/55 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090312]/95 via-[#090312]/60 to-transparent pointer-events-none" />
      </div>

      {/* Top Brand Banner & Founder Heritage Badge */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 w-full">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/25 pb-4">
          
          {/* Founder Identity Pill */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#140726] border border-amber-400/50 text-white text-xs sm:text-sm font-semibold shadow-lg">
            <img
              src="/media/founder/mahendra-kandhari-founder-portrait.jpg"
              alt="Shri Mahendra Kandhari"
              className="w-6 h-6 rounded-full object-cover border border-amber-300 shrink-0"
            />
            <span className="text-amber-300 font-bold">Founded by Shri Mahendra Kandhari</span>
            <span className="text-neutral-400 hidden sm:inline">&bull;</span>
            <span className="text-neutral-300 text-xs hidden sm:inline">Dwarka Shri Lawn, Lucknow</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] sm:text-xs text-neutral-300 flex-wrap">
            <span className="flex items-center gap-1.5 text-neutral-200 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Kanpur Road, Opp. Pillar No. 37</span>
            </span>

            {/* Scenic Setup Navigation Controls */}
            <div className="flex items-center gap-1.5 bg-black/75 px-3 py-1.5 rounded-xl border border-amber-400/30">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-neutral-200 font-serif font-bold text-xs">
                Setup {activeSetupIndex + 1} of {HERO_SETUPS.length}
              </span>
              <button
                type="button"
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="ml-2 text-neutral-400 hover:text-white transition p-0.5"
                title={isAutoPlaying ? 'Pause Slideshow' : 'Resume Slideshow'}
              >
                {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-amber-400" />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Center Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full flex-1 flex flex-col justify-center">
        <div className="max-w-3xl space-y-4 sm:space-y-6">
          
          {/* Active Setup Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs font-semibold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{currentSetup.tag}</span>
            <span className="text-neutral-500">&bull;</span>
            <span className="text-neutral-300 capitalize">{currentSetup.locality}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[1.15] drop-shadow-md">
            {currentSetup.title}
          </h1>

          {/* Subtitle Description */}
          <p className="text-sm sm:text-base lg:text-lg text-neutral-200/90 font-normal leading-relaxed max-w-2xl drop-shadow-sm">
            {currentSetup.subtitle}
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={onOpenDrawer}
              className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs sm:text-sm shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-black" />
              <span>Plan an Event</span>
            </button>

            <a
              href="#event-discovery"
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-neutral-100 text-[#140726] font-bold text-xs sm:text-sm shadow-md transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#140726]" />
              <span>Explore Services</span>
            </a>

            <Link
              to="/lawn"
              className="px-6 py-3.5 rounded-xl bg-[#2a1145] hover:bg-[#38165c] text-amber-200 border border-amber-400/40 font-bold text-xs sm:text-sm shadow-md transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Explore Dwaraka Shree Lawn</span>
            </Link>

            <a
              href="https://wa.me/919305465848?text=Namaste%20Kandhari%20Tent!%20I%20am%20exploring%20your%20wedding%20website%20and%20would%20like%20to%20discuss%20decor%2C%20catering%2C%20and%20lawn%20booking."
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>

            <a
              href="tel:9305465848"
              className="px-4 py-3.5 rounded-xl bg-[#1d0b38] hover:bg-[#27104b] text-amber-300 font-bold text-xs sm:text-sm border border-amber-500/40 transition flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>Call: 9305465848</span>
            </a>
          </div>

          {/* Genuine Trust Badges Row */}
          <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-5 text-[11px] sm:text-xs text-neutral-300/90 border-t border-amber-500/20">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>100% Real Lucknow Work</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Punctual On-Site Execution</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Direct Family Commitment</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>GST &amp; DRDO Approved</span>
            </span>
          </div>

        </div>
      </div>

      {/* Bottom Setup Switcher Strip - Solid Royal Obsidian Bar */}
      <div className="relative z-10 w-full bg-[#0B0414] border-t border-amber-500/30 py-3 px-4 sm:px-6 lg:px-8 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider hidden md:block">
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
                className={`group px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
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

          <div className="text-[11px] text-neutral-400 hidden lg:flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Capacity: {currentSetup.capacity}</span>
          </div>

        </div>
      </div>

    </section>
  );
};

export default HeroRealPhotography;
