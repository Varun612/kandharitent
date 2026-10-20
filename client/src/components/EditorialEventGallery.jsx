import React, { useState } from 'react';
import { 
  Sparkles, 
  Eye, 
  MapPin, 
  Calendar, 
  Maximize2, 
  Layers, 
  Users, 
  ArrowRight,
  ShieldCheck,
  Building,
  Crown
} from 'lucide-react';
import GalleryViewer from './GalleryViewer';

export const EDITORIAL_EVENTS = [
  {
    id: 'imperial-wedding',
    title: 'The Royal Imperial Wedding at Dwarka Shri Lawn',
    subtitle: 'End-to-End Grand Wedding Setup on Kanpur Road, Lucknow',
    locality: 'Dwarka Shri Lawn, Opp. Pillar No. 37, Kanpur Road',
    pax: '1,200 Guests',
    season: 'Winter Wedding Season',
    description: 'A complete showcase of our full-service execution: all-weather German hangar pavilion, a 30-foot carved palace arch stage, handcrafted Vedic floral mandap, and velvet VIP lounges across Dwarka Shri Lawn.',
    photos: [
      {
        id: 'imp-1',
        title: 'Full Venue Twilight Overview',
        tag: 'Overall Venue',
        imageUrl: '/media/weddings/wedding-1.jpg',
        caption: 'Panoramic view of Dwarka Shri Lawn grounds featuring our illuminated German hangar and perimeter ambient lighting.'
      },
      {
        id: 'imp-2',
        title: 'Carved Palace Arch Stage',
        tag: 'Royal Stage',
        imageUrl: '/media/stage/stage-1.jpg',
        caption: 'Elevated wedding stage with gold palace pillars, crystal chandelier, and floral crest.'
      },
      {
        id: 'imp-3',
        title: 'Vedic Rose & Marigold Mandap',
        tag: 'Sacred Mandap',
        imageUrl: '/media/mandap/mandap-1.jpg',
        caption: 'Sacred wedding mandap adorned with fresh red roses, fragrant marigolds, and brass ceremonial urlis.'
      },
      {
        id: 'imp-4',
        title: 'VIP Maharaja Velvet Lounge',
        tag: 'VIP Seating',
        imageUrl: '/media/seating/seating-1.jpg',
        caption: 'Deep plum cushioned sofas and banquet chairs arranged for comfortable family viewing.'
      },
      {
        id: 'imp-5',
        title: 'Illuminated Grand Gate Gateway',
        tag: 'Entrance Gateway',
        imageUrl: '/media/gate/gate-1.jpg',
        caption: 'Stately floral entrance archway welcoming guests with warm amber spotlights.'
      },
      {
        id: 'imp-6',
        title: 'Manicured Lawn & Starlight Pathways',
        tag: 'Lawn Grounds',
        imageUrl: '/media/lawns/lawn-main.jpg',
        caption: 'Natural open lawn setting ideal for outdoor receptions and winter dining.'
      }
    ]
  },
  {
    id: 'hangar-banquet',
    title: 'All-Weather Waterproof German Hangar Banquet',
    subtitle: 'Engineered Canopy with Fine Dining & Climate Management',
    locality: 'Lucknow Highway Corridor',
    pax: '800 Guests',
    season: 'Monsoon-Proof Execution',
    description: 'When weather cannot be compromised, our heavy structural German hangars provide a wind-tested, rain-sealed palace with floor-length royal drapery, round banquet tables, and laser-cut buffet lines.',
    photos: [
      {
        id: 'hang-1',
        title: 'German Hangar Exterior & Canopy',
        tag: 'Structural Canopy',
        imageUrl: '/media/rich-decor/decor-1.jpg',
        caption: 'Massive waterproof curved aluminum hangar spanning 6,000+ sq.ft with weather-sealed sidewalls.'
      },
      {
        id: 'hang-2',
        title: 'Round Banquet Tables with Linen',
        tag: 'Dining Setup',
        imageUrl: '/media/tables/table-1.jpg',
        caption: '60-inch round banquet tables dressed in clean royal covers with matching ribbon bows.'
      },
      {
        id: 'hang-3',
        title: 'Illuminated Laser-Cut Buffet Line',
        tag: 'Catering Display',
        imageUrl: '/media/catering/catering-1.jpg',
        caption: 'Modern LED-lit catering counters presenting hot Awadhi delicacies and chafers.'
      },
      {
        id: 'hang-4',
        title: 'Ceiling Chandeliers & Drapes',
        tag: 'Interior Ambience',
        imageUrl: '/media/rich-decor/decor-2.jpg',
        caption: 'Layered ceiling pleating in ivory and maroon with centralized crystal chandeliers.'
      }
    ]
  },
  {
    id: 'traditional-sangeet',
    title: 'Vedic Sangeet & Festive Mehendi Celebration',
    subtitle: 'Vibrant Floral Draping, Traditional Baithaks & Warm Ambience',
    locality: 'Dwarka Shri Lawn Courtyard',
    pax: '400 Guests',
    season: 'Festive Pre-Wedding',
    description: 'An intimate, colorful pre-wedding celebration showcasing yellow marigold canopies, comfortable mattress baithaks (winter gadda sets), fairy lights, and live chaat counter presentation.',
    photos: [
      {
        id: 'sang-1',
        title: 'Marigold & Draped Sangeet Stage',
        tag: 'Stage Backdrop',
        imageUrl: '/media/stage/stage-2.jpg',
        caption: 'Festive backdrop with natural marigold tassels, bells, and brass urlis.'
      },
      {
        id: 'sang-2',
        title: 'Traditional Floor Baithak Seating',
        tag: 'Baithak Seating',
        imageUrl: '/media/seating/seating-3.jpg',
        caption: 'Cotton winter gadda mattresses with white linen and bolster pillows for traditional music gatherings.'
      },
      {
        id: 'sang-3',
        title: 'Fairy Light Twilight Ambience',
        tag: 'Lighting Design',
        imageUrl: '/media/lighting/lighting-1.jpg',
        caption: 'Cascading warm fairy lights strung along tree canopies and lawn borders.'
      },
      {
        id: 'sang-4',
        title: 'Live Chaat & Snacks Presentation',
        tag: 'Catering Counters',
        imageUrl: '/media/catering/catering-2.jpg',
        caption: 'Open-air live chaat counters serving hot Lucknowi aloo tikki and pani batashas.'
      }
    ]
  }
];

