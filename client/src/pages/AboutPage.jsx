import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Heart, 
  ShieldCheck, 
  Users, 
  MapPin, 
  Phone, 
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import SEO from '../components/SEO';


const AboutPage = () => {
  return (
    <div className="space-y-16 pb-20 animate-fadeIn">
      <SEO
        title="About Kandhari Tent & Caterers | Dwarka Shri Lawn Lucknow"
        description="Learn about the heritage of Kandhari Tent & Caterers and Dwarka Shri Lawn on Kanpur Road, Lucknow. Family dedication, government contractor credentials, and quality equipment."
        canonical="/about"
      />
      
      {/* Header */}
      <section className="royal-gradient text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-gold text-brand-dark">
            <Heart className="w-3.5 h-3.5" />
            <span>Rooted in Lucknow</span>
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-white">
            About Kandhari Tent & Caterers
          </h1>
          <p className="text-base text-neutral-200 max-w-2xl mx-auto leading-relaxed">
            A family-founded business dedicated to turning milestone celebrations into unforgettable memories.
          </p>
        </div>
      </section>

      {/* Founder Identity & Visionary Tribute */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#11081e] text-white rounded-3xl p-8 sm:p-12 border-2 border-amber-500/40 shadow-2xl relative overflow-hidden space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Photos */}
            <div className="md:col-span-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl overflow-hidden border border-amber-400/50 aspect-[3/4] bg-neutral-900 shadow-md">
                <img
                  src="/media/founder/mahendra-kandhari-founder-portrait.jpg"
                  alt="Shri Mahendra Kandhari - Founder"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden border border-amber-400/50 aspect-[3/4] bg-neutral-900 shadow-md mt-4">
                <img
                  src="/media/founder/mahendra-kandhari-founder-garland.jpg"
                  alt="Shri Mahendra Kandhari with Garland"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Narrative */}
            <div className="md:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[11px] font-bold uppercase tracking-wider">
                <span>The Brand Creator &bull; Founding Father</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">
                Shri Mahendra Kandhari
              </h2>
              <p className="text-xs sm:text-sm text-amber-200/90 italic font-serif leading-relaxed">
                &ldquo;Honesty in pricing, punctuality in delivery, and treating every guest as our own family.&rdquo;
              </p>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Kandhari Tent &amp; Caterers was founded by <strong>Shri Mahendra Kandhari</strong> with an unshakeable commitment to authentic Awadhi hospitality. Every milestone celebration, luxury German hangar structure, and marriage setup at <strong>Dwarka Shri Lawn</strong> continues to be guided by his personal values of direct family accountability and heartfelt care.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-bold text-amber-300">
                <a href="tel:9305465848" className="bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/40 hover:bg-amber-500/30 transition">
                  📞 +91 9305465848 (Founder Desk)
                </a>
                <a href="tel:7355059566" className="bg-neutral-800 px-3 py-1.5 rounded-xl border border-neutral-700 hover:text-white transition">
                  📞 7355059566
                </a>
                <a href="tel:9307908994" className="bg-neutral-800 px-3 py-1.5 rounded-xl border border-neutral-700 hover:text-white transition">
                  📞 9307908994
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Narrative */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-royal space-y-6">
          <span className="text-xs font-bold text-brand-accent uppercase tracking-widest">
            Our Story & Heritage
          </span>
          
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-primary">
            Built on Personal Dedication, Trust, and Craftsmanship
          </h2>

          <div className="space-y-4 text-sm sm:text-base text-neutral-700 leading-relaxed">
            <p>
              <strong>Kandhari Tent & Caterers</strong> began with a clear, heartfelt mission: to relieve Lucknow families of the stress of event logistics so they can truly immerse themselves in their most cherished family milestones.
            </p>
            <p>
              Events in India—whether an auspicious wedding, an emotional bidaai, a joyous Sangeet, or a solemn religious gathering—are deeply personal. We understand that behind every tent pitched and every chair arranged is a family putting their trust in us. That is why our business operates with direct owner supervision, treating each booking with the utmost care, transparency, and personal accountability.
            </p>
            <p>
              Over the years, we recognized the frustration families faced when trying to coordinate separate venue managers and tent suppliers. To solve this, we took over the direct stewardship of <strong>Dwarka Shri Lawn</strong> on Kanpur Road, creating a unified destination where grand open-air celebrations, customized German hangars, royal shamianas, and ambient stage lighting exist harmoniously under one roof.
            </p>
          </div>

          <div className="pt-4 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-neutral-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Direct owner communication & on-site presence</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>No hidden vendor markups or surprise surcharges</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Carefully maintained, clean, and sanitized equipment</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Deep respect for cultural traditions and timings</span>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="space-y-6">
          <div className="text-center">
            <span className="text-xs font-bold text-brand-purple uppercase tracking-widest">
              Guiding Principles
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-brand-primary mt-1">
              What We Stand For
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-brand-purple flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-serif font-bold text-neutral-900">
                Punctuality & Reliability
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                We believe in arriving early. Our tents and equipment are erected and inspected well before the first guest steps onto the grounds.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-brand-gold flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-serif font-bold text-neutral-900">
                Clean, Event-Ready Stock
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                From stainless steel roll-top chafing warmers to velvet sofa upholstery and banquet linen, all inventory is cleaned before dispatch.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-base font-serif font-bold text-neutral-900">
                Community Focus
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Proudly rooted in Lucknow. We are committed to serving local families with fair quotes and neighborly respect.
              </p>
            </div>
          </div>
        </div>

        {/* Location & Visit Invitation */}
        <div className="royal-gradient rounded-3xl p-8 sm:p-10 text-white shadow-royal text-center space-y-6">
          <h3 className="text-2xl font-serif font-bold">
            Visit Our Office & Dwarka Shri Lawn
          </h3>
          <p className="text-xs sm:text-sm text-neutral-200 max-w-lg mx-auto">
            We welcome families to inspect our lawn and discuss event requirements in person. Located conveniently on Kanpur Road opposite Pillar No. 37 in Daroga Kheda, Lucknow.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="/contact"
              className="px-6 py-3.5 rounded-xl bg-white text-brand-dark font-bold text-xs sm:text-sm hover:bg-brand-goldLight transition flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-brand-purple" />
              <span>Toll-Free Helpline</span>
            </a>
            <Link
              to="/contact"
              className="px-6 py-3.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white font-bold text-xs sm:text-sm transition flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-brand-gold" />
              <span>Get Directions & Details</span>
            </Link>
          </div>
        </div>

      </section>

    </div>
  );
};

export default AboutPage;
