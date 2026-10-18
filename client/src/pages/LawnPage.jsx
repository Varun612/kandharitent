import React, { useState, useEffect } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { FALLBACK_VENUE } from '../data/seedItems';
import LawnEnquiryModal from '../components/LawnEnquiryModal';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const res = await api.getVenue();
        if (res.success && res.data) {
          setVenue(res.data);
        }
      } catch (err) {
        console.warn('Error loading venue info from server, using local fallback', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVenue();
  }, []);

  return (
    <div className="space-y-16 pb-20 animate-fadeIn">
      
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden royal-gradient text-white">
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30"
          style={{ backgroundImage: `url('${(venue.images && venue.images[0]?.url) || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1920&q=80'}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-brand-dark/50" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-gold text-brand-dark text-xs sm:text-sm font-bold tracking-wide shadow-md">
            <Sparkles className="w-4 h-4" />
            <span>Dwarka Shri Lawn (Managed by Kandhari Tent & Caterers)</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight text-white leading-tight">
            An Elegant Celebration Venue on Kanpur Road, Lucknow
          </h1>

          <p className="text-base sm:text-lg text-neutral-200 max-w-3xl mx-auto leading-relaxed">
            {venue.headline || 'A Majestic Open-Air Wedding & Celebration Venue on Kanpur Road, Lucknow'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setIsLawnModalOpen(true)}
              className="px-8 py-4 rounded-2xl bg-brand-accent hover:bg-brand-accentLight text-white font-bold text-sm sm:text-base shadow-royal-lg transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Calendar className="w-5 h-5 text-brand-gold" />
              <span>Check Date Availability</span>
            </button>

            <a
              href="tel:9305465848"
              className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold text-sm sm:text-base transition flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-brand-gold" />
              <span>Call Venue Desk: 9305465848</span>
            </a>
          </div>

          <div className="pt-6 flex items-center justify-center gap-2 text-xs text-brand-goldLight">
            <MapPin className="w-4 h-4 text-brand-gold shrink-0" />
            <span>Opp. Pillar No. 37, Daroga Kheda, Kanpur Road, Lucknow, Uttar Pradesh</span>
          </div>
        </div>
      </section>

      {/* Venue Overview & Photography Carousel Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-bold text-brand-accent uppercase tracking-widest">
              Venue Overview
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-primary leading-tight">
              Open-Air Grandeur Paired with Professional Tent Engineering
            </h2>
            
            <p className="text-sm text-neutral-600 leading-relaxed">
              {venue.description}
            </p>

            <div className="p-4 bg-brand-cream rounded-2xl border border-brand-gold/30 text-xs text-neutral-700 space-y-2">
              <h4 className="font-bold text-brand-primary flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-gold" />
                <span>The Direct Advantage: Venue + Tent Synergy</span>
              </h4>
              <p className="text-neutral-600 leading-normal">
                Because <strong>Dwarka Shri Lawn</strong> is operated and managed by <strong>Kandhari Tent & Caterers</strong>, our hosts enjoy perfectly synchronized lighting, tailor-fit German hangars, plush carpeted stages, and uninterrupted power backup without external vendor coordination delays.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => setIsLawnModalOpen(true)}
                className="px-6 py-3 rounded-xl royal-gradient text-white text-xs sm:text-sm font-bold shadow-md hover:opacity-95 transition flex items-center gap-2"
              >
                <span>Request Date Availability</span>
                <ChevronRight className="w-4 h-4 text-brand-gold" />
              </button>
              
              <a
                href="https://wa.me/919305465848?text=Namaste!%20I%20am%20inquiring%20about%20booking%20Dwarka%20Shri%20Lawn%20on%20Kanpur%20Road,%20Lucknow."
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm transition flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right: Venue Images Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {(venue.images || []).slice(0, 4).map((img, idx) => (
              <div 
                key={idx}
                className={`rounded-2xl overflow-hidden shadow-md group relative ${
                  idx === 0 ? 'col-span-2 aspect-16/9' : 'aspect-square'
                }`}
              >
                <img
                  src={img.url}
                  alt={img.caption || 'Dwarka Shri Lawn Lucknow'}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {img.caption && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                    <p className="text-[11px] text-white font-medium leading-tight">
                      {img.caption}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Suitable Events & Functions */}
      <section className="bg-brand-cream/60 py-16 border-y border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-brand-accent uppercase tracking-widest">
              Versatile Celebrations
            </span>
            <h2 className="text-3xl font-serif font-bold text-brand-primary">
              Functions Suited for Dwarka Shri Lawn
            </h2>
            <p className="text-sm text-neutral-600 max-w-xl mx-auto">
              Our open lawn layout allows flexible seating arrangements and customized theme stages for all milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(venue.suitableEvents || []).map((event, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs hover:shadow-md transition space-y-2"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-brand-gold font-serif font-black flex items-center justify-center text-sm">
                  0{idx + 1}
                </div>
                <h3 className="text-base font-serif font-bold text-neutral-900">
                  {event}
                </h3>
                <p className="text-xs text-neutral-500 leading-normal">
                  Customized mandap arrangements, wide seating layouts, buffet corridors, and dedicated stage illumination.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities & Amenities (Editable via Admin) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-brand-accent uppercase tracking-widest">
            Comfort & Convenience
          </span>
          <h2 className="text-3xl font-serif font-bold text-brand-primary">
            Venue Facilities & Amenities
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
                className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm hover:shadow-royal transition space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-brand-purple flex items-center justify-center">
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-base font-serif font-bold text-neutral-900">
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

      {/* Location, Directions & Contact Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-royal grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          
          <div className="space-y-6">
            <span className="text-xs font-bold text-brand-accent uppercase tracking-widest">
              Convenient Accessibility
            </span>
            <h2 className="text-3xl font-serif font-bold text-brand-primary">
              Location & Directions
            </h2>
            
            <p className="text-sm text-neutral-600 leading-relaxed">
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
                  Booking Inquiries: <strong>9305465848</strong> / 9307908994 / 7355059566
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setIsLawnModalOpen(true)}
                className="px-6 py-3.5 rounded-xl royal-gradient text-white text-xs sm:text-sm font-bold shadow-md hover:opacity-95 transition text-center"
              >
                Enquire Lawn Availability
              </button>

              <a
                href="https://maps.google.com/?q=Daroga+Kheda+Kanpur+Road+Lucknow"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-xs sm:text-sm font-semibold transition text-center flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-4 h-4 text-brand-primary" />
                <span>Open in Google Maps</span>
              </a>
            </div>
          </div>

          {/* Interactive Map Visual Guide */}
          <div className="bg-neutral-100 rounded-2xl p-6 border border-neutral-200 text-center space-y-4">
            <div className="aspect-4/3 rounded-xl overflow-hidden shadow-inner relative bg-amber-50 flex flex-col items-center justify-center p-6 text-neutral-700 border border-amber-200/50">
              <div className="w-14 h-14 rounded-full bg-brand-primary text-brand-gold flex items-center justify-center mb-3 shadow-md">
                <MapPin className="w-7 h-7" />
              </div>
              <h4 className="text-base font-serif font-bold text-brand-primary">
                Dwarka Shri Lawn
              </h4>
              <p className="text-xs text-neutral-600 mt-1">
                Opposite Pillar No. 37, Daroga Kheda
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Kanpur Road, Lucknow
              </p>

              <div className="mt-4 px-3 py-1 rounded-full bg-white text-[11px] font-semibold text-brand-purple border border-purple-200 shadow-xs">
                Landmark: Pillar No. 37 (Kanpur Highway)
              </div>
            </div>

            <p className="text-[11px] text-neutral-500">
              On-site visits available daily between 9:00 AM – 9:00 PM. Call ahead to schedule with our venue coordinator.
            </p>
          </div>

        </div>
      </section>

      {/* Lawn Booking Enquiry Modal */}
      <LawnEnquiryModal
        isOpen={isLawnModalOpen}
        onClose={() => setIsLawnModalOpen(false)}
      />

    </div>
  );
};

export default LawnPage;