const EditorialEventGallery = ({ onOpenEnquiryWithItem }) => {
  const [selectedEventIndex, setSelectedEventIndex] = useState(0);
  const [lightboxPhotoIndex, setLightboxPhotoIndex] = useState(null);

  const activeEvent = EDITORIAL_EVENTS[selectedEventIndex];

  // Convert current event's photos to GalleryViewer format
  const viewerItems = activeEvent.photos.map(p => ({
    id: p.id,
    title: p.title,
    caption: p.caption,
    category: p.tag,
    imageUrl: p.imageUrl,
    type: 'image'
  }));

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fadeIn">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-brand-border/80 pb-6">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-brand-primary/10 text-brand-primary border border-brand-gold/30 uppercase tracking-widest flex items-center gap-1.5">
              <Crown className="w-3 h-3 text-brand-gold" />
              <span>Authentic Wedding Portfolios</span>
            </span>
            <span className="text-xs font-semibold text-neutral-500">
              Verified Lucknow Real Work
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-brand-primary">
            The Royal Imperial Wedding Showcase
          </h2>
          
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            Explore complete photographic stories of actual Lucknow weddings and banquets managed by Kandhari Tent &amp; Caterers at Dwarka Shri Lawn. Every photo depicts genuine on-site decor, real German hangars, and authentic catering setups.
          </p>
        </div>

        {/* Event Selection Tabs - Spacious, Non-Clipped Responsive Buttons */}
        <div className="flex flex-wrap gap-2.5">
          {EDITORIAL_EVENTS.map((ev, idx) => (
            <button
              key={ev.id}
              onClick={() => setSelectedEventIndex(idx)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                idx === selectedEventIndex
                  ? 'royal-gradient text-white shadow-md border border-brand-gold/40 ring-2 ring-brand-gold/20'
                  : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-brand-gold" />
              <span>{ev.title.split(' at ')[0].split(' on ')[0]}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                idx === selectedEventIndex ? 'bg-black/30 text-brand-goldLight' : 'bg-neutral-100 text-neutral-500'
              }`}>
                {ev.pax.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Event Case Study Card */}
      <div className="bg-brand-cream/60 rounded-3xl p-6 sm:p-8 border border-brand-border shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-brand-border/60">
          <div className="space-y-2">
            <span className="text-xs font-bold text-brand-gold uppercase tracking-wider block">
              Case Study &bull; {activeEvent.season}
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-brand-primary">
              {activeEvent.title}
            </h3>
            <div className="text-xs text-neutral-600 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1 font-semibold text-neutral-800">
                <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                <span>{activeEvent.locality}</span>
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1 font-semibold text-brand-purple">
                <Users className="w-3.5 h-3.5 text-brand-purple" />
                <span>Capacity: {activeEvent.pax}</span>
              </span>
            </div>
          </div>

          <p className="text-xs text-neutral-600 max-w-xl leading-relaxed lg:border-l lg:border-brand-border/80 lg:pl-6">
            {activeEvent.description}
          </p>
        </div>

        {/* Multi-Angle Photo Grid - Spacious Cards with Zero Text Overlap */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeEvent.photos.map((photo, pIdx) => (
            <div
              key={photo.id}
              onClick={() => setLightboxPhotoIndex(pIdx)}
              className="group bg-white rounded-2xl overflow-hidden border border-neutral-200/90 shadow-xs hover:shadow-luxury hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
            >
              {/* Photo Area with Aspect Ratio & Badges */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-neutral-900">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Category Pill Tag at Top Left - Completely Disjoint from Title */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-neutral-950/80 backdrop-blur-md text-brand-gold border border-brand-gold/40 uppercase tracking-wider shadow-sm">
                    {photo.tag}
                  </span>
                </div>

                {/* Expand Icon Button at Top Right */}
                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-md">
                    <Maximize2 className="w-4 h-4 text-brand-gold" />
                  </div>
                </div>
              </div>

              {/* Lower Details Card - Generous Padding, No Text Collision */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-2 bg-white">
                <div className="space-y-1.5">
                  <h4 className="text-sm font-serif font-bold text-neutral-900 group-hover:text-brand-primary transition">
                    {photo.title}
                  </h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {photo.caption}
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] font-bold text-brand-purple">
                  <span>View High-Res Photo</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxPhotoIndex !== null && (
        <GalleryViewer
          items={viewerItems}
          initialIndex={lightboxPhotoIndex}
          onClose={() => setLightboxPhotoIndex(null)}
          onOpenEnquiry={(item) => {
            setLightboxPhotoIndex(null);
            if (onOpenEnquiryWithItem) {
              onOpenEnquiryWithItem(item);
            }
          }}
        />
      )}

    </section>
  );
};

export default EditorialEventGallery;
