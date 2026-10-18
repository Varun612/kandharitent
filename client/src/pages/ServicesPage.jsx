import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Layers, 
  Calendar, 
  Utensils, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  MessageCircle,
  Music,
  Tent,
  Palette,
  Flower2
} from 'lucide-react';
import LawnEnquiryModal from '../components/LawnEnquiryModal';
import { useEnquiry } from '../context/EnquiryContext';

const ServicesPage = () => {
  const [isLawnModalOpen, setIsLawnModalOpen] = useState(false);
  const { openDrawer } = useEnquiry();

  const handleLaunchChatForService = (serviceName) => {
    window.dispatchEvent(
      new CustomEvent('open-ai-chat', {
        detail: {
          initialMessage: `Namaste! Mujhe "${serviceName}" ke baare me enquiry karni hai. Details aur options batayein.`
        }
      })
    );
  };

  const services = [
    {
      id: 'tents',
      badge: 'Tenting Infrastructure',
      title: '1. Tent House & Canopy Rentals',
      description: 'Weather-resilient, heavy-duty structures engineered to client dimensions. From high-clearance clear-span German hangars that provide unobstructed ballroom elegance to traditional royal velvet shamianas and pagodas across Lucknow.',
      points: [
        'All-weather German Hangar setups (rain & wind tested)',
        'Royal embroidered Shamianas, Pagodas & Gazebos',
        'Covered dining marquees & passage walkway tunnels',
        'Heavy anchoring, clean drapery, and level ground staging'
      ],
      image: '/media/rich-decor/decor-1.jpg',
      alt: 'German Hangar Tent Setup by Kandhari Tent',
      ctaText: 'Enquire for Tent Rentals',
      actionType: 'chat'
    },
    {
      id: 'floral-decor',
      badge: 'Theme Styling',
      title: '2. Wedding Decoration & Floral Design',
      description: 'Artfully curated floral backdrops, fresh flower arches, marigold hangings, and contemporary pastel palettes for Haldi, Mehendi, Ring Ceremonies, and Grand Receptions.',
      points: [
        'Exotic fresh flower stage backdrops (roses, orchids, carnations)',
        'Traditional yellow & orange genda phool Haldi canopies',
        'Floral jewelry setups & decorated bridal photobooth swings',
        'Aesthetic entrance floral arches with warm illumination'
      ],
      image: '/media/stage/stage-1.jpg',
      alt: 'Fresh Floral Stage Decor by Kandhari Tent',
      ctaText: 'Enquire for Floral Decor',
      actionType: 'chat'
    },
    {
      id: 'lighting-sound',
      badge: 'Audio & Illumination',
      title: '3. Lighting Arrangements & Sound Systems',
      description: 'High-impact illumination that brings evening events to life. From multi-tiered crystal chandeliers and romantic fairy light canopies to aluminum box trusses, moving sharpies, and crystal-clear sound setups for Sangeet nights.',
      points: [
        'Luxury multi-tiered crystal chandeliers under shamiana ceiling',
        'Warm fairy light starry canopies over lawn and dining lawns',
        'Programmable RGBW LED par stage wash & ambient uplighters',
        'Aluminum truss rigging, focused spotlights & DJ sound systems'
      ],
      image: '/media/rich-decor/decor-6.jpg',
      alt: 'Ambient Lighting & Truss by Kandhari Tent',
      ctaText: 'Enquire for Lighting & Sound',
      actionType: 'chat'
    },
    {
      id: 'catering',
      badge: 'Catering Coordination',
      title: '4. Catering & Food Menu Arrangements',
      description: 'Dedicated buffet infrastructure, multi-tier food counters, hygienic roll-top chafing warmers, and live-kitchen stalls. We tailor menus according to your family choices (Pure Veg, Multi-Cuisine, Live Chaat & Desserts).',
      points: [
        'Multi-tier modular 8ft buffet counters with royal skirting',
        'Hygienic stainless steel roll-top dish warmers & live chaat stalls',
        'Mocktail bars, beverage dispensers, and dessert display racks',
        'Customized menu proposals based on expected guest counts'
      ],
      image: '/media/tables/table-2.jpg',
      alt: 'Buffet Catering Counter Setup by Kandhari Tent',
      ctaText: 'Enquire for Catering Proposal',
      actionType: 'chat'
    },
    {
      id: 'lawn-booking',
      badge: 'Associated Venue',
      title: '5. Dwarka Shri Lawn Venue Booking',
      description: 'Spacious green celebratory lawn managed directly by Kandhari Tent & Caterers, located right on Kanpur Road opposite Pillar 37, Daroga Kheda, Lucknow. Equipped with bridal suites, 100% generator power backup, and parking.',
      points: [
        'Spacious lawn accommodating 1,000+ celebration guests',
        'Private AC bridal dressing suites & guest washrooms',
        '100% generator power backup for uninterrupted illumination',
        'Dedicated catering preparation yard & entrance walkway'
      ],
      image: '/media/lawns/lawn-main.jpg',
      alt: 'Dwarka Shri Lawn Evening View, Lucknow',
      ctaText: 'Check Lawn Date Availability',
      actionType: 'lawn_modal'
    },
    {
      id: 'stage-mandap',
      badge: 'Ceremonial Essentials',
      title: '6. Wedding Stages, Mandaps & Entrance Gates',
      description: 'The visual centerpiece of any Indian wedding. Stately 4-pillar sacred Vedic mandaps, Maharaja high-back golden throne seating, carved royal jharokhas, and magnificent welcoming entrance gates.',
      points: [
        'Sacred 4-pillar Vedic mandap setups with havan space',
        'Carved Maharaja double sofa & dignitary baithak setups',
        'Palatial carved welcome gates with floral & drape framing',
        'Modular stage platforms, carpeted walkways & VIP barricading'
      ],
      image: '/media/mandap/mandap-1.jpg',
      alt: 'Wedding Mandap & Stage Setup by Kandhari Tent',
      ctaText: 'Enquire for Stage & Mandap',
      actionType: 'chat'
    },
    {
      id: 'custom-events',
      badge: 'Celebrations',
      title: '7. Customized Event Packages & Family Functions',
      description: 'Tailored event management for birthdays, anniversaries, corporate annual meets, Mata Ki Chowki, and intimate family gatherings across Lucknow with complete equipment coordination.',
      points: [
        'Traditional low-seating royal Lucknowi baithaks with masnads',
        'Industrial jumbo coolers (150L) & mist fans for summer comfort',
        'Round banquet tables, Chiavari chairs, and dining linen sets',
        'Single-point coordination directly with business owners'
      ],
      image: '/media/haldi-mehendi/haldi-1.jpg',
      alt: 'Custom Pre-Wedding & Family Celebration Setup',
      ctaText: 'Enquire for Custom Package',
      actionType: 'chat'
    }
  ];

  return (
    <div className="space-y-20 pb-20 animate-fadeIn">
      
      {/* Header */}
      <section className="royal-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-gold text-brand-dark">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Complete Event Infrastructure in Lucknow</span>
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-white">
            Our Services & Event Offerings
          </h1>
          <p className="text-sm sm:text-base text-neutral-200 max-w-2xl mx-auto leading-relaxed">
            From heavy-duty German hangars and royal floral mandaps to banquet catering equipment and hosting at <strong>Dwarka Shri Lawn</strong>.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {services.map((svc, index) => {
          const isEven = index % 2 === 1;
          return (
            <div 
              key={svc.id} 
              className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${isEven ? 'lg:flex-row-reverse' : ''}`}
            >
              <div className={`space-y-5 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                <span className="text-xs font-bold text-brand-purple uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-md border border-purple-200">
                  {svc.badge}
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-primary">
                  {svc.title}
                </h2>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {svc.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-700">
                  {svc.points.map((pt, i) => (
                    <div key={i} className="p-3 bg-white rounded-xl border border-neutral-200 flex items-start gap-2 shadow-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 flex flex-wrap items-center gap-3">
                  {svc.actionType === 'lawn_modal' ? (
                    <button
                      onClick={() => setIsLawnModalOpen(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl royal-gradient text-white text-xs font-bold shadow-md hover:opacity-95 transition"
                    >
                      <Calendar className="w-4 h-4 text-brand-gold" />
                      <span>{svc.ctaText}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLaunchChatForService(svc.title)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl royal-gradient text-white text-xs font-bold shadow-md hover:opacity-95 transition"
                    >
                      <Sparkles className="w-4 h-4 text-brand-gold" />
                      <span>{svc.ctaText}</span>
                    </button>
                  )}

                  <Link
                    to="/catalogue"
                    className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold transition"
                  >
                    <span>View Equipment</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  </Link>
                </div>
              </div>

              <div className={`rounded-3xl overflow-hidden shadow-xl aspect-4/3 border border-neutral-200 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                <img
                  src={svc.image}
                  alt={svc.alt}
                  loading="lazy"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          );
        })}
      </section>

      {/* Lawn Modal */}
      <LawnEnquiryModal
        isOpen={isLawnModalOpen}
        onClose={() => setIsLawnModalOpen(false)}
      />

    </div>
  );
};

export default ServicesPage;
