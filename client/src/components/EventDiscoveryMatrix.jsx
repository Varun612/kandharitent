import React, { useState } from 'react';
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
    tagline: 'Spacious natural grounds managed by Kandhari Tent & Caterers',
    desc: 'Accommodates 800–1,000+ guests opposite Pillar No. 37, Daroga Kheda. Features AC bridal suites, covered dining pavilion, and dedicated guest parking.',
    image: '/media/lawns/lawn-main.jpg',
    badge: '📍 Opp. Pillar 37, Daroga Kheda',
    badgeColor: 'bg-emerald-950/80 text-emerald-200 border-emerald-500/40',
    primaryAction: 'Check Date Availability',
    initialMessage: 'What is the date availability and booking procedure for Dwaraka Shree Lawn?',
    isPriority: false,
    highlights: ['800–1,000 guest capacity', 'Private AC dressing suites', 'Heavy silent generator backup']
  },
  {
    id: 'rentals',
    categoryKey: 'D',
    eventType: 'Tent / Equipment Rental',
    tag: 'In-House Warehouse Inventory',
    title: 'Waterproof German Hangars & Equipment',
    tagline: 'Direct warehouse rates with zero middleman markup',
    desc: 'Engineered all-weather German hangars, VIP Maharaja sofas, 10,000+ commercial PVC chairs (₹20/pc), outdoor jumbo coolers, and heavy staging.',
    image: '/media/rich-decor/decor-1.jpg',
    badge: '⛺ DRDO Approved Vendor',
    badgeColor: 'bg-blue-950/80 text-blue-200 border-blue-500/40',
    primaryAction: 'Browse Equipment & Rates',
    initialMessage: 'I need rental equipment rates for chairs, sofas, and German hangar tents.',
    isPriority: false,
    highlights: ['Waterproof German hangars', 'White PVC chairs @ ₹20/pc', 'Outdoor mist fans & coolers']
  },
  {
    id: 'catering',
    categoryKey: 'D',
    eventType: 'Catering',
    tag: 'Royal Awadhi Cuisine',
    title: 'Awadhi Banqueting & Live Chaat Counters',
    tagline: '100% Pure Vegetarian 17-course wedding feast',
    desc: 'Authentic Lucknowi live counters: Matar Ki Chaat, Paneer Tikka Angara, Dal Bukhara, Kesaria Jalebi with Rabri, and Dum Biryani. Verified rates: ₹650 / ₹750.',
    image: '/media/catering/catering-1.jpg',
    badge: '🍲 17 Printed Courses • ₹650 / ₹750',
    badgeColor: 'bg-red-950/80 text-red-200 border-red-500/40',
    primaryAction: 'Design Catering Menu',
    initialMessage: 'Please share your royal catering menu packages and per-plate pricing.',
    isPriority: false,
    highlights: ['Live Awadhi chaat & tandoor', 'Illuminated laser-cut buffet lines', 'Bone china crockery & table service']
  }
];

const EventDiscoveryMatrix = ({ onOpenEnquiryWithCategory }) => {
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
            <span>Interactive Event Discovery</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-white leading-tight">
            What Are You Planning Today?
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Select your event type to launch an instant, tailored coordination session with the <strong>Kandhari Event Concierge</strong>. No repetitive forms—your choice is preserved instantly.
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
            🕊️ Condolence (Priority)
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

      {/* Grid of 6 Luxury Event Discovery Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 items-stretch">
        {filteredCategories.map((item) => (
          <div
            key={item.id}
            className={`cinematic-card rounded-3xl overflow-hidden flex flex-col justify-between group transition-all duration-500 relative ${
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
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
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
              <div className="absolute bottom-3 left-4">
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
          </div>
        ))}
      </div>
    </section>
  );
};

export default EventDiscoveryMatrix;
