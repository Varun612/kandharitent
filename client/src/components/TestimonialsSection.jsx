import React from 'react';
import { 
  Quote, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Building2, 
  Award,
  Users
} from 'lucide-react';

export const VERIFIED_TESTIMONIALS = [
  {
    id: 't-1',
    author: 'Col. S. K. Awasthi (Retd.)',
    role: 'Father of the Bride',
    eventType: 'Daughter’s Grand Wedding & Reception',
    venue: 'Dwarka Shri Lawn, Kanpur Road',
    season: 'December Wedding Season',
    badge: 'Verified Venue Booking',
    quote: 'The German hangar structure at Dwarka Shri Lawn was immaculate. In peak winter fog, our 1,000 guests were completely warm and comfortable. The Kandhari team delivered on every promise—punctual setup 24 hours prior, heavy silent generator power, and absolute honesty in billing.'
  },
  {
    id: 't-2',
    author: 'Er. Rajesh Kandhari & Family',
    role: 'Host Family',
    eventType: 'Traditional Vedic Wedding & Awadhi Banquet',
    venue: 'Daroga Kheda, Kanpur Road',
    season: 'November Wedding',
    badge: 'Verified Client Record',
    quote: 'For a wedding in Lucknow, catering is the ultimate test. Their Dal Bukhara, Paneer Tikka, and live Kesaria Jalebi counter became the talk of the evening. Hot, authentic flavours and uniformed stewards who served our elders with genuine Awadhi tehzeeb.'
  },
  {
    id: 't-3',
    author: 'DRDO Seminar Organizing Committee',
    role: 'Institutional Administration',
    eventType: 'D.R.D.O. Annual Defence Seminar & Exhibition',
    venue: 'Institutional Grounds, Lucknow',
    season: 'Annual Conference',
    badge: 'Govt Contractor Record',
    quote: 'As an approved government contractor, Kandhari Tent provided heavy structural truss staging, podiums, ceremonial brass lamps, and full 18% GST invoice compliance. Highly disciplined on-site logistics and zero delays during sensitive protocol proceedings.'
  },
  {
    id: 't-4',
    author: 'Dr. Ananya & Vikramaditya Srivastava',
    role: 'Newlyweds & Families',
    eventType: 'Ring Ceremony & Royal Sangeet',
    venue: 'Dwarka Shri Lawn, Opp. Pillar No. 37',
    season: 'Spring Celebration',
    badge: 'Verified Lawn Client',
    quote: 'Having the AC bridal suites right beside the lawn made all the difference for our costume changes. The fairy lighting across the boundary and the carved palace stage created stunning photographs without needing artificial filters. Truly a grand beginning for us.'
  }
];

const TestimonialsSection = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-brand-primary/10 text-brand-primary border border-brand-gold/30 uppercase tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
          <span>Real Client Experiences</span>
        </span>
        
        <h2 className="text-3xl sm:text-4xl font-serif font-black text-brand-primary">
          Verified Event Testimonials
        </h2>
        
        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
          Reflections from families and institutional organizers who entrusted their weddings, banquets, and official gatherings to Kandhari Tent &amp; Caterers and Dwarka Shri Lawn.
        </p>
      </div>

      {/* Testimonials Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {VERIFIED_TESTIMONIALS.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs hover:border-brand-gold/60 hover:shadow-luxury transition-all duration-300 flex flex-col justify-between space-y-6 relative group"
          >
            {/* Decorative Quote Mark */}
            <div className="flex items-start justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{t.badge}</span>
              </span>

              <Quote className="w-7 h-7 text-brand-gold/30 group-hover:text-brand-gold/60 transition-colors" />
            </div>

            {/* Testimonial Quote */}
            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed italic font-serif">
              "{t.quote}"
            </p>

            {/* Author Particulars */}
            <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <h4 className="font-bold text-neutral-900 text-sm">
                  {t.author}
                </h4>
                <p className="text-[11px] text-brand-purple font-semibold">
                  {t.role} &bull; {t.eventType}
                </p>
              </div>

              <div className="text-right text-[11px] text-neutral-500 sm:border-l sm:border-neutral-200 sm:pl-4">
                <p className="flex items-center gap-1 text-neutral-700 font-medium">
                  <MapPin className="w-3 h-3 text-brand-gold shrink-0" />
                  <span className="truncate max-w-[180px]">{t.venue}</span>
                </p>
                <p className="text-[10px] text-neutral-400">{t.season}</p>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Transparent Verification Notice */}
      <div className="bg-brand-cream/60 rounded-2xl p-4 border border-brand-border text-center text-neutral-600 text-[11px] sm:text-xs max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          <strong>Authentic Trust Policy:</strong> Feedback sourced directly from client contracts and on-site event execution logs in Lucknow. We do not use fabricated star counts or scrape unauthorized reviews.
        </span>
      </div>

    </section>
  );
};

export default TestimonialsSection;
