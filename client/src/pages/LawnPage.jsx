import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Users, 
  Phone, 
  CheckCircle2, 
  Trees, 
  Home, 
  Zap, 
  Car, 
  Utensils, 
  Check, 
  MessageCircle, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Eye,
  Award,
  Move3d,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { FALLBACK_VENUE } from '../data/seedItems';
import LawnEnquiryModal from '../components/LawnEnquiryModal';
import { useEnquiry } from '../context/EnquiryContext';
import LawnScrollCanvas from '../components/canvas/LawnScrollCanvas';
import HotspotDetailModal from '../components/canvas/HotspotDetailModal';

const iconMap = {
  Trees: Trees,
  Home: Home,
  Zap: Zap,
  Car: Car,
  Sparkles: Sparkles,
  Utensils: Utensils,
  CheckCircle: CheckCircle2
};

const LawnPage = () => {
  const [venue, setVenue] = useState(FALLBACK_VENUE);
  const [isLawnModalOpen, setIsLawnModalOpen] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0.05);
  const [activeScene, setActiveScene] = useState(0);
  const { openDrawer } = useEnquiry();

  const heroScrollContainerRef = useRef(null);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const res = await api.getVenue();
        if (res.success && res.data) {
          setVenue(res.data);
        }
      } catch (err) {
        console.warn('Error loading venue info from server, using local fallback', err);
      }
    };
    fetchVenue();
  }, []);

  // Coordinated scroll tracking for the 3D cinematic journey
  useEffect(() => {
    const handleScroll = () => {
      if (!heroScrollContainerRef.current) return;
      const rect = heroScrollContainerRef.current.getBoundingClientRect();
      const containerHeight = heroScrollContainerRef.current.offsetHeight;
      const windowHeight = window.innerHeight;
      
      const scrollableDist = containerHeight - windowHeight;
      if (scrollableDist > 0) {
        const progress = Math.max(0, Math.min(1, -rect.top / scrollableDist));
        setScrollProgress(progress);

        if (progress < 0.28) setActiveScene(0);
        else if (progress < 0.58) setActiveScene(1);
        else if (progress < 0.85) setActiveScene(2);
        else setActiveScene(3);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelectScene = (sceneIndex, targetProgress) => {
    setActiveScene(sceneIndex);
    if (targetProgress !== undefined) {
      setScrollProgress(targetProgress);
    }
  };

  const scrollToOverview = () => {
    const el = document.getElementById('venue-overview');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const eventSetups = [
    {
      title: 'Weddings & Grand Receptions',
      subtitle: 'Up to 1,000+ Guests',
      description: 'Lush open-air manicured grounds configured with high-ceiling German hangars, royal floral mandaps, and tiered banquet seating.',
      image: '/media/rich-decor/decor-1.jpg',
      badge: 'Main Lawn Showcase'
    },
    {
      title: 'Sangeet & Haldi Celebrations',
      subtitle: 'Vibrant Daytime & Evening Festivities',
      description: 'Bright marigold canopies, bridal photobooth swings, and high-impact truss illumination with acoustic sound layout.',
      image: '/media/haldi-mehendi/haldi-1.jpg',
      badge: 'Festive Styling'
    },
    {
      title: 'Engagements & Ring Ceremonies',
      subtitle: 'Sophisticated Intimate Elegance',
      description: 'Custom pastel flower backdrops, VIP Maharaja seating lounges, and refined ambient fairy light ceilings.',
      image: '/media/stage/stage-1.jpg',
      badge: 'Stage Architecture'
    },
    {
      title: 'Birthday & Anniversary Banquets',
      subtitle: 'Personalized Family Celebrations',
      description: 'Round banquet dining layouts with brass buffet counters, ambient garden lanterns, and dedicated family dining zones.',
      image: '/media/seating/seating-1.jpg',
      badge: 'Dining & Hospitality'
    }
  ];

  return (
    <div className="space-y-24 pb-24 animate-fadeIn">
      
      {/* ============================================================ */}
      {/* SCENE ONE: THE GRAND CELEBRATION (CINEMATIC 3D VENUE HERO) */}
      {/* ============================================================ */}
      <section 
        ref={heroScrollContainerRef} 
        className="relative w-full bg-brand-twilight overflow-hidden"
      >
        {/* Real 3D Twilight Venue Canvas */}
        <LawnScrollCanvas
          scrollProgress={scrollProgress}
          activeScene={activeScene}
          onSelectScene={handleSelectScene}
          onOpenHotspotDetail={(spot) => setSelectedHotspot(spot)}
        />

        {/* Hero Editorial Presentation (Positioned over the scene) */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-20 pb-16 text-center z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-dark/90 backdrop-blur-md border border-brand-gold/40 text-brand-goldLight text-xs sm:text-sm font-semibold tracking-wide shadow-luxury animate-shimmer">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
            <span>Dwarka Shri Lawn • Managed by Kandhari Tent & Caterers</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight text-white leading-tight drop-shadow-lg max-w-4xl mx-auto">
            An Elegant Celebration Venue on <br className="hidden sm:inline" />
            <span className="text-gold-gradient">
              Kanpur Road, Lucknow
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-neutral-200/90 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Discover <strong>Dwarka Shri Lawn</strong> for weddings, family celebrations, and memorable gatherings. Expansive open-air elegance managed directly by Kandhari Tent & Caterers.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={() => setIsLawnModalOpen(true)}
              className="px-7 py-3.5 rounded-xl royal-gradient text-white font-bold text-xs sm:text-sm shadow-luxury hover:opacity-95 transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-brand-gold" />
              <span>Check Date Availability</span>
            </button>

            <button
              onClick={openDrawer}
              className="px-7 py-3.5 rounded-xl bg-brand-cream hover:bg-brand-creamDark text-brand-primary font-bold text-xs sm:text-sm shadow-md transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-brand-gold" />
              <span>Plan Your Event</span>
            </button>

            <button
              onClick={scrollToOverview}
              className="px-6 py-3.5 rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-md border border-brand-gold/40 text-brand-goldLight font-semibold text-xs sm:text-sm transition flex items-center gap-2"
            >
              <Eye className="w-4 h-4 text-brand-gold" />
              <span>Explore the Venue</span>
            </button>
          </div>

          {/* Verified Address & Highway Marker */}
          <div className="pt-4 flex items-center justify-center gap-2 text-xs text-brand-goldLight drop-shadow-sm">
            <MapPin className="w-4 h-4 text-brand-gold shrink-0" />
            <span>Opp. Pillar No. 37, Daroga Kheda, Kanpur Road, Lucknow, Uttar Pradesh</span>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SCENE TWO: ENTER THE VENUE (OVERVIEW & TENT SYNERGY)       */}
      {/* ============================================================ */}
      <section id="venue-overview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">
                Venue Overview & Synergy
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-primary leading-tight">
                Open-Air Grandeur Paired with Professional Tent Engineering
              </h2>
            </div>
            
            <p className="text-sm text-neutral-700 leading-relaxed">
              {venue.description || 'Nestled conveniently on Kanpur Road opposite Pillar No. 37 in Daroga Kheda, Dwarka Shri Lawn offers an expansive, beautifully landscaped open-air venue ideal for weddings, grand receptions, Sangeet & Mehendi festivities, ring ceremonies, and milestone celebrations.'}
            </p>

            <div className="p-5 bg-brand-cream rounded-2xl border border-brand-border space-y-3 shadow-xs">
              <h4 className="font-bold text-brand-primary text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-gold" />
                <span>The Direct Advantage: Venue + Tent Synergy</span>
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Because <strong>Dwarka Shri Lawn</strong> is operated and managed directly by <strong>Kandhari Tent & Caterers</strong>, our hosts enjoy perfectly synchronized lighting, tailor-fit German hangars, plush carpeted stages, and uninterrupted power backup without external vendor coordination delays.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white border border-brand-border shadow-xs">
                <p className="text-xs text-neutral-500 font-medium">Guest Capacity</p>
                <p className="text-xl font-serif font-bold text-brand-primary mt-0.5">Up to 1,000+</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-brand-border shadow-xs">
                <p className="text-xs text-neutral-500 font-medium">Power Distribution</p>
                <p className="text-xl font-serif font-bold text-brand-primary mt-0.5">100% Generator</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-brand-border shadow-xs col-span-2 sm:col-span-1">
                <p className="text-xs text-neutral-500 font-medium">Dressing Suites</p>
                <p className="text-xl font-serif font-bold text-brand-primary mt-0.5">AC Private Rooms</p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => setIsLawnModalOpen(true)}
                className="px-6 py-3 rounded-xl royal-gradient text-white text-xs sm:text-sm font-bold shadow-luxury hover:opacity-95 transition flex items-center gap-2"
              >
                <span>Request Date Availability</span>
                <ChevronRight className="w-4 h-4 text-brand-gold" />
              </button>
              
              <a
                href="https://wa.me/919305465848?text=Namaste!%20I%20am%20inquiring%20about%20booking%20Dwarka%20Shri%20Lawn%20on%20Kanpur%20Road,%20Lucknow."
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right: Venue Images Grid with Authentic Photography */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="col-span-2 rounded-2xl overflow-hidden shadow-luxury group relative aspect-16/9 border border-brand-border">
              <img
                src="/media/lawns/lawn-main.jpg"
                alt="Dwarka Shri Lawn setup in Lucknow"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <p className="text-xs text-white font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Main Landscaped Lawn Ground — Kanpur Road</span>
                </p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-sm group relative aspect-square border border-brand-border">
              <img
                src="/media/rich-decor/decor-1.jpg"
                alt="German Hangar on Lawn"
                onError={(e) => { e.currentTarget.src = '/media/rich-decor/decor-2.jpg'; }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                <p className="text-[11px] text-white font-medium">All-Weather Tenting</p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-sm group relative aspect-square border border-brand-border">
              <img
                src="/media/gate/gate-1.jpg"
                alt="Illuminated Grand Gateway"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                <p className="text-[11px] text-white font-medium">Welcome Gateway</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* SCENE THREE: THE WEDDING STAGE & MANDAP FOCUS                */}
      {/* ============================================================ */}
      <section className="bg-brand-dark text-white py-20 border-y border-brand-gold/25 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-brand-gold text-brand-dark uppercase tracking-widest inline-block">
              Focal Point of Celebration
            </span>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
              The Royal Mandap & Ceremonial Stage Artistry
            </h2>

            <p className="text-sm text-neutral-300 leading-relaxed">
              Every sacred vow deserves a dignified setting. At Dwarka Shri Lawn, our in-house craftsmanship delivers bespoke 4-pillar and circular mandaps decorated with fresh marigold (*saffron*) and jasmine garlands, auspicious kalash motifs, sacred havan altars, and royal velvet bajots.
            </p>

            <ul className="space-y-3 text-xs text-neutral-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" />
                <span>Custom floral canopies (fresh exotic flowers or traditional marigolds)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" />
                <span>Heavy-duty stage leveling with clean carpeted risers</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" />
                <span>Overhead crystal chandeliers and focused warm spotlighting</span>
              </li>
            </ul>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/gallery"
                className="px-6 py-3 rounded-xl royal-gradient text-white font-bold text-xs shadow-luxury hover:opacity-95 transition flex items-center gap-2"
              >
                <span>Browse Mandap & Stage Gallery</span>
                <ArrowRight className="w-4 h-4 text-brand-gold" />
              </Link>

              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setActiveScene(2);
                  setScrollProgress(0.70);
                }}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-brand-gold/40 text-brand-goldLight text-xs font-semibold transition flex items-center gap-2"
              >
                <Move3d className="w-4 h-4 text-brand-gold" />
                <span>Inspect in 3D Scene</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-2 border-brand-gold/40 group">
              <img
                src="/media/mandap/mandap-1.jpg"
                alt="Royal Floral Mandap at Dwarka Shri Lawn Lucknow"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <p className="text-xs text-brand-gold font-semibold uppercase tracking-wider">
                  Real Lucknow Mandap Setup
                </p>
                <h3 className="text-xl font-serif font-bold">
                  Bespoke Handcrafted Wedding Mandaps
                </h3>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* SCENE FOUR: AUTHENTIC EVENT SETUPS (REAL PHOTOGRAPHY)        */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">
            Versatile Celebration Formats
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-primary">
            Curated Event Setups at Dwarka Shri Lawn
          </h2>
          <p className="text-sm text-neutral-600 max-w-2xl mx-auto">
            Explore authentic photographs of how our lawn is transformed for different milestone celebrations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {eventSetups.map((setup, idx) => (
            <div
              key={idx}
              className="group bg-brand-card rounded-3xl overflow-hidden border border-brand-border shadow-luxury hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between"
            >
              <div className="relative aspect-16/10 overflow-hidden bg-brand-dark">
                <img
                  src={setup.image}
                  alt={setup.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/85 via-black/20 to-transparent flex items-end p-5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand-gold text-brand-dark">
                    {setup.badge}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-serif font-bold text-brand-primary group-hover:text-brand-plum transition">
                    {setup.title}
                  </h3>
                  <p className="text-xs font-medium text-brand-gold mt-0.5">
                    {setup.subtitle}
                  </p>
                  <p className="text-xs text-neutral-600 leading-relaxed mt-2">
                    {setup.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-brand-border/60 flex items-center justify-between">
                  <button
                    onClick={() => setIsLawnModalOpen(true)}
                    className="text-xs font-bold text-brand-primary hover:text-brand-accent transition flex items-center gap-1"
                  >
                    <span>Check Availability</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={`https://wa.me/919305465848?text=Namaste!%20I%20am%20interested%20in%20hosting%20a%20${encodeURIComponent(setup.title)}%20at%20Dwarka%20Shri%20Lawn.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Inquiry</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SCENE FIVE: FACILITIES & AMENITIES                           */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">
            Comfort & Convenience
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-primary">
            Venue Facilities & Infrastructure
          </h2>
          <p className="text-sm text-neutral-600 max-w-xl mx-auto">
            Thoughtfully planned infrastructure to ensure a dignified, comfortable experience for hosts and guests alike.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(venue.amenities || []).map((amenity) => {
            const IconComponent = iconMap[amenity.icon] || CheckCircle2;
            return (
              <div
                key={amenity.id}
                className="bg-brand-card p-6 rounded-2xl border border-brand-border shadow-sm hover:shadow-luxury transition space-y-3"
              >
                <div className="w-12 h-12 rounded-xl royal-gradient text-brand-gold flex items-center justify-center shadow-xs">
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-base font-serif font-bold text-brand-primary">
                  {amenity.title}
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {amenity.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SCENE SIX: LOCATION, DIRECTIONS & FINAL INQUIRY CTA         */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-card rounded-3xl p-8 sm:p-12 border border-brand-border shadow-luxury grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          
          <div className="space-y-6">
            <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">
              Convenient Kanpur Road Highway Access
            </span>
            <h2 className="text-3xl font-serif font-bold text-brand-primary">
              Location & Visiting Directions
            </h2>
            
            <p className="text-sm text-neutral-700 leading-relaxed">
              Dwarka Shri Lawn is prominently situated on Kanpur Road in Daroga Kheda, Lucknow, directly opposite Metro/Highway <strong>Pillar No. 37</strong>. Its prime arterial position makes it easily reachable for guests arriving from Alambagh, Transport Nagar, Amausi Airport, or surrounding districts.
            </p>

            <div className="space-y-3 text-xs text-neutral-700">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <span className="font-semibold text-neutral-900">
                  Opp. Pillar No. 37, Daroga Kheda, Kanpur Road, Lucknow, Uttar Pradesh.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <span>
                  Booking Desk Direct Lines: <strong>9305465848</strong> / 9307908994 / 7355059566
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setIsLawnModalOpen(true)}
                className="px-6 py-3.5 rounded-xl royal-gradient text-white text-xs sm:text-sm font-bold shadow-luxury hover:opacity-95 transition text-center flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 text-brand-gold" />
                <span>Enquire Lawn Availability</span>
              </button>

              <a
                href="https://maps.google.com/?q=Daroga+Kheda+Kanpur+Road+Lucknow"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl border border-brand-border text-brand-primary hover:bg-brand-cream text-xs sm:text-sm font-semibold transition text-center flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-4 h-4 text-brand-gold" />
                <span>Open in Google Maps</span>
              </a>
            </div>
          </div>

          {/* Map Guide Card */}
          <div className="bg-brand-cream/80 rounded-2xl p-6 border border-brand-border text-center space-y-4 shadow-xs">
            <div className="aspect-4/3 rounded-xl overflow-hidden shadow-inner relative bg-amber-50/50 flex flex-col items-center justify-center p-6 text-neutral-700 border border-brand-gold/30">
              <div className="w-14 h-14 rounded-2xl royal-gradient text-brand-gold flex items-center justify-center mb-3 shadow-md">
                <MapPin className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-serif font-bold text-brand-primary">
                Dwarka Shri Lawn
              </h4>
              <p className="text-xs text-neutral-600 mt-1 font-medium">
                Opposite Pillar No. 37, Daroga Kheda
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Kanpur Road, Lucknow, Uttar Pradesh
              </p>

              <div className="mt-4 px-3 py-1.5 rounded-full bg-white text-[11px] font-semibold text-brand-primary border border-brand-gold/40 shadow-xs">
                Key Landmark: Pillar No. 37 (Kanpur Highway)
              </div>
            </div>

            <p className="text-[11px] text-neutral-500">
              On-site inspections welcomed daily between 9:00 AM – 9:00 PM. Call ahead at <strong>9305465848</strong> to schedule with our venue manager.
            </p>
          </div>

        </div>
      </section>

      {/* 3D Hotspot Detail Modal */}
      <HotspotDetailModal
        hotspot={selectedHotspot}
        onClose={() => setSelectedHotspot(null)}
        onOpenEnquiry={openDrawer}
      />

      {/* Lawn Booking Enquiry Modal */}
      <LawnEnquiryModal
        isOpen={isLawnModalOpen}
        onClose={() => setIsLawnModalOpen(false)}
      />

    </div>
  );
};

export default LawnPage;
