import React from 'react';
import { Phone, MessageCircle, MapPin, Award, CheckCircle2, Heart, Sparkles, ShieldCheck } from 'lucide-react';

const FounderSection = ({ onOpenDrawer }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn">
      <div className="bg-[#12081f] text-white rounded-3xl border-2 border-amber-500/40 p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden">
        
        {/* Subtle royal background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Dual Photos of Founder Shri Mahendra Kandhari */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            
            {/* Photo 1: Formal Portrait */}
            <div className="flex flex-col space-y-2 group">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-xl bg-neutral-900">
                <img
                  src="/media/founder/mahendra-kandhari-founder-portrait.jpg"
                  alt="Shri Mahendra Kandhari - Founder, Kandhari Tent & Caterers"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/60 to-transparent p-3 text-center">
                  <span className="text-[11px] font-bold text-amber-300 block tracking-wide font-serif">
                    Shri Mahendra Kandhari
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-neutral-300">
                    Founder & Brand Creator
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-amber-200/80 text-center font-serif italic">
                The Visionary Behind Lucknow&apos;s Royal Setups
              </p>
            </div>

            {/* Photo 2: Celebration Moment with Garland */}
            <div className="flex flex-col space-y-2 group mt-6 sm:mt-8">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-xl bg-neutral-900">
                <img
                  src="/media/founder/mahendra-kandhari-founder-garland.jpg"
                  alt="Shri Mahendra Kandhari celebrating milestone with clients"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/60 to-transparent p-3 text-center">
                  <span className="text-[11px] font-bold text-amber-300 block tracking-wide font-serif">
                    A Legacy of Trust
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-neutral-300">
                    Direct Client Relationships
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-amber-200/80 text-center font-serif italic">
                Honored by Generations of Lucknow Families
              </p>
            </div>

          </div>

          {/* Founder Narrative & Legacy Credentials */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-bold uppercase tracking-widest">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Our Founding Legacy &amp; Heritage</span>
              </div>
              
              <h2 className="text-2xl sm:text-4xl font-serif font-black text-white leading-tight">
                Shri Mahendra Kandhari
              </h2>
              <p className="text-sm sm:text-base font-serif text-amber-300 font-semibold">
                Founder, Creator &amp; Eternal Inspiration of Kandhari Tent &amp; Caterers
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30">
              <p className="text-xs sm:text-sm text-neutral-200 italic leading-relaxed font-serif">
                &ldquo;A wedding is not just a business order—it is an auspicious family milestone. When a father or mother trusts us with their son or daughter&apos;s marriage, our setups, food, and punctuality must honor that trust with royal perfection.&rdquo;
              </p>
              <span className="block text-right text-[11px] font-bold text-amber-400 mt-2">
                — Shri Mahendra Kandhari, Founder
              </span>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Every tent canopy pitched, every German hangar erected, and every royal Awadhi buffet served at <strong>Dwarka Shri Lawn</strong> carries forward the uncompromising standards set by Shri Mahendra Kandhari. He built this brand from the ground up on Kanpur Road, establishing Lucknow&apos;s most respected standard for authentic tent house rentals, royal shamianas, and transparent family hospitality.
            </p>

            {/* Core Values Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-black/40 border border-neutral-700 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Direct Accountability</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Every order is personally supervised by the family. No middlemen.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-neutral-700 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>100% In-House Inventory</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  From 1,000+ banquet chairs to German hangars &amp; bridal lawns.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-neutral-700 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Kanpur Road Flagship</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Opp. Pillar No. 37, Daroga Kheda, Lucknow. Prime event access.
                </p>
              </div>
            </div>

            {/* Direct Contact Phone Numbers */}
            <div className="pt-4 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] text-neutral-400 uppercase tracking-wider block font-semibold">
                  Founder&apos;s Direct Helpline &amp; Booking Contacts:
                </span>
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-bold text-white">
                  <a href="tel:9305465848" className="hover:text-amber-300 transition flex items-center gap-1 bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/40">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>9305465848 (Founder Desk)</span>
                  </a>
                  <a href="tel:7355059566" className="hover:text-amber-300 transition flex items-center gap-1 bg-neutral-800/80 px-2.5 py-1 rounded-lg border border-neutral-700">
                    <span>7355059566</span>
                  </a>
                  <a href="tel:9307908994" className="hover:text-amber-300 transition flex items-center gap-1 bg-neutral-800/80 px-2.5 py-1 rounded-lg border border-neutral-700">
                    <span>9307908994</span>
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="https://wa.me/919305465848?text=Namaste%20Kandhari%20Ji%2C%20I%20want%20to%20discuss%20an%20upcoming%20event%20booking."
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Desk</span>
                </a>
                
                {onOpenDrawer && (
                  <button
                    onClick={onOpenDrawer}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md transition"
                  >
                    <span>Request Quotation</span>
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default FounderSection;
