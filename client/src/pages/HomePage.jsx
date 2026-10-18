import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  MessageCircle, 
  Calendar, 
  ShoppingBag, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Layers,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Compass,
  FileCheck2,
  Eye,
  Award,
  Users
} from 'lucide-react';
import { api } from '../services/api';
import { useEnquiry } from '../context/EnquiryContext';
import LawnEnquiryModal from '../components/LawnEnquiryModal';
import ItemCard from '../components/ItemCard';
import ItemDetailModal from '../components/ItemDetailModal';
import WeddingScene from '../components/canvas/WeddingScene';
import HotspotDetailModal from '../components/canvas/HotspotDetailModal';

const HomePage = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [isLawnModalOpen, setIsLawnModalOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const { openDrawer } = useEnquiry();

  // Video reel state
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.getItems({ featured: 'true' });
        if (res.success && res.data && res.data.length > 0) {
          setFeaturedItems(res.data.slice(0, 6));
        }
      } catch (err) {
        console.warn('Could not load featured items from server, using fallback', err);
      }
    };
    fetchFeatured();
  }, []);

  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const scrollToCelebrations = () => {
    const el = document.getElementById('celebrations');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const categoriesPreview = [
    { name: 'Waterproof German Hangars', id: 'tents-canopies', count: 'All-Weather Structures', image: '/media/rich-decor/decor-1.jpg' },
    { name: 'VIP Seating & Maharaja Sofas', id: 'chairs-seating', count: 'Luxury Velvet Couches', image: '/media/seating/seating-1.jpg' },
    { name: 'Traditional & Floral Mandaps', id: 'wedding-essentials', count: 'Sacred Stage Architecture', image: '/media/mandap/mandap-1.jpg' },
    { name: 'Truss & Ambient Illumination', id: 'stage-platform', count: 'Modular Platforms & Spotlights', image: '/media/stage/stage-1.jpg' },
    { name: 'Illuminated Grand Gate Arches', id: 'lighting-decor', count: 'Royal Welcome Gateways', image: '/media/gate/gate-1.jpg' },
    { name: 'Haldi & Pre-Wedding Setups', id: 'wedding-essentials', count: 'Marigold & Yellow Decor', image: '/media/haldi-mehendi/haldi-1.jpg' }
  ];

  const planningJourney = [
    {
      step: '01',
      title: 'Explore & Select Equipment',
      desc: 'Browse our real Lucknow inventory of German hangars, Maharaja sofas, banquet tables, and outdoor coolers.'
    },
    {
      step: '02',
      title: 'Share Your Requirements',
      desc: 'Submit your proposed event date, guest count, and locality. Coordinate directly with our family-run desk.'
    },
    {
      step: '03',
      title: 'Personalized Coordination',
      desc: 'Our team reviews inventory availability and shares transparent, customized quotes with punctual on-site execution.'
    }
  ];

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. CINEMATIC 3D TWILIGHT WEDDING HERO SECTION */}
      <section className="relative w-full overflow-hidden bg-brand-twilight">
        {/* Real Interactive 3D Canvas */}
        <WeddingScene onOpenHotspotDetail={(spot) => setSelectedHotspot(spot)} />

        {/* Cinematic Editorial Overlay Card (Float Over Center Top) */}
        <div className="absolute top-16 sm:top-20 inset-x-0 mx-auto max-w-4xl px-4 text-center pointer-events-none z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-dark/85 backdrop-blur-md border border-brand-gold/40 text-brand-goldLight text-xs sm:text-sm font-semibold tracking-wide shadow-luxury mb-4 animate-shimmer">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
            <span>Dwarka Shri Lawn • Managed by Kandhari Tent & Caterers</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight text-white leading-tight drop-shadow-lg">
            Every Celebration Deserves <br className="hidden sm:inline" />
            <span className="text-gold-gradient">
              A Grand Beginning.
            </span>
          </h1>

          <p className="mt-3 text-xs sm:text-base text-neutral-200/90 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Planning a wedding, reception, or milestone function in Lucknow? Explore our interactive 3D twilight showcase, tour <strong>Dwarka Shri Lawn</strong> on Kanpur Road, and experience our German hangars and royal mandap artistry.
          </p>

          {/* Interactive Hero CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-5 pointer-events-auto">
            <button
              onClick={openDrawer}
              className="px-6 py-3.5 rounded-xl royal-gradient text-white font-bold text-xs sm:text-sm shadow-luxury hover:opacity-95 transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-brand-gold" />
              <span>Plan Your Event</span>
            </button>

            <button
              onClick={scrollToCelebrations}
              className="px-6 py-3.5 rounded-xl bg-brand-cream hover:bg-brand-creamDark text-brand-primary font-bold text-xs sm:text-sm shadow-md transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Eye className="w-4 h-4 text-brand-accent" />
              <span>Explore Our Celebrations</span>
            </button>

            <a
              href="https://wa.me/919305465848?text=Namaste%20Kandhari%20Tent!%20I%20am%20exploring%20your%203D%20website%20and%20would%20like%20to%20discuss%20event%20rentals%20and%20lawn%20booking."
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 rounded-xl bg-emerald-700/90 hover:bg-emerald-800 border border-emerald-500/40 text-white font-semibold text-xs sm:text-sm transition flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Desk</span>
            </a>

            <a
              href="tel:9305465848"
              className="px-5 py-3.5 rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-md border border-brand-gold/40 text-brand-goldLight font-semibold text-xs sm:text-sm transition flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-brand-gold" />
              <span>Call: 9305465848</span>
            </a>
          </div>

          {/* Key Trust Signals */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-[11px] sm:text-xs text-neutral-300 drop-shadow-md">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold" />
              <span>Kanpur Road Opp. Pillar No. 37</span>
            </span>
            <span className="hidden sm:inline text-neutral-500">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold" />
              <span>100% Real Lucknow Media</span>
            </span>
            <span className="hidden sm:inline text-neutral-500">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold" />
              <span>Direct Family Commitment</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. EDITORIAL BRAND STORY: THE HERITAGE OF KANDHARI TENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-brand-border aspect-4/5 group">
              <img
                src="/media/rich-decor/IMG_3962.JPG"
                alt="Grand wedding decor by Kandhari Tent & Caterers in Lucknow"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand-gold text-brand-dark inline-block mb-1">
                  Kanpur Road, Lucknow
                </span>
                <p className="text-lg font-serif font-bold">
                  Handcrafted Wedding Luxury
                </p>
                <p className="text-xs text-brand-goldLight">
                  German hangars, crystal chandeliers & regal velvet drapery
                </p>
              </div>
            </div>
            {/* Floating Metric Badge */}
            <div className="absolute -bottom-6 -right-6 bg-brand-card p-5 rounded-2xl shadow-luxury border border-brand-gold/30 max-w-xs space-y-1">
              <div className="flex items-center gap-2 text-brand-primary">
                <Award className="w-5 h-5 text-brand-gold" />
                <span className="text-xs font-bold uppercase tracking-wider">Decades of Trust</span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-normal">
                Serving families across Lucknow, Alambagh, Gomti Nagar, and Kanpur Road with punctual setups.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">
                Our Heritage & Craftsmanship
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-primary leading-tight">
                Transforming Venues into Palatial Celebrations
              </h2>
            </div>

            <p className="text-sm text-neutral-700 leading-relaxed">
              At <strong>Kandhari Tent & Caterers</strong>, we believe an Indian wedding is more than an event—it is the celebration of a lifetime. Based on Kanpur Road opposite Pillar No. 37, our family enterprise combines generations of event wisdom with modern structural engineering.
            </p>

            <p className="text-sm text-neutral-700 leading-relaxed">
              From all-weather waterproof German hangars spanning thousands of square feet to intimate floral mandaps crowned with fresh marigold and mogra, we manage your event end-to-end. Together with <strong>Dwarka Shri Lawn</strong>, we eliminate vendor friction so your family can focus on celebrating.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3">
              <div className="p-4 rounded-2xl bg-brand-cream border border-brand-border space-y-1">
                <span className="text-2xl font-serif font-black text-brand-primary">100%</span>
                <p className="text-xs font-bold text-neutral-800">Weatherproof</p>
                <p className="text-[11px] text-neutral-500">German hangar engineering</p>
              </div>
              <div className="p-4 rounded-2xl bg-brand-cream border border-brand-border space-y-1">
                <span className="text-2xl font-serif font-black text-brand-primary">1,000+</span>
                <p className="text-xs font-bold text-neutral-800">Guest Capacity</p>
                <p className="text-[11px] text-neutral-500">Dwarka Shri Lawn grounds</p>
              </div>
              <div className="p-4 rounded-2xl bg-brand-cream border border-brand-border space-y-1">
                <span className="text-2xl font-serif font-black text-brand-primary">24/7</span>
                <p className="text-xs font-bold text-neutral-800">Power Backup</p>
                <p className="text-[11px] text-neutral-500">Heavy silent generators</p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={openDrawer}
                className="px-6 py-3 rounded-xl royal-gradient text-white font-bold text-xs shadow-luxury hover:opacity-95 transition"
              >
                Request Custom Quotation
              </button>
              <Link
                to="/about"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-accent transition"
              >
                <span>Read Full Story</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DWARKA SHRI LAWN SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="royal-gradient rounded-3xl p-8 sm:p-14 text-white shadow-luxury grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-brand-gold text-brand-dark uppercase tracking-widest inline-block">
              Associated Event Venue
            </span>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
              Dwarka Shri Lawn, Kanpur Road
              <span className="block text-sm font-sans font-normal text-brand-goldLight mt-1">
                Managed directly by Kandhari Tent & Caterers
              </span>
            </h2>

            <p className="text-sm text-neutral-200 leading-relaxed">
              Conveniently located on Kanpur Road opposite Pillar No. 37 in Daroga Kheda, Dwarka Shri Lawn offers an expansive, beautifully manicured open-air lawn ideal for weddings, Sangeet evenings, ring ceremonies, and milestone banquets.
            </p>

            <ul className="space-y-2.5 text-xs text-neutral-200">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" />
                <span>Prime Kanpur Road location with effortless highway access</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" />
                <span>Air-conditioned private bridal and groom dressing suites</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" />
                <span>Heavy generator power backup ensuring uninterrupted illumination</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" />
                <span>Dedicated guest parking zone for smooth vehicular entry</span>
              </li>
            </ul>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsLawnModalOpen(true)}
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-brand-goldLight text-brand-dark font-bold text-xs shadow-md transition flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-brand-primary" />
                <span>Check Date Availability</span>
              </button>

              <Link
                to="/lawn"
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition flex items-center gap-2"
              >
                <span>View Lawn Details & Photos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 relative aspect-4/3 rounded-2xl overflow-hidden shadow-2xl border-2 border-brand-gold/40 group">
            <img
              src="/media/lawns/lawn-main.jpg"
              alt="Dwarka Shri Lawn Kanpur Road Lucknow"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-5 right-5 text-xs text-white">
              <p className="font-bold flex items-center gap-1.5 text-brand-goldLight">
                <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                <span>Opp. Pillar No. 37, Daroga Kheda, Kanpur Road, Lucknow</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. REAL VIDEO WALKTHROUGH REEL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-dark rounded-3xl p-8 sm:p-12 text-white border border-brand-gold/25 shadow-luxury grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-gold text-brand-dark uppercase tracking-widest inline-block">
              Genuine Business Footage
            </span>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
              See Our Real Event Setups in Lucknow
            </h2>

            <p className="text-sm text-neutral-300 leading-relaxed">
              Watch this real walkthrough from one of our grand wedding canopy and stage installations. We bring your vision to life with precision tent anchoring, royal velvet drapery, crystal chandeliers, and manicured lawn presentation.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={toggleVideoPlay}
                className="px-6 py-3 rounded-xl royal-gradient text-white font-bold text-xs sm:text-sm shadow-md hover:opacity-95 transition flex items-center gap-2"
              >
                {isPlaying ? <Pause className="w-4 h-4 text-brand-gold" /> : <Play className="w-4 h-4 text-brand-gold" />}
                <span>{isPlaying ? 'Pause Video Reel' : 'Play Event Walkthrough'}</span>
              </button>

              <button
                onClick={toggleMute}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 text-xs font-semibold transition flex items-center gap-1.5"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-brand-gold" /> : <Volume2 className="w-4 h-4 text-brand-gold" />}
                <span>{isMuted ? 'Unmute Audio' : 'Mute'}</span>
              </button>
            </div>
          </div>

          {/* Video Container */}
          <div className="lg:col-span-6 relative aspect-16/9 rounded-2xl overflow-hidden shadow-2xl border-2 border-brand-gold/30 bg-black">
            <video
              ref={videoRef}
              src="/media/videos/event-walkthrough.mp4"
              poster="/media/lawns/lawn-main.jpg"
              playsInline
              muted={isMuted}
              loop
              className="w-full h-full object-cover"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            {!isPlaying && (
              <div 
                onClick={toggleVideoPlay}
                className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-full royal-gradient text-brand-gold flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 ml-1" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. CELEBRATION SHOWCASE & RENTAL CATEGORIES */}
      <section id="celebrations" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">
            Complete Event Solutions
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-primary">
            Curated Rental Categories
          </h2>
          <p className="text-sm text-neutral-600 max-w-2xl mx-auto">
            Everything you need for grand weddings and milestone celebrations in Lucknow. Add items to your enquiry list for instant custom quoting.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesPreview.map((cat, idx) => (
            <Link
              key={idx}
              to={`/catalogue?category=${cat.id}`}
              className="group relative h-64 rounded-3xl overflow-hidden shadow-luxury hover:-translate-y-1 transition-all duration-500"
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-black/35 to-transparent p-6 flex flex-col justify-end text-white">
                <span className="text-xs text-brand-gold font-medium">
                  {cat.count}
                </span>
                <h3 className="text-xl font-serif font-bold group-hover:text-brand-goldLight transition">
                  {cat.name}
                </h3>
                <span className="inline-flex items-center gap-1 text-xs text-neutral-300 mt-2 font-medium group-hover:translate-x-1 transition-transform">
                  <span>Browse Category</span>
                  <ChevronRight className="w-3.5 h-3.5 text-brand-gold" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl royal-gradient text-white text-xs font-bold shadow-luxury hover:opacity-95 transition"
          >
            <span>View Complete Dynamic Catalogue</span>
            <ArrowRight className="w-4 h-4 text-brand-gold" />
          </Link>
        </div>
      </section>

      {/* 6. FEATURED INVENTORY ITEMS GRID */}
      {featuredItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">
                Real Lucknow Inventory
              </span>
              <h2 className="text-3xl font-serif font-bold text-brand-primary">
                Popular Rental Selections
              </h2>
            </div>
            <Link
              to="/catalogue"
              className="text-xs sm:text-sm font-semibold text-brand-primary hover:text-brand-accent transition flex items-center gap-1"
            >
              <span>Explore Entire Catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onSelectDetail={(it) => setSelectedDetailItem(it)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 7. 3-STEP CELEBRATION PLANNING JOURNEY */}
      <section className="bg-brand-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">
              Simple & Transparent
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
              How We Plan Your Celebration
            </h2>
            <p className="text-sm text-neutral-300 max-w-xl mx-auto">
              Direct family coordination with zero middlemen and absolute reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {planningJourney.map((step) => (
              <div
                key={step.step}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-brand-gold/40 transition duration-300 space-y-4"
              >
                <span className="text-4xl font-serif font-black text-brand-gold">
                  {step.step}
                </span>
                <h3 className="text-lg font-serif font-bold text-white">
                  {step.title}
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. DIRECT CONTACT & LOCATION CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="royal-gradient rounded-3xl p-8 sm:p-12 text-white shadow-luxury flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center lg:text-left max-w-2xl">
            <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">
              Direct Family Booking Desk
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white">
              Let's Make Your Next Celebration Unforgettable
            </h2>
            <p className="text-xs sm:text-sm text-neutral-200">
              Visit our venue on Kanpur Road (Opp. Pillar No. 37), call our desk, or submit your requirements online.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => setIsLawnModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-brand-goldLight text-brand-dark font-bold text-xs shadow-md transition"
            >
              Enquire Lawn Dates
            </button>
            <a
              href="tel:9305465848"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-brand-gold" />
              <span>Call 9305465848</span>
            </a>
          </div>
        </div>
      </section>

      {/* 3D Hotspot Detail Modal */}
      <HotspotDetailModal
        hotspot={selectedHotspot}
        onClose={() => setSelectedHotspot(null)}
        onOpenEnquiry={openDrawer}
      />

      {/* Lawn Booking Modal */}
      <LawnEnquiryModal
        isOpen={isLawnModalOpen}
        onClose={() => setIsLawnModalOpen(false)}
      />

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
      />

    </div>
  );
};

export default HomePage;
