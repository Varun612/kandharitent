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
  FileCheck2
} from 'lucide-react';
import { api } from '../services/api';
import { useEnquiry } from '../context/EnquiryContext';
import LawnEnquiryModal from '../components/LawnEnquiryModal';
import ItemCard from '../components/ItemCard';
import ItemDetailModal from '../components/ItemDetailModal';

const HomePage = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [isLawnModalOpen, setIsLawnModalOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
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

  const bookingSteps = [
    {
      step: '01',
      title: 'Explore & Select Equipment',
      desc: 'Browse our real Lucknow inventory of German hangars, Maharaja sofas, banquet tables, and outdoor coolers.'
    },
    {
      step: '02',
      title: 'Add to Enquiry List',
      desc: 'Select items and quantities, or choose Dwarka Shri Lawn hosting on Kanpur Road.'
    },
    {
      step: '03',
      title: 'Personalized Custom Quote',
      desc: 'Our coordination team reviews dates and locality, sharing transparent bundled pricing.'
    },
    {
      step: '04',
      title: 'On-Site Execution in Lucknow',
      desc: 'Punctual setup, certified rigging, and post-event clearance by seasoned event staff.'
    }
  ];

  const categoriesPreview = [
    { name: 'Waterproof Hangars & Tents', id: 'tents-canopies', count: 'German Hangars & Shamianas', image: '/media/rich-decor/decor-1.jpg' },
    { name: 'VIP Seating & Sofas', id: 'chairs-seating', count: 'Maharaja Sofas & Banquet Chairs', image: '/media/seating/seating-1.jpg' },
    { name: 'Wedding Mandap Setups', id: 'wedding-essentials', count: 'Traditional Mandaps & Floral Bells', image: '/media/mandap/mandap-1.jpg' },
    { name: 'Stage & Truss Illumination', id: 'stage-platform', count: 'Modular Platforms & Backdrops', image: '/media/stage/stage-1.jpg' },
    { name: 'Grand Entrance Gate Arches', id: 'lighting-decor', count: 'Illuminated Welcome Gateways', image: '/media/gate/gate-1.jpg' },
    { name: 'Haldi & Pre-Wedding Decor', id: 'wedding-essentials', count: 'Vibrant Yellow & Marigold Setups', image: '/media/haldi-mehendi/haldi-1.jpg' }
  ];

  return (
    <div className="space-y-20 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden royal-gradient text-white">
        {/* Real Event Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-35"
          style={{ backgroundImage: `url('/media/lawns/lawn-main.jpg')` }}
        />
        
        {/* Decorative Radial Lights */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-accent/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-gold/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center z-10 space-y-8">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-brand-gold/40 text-brand-goldLight text-xs sm:text-sm font-semibold tracking-wide animate-shimmer">
            <Sparkles className="w-4 h-4 text-brand-gold" />
            <span>Dwarka Shri Lawn (Managed by Kandhari Tent & Caterers)</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-black tracking-tight text-white leading-tight max-w-5xl mx-auto">
            Making Your Celebrations <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-amber-200 to-brand-goldLight">
              Truly Memorable in Lucknow
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-neutral-200 font-normal max-w-3xl mx-auto leading-relaxed">
            Planning a wedding, reception, or milestone function? We supply all-weather German hangars, luxury Maharaja seating, and host your dream celebration at <strong>Dwarka Shri Lawn</strong> on Kanpur Road.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={openDrawer}
              className="px-7 py-4 rounded-2xl bg-brand-accent hover:bg-brand-accentLight text-white font-bold text-sm sm:text-base shadow-royal-lg hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Calendar className="w-5 h-5 text-brand-gold" />
              <span>Plan Your Event</span>
            </button>

            <Link
              to="/services"
              className="px-7 py-4 rounded-2xl bg-white hover:bg-brand-goldLight text-brand-dark font-bold text-sm sm:text-base shadow-lg transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Layers className="w-5 h-5 text-brand-purple" />
              <span>Explore Services</span>
            </Link>

            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-ai-chat', { detail: { initialMessage: 'Namaste! Main event plan karna chahta hoon.' } }))}
              className="px-7 py-4 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-brand-gold/40 text-brand-goldLight font-semibold text-sm sm:text-base transition flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-brand-gold" />
              <span>Chat With Us</span>
            </button>
          </div>

          {/* Click to Call and WhatsApp Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="tel:9305465848"
              className="px-6 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-brand-gold/40 text-brand-goldLight font-bold text-xs sm:text-sm transition flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-brand-gold" />
              <span>Call Now: 9305465848</span>
            </a>

            <a
              href="https://wa.me/919305465848?text=Namaste%20Kandhari%20Tent%20%26%20Caterers!%20I%20would%20like%20to%20enquire%20about%20event%20rentals%20and%20lawn%20booking."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 border border-emerald-400 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Us: +91 9305465848</span>
            </a>

            <Link
              to="/tools"
              className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 font-semibold text-xs sm:text-sm transition flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-brand-gold" />
              <span>Book a Site Inspection</span>
            </Link>
          </div>

          {/* Key Trust Signals Bar */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-white/10 text-xs sm:text-sm text-neutral-300">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-gold" />
              <span>Kanpur Road, Opp. Pillar No. 37</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-gold" />
              <span>100% Real Event Media</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-gold" />
              <span>Direct Family Commitment</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-gold" />
              <span>All Lucknow Localities</span>
            </div>
          </div>

        </div>
      </section>

      {/* DUAL PROMOTION HIGHLIGHT: TENT HOUSE + DWARKA SHRI LAWN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card 1: Tent House & Event Equipment Rentals */}
          <div className="glass-card rounded-3xl p-8 sm:p-10 border border-neutral-200/80 shadow-royal hover:shadow-royal-lg transition duration-300 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl royal-gradient flex items-center justify-center text-brand-gold shadow-md">
                <Layers className="w-7 h-7" />
              </div>

              <span className="text-xs font-bold text-brand-accent uppercase tracking-wider">
                Full-Service Event Rentals
              </span>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-primary">
                Kandhari Tent House & Equipment Rentals
              </h2>

              <p className="text-sm text-neutral-600 leading-relaxed">
                Whether you are hosting an intimate wedding function, grand reception, or commercial gathering across Lucknow, our extensive inventory has you covered. We supply waterproof German hangars, royal embroidered shamianas, VIP Maharaja seating, modular stages, high-output desert coolers, and complete power distribution.
              </p>

              <ul className="space-y-2 text-xs font-medium text-neutral-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Curated catalogue of real verified event inventory</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>On-time delivery, professional rigging, and post-event pack-down</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Custom tailored quotes with no hidden surprises</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
              <Link
                to="/catalogue"
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-purple hover:text-brand-accent transition"
              >
                <span>Explore Full Equipment Catalogue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={openDrawer}
                className="px-4 py-2 rounded-xl bg-purple-50 text-brand-purple text-xs font-bold hover:bg-purple-100 transition"
              >
                Send Enquiry
              </button>
            </div>
          </div>

          {/* Card 2: Dwarka Shri Lawn */}
          <div className="glass-card rounded-3xl p-8 sm:p-10 border border-brand-gold/30 shadow-royal hover:shadow-royal-lg transition duration-300 flex flex-col justify-between space-y-6 bg-gradient-to-br from-white via-white to-amber-50/40">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-primary flex items-center justify-center text-brand-gold shadow-md">
                <Sparkles className="w-7 h-7" />
              </div>

              <span className="text-xs font-bold text-brand-gold uppercase tracking-wider">
                Premier Kanpur Road Venue
              </span>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-primary">
                Dwarka Shri Lawn
                <span className="block text-sm font-sans font-semibold text-neutral-500 mt-1">
                  (Managed by Kandhari Tent & Caterers)
                </span>
              </h2>

              <p className="text-sm text-neutral-600 leading-relaxed">
                Situated opposite Pillar No. 37, Daroga Kheda on Kanpur Road, Dwarka Shri Lawn provides an open-air venue with lush lawns, dedicated bridal green rooms, 100% generator power backup, and ample guest parking. Because it is managed directly by Kandhari Tent & Caterers, tenting and stage decor are seamlessly integrated without third-party coordination delays.
              </p>

              <ul className="space-y-2 text-xs font-medium text-neutral-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Direct Kanpur Road accessibility opposite Pillar No. 37</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Suitable for Weddings, Sangeet, Receptions & Corporate Events</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Combined lawn hire and tenting packages available</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
              <Link
                to="/lawn"
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-primary hover:text-brand-purple transition"
              >
                <span>View Lawn Photos & Amenities</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setIsLawnModalOpen(true)}
                className="px-5 py-2.5 rounded-xl royal-gradient text-white text-xs font-bold shadow-md hover:opacity-95 transition"
              >
                Check Date Availability
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* REAL VIDEO REEL SHOWCASE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-dark rounded-3xl p-8 sm:p-12 text-white border border-brand-purple/40 shadow-royal-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
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

      {/* FEATURED RENTAL CATEGORIES (USING REAL PHOTOS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-bold text-brand-accent uppercase tracking-widest">
            Equipment Inventory
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-primary">
            Featured Rental Categories
          </h2>
          <p className="text-sm text-neutral-600 max-w-2xl mx-auto">
            Everything you need for weddings and parties in Lucknow. Add items to your enquiry list for instant custom quoting.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesPreview.map((cat, idx) => (
            <Link
              key={idx}
              to={`/catalogue?category=${cat.id}`}
              className="group relative h-64 rounded-3xl overflow-hidden shadow-sm hover:shadow-royal transition-all duration-300"
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 flex flex-col justify-end text-white">
                <span className="text-xs text-brand-gold font-medium">
                  {cat.count}
                </span>
                <h3 className="text-xl font-serif font-bold group-hover:text-brand-goldLight transition">
                  {cat.name}
                </h3>
                <span className="inline-flex items-center gap-1 text-xs text-neutral-300 mt-2 font-medium group-hover:translate-x-1 transition-transform">
                  <span>Browse items</span>
                  <ChevronRight className="w-3.5 h-3.5 text-brand-gold" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl royal-gradient text-white text-sm font-bold shadow-royal hover:opacity-95 transition"
          >
            <span>View All Rental Categories</span>
            <ArrowRight className="w-4 h-4 text-brand-gold" />
          </Link>
        </div>
      </section>

      {/* FEATURED INVENTORY ITEMS GRID */}
      {featuredItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-brand-accent uppercase tracking-widest">
                Top Requested
              </span>
              <h2 className="text-3xl font-serif font-bold text-brand-primary">
                Popular Rental Selections
              </h2>
            </div>
            <Link
              to="/catalogue"
              className="text-xs sm:text-sm font-semibold text-brand-purple hover:text-brand-accent transition flex items-center gap-1"
            >
              <span>Explore Entire Dynamic Catalogue</span>
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

      {/* 4-STEP HOW IT WORKS */}
      <section className="bg-brand-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">
              Simple & Transparent
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
              How Our Booking Process Works
            </h2>
            <p className="text-sm text-neutral-300 max-w-xl mx-auto">
              We make event hiring simple, structured, and reliable with zero guesswork.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bookingSteps.map((step) => (
              <div
                key={step.step}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-gold/40 transition duration-300 space-y-3"
              >
                <span className="text-3xl font-serif font-black text-brand-gold">
                  {step.step}
                </span>
                <h3 className="text-base font-serif font-bold text-white">
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

      {/* WHY CHOOSE US / TRUST SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <span className="text-xs font-bold text-brand-accent uppercase tracking-widest">
              The Kandhari Promise
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-primary leading-tight">
              Honest Local Service, Deep Community Roots
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              At <strong>Kandhari Tent & Caterers</strong>, we treat every celebration like our own family milestone. With decades of hands-on event execution across Lucknow, our reputation is built on reliability, spotless equipment, and personal accountability.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-brand-purple shrink-0 mt-1">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-800">
                    Transparent Quoting & Centralized Tracking
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    No middlemen or inflated commissions. Every enquiry is collected centrally to ensure the best fulfillment option and pricing.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-brand-gold shrink-0 mt-1">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-800">
                    Dwarka Shri Lawn Synergy
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Avoid coordination friction between separate venue and tenting vendors. Our lawn is fully optimized for our high-capacity hangars and stages.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 mt-1">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-800">
                    On-Time Setup Guarantee
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Equipment arrives ahead of schedule, allowing your decorators and family to inspect and relax prior to guest arrivals.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-primary hover:text-brand-purple transition"
              >
                <span>Read More About Our Family Business</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right: Real Venue Visual Collage */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-4/3">
              <img
                src="/media/lawns/lawn-main.jpg"
                alt="Dwarka Shri Lawn setup in Lucknow"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-xl border border-neutral-100 max-w-xs space-y-2">
              <div className="flex items-center gap-2 text-brand-primary">
                <MapPin className="w-5 h-5 text-brand-gold shrink-0" />
                <span className="text-xs font-bold">Kanpur Road, Lucknow</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-normal">
                Directly opposite Pillar No. 37, Daroga Kheda. Easy access for guests travelling from Lucknow city or airport.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* LOCATION & CONTACT CTA BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="royal-gradient rounded-3xl p-8 sm:p-12 text-white shadow-royal-lg flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center lg:text-left max-w-2xl">
            <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">
              Ready to Plan Your Event?
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white">
              Let's Make Your Next Celebration Unforgettable
            </h2>
            <p className="text-xs sm:text-sm text-neutral-200">
              Visit us at Kanpur Road, Lucknow, call our booking desk, or send your rental list online for a fast custom quote.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => setIsLawnModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-brand-goldLight text-brand-dark font-bold text-sm shadow-md transition"
            >
              Enquire Lawn Dates
            </button>
            <a
              href="tel:9305465848"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-brand-gold" />
              <span>Call 9305465848</span>
            </a>
          </div>
        </div>
      </section>

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
