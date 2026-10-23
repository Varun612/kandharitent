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
