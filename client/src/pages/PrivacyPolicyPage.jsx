import React from 'react';
import { ShieldCheck, FileText, AlertCircle, Sparkles } from 'lucide-react';

const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10 animate-fadeIn">
      
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-gold text-brand-dark">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Trust & Transparency</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-brand-primary">
          Privacy Policy & Terms of Service
        </h1>
        <p className="text-xs text-neutral-500">
          Last Updated: October 2026 | Kandhari Tent & Caterers & Dwarka Shri Lawn, Lucknow
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-royal space-y-8 text-neutral-700 text-sm leading-relaxed">
        
        {/* Critical Booking Disclaimer Alert */}
        <div className="p-5 bg-amber-50 rounded-2xl border border-amber-300 text-amber-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-base text-brand-primary">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Important Booking & Reservation Disclaimer</span>
          </div>
          <p className="text-xs leading-relaxed text-amber-900">
            Submitting an enquiry via this website, whether for rental equipment or Dwarka Shri Lawn, <strong>does not constitute a confirmed reservation or binding contract</strong>. All dates, venue availability, and equipment quantities must be officially verified and confirmed in writing or agreement with Kandhari Tent & Caterers management following discussion of event specifications.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-brand-primary flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-purple" />
            <span>1. Information We Collect</span>
          </h2>
          <p>
            When you submit an enquiry through our online forms, we collect basic contact information such as your name, mobile phone number, email address, proposed event date, and specific event requirements. This information is gathered solely to prepare accurate equipment quotations and coordinate date availability for your function.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-brand-primary flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-purple" />
            <span>2. How Your Information is Used</span>
          </h2>
          <p>
            Your information is used strictly to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-600">
            <li>Generate personalized quotations for tent-house rentals and lawn booking.</li>
            <li>Contact you via phone call or WhatsApp to discuss event site logistics.</li>
            <li>Maintain internal booking records for scheduled deliveries and retrievals.</li>
          </ul>
          <p className="text-xs">
            We do not sell, rent, or share customer contact details with third-party advertisers or marketing agencies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-brand-primary flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-purple" />
            <span>3. Rental Equipment Terms & Care</span>
          </h2>
          <p>
            All rental inventory (including tents, canopies, chairs, tables, stages, coolers, and electrical switchgear) remains the exclusive property of <strong>Kandhari Tent & Caterers</strong>. The customer is responsible for providing reasonable care and ensuring safe operating conditions during the rental period. Any damages caused by negligent handling will be assessed according to standard commercial replacement costs.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-brand-primary flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-purple" />
            <span>4. Dwarka Shri Lawn Venue Rules</span>
          </h2>
          <p>
            Functions hosted at Dwarka Shri Lawn are subject to local noise and civic regulations established by the Lucknow administration and police authority. The client agrees to adhere to sound decibel guidelines and permissible outdoor timings.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-brand-primary flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-purple" />
            <span>5. Contact & Grievances</span>
          </h2>
          <p>
            For any queries or concerns regarding this policy, you may contact our office directly:
          </p>
          <div className="p-4 bg-neutral-50 rounded-xl text-xs space-y-1 text-neutral-800">
            <p className="font-bold">Kandhari Tent & Caterers & Dwarka Shri Lawn</p>
            <p>Opp. Pillar No. 37, Daroga Kheda, Kanpur Road, Lucknow, Uttar Pradesh</p>
            <p>Phone: +91 9305465848 | Email: contact@kandharitent.com</p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
