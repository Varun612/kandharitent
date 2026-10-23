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
  Users,
  Building2,
  Utensils
} from 'lucide-react';
import { api } from '../services/api';
import { useEnquiry } from '../context/EnquiryContext';
import LawnEnquiryModal from '../components/LawnEnquiryModal';
import ItemCard from '../components/ItemCard';
import ItemDetailModal from '../components/ItemDetailModal';
import HeroRealPhotography from '../components/HeroRealPhotography';
import EditorialEventGallery from '../components/EditorialEventGallery';
import FounderSection from '../components/FounderSection';
import PhoneCallModal from '../components/PhoneCallModal';
import TestimonialsSection from '../components/TestimonialsSection';
import SEO from '../components/SEO';

const HomePage = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [isLawnModalOpen, setIsLawnModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const { openDrawer, addItem } = useEnquiry();

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
      
      <SEO
        title="Wedding Tent Decoration, Luxury Catering & Dwarka Shri Lawn Lucknow"
        description="Premium wedding tent decoration, waterproof German hangars, royal catering, and Dwarka Shri Lawn banquet booking in Lucknow. Decades of trusted service at Kanpur Road, Opp. Pillar No. 37."
        canonical="/"
      />

      {/* 1. CINEMATIC REAL-PHOTOGRAPHY HERO */}
      <HeroRealPhotography
        onOpenDrawer={openDrawer}
        onScrollToCelebrations={scrollToCelebrations}
      />

      {/* Redesigned Royal Live Lucknow Activity & Direct Telephony Ticker */}
      <div className="bg-[#0b0414] text-white py-3.5 border-y-2 border-amber-500/40 shadow-xl relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
          
          {/* Live Activity Stream */}
          <div className="flex items-center gap-3 overflow-hidden w-full lg:w-auto">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono text-[10px] font-bold uppercase tracking-wider shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Live Demand</span>
            </span>
            
            <div className="flex items-center gap-4 text-neutral-200 text-xs truncate">
              <span className="flex items-center gap-1 text-amber-300 font-semibold shrink-0">
                <span>📍 Kanpur Road:</span>
                <span className="text-white font-normal">300 PVC Chairs confirmed for Nov Wedding</span>
              </span>
              <span className="text-amber-500/60 hidden sm:inline">&bull;</span>
              <span className="hidden sm:flex items-center gap-1 text-amber-300 font-semibold shrink-0">
                <span>📍 Gomti Nagar:</span>
                <span className="text-white font-normal">Haldi &amp; Mehendi Yellow Setup reserved</span>
              </span>
              <span className="text-amber-500/60 hidden md:inline">&bull;</span>
              <span className="hidden md:flex items-center gap-1 text-amber-300 font-semibold shrink-0">
                <span>📍 Alambagh:</span>
                <span className="text-white font-normal">Waterproof German Hangar booked</span>
              </span>
            </div>
          </div>

          {/* Genuine Telephony & AI Receptionist Action Desk */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-center sm:justify-end">
            <button
              onClick={() => setIsPhoneModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md transition cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-black animate-bounce" />
              <span>Call: +91 9305465848</span>
            </button>

            <a
              href="https://wa.me/919305465848?text=Namaste%2C%20I%20want%20to%20enquire%20about%20event%20rentals."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-ai-chat', {
                  detail: { mode: 'voice', initialMessage: 'Namaste Veronica, I want to explore wedding packages and check lawn availability.' }
                }));
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1e0d36] text-amber-300 hover:text-white border border-amber-500/40 hover:bg-[#2a134a] transition text-xs font-bold shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Voice AI Desk</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1.25. FOUNDER & BRAND IDENTITY SECTION: SHRI MAHENDRA KANDHARI */}
      <FounderSection onOpenDrawer={openDrawer} />

      {/* 1.5. EDITORIAL EVENT GALLERY SHOWCASE */}
      <EditorialEventGallery
        onOpenEnquiryWithItem={(item) => addItem(item, 1)}
      />


      {/* 2. EDITORIAL BRAND STORY: THE HERITAGE OF KANDHARI TENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-brand-border aspect-4/5 group">
              <img
                src="/media/rich-decor/decor-1.jpg"
                alt="Grand wedding decor by Kandhari Tent & Caterers in Lucknow"
                onError={(e) => { e.currentTarget.src = '/media/rich-decor/decor-2.jpg'; }}
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

      {/* 4.5 AWADHI ROYAL CATERING SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-luxury space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                <span>100% Pure Vegetarian Awadhi & North Indian Banqueting</span>
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-brand-primary">
                Royal Wedding Catering & Live Food Counters
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Elevate your celebration with rich Lucknowi culinary heritage. From traditional <strong>Matar Ki Chaat</strong> and smoky <strong>Paneer Tikka Angara</strong> to slow-simmered <strong>Dal Bukhara</strong> and live <strong>Kesaria Jalebi with Rabri</strong>, we craft memorable dining experiences.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/catering"
                className="px-6 py-3.5 rounded-xl royal-gradient text-white text-xs font-bold shadow-md hover:opacity-95 transition flex items-center gap-2"
              >
                <span>Design Custom Catering Menu</span>
                <ArrowRight className="w-4 h-4 text-brand-gold" />
              </Link>
            </div>
          </div>

          {/* Real Catering Setup Photos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="group relative rounded-2xl overflow-hidden aspect-4/3 bg-neutral-100 shadow-xs border border-neutral-200">
              <img
                src="/media/catering/catering-1.jpg"
                alt="Laser-cut illuminated buffet counter"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 flex flex-col justify-end text-white">
                <span className="text-[10px] font-bold text-brand-gold uppercase tracking-wider">Live Presentation</span>
                <h4 className="text-sm font-serif font-bold">Laser-Cut Illuminated Buffet Line</h4>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden aspect-4/3 bg-neutral-100 shadow-xs border border-neutral-200">
              <img
                src="/media/catering/catering-2.jpg"
                alt="Dwarka Shri Lawn banquet dining"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 flex flex-col justify-end text-white">
                <span className="text-[10px] font-bold text-brand-gold uppercase tracking-wider">Lawn Banquets</span>
                <h4 className="text-sm font-serif font-bold">Starlight Open-Air Food Counters</h4>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden aspect-4/3 bg-neutral-100 shadow-xs border border-neutral-200">
              <img
                src="/media/catering/catering-3.jpg"
                alt="Hot chafing dishes and Awadhi buffet"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 flex flex-col justify-end text-white">
                <span className="text-[10px] font-bold text-brand-gold uppercase tracking-wider">Awadhi Specialities</span>
                <h4 className="text-sm font-serif font-bold">Stainless & Brass Chafing Warmers</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4.8 SIGNATURE PACKAGES WITH VERIFIED RATES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-cream/50 rounded-3xl p-8 sm:p-12 border border-brand-border/80 shadow-luxury space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-brand-border/80 pb-6">
            <div className="max-w-2xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-200/70 text-amber-900 border border-amber-300 uppercase tracking-widest">
                  Direct Rate Slips & Official Contracts
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-brand-purple">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  DRDO Approved Contractor
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-brand-primary">
                Transparent All-Inclusive Packages
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                No hidden charges or inflated estimates. These are our authentic, verified contract packages for wedding banqueting, tent setups, and institutional seminars in Lucknow.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-500 hidden sm:inline">Need something bespoke?</span>
              <button
                onClick={openDrawer}
                className="px-5 py-2.5 rounded-xl royal-gradient text-white font-bold text-xs shadow-md hover:opacity-95 transition"
              >
                Custom Package Quote
              </button>
            </div>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Full Catering */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200/90 shadow-xs flex flex-col justify-between hover:border-brand-gold hover:shadow-luxury transition-all group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Pure-Veg Banqueting
                  </span>
                  <Utensils className="w-4 h-4 text-brand-gold" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-brand-primary group-hover:text-brand-purple transition">
                    Royal Catering Packages
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-2xl font-serif font-black text-emerald-800">₹650</span>
                    <span className="text-xs text-neutral-500 font-medium">/ person (&gt; 500 pax)</span>
                  </div>
                  <p className="text-[11px] text-brand-primary font-semibold mt-0.5">
                    Veg Platter ₹650 &bull; Non-Veg Platter ₹850 (&gt; 500 pax)
                  </p>
                  <p className="text-[10px] text-neutral-500">
                    ₹750/person for 250–500 pax &bull; Custom quote for &lt;250 pax
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-neutral-600 pt-2 border-t border-neutral-100">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Above 500 Guests:</strong> Veg @ ₹650/pp &bull; Non-Veg @ ₹850/pp</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>17 Printed Courses:</strong> Welcome drinks, live chaat, tandoor &amp; hot sweets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Official Rule:</strong> All snacks served strictly for 2 to 2.5 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Illuminated counters &amp; bone china; rate varies by dishes &amp; pax count</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6">
                <Link
                  to="/catering"
                  className="w-full py-2.5 rounded-xl royal-gradient text-white font-bold text-xs shadow-xs hover:opacity-95 transition flex items-center justify-center gap-1.5"
                >
                  <span>Select Dishes & Book</span>
                  <ArrowRight className="w-3.5 h-3.5 text-brand-gold" />
                </Link>
              </div>
            </div>

            {/* 2. Semi Catering */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200/90 shadow-xs flex flex-col justify-between hover:border-brand-gold hover:shadow-luxury transition-all group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    Service & Setup
                  </span>
                  <Sparkles className="w-4 h-4 text-brand-gold" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-brand-primary group-hover:text-brand-purple transition">
                    Semi Catering Service
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-serif font-black text-brand-primary">₹250</span>
                    <span className="text-xs text-neutral-500 font-medium">/ person</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">For ≥ 250 persons • Custom for &lt;250</p>
                </div>
                <ul className="space-y-2 text-xs text-neutral-600 pt-2 border-t border-neutral-100">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Stainless & brass buffet counter warmers and setup</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Complete table service, clearing staff & supervisors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Ideal for families providing own raw food materials</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6">
                <Link
                  to="/catering"
                  className="w-full py-2.5 rounded-xl bg-neutral-100 text-neutral-800 font-bold text-xs hover:bg-neutral-200 transition flex items-center justify-center gap-1.5"
                >
                  <span>Explore Semi Catering</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 3. Standard Wedding Package */}
            <div className="bg-white rounded-2xl p-6 border-2 border-brand-gold/60 shadow-md flex flex-col justify-between hover:shadow-luxury transition-all relative group">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand-gold text-brand-dark text-[10px] font-extrabold uppercase tracking-widest shadow-xs">
                Most Popular
              </div>
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-50 text-brand-purple border border-purple-200">
                    Complete Wedding
                  </span>
                  <Award className="w-4 h-4 text-brand-gold" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-brand-primary group-hover:text-brand-purple transition">
                    Standard Wedding Package
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-serif font-black text-brand-primary">₹50,000</span>
                    <span className="text-xs text-neutral-500 font-medium">all inclusive</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Official Handwritten Booking Slip Rate</p>
                </div>
                <ul className="space-y-2 text-xs text-neutral-600 pt-2 border-t border-neutral-100">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Tent Setup:</strong> Complete waterproof covered shamiana canopy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Illumination:</strong> Ambient lighting, spotlights, chandeliers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Floral Decor:</strong> Fresh entrance gate & stage backdrop garland</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>DJ Sound:</strong> Professional wedding sound console & speakers</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6">
                <button
                  onClick={() => {
                    addItem({
                      id: 'pkg-standard-wedding',
                      name: 'Standard Wedding Package (Tent + Light + Flower + DJ - ₹50,000)',
                      category: 'Package Deals',
                      imageUrl: '/media/rich-decor/decor-1.jpg'
                    }, 1);
                  }}
                  className="w-full py-2.5 rounded-xl royal-gradient text-white font-bold text-xs shadow-xs hover:opacity-95 transition flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Enquire ₹50,000 Package</span>
                </button>
              </div>
            </div>

            {/* 4. Grand Royal Wedding Setup */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200/90 shadow-xs flex flex-col justify-between hover:border-brand-gold hover:shadow-luxury transition-all group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                    Grand Royal
                  </span>
                  <Building2 className="w-4 h-4 text-brand-gold" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-brand-primary group-hover:text-brand-purple transition">
                    Grand Royal Setup
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-serif font-black text-brand-primary">₹1,10,000</span>
                    <span className="text-xs text-neutral-500 font-medium">all inclusive</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Kanpur Road Signature Wedding Benchmark</p>
                </div>
                <ul className="space-y-2 text-xs text-neutral-600 pt-2 border-t border-neutral-100">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>20×200 ft Grand Passage Gallery with lights & fresh flowers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>14 Maharaja Sofas, 200 Highback Chairs with ribbon covers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>16×24 ft Royal Stage, 16×16 ft Mandap, 2 Welcome Gates & DJ setup</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6">
                <button
                  onClick={() => {
                    addItem({
                      id: 'pkg-grand-royal-wedding',
                      name: 'Grand Royal Wedding Setup (VIP 20x200 Gallery, 14 Sofas, 200 Chairs, Stage, Mandap, DJ - ₹1,10,000)',
                      category: 'Package Deals',
                      imageUrl: '/media/rich-decor/decor-1.jpg'
                    }, 1);
                  }}
                  className="w-full py-2.5 rounded-xl bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800 transition flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Enquire ₹1,10,000 Setup</span>
                </button>
              </div>
            </div>
          </div>

          {/* D.R.D.O. Approved Government Contractor Banner */}
          <div className="bg-neutral-900 text-white p-6 rounded-2xl border border-brand-gold/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-gold">
                    Official Institutional Credentials
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                    18% GST Compliant
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-serif font-bold text-white">
                  Approved Government Contractors — D.R.D.O. Lucknow Benchmarks
                </h4>
                <p className="text-xs text-neutral-300 max-w-2xl">
                  Contracted for Defence Research & Development Organisation (DRDO Lucknow) seminars. Heavy truss staging, podiums, ceremonial brass diya lamps, cordless audio, and 80+ LED par setups available with official billing.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-3">
              <a
                href="https://wa.me/??text=Namaste%20Kandhari%20Tent!%20We%20require%20an%20institutional%2Fcorporate%20seminar%20setup%20with%20GST%20quotation."
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Govt / Corporate Desk</span>
              </a>
              <button
                onClick={() => {
                  addItem({
                    id: 'pkg-corporate-institutional',
                    name: 'Corporate & Government Seminar Setup (DRDO Approved Contractor Benchmark)',
                    category: 'Package Deals',
                    imageUrl: '/media/stage/stage-1.jpg'
                  }, 1);
                }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition"
              >
                Request Seminar Quote
              </button>
            </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
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

      {/* 6.5. VERIFIED CLIENT TESTIMONIALS */}
      <TestimonialsSection />

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
              href="/contact"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-brand-gold" />
              <span>Toll-Free Helpline</span>
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

      {/* Multi-Line Phone Call Modal */}
      <PhoneCallModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onOpenVoiceAi={() => {
          window.dispatchEvent(new CustomEvent('open-ai-chat', {
            detail: { mode: 'voice', initialMessage: 'Namaste Veronica, I want to discuss a rental booking.' }
          }));
        }}
      />

    </div>
  );
};

export default HomePage;
