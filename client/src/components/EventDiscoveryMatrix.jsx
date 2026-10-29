import React, { useState, useRef } from 'react';
import { 
  HeartHandshake, 
  Sparkles, 
  Crown, 
  MapPin, 
  Tent, 
  UtensilsCrossed, 
  ArrowRight, 
  Phone, 
  Calendar, 
  Eye, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

/**
 * 3D Interactive Perspective Tilt Card with Dynamic Specular Glare
 * Implements modern spatial UI/UX principles (Awwwards / Apple / Stripe style)
 */
const Tilt3DCard = ({ children, className = '', isPriority = false }) => {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});
  const [glareStyle, setGlareStyle] = useState({ opacity: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (-6 to +6 degrees)
    const rotateX = ((y - centerY) / centerY) * -6.5;
    const rotateY = ((x - centerX) / centerX) * 6.5;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.08s ease-out',
      transformStyle: 'preserve-3d',
    });

    setGlareStyle({
      opacity: isPriority ? 0.08 : 0.22,
      background: `radial-gradient(circle at ${x}px ${y}px, rgba(212, 175, 55, 0.45) 0%, rgba(255, 255, 255, 0.05) 45%, rgba(0, 0, 0, 0) 70%)`,
      transition: 'opacity 0.15s ease-out',
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
      transformStyle: 'preserve-3d',
    });
    setGlareStyle({
      opacity: 0,
      transition: 'opacity 0.35s ease-out',
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      className={`relative overflow-hidden ${className}`}
    >
      {children}
      {/* Dynamic Specular Glare Overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-200"
        style={glareStyle}
      />
    </div>
  );
};

export const DISCOVERY_CATEGORIES = [
  {
    id: 'bereavement',
    categoryKey: 'A',
    eventType: 'Condolence / Chautha',
    tag: 'Priority Bereavement Desk',
    title: 'Condolence, Chautha & Shradh Gatherings',
    tagline: 'Respectful, discreet, and urgent setups with zero sales pressure',
    desc: 'Clean white linen mattresses (gadda baithak), dignified white shamianas, sound systems, and priority delivery across Lucknow within hours.',
    image: '/media/seating/seating-1.jpg',
    badge: '🕊️ Immediate Coordination • Direct Helpline',
    badgeColor: 'bg-stone-800 text-stone-200 border-stone-600',
    primaryAction: 'Coordinate Urgently',
    phoneLink: 'tel:+919305465848',
    initialMessage: 'Namaste, we need urgent arrangements for a chautha / condolence gathering.',
    isPriority: true,
    highlights: ['Clean white gadda & bedsheets', 'Waterproof white canopy', 'Toll-free 24/7 priority response']
  },
  {
    id: 'birthdays',
    categoryKey: 'B',
    eventType: 'Birthday Party',
    tag: 'Milestone Celebrations',
    title: 'Birthdays & Social Celebrations',
    tagline: 'Vibrant themes, bespoke backdrops & joyful memories',
    desc: 'Creative party themes including Princess, Jungle, Cartoon, and Elegant Floral. Ambient party lighting, balloon arches, and kid-friendly catering.',
    image: '/media/rich-decor/decor-2.jpg',
    badge: '🎂 Themes & Custom Cakes',
    badgeColor: 'bg-purple-900/80 text-purple-200 border-purple-500/40',
    primaryAction: 'Plan Party Theme',
    initialMessage: 'I want to plan a birthday party celebration. What themes and packages do you have?',
    isPriority: false,
    highlights: ['Custom balloon & floral backdrops', 'High-energy sound consoles', 'Live snacks & dessert bars']
  },
  {
    id: 'weddings',
    categoryKey: 'C',
    eventType: 'Wedding',
    tag: 'Palatial Vivah Celebrations',
    title: 'Grand Weddings & Royal Receptions',
    tagline: 'End-to-end royal wedding architecture on Kanpur Road',
    desc: '30-ft elevated carved palace stages, fragrant rose and marigold Vedic mandaps, illuminated grand gate entrances, and VIP family seating.',
    image: '/media/weddings/wedding-1.jpg',
    badge: '👑 Royal Stages & Vedic Mandap',
    badgeColor: 'bg-amber-950/80 text-amber-200 border-amber-500/40',
    primaryAction: 'Explore Wedding Setups',
    initialMessage: 'I am planning a wedding and want to explore stage, mandap, and tent setups.',
    isPriority: false,
    highlights: ['Vedic rose & marigold mandaps', 'Modular 30ft palace stages', 'Full DJ sound & illumination']
  },
  {
    id: 'lawn',
    categoryKey: 'C',
    eventType: 'Dwaraka Shree Lawn',
    tag: 'Associated Luxury Venue',
    title: 'Dwaraka Shree Lawn, Kanpur Road',
    tagline: 'Spacious celebration grounds for up to 1,200 guests',
    desc: 'Lush open-air manicured grounds opposite Pillar No. 37, Daroga Kheda. Dedicated bride/groom suites, paved food court, and ample parking.',
    image: '/media/lawns/lawn-main.jpg',
    badge: '🏰 25,000+ Sq.Ft Lawn & Hall',
    badgeColor: 'bg-emerald-950/80 text-emerald-200 border-emerald-500/40',
    primaryAction: 'Check Lawn Dates',
    initialMessage: 'I want to check date availability and booking rates for Dwaraka Shree Lawn.',
    isPriority: false,
    highlights: ['Capacity for 1,200+ guests', 'Covered dining hall + lawn', 'Bridal dressing rooms included']
  },
  {
    id: 'rentals',
    categoryKey: 'D',
    eventType: 'Equipment Rental',
    tag: 'Direct Warehouse Inventory',
    title: 'Tent, Furniture & Sound Rentals',
    tagline: 'Transparent catalog pricing with verified live stock',
    desc: 'Banquet chairs, VIP sofas, round dining tables, sound setups, mist fans, and Haldi/Mehendi props available with prompt Kanpur Road dispatch.',
    image: '/media/tent/tent-1.jpg',
    badge: '⛺ 31+ Items in Live Stock',
    badgeColor: 'bg-blue-950/80 text-blue-200 border-blue-500/40',
    primaryAction: 'Browse Rental Catalog',
    initialMessage: 'I need to rent chairs, tables, and tent equipment for an upcoming gathering.',
    isPriority: false,
    highlights: ['Verified commercial stock', 'Dispatched from Daroga Kheda', 'Flexible daily hire rates']
  },
  {
    id: 'catering',
    categoryKey: 'D',
    eventType: 'Catering Enquiry',
    tag: 'Authentic Awadhi Kitchen',
    title: 'Royal Awadhi & Pure Veg Catering',
    tagline: 'Live tawa chaat, Shahi Paneer, and hot Imarti Rabri',
    desc: 'Custom pure vegetarian event menus prepared with authentic Awadhi dum pukht methods. Live counters, uniformed service staff, and cutlery included.',
    image: '/media/food/dal-makhani.jpg',
    badge: '🍽️ 125 Dishes • 8 Packages',
    badgeColor: 'bg-amber-900/80 text-amber-200 border-amber-500/40',
    primaryAction: 'View Catering Packages',
    initialMessage: 'Namaste, please share your catering menu and per-plate packages.',
    isPriority: false,
    highlights: ['100% Pure vegetarian kitchen', 'Live Chaat & Dosa stalls', 'Customizable tasting menus']
  }
];

export const EventDiscoveryMatrix = ({ onOpenEnquiryWithCategory }) => {
  const [activeTab, setActiveTab] = useState('all');

  const handleCardClick = (item) => {
    // Dispatch custom event to open AI Chat Concierge pre-loaded with the category
    window.dispatchEvent(new CustomEvent('open-ai-chat', {
      detail: {
        category: item.categoryKey,
        eventType: item.eventType,
        initialMessage: item.initialMessage
      }
    }));

    if (onOpenEnquiryWithCategory) {
      onOpenEnquiryWithCategory(item);
    }
  };

  const filteredCategories = activeTab === 'all' 
    ? DISCOVERY_CATEGORIES 
    : DISCOVERY_CATEGORIES.filter(c => c.categoryKey === activeTab);

  return (
    <section id="event-discovery" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive 3D Event Discovery</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-white leading-tight">
            What Are You Planning Today?
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Select your event type to launch an instant, tailored coordination session with the <strong>Kandhari Event Concierge</strong>. Move cursor over any card to experience interactive 3D spatial depth.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#0f041d] border border-amber-500/20 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'all' 
                ? 'bg-amber-500 text-black shadow-md' 
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            All Services (6)
          </button>
          <button
            onClick={() => setActiveTab('A')}
            className={`px-3.5 py-2 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'A' 
                ? 'bg-stone-700 text-white shadow-md' 
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            🕊️ Bereavement Desk
          </button>
          <button
            onClick={() => setActiveTab('B')}
            className={`px-3.5 py-2 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'B' 
                ? 'bg-purple-700 text-white shadow-md' 
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            🎂 Birthdays
          </button>
          <button
            onClick={() => setActiveTab('C')}
            className={`px-3.5 py-2 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'C' 
                ? 'bg-amber-700 text-white shadow-md' 
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            👑 Weddings & Lawn
          </button>
          <button
            onClick={() => setActiveTab('D')}
            className={`px-3.5 py-2 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'D' 
                ? 'bg-blue-800 text-white shadow-md' 
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            ⛺ Rentals & Food
          </button>
        </div>
      </div>

      {/* Grid of 6 Luxury Event Discovery Cards with 3D Spatial Tilt */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 items-stretch">
        {filteredCategories.map((item) => (
          <Tilt3DCard
            key={item.id}
            isPriority={item.isPriority}
            className={`cinematic-card rounded-3xl overflow-hidden flex flex-col justify-between group ${
              item.isPriority 
                ? 'border-stone-500/60 bg-gradient-to-b from-[#181318] to-[#0c0a0c]' 
                : 'border-amber-500/30'
            }`}
          >
            {/* Image Header with Cinematic Vignette */}
            <div className="relative aspect-16/10 overflow-hidden bg-black/40">
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                onError={(e) => {
                  e.currentTarget.src = '/media/rich-decor/decor-1.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e041a] via-black/40 to-transparent" />
              
              {/* Top Badge */}
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 z-10">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md shadow-md ${item.badgeColor}`}>
                  {item.badge}
                </span>
                {item.isPriority && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-600/90 text-white animate-pulse shadow-md">
                    URGENT DESK
                  </span>
                )}
              </div>

              {/* Tag Over Image */}
              <div className="absolute bottom-3 left-4 z-10">
                <span className="text-[11px] font-serif font-bold text-amber-300 tracking-wide uppercase">
                  {item.tag}
                </span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
              <div className="space-y-2.5">
                <h3 className="text-xl font-serif font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs font-medium text-amber-200/80 leading-normal">
                  {item.tagline}
                </p>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {item.desc}
                </p>

                {/* Key Highlights */}
                <div className="pt-2 space-y-1.5 border-t border-white/10 text-[11px] text-neutral-200">
                  {item.highlights.map((hl, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center gap-2.5 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => handleCardClick(item)}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
                    item.isPriority
                      ? 'bg-stone-200 hover:bg-white text-stone-900'
                      : 'bg-amber-500 hover:bg-amber-400 text-black'
                  }`}
                >
                  <span>{item.primaryAction}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {item.phoneLink ? (
                  <a
                    href={item.phoneLink}
                    className="p-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-white border border-stone-600 transition flex items-center justify-center shrink-0"
                    title="Direct Helpline"
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleCardClick(item)}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 border border-white/20 transition flex items-center justify-center shrink-0 cursor-pointer"
                    title="Ask AI Concierge"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </Tilt3DCard>
        ))}
      </div>
    </section>
  );
};

export default EventDiscoveryMatrix;
