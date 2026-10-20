import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download, 
  Share2, 
  Check, 
  CheckCircle2, 
  MapPin, 
  Users, 
  Phone, 
  Calendar, 
  Sparkles, 
  Home, 
  Trees, 
  Utensils, 
  Maximize2, 
  X, 
  ChevronRight, 
  ArrowRight,
  MessageCircle,
  Eye,
  Award,
  ShieldCheck,
  Building,
  Bed,
  Layers,
  Flame,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { FALLBACK_VENUE } from '../data/seedItems';
import { useEnquiry } from '../context/EnquiryContext';
import SEO from '../components/SEO';

const LawnPage = () => {
  const [venue, setVenue] = useState(FALLBACK_VENUE);
  const [reels, setReels] = useState([]);
  const [venueVideo, setVenueVideo] = useState(null);
  const [activeReelModal, setActiveReelModal] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeAreaTab, setActiveAreaTab] = useState('entrance');
  
  // Hero Video Player State
  const [isPlayingHero, setIsPlayingHero] = useState(false);
  const [isMutedHero, setIsMutedHero] = useState(true);
  const heroVideoRef = useRef(null);

  // Modal Video Player State
  const [isModalMuted, setIsModalMuted] = useState(false);
  const modalVideoRef = useRef(null);

  const { openDrawer } = useEnquiry();

  useEffect(() => {
    const loadVenueData = async () => {
      try {
        const [venueRes, reelsRes, videoRes] = await Promise.all([
          api.getVenue(),
          api.getLawnReels ? api.getLawnReels() : Promise.resolve({ success: false }),
          api.getVenueVideo ? api.getVenueVideo() : Promise.resolve({ success: false })
        ]);

        if (venueRes.success && venueRes.data) {
          setVenue(venueRes.data);
        }

        if (reelsRes.success && reelsRes.data && reelsRes.data.length > 0) {
          setReels(reelsRes.data);
        } else {
          // Robust fallback with the 7 verified pre-cut reels
          setReels([
            {
              id: 'reel-entrance',
              filename: '01_Grand_Entrance.mp4',
              title: 'A Grand Welcome at Dwarka Shri Lawn',
              category: 'Grand Entrance',
              areaTag: 'Entry Gate & Approach',
              duration: 12,
              aspectRatio: '9:16',
              videoUrl: '/media/lawn/reels/01_Grand_Entrance.mp4',
              coverUrl: '/media/lawn/reels/01_Grand_Entrance_cover.jpg',
              description: 'The royal entrance pathway, decorated welcome arches, and grand arrival experience on Kanpur Road, Lucknow.',
              hashtags: ['#DwarkaShriLawn', '#LucknowWedding', '#GrandEntrance', '#KandhariTent']
            },
            {
              id: 'reel-vip-lawn',
              filename: '02_Lawn_and_Gallery.mp4',
              title: 'An Exclusive VIP Experience',
              category: 'VIP Setting',
              areaTag: 'VIP Seating & Carpeted Grounds',
              duration: 13,
              aspectRatio: '9:16',
              videoUrl: '/media/lawn/reels/02_Lawn_and_Gallery.mp4',
              coverUrl: '/media/lawn/reels/02_Lawn_and_Gallery_cover.jpg',
              description: 'Spacious open green grounds with high-density red carpet walkway, VIP sofa lounges, and grand gallery perspective.',
              hashtags: ['#DwarkaShriLawn', '#VIPLounge', '#LucknowEvents', '#WeddingDecor']
            },
            {
              id: 'reel-setup-area',
              filename: '03_Lawn_Setup_Area.mp4',
              title: 'Spacious Lawn & Canopy Grounds',
              category: 'Lawn Setup Area',
              areaTag: 'Open Ground & Pandal Area',
              duration: 14,
              aspectRatio: '9:16',
              videoUrl: '/media/lawn/reels/03_Lawn_Setup_Area.mp4',
              coverUrl: '/media/lawn/reels/03_Lawn_Setup_Area_cover.jpg',
              description: 'Expansive 25,000+ sq.ft open ground capable of hosting 1,000+ guests with German waterproof pandal arrangements.',
              hashtags: ['#DwarkaShriLawn', '#LawnSetup', '#WeddingVenueLucknow', '#TentHouse']
            },
            {
              id: 'reel-indoor-hall',
              filename: '04_Indoor_Hall.mp4',
              title: 'Celebrate in Style — The Hall',
              category: 'Hall Experience',
              areaTag: 'Covered Air-Cooled Hall',
              duration: 15,
              aspectRatio: '9:16',
              videoUrl: '/media/lawn/reels/04_Indoor_Hall.mp4',
              coverUrl: '/media/lawn/reels/04_Indoor_Hall_cover.jpg',
              description: 'Large covered indoor hall for ring ceremonies, sangeet performances, and inclement weather protection.',
              hashtags: ['#DwarkaShriLawn', '#BanquetHall', '#LucknowBanquet', '#IndoorCelebration']
            },
            {
              id: 'reel-room-tour',
              filename: '05_Room_Tour.mp4',
              title: 'Comfortable Guest Rooms',
              category: 'Guest Rooms',
              areaTag: 'Deluxe AC Rooms & Suites',
              duration: 18,
              aspectRatio: '9:16',
              videoUrl: '/media/lawn/reels/05_Room_Tour.mp4',
              coverUrl: '/media/lawn/reels/05_Room_Tour_cover.jpg',
              description: 'Private air-conditioned bridal and family suites with attached modern bathrooms for wedding parties and overnight stay.',
              hashtags: ['#DwarkaShriLawn', '#GuestRooms', '#BridalSuite', '#WeddingStay']
            },
            {
              id: 'reel-corridor',
              filename: '06_Rooms_and_Corridor.mp4',
              title: 'Private Accommodation & Corridors',
              category: 'Guest Facilities',
              areaTag: '7+ Rooms & Private Wing',
              duration: 16,
              aspectRatio: '9:16',
              videoUrl: '/media/lawn/reels/06_Rooms_and_Corridor.mp4',
              coverUrl: '/media/lawn/reels/06_Rooms_and_Corridor_cover.jpg',
              description: 'Wide secure corridors, family preparation spaces, and 7+ furnished rooms (2 rooms included in standard package).',
              hashtags: ['#DwarkaShriLawn', '#RoomsTour', '#Accommodation', '#LucknowVenue']
            },
            {
              id: 'reel-teaser',
              filename: '07_Venue_Teaser.mp4',
              title: 'Discover Dwarka Shri Lawn Highlights',
              category: 'Venue Highlights',
              areaTag: 'Complete Venue Overview',
              duration: 12,
              aspectRatio: '9:16',
              videoUrl: '/media/lawn/reels/07_Venue_Teaser.mp4',
              coverUrl: '/media/lawn/reels/07_Venue_Teaser_cover.jpg',
              description: 'Complete cinematic aerial and ground walkthrough of Dwarka Shri Lawn, Opp. Pillar No. 37, Kanpur Road, Lucknow.',
              hashtags: ['#DwarkaShriLawn', '#LucknowWeddings', '#RoyalVivah', '#KandhariTent']
            }
          ]);
        }

        if (videoRes.success && videoRes.data) {
          setVenueVideo(videoRes.data);
        } else {
          setVenueVideo({
            url: '/media/lawn/DwarakaShreevideo.mp4',
            coverUrl: '/media/lawn/raw_video_cover.jpg',
            title: 'Dwarka Shri Lawn — Full Cinematic Venue Tour',
            location: 'Kanpur Road, Opp. Pillar No. 37, Daroga Kheda, Lucknow'
          });
        }
      } catch (err) {
        console.warn('Error loading lawn venue info:', err);
      }
    };

    loadVenueData();
  }, []);

  const toggleHeroPlay = () => {
    if (!heroVideoRef.current) return;
    if (isPlayingHero) {
      heroVideoRef.current.pause();
      setIsPlayingHero(false);
    } else {
      heroVideoRef.current.play();
      setIsPlayingHero(true);
    }
  };

  const toggleHeroMute = () => {
    if (!heroVideoRef.current) return;
    heroVideoRef.current.muted = !isMutedHero;
    setIsMutedHero(!isMutedHero);
  };

  const handleShareReel = (reel) => {
    const shareText = `नमस्ते! द्वारका श्री लॉन (कानपुर रोड, लखनऊ) का यह वीडियो रील देखें: ${window.location.origin}/lawn#${reel.id} — ${reel.title}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const filteredReels = activeFilter === 'all' 
    ? reels 
    : reels.filter(r => r.category.toLowerCase().includes(activeFilter.toLowerCase()) || r.areaTag?.toLowerCase().includes(activeFilter.toLowerCase()));

  // Visual areas data
  const venueAreas = [
    {
      id: 'entrance',
      title: 'Grand Entrance & Approach',
      hindiTitle: 'शाही मुख्य द्वार व आगमन',
      tag: 'Grand Arrival',
      image: '/media/lawn/reels/01_Grand_Entrance_cover.jpg',
      reelId: 'reel-entrance',
      description: 'A 40-foot illuminated royal entrance archway directly off Kanpur Road Highway, welcoming barat processions, VIP convoys, and decorated bridal carriages without traffic congestion.',
      highlights: ['Wide 40-foot Highway Entrance', 'Separate Barat Assembly Lane', 'Decorated Floral Welcome Arch', 'Valet & Guarded Parking Area']
    },
    {
      id: 'vip-lawn',
      title: 'VIP Seating & Carpeted Grounds',
      hindiTitle: 'वीआईपी लाउंज व मुख्य लॉन',
      tag: '25,000+ sq.ft Lawn',
      image: '/media/lawn/reels/02_Lawn_and_Gallery_cover.jpg',
      reelId: 'reel-vip-lawn',
      description: 'Lush, manicured green open lawn fitted with royal red carpet pathways, plush double-seater sofas, tiered VIP family enclosures, and mood ambient fairy lighting.',
      highlights: ['1,000+ Guest Capacity', 'High-density Red Carpet Walkways', 'Luxury Velvet Sofa Enclosures', 'High-mast LED Night Floodlights']
    },
    {
      id: 'dining',
      title: 'Main Course & Live Halwai Counter',
      hindiTitle: 'खान-पान व डाइनिंग एरिया',
      tag: 'Pure Veg Awadhi Feast',
      image: '/media/catering/counter-1.jpg',
      reelId: 'reel-setup-area',
      description: 'A dedicated, clean dining quadrangle with stainless-steel and brass chafing counters, tandoor stations, live chaat stalls, and covered seating so dining remains seamless.',
      highlights: ['100% Pure Vegetarian Awadhi Menu', '125 Authentic Wedding Recipes', 'Separate Water & Waste Lines', 'Covered Dining Canopy Options']
    },
    {
      id: 'hall',
      title: 'Covered Air-Cooled Banquet Hall',
      hindiTitle: 'कवर्ड इनडोर हॉल',
      tag: 'Weatherproof Hall',
      image: '/media/lawn/reels/04_Indoor_Hall_cover.jpg',
      reelId: 'reel-indoor-hall',
      description: 'Spacious covered hall for ring ceremonies, sangeet performances, elderly guest dining, or complete weather protection during unexpected Lucknow rains.',
      highlights: ['High-ceiling Covered Structure', 'Air-cooled Ventilation System', 'Polished Flooring & Stage Area', 'Attached Modern Restrooms']
    },
    {
      id: 'stage',
      title: 'Grand Wedding Stage & Mandap Area',
      hindiTitle: 'जयमाला स्टेज व फेरे मंडप',
      tag: 'Royal Stage',
      image: '/media/stage/stage-1.jpg',
      reelId: 'reel-teaser',
      description: 'Centrally positioned elevated platform with heavy floral backdrops, crystal chandeliers, Maharaja chairs for the couple, and traditional sacred fire havan kund.',
      highlights: ['Elevated 32x20 ft Stage Footprint', 'Bespoke Fresh & Silk Floral Styling', 'Surround Acoustic Sound Integration', 'Sacred Wedding Mandap Quadrangle']
    },
    {
      id: 'rooms',
      title: 'Guest Rooms & Bridal Dressing Suites',
      hindiTitle: 'गेस्ट रूम्स व दुल्हन सुइट',
      tag: '7+ Deluxe Rooms',
      image: '/media/lawn/reels/05_Room_Tour_cover.jpg',
      reelId: 'reel-room-tour',
      description: 'Seven private air-conditioned suites with double beds, full-length dressing mirrors, attached clean tiled bathrooms, and secure storage for family jewelry and outfits.',
      highlights: ['2 AC Rooms Included in Wedding Package', '5 Additional Rooms Available at ₹1,500/day', 'Private Dressing & Makeup Mirrors', 'Attached Hygienic Bathrooms']
    }
  ];

  const currentArea = venueAreas.find(a => a.id === activeAreaTab) || venueAreas[0];

  return (
    <div className="min-h-screen bg-brand-cream text-neutral-800 pb-24">
      <SEO
        title="Dwarka Shri Lawn Lucknow | Wedding Banquet & Event Venue Kanpur Road"
        description="Dwarka Shri Lawn on Kanpur Road Opp. Pillar No. 37, Daroga Kheda, Lucknow. 25,000+ sq.ft lawn, 1,000+ capacity, 7+ AC rooms, covered hall, pure veg catering by Kandhari Tent."
        canonical="/lawn"
      />

      {/* ========================================================================= */}
      {/* 1. CINEMATIC VIDEO HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative bg-brand-dark text-white overflow-hidden pt-12 pb-20 border-b border-brand-gold/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-maroon/50 via-brand-dark to-black pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header Title & Location */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-maroon/70 border border-brand-gold/40 text-brand-goldLight text-xs sm:text-sm font-semibold tracking-wide">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <span>द्वारका श्री लॉन • वास्तविक वीडियो टूर</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-tight">
              Dwarka Shri Lawn
            </h1>
            
            <p className="text-brand-goldLight font-serif text-lg sm:text-xl">
              The Grand Royal Wedding Grounds of Kanpur Road, Lucknow
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-neutral-300 pt-1">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-gold" />
                Opp. Pillar No. 37, Daroga Kheda, Kanpur Road, Lucknow
              </span>
              <span className="hidden sm:inline text-neutral-500">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand-gold" />
                Capacity: 1,000+ Guests
              </span>
              <span className="hidden sm:inline text-neutral-500">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-brand-gold" />
                7+ AC Guest Rooms Available
              </span>
            </div>
          </div>

          {/* Large Cinematic Video Player Showcase */}
          <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden border-2 border-brand-gold/40 shadow-2xl bg-black">
            <div className="relative aspect-[16/9] sm:aspect-[16/9] md:aspect-[16/9] w-full bg-black flex items-center justify-center">
              <video
                ref={heroVideoRef}
                src={venueVideo?.url || '/media/lawn/DwarakaShreevideo.mp4'}
                poster={venueVideo?.coverUrl || '/media/lawn/raw_video_cover.jpg'}
                playsInline
                loop
                muted={isMutedHero}
                onPlay={() => setIsPlayingHero(true)}
                onPause={() => setIsPlayingHero(false)}
                className="w-full h-full object-contain"
              />

              {/* Big Play Overlay (when paused) */}
              {!isPlayingHero && (
                <div 
                  onClick={toggleHeroPlay}
                  className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer group transition"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full royal-gradient text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-10 h-10 sm:w-12 sm:h-12 ml-1 text-white fill-current" />
                  </div>
                  <p className="mt-4 text-sm sm:text-base font-serif text-white font-medium drop-shadow-md">
                    द्वारका श्री लॉन का वास्तविक वीडियो देखें (Click to Play)
                  </p>
                </div>
              )}

              {/* Video Bottom Floating Controls */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-white text-xs">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={toggleHeroPlay}
                    className="p-1.5 hover:text-brand-gold transition"
                    title={isPlayingHero ? 'Pause' : 'Play'}
                  >
                    {isPlayingHero ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>

                  <button 
                    onClick={toggleHeroMute}
                    className="p-1.5 hover:text-brand-gold transition flex items-center gap-1.5"
                    title={isMutedHero ? 'Unmute' : 'Mute'}
                  >
                    {isMutedHero ? <VolumeX className="w-5 h-5 text-neutral-400" /> : <Volume2 className="w-5 h-5 text-brand-gold" />}
                    <span className="hidden sm:inline text-[11px] text-neutral-300">
                      {isMutedHero ? 'Unmute Sound' : 'Sound On'}
                    </span>
                  </button>

                  <span className="text-neutral-400 text-[11px] hidden md:inline">
                    Dwarka Shri Lawn • Kanpur Road, Lucknow
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="#lawn-reels"
                    className="px-3 py-1.5 rounded-lg bg-brand-gold/20 border border-brand-gold/40 text-brand-goldLight text-[11px] font-semibold hover:bg-brand-gold/30 transition flex items-center gap-1"
                  >
                    <span>7 वीडियो रील्स</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>

                  <a 
                    href="/media/lawn/DwarakaShreevideo.mp4" 
                    download="Dwarka_Shri_Lawn_Video.mp4"
                    className="p-1.5 hover:text-brand-gold transition text-neutral-300"
                    title="Download Source Video"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Statistics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
            <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-center space-y-1">
              <span className="text-xl sm:text-2xl font-serif font-bold text-brand-gold">25,000+</span>
              <p className="text-[11px] text-neutral-400">वर्ग फुट खुला लॉन</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-center space-y-1">
              <span className="text-xl sm:text-2xl font-serif font-bold text-brand-gold">1,000+</span>
              <p className="text-[11px] text-neutral-400">मेहमानों की क्षमता</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-center space-y-1">
              <span className="text-xl sm:text-2xl font-serif font-bold text-brand-gold">7+ AC</span>
              <p className="text-[11px] text-neutral-400">डीलक्स गेस्ट रूम्स</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-center space-y-1">
              <span className="text-xl sm:text-2xl font-serif font-bold text-brand-gold">₹1.10L</span>
              <p className="text-[11px] text-neutral-400">वेन्यू पैकेज (2 रूम शामिल)</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-center space-y-1">
              <span className="text-xl sm:text-2xl font-serif font-bold text-brand-gold">100%</span>
              <p className="text-[11px] text-neutral-400">शुद्ध शाकाहारी केटरिंग</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-center space-y-1">
              <span className="text-xl sm:text-2xl font-serif font-bold text-brand-gold">पिलर 37</span>
              <p className="text-[11px] text-neutral-400">कानपुर रोड, दरोगा खेड़ा</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PROMOTIONAL REELS GALLERY (6-7 FINISHED MP4 VIDEOS) */}
      {/* ========================================================================= */}
      <section id="lawn-reels" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-maroon/10 border border-brand-maroon/20 text-brand-maroon text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 text-brand-maroon" />
            <span>इंस्टाग्राम व व्हाट्सएप रील्स</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-maroon">
            7 Cinematic Promotional Reels
          </h2>

          <p className="text-sm text-neutral-600">
            वास्तविक वीडियो फुटेज से तैयार की गई 9:16 वर्टिकल रील्स। आप इन्हें यहीं प्ले कर सकते हैं या सीधे डाउनलोड व शेयर कर सकते हैं।
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            { id: 'all', label: 'सभी रील्स (All 7 Reels)' },
            { id: 'Entrance', label: 'मुख्य द्वार (Entrance)' },
            { id: 'VIP', label: 'वीआईपी लाउंज (VIP Setting)' },
            { id: 'Setup', label: 'लॉन ग्राउंड्स (Lawn Setup)' },
            { id: 'Hall', label: 'इनडोर हॉल (Indoor Hall)' },
            { id: 'Room', label: 'गेस्ट रूम्स (Guest Rooms)' },
            { id: 'Highlights', label: 'वेन्यू हाइलाइट्स (Highlights)' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
                activeFilter === f.id
                  ? 'bg-brand-maroon text-white shadow-md'
                  : 'bg-white text-neutral-600 hover:text-brand-maroon border border-neutral-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 7 Reels Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredReels.map((reel, idx) => (
            <div 
              key={reel.id}
              className="bg-white rounded-3xl overflow-hidden border border-brand-cream-border shadow-luxury hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Vertical 9:16 Thumbnail Container with Hover Glow */}
              <div 
                onClick={() => setActiveReelModal(reel)}
                className="relative aspect-[9/16] w-full bg-neutral-900 cursor-pointer overflow-hidden"
              >
                <img 
                  src={reel.coverUrl} 
                  alt={reel.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = '/media/lawn/raw_video_cover.jpg';
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 group-hover:via-black/10 transition" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-brand-goldLight">
                    {reel.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-mono">
                    {reel.duration}s • 9:16
                  </span>
                </div>

                {/* Center Play Icon Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full royal-gradient text-white flex items-center justify-center shadow-2xl group-hover:scale-125 transition-transform">
                    <Play className="w-7 h-7 ml-0.5 text-white fill-current" />
                  </div>
                </div>

                {/* Bottom Overlay Title in Video Frame */}
                <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
                  <p className="text-[11px] text-brand-gold uppercase tracking-wider font-semibold">
                    {reel.areaTag}
                  </p>
                  <h3 className="text-sm font-serif font-bold text-white line-clamp-2 drop-shadow">
                    {reel.title}
                  </h3>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                  {reel.description}
                </p>

                {/* Hashtags */}
                {reel.hashtags && reel.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 text-[10px] text-neutral-400">
                    {reel.hashtags.slice(0, 3).map((h, hIdx) => (
                      <span key={hIdx}>{h}</span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveReelModal(reel)}
                    className="flex-1 py-2 px-3 rounded-xl bg-brand-maroon/10 hover:bg-brand-maroon text-brand-maroon hover:text-white text-xs font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>देखें (Play)</span>
                  </button>

                  <a
                    href={reel.videoUrl}
                    download={reel.filename}
                    className="p-2 rounded-xl border border-neutral-200 text-neutral-600 hover:text-brand-maroon hover:border-brand-maroon transition"
                    title="Download MP4 Reel"
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleShareReel(reel)}
                    className="p-2 rounded-xl border border-neutral-200 text-neutral-600 hover:text-green-600 hover:border-green-600 transition"
                    title="Share via WhatsApp"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. DEDICATED VISUAL SECTIONS (ENTRY, VIP, DINING, HALL, STAGE, ROOMS) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/20 text-brand-maroon text-xs font-semibold">
            <Building className="w-3.5 h-3.5 text-brand-gold" />
            <span>लॉन के मुख्य क्षेत्र (Venue Areas)</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-maroon">
            Explore Every Corner of the Venue
          </h2>
          
          <p className="text-sm text-neutral-600">
            विवाह, सगाई, संगीत व रिसेप्शन के लिए द्वारका श्री लॉन की संपूर्ण सुविधाएं
          </p>
        </div>

        {/* Tabs for Areas */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-neutral-200 pb-4">
          {venueAreas.map(area => (
            <button
              key={area.id}
              onClick={() => setActiveAreaTab(area.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-serif font-semibold transition flex items-center gap-2 ${
                activeAreaTab === area.id
                  ? 'bg-brand-maroon text-white shadow-md'
                  : 'bg-white text-neutral-600 hover:text-brand-maroon border border-neutral-200'
              }`}
            >
              <span>{area.title}</span>
            </button>
          ))}
        </div>

        {/* Active Area Showcase Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-cream-border shadow-luxury grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-brand-gold/15 text-brand-maroon text-xs font-bold uppercase tracking-wider">
                {currentArea.tag}
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900">
                {currentArea.title}
              </h3>
              <p className="text-sm font-serif text-brand-gold font-medium">
                {currentArea.hindiTitle}
              </p>
            </div>

            <p className="text-neutral-700 text-sm sm:text-base leading-relaxed">
              {currentArea.description}
            </p>

            {/* Bullet Highlights */}
            <div className="space-y-2.5 pt-2">
              {currentArea.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-neutral-700">
                  <div className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{h}</span>
                </div>
              ))}
            </div>

            {/* Action CTAs */}
            <div className="pt-4 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  const targetReel = reels.find(r => r.id === currentArea.reelId);
                  if (targetReel) setActiveReelModal(targetReel);
                }}
                className="px-5 py-3 rounded-xl bg-brand-maroon hover:bg-brand-maroonLight text-white text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>इस क्षेत्र का वीडियो देखें</span>
              </button>

              <button
                onClick={() => openDrawer({ defaultService: 'Dwarka Shri Lawn' })}
                className="px-5 py-3 rounded-xl border border-brand-gold text-brand-maroon hover:bg-brand-gold/10 text-xs sm:text-sm font-bold transition flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-brand-gold" />
                <span>तारीख बुक करें (Enquire)</span>
              </button>
            </div>
          </div>

          {/* Area Visual Showcase Container */}
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-neutral-900 border border-neutral-200 shadow-md">
            <img 
              src={currentArea.image} 
              alt={currentArea.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/media/lawn/raw_video_cover.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
              <p className="text-white text-xs sm:text-sm font-serif font-medium drop-shadow">
                Dwarka Shri Lawn • {currentArea.title}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. VERIFIED LAWN PHOTO GALLERY */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider text-brand-gold font-bold">
              गैलरी व वास्तविक सजावट
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-maroon">
              Verified Grounds & Setup Gallery
            </h2>
            <p className="text-sm text-neutral-600">
              द्वारका श्री लॉन में आयोजित हुए शाही विवाह और स्वागत समारोहों की वास्तविक तस्वीरें
            </p>
          </div>

          <button
            onClick={() => openDrawer({ defaultService: 'Dwarka Shri Lawn' })}
            className="px-5 py-2.5 rounded-xl royal-gradient text-white text-xs sm:text-sm font-bold shadow-md hover:opacity-95 transition self-start md:self-auto"
          >
            वेन्यू कोटेशन प्राप्त करें
          </button>
        </div>

        {/* Curated Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { img: '/media/lawn/reels/01_Grand_Entrance_cover.jpg', title: 'Main Grand Entrance' },
            { img: '/media/lawn/reels/02_Lawn_and_Gallery_cover.jpg', title: 'Red Carpet Open Lawn' },
            { img: '/media/lawn/reels/04_Indoor_Hall_cover.jpg', title: 'Covered Banquet Hall' },
            { img: '/media/lawn/reels/05_Room_Tour_cover.jpg', title: 'AC Bridal & Family Rooms' },
            { img: '/media/stage/stage-1.jpg', title: 'Royal Stage & Mandap' },
            { img: '/media/rich-decor/decor-1.jpg', title: 'Night Mood Illumination' },
            { img: '/media/catering/counter-1.jpg', title: 'Awadhi Catering Setup' },
            { img: '/media/seating/seating-1.jpg', title: 'VIP Sofa Lounge Setup' }
          ].map((item, idx) => (
            <div key={idx} className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-neutral-900 group border border-neutral-200">
              <img 
                src={item.img} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.currentTarget.src = '/media/lawn/raw_video_cover.jpg'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-white text-xs font-serif font-bold">{item.title}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. IN-HOUSE ADVANTAGE: KANDHARI TENT & CATERERS */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="rounded-3xl royal-gradient p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-6">
            <span className="px-3 py-1 rounded-full bg-white/20 text-brand-goldLight text-xs font-bold uppercase tracking-wider">
              पूर्ण इन-हाउस सुविधा • Zero Middlemen
            </span>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
              Kandhari Tent & Caterers In-House Production
            </h2>

            <p className="text-sm sm:text-base text-neutral-200 leading-relaxed">
              द्वारका श्री लॉन में आयोजन का सबसे बड़ा लाभ यह है कि यहाँ टेंट, शामियाना, स्टेज, लाइटिंग, फर्नीचर और 100% शुद्ध शाकाहारी अवधी खान-पान सीधे <strong>कंधारी टेंट एंड कैटरर्स</strong> द्वारा स्वयं किया जाता है। किसी बाहरी बिचौलिए या कमीशन का झंझट नहीं।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
                <h4 className="font-serif font-bold text-brand-goldLight text-sm">125 शुद्ध शाकाहारी व्यंजन</h4>
                <p className="text-xs text-neutral-300">लखनऊ के प्रसिद्ध शाही पनीर, दाल मखनी, व इमरती-रबड़ी</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
                <h4 className="font-serif font-bold text-brand-goldLight text-sm">जर्मन वाटरप्रूफ हैंगर</h4>
                <p className="text-xs text-neutral-300">बारिश व आंधी से पूर्ण सुरक्षा की गारंटी</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
                <h4 className="font-serif font-bold text-brand-goldLight text-sm">पारदर्शी स्थानीय दरें</h4>
                <p className="text-xs text-neutral-300">सीधा मालिक से सौदा, कोई छिपा हुआ शुल्क नहीं</p>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-4 items-center">
              <button
                onClick={() => openDrawer({ defaultService: 'Dwarka Shri Lawn' })}
                className="px-6 py-3.5 rounded-xl bg-white text-brand-maroon hover:bg-brand-cream text-xs sm:text-sm font-bold shadow-lg transition"
              >
                तारीख उपलब्धता व कोटेशन पूछें
              </button>

              <a 
                href="tel:+919305465848"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-white/30 text-white hover:bg-white/10 text-xs sm:text-sm font-bold transition"
              >
                <Phone className="w-4 h-4 text-brand-gold" />
                <span>+91 93054 65848 पर कॉल करें</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. MODAL VIDEO PLAYER (FOR 9:16 REELS) */}
      {/* ========================================================================= */}
      {activeReelModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-sm w-full bg-neutral-900 rounded-3xl overflow-hidden border border-brand-gold/40 shadow-2xl flex flex-col">
            {/* Top Close Button & Title */}
            <div className="p-4 bg-neutral-950/80 backdrop-blur-md flex items-center justify-between text-white border-b border-neutral-800">
              <div className="truncate pr-2">
                <span className="text-[10px] text-brand-gold uppercase tracking-wider font-semibold block">
                  {activeReelModal.category}
                </span>
                <h4 className="text-sm font-serif font-bold truncate">
                  {activeReelModal.title}
                </h4>
              </div>

              <button
                onClick={() => setActiveReelModal(null)}
                className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 9:16 Video Player Container */}
            <div className="relative aspect-[9/16] w-full bg-black flex items-center justify-center">
              <video
                ref={modalVideoRef}
                src={activeReelModal.videoUrl}
                poster={activeReelModal.coverUrl}
                autoPlay
                playsInline
                loop
                muted={isModalMuted}
                className="w-full h-full object-contain"
              />

              {/* Sound Toggle Overlay */}
              <button
                onClick={() => setIsModalMuted(!isModalMuted)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:text-brand-gold transition"
                title={isModalMuted ? 'Unmute' : 'Mute'}
              >
                {isModalMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-brand-gold" />}
              </button>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 bg-neutral-950 border-t border-neutral-800 space-y-3">
              <p className="text-xs text-neutral-300 line-clamp-2">
                {activeReelModal.description}
              </p>

              <div className="flex gap-2">
                <a
                  href={activeReelModal.videoUrl}
                  download={activeReelModal.filename}
                  className="flex-1 py-2.5 rounded-xl bg-brand-gold text-brand-dark text-xs font-bold transition hover:opacity-95 flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>डाउनलोड MP4</span>
                </a>

                <button
                  onClick={() => handleShareReel(activeReelModal)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:text-green-500 hover:border-green-500 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Share2 className="w-4 h-4" />
                  <span>शेयर</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LawnPage;
