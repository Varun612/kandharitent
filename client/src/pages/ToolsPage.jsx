import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Bot, 
  HelpCircle, 
  Layers, 
  CheckCircle2,
  MessageCircle
} from 'lucide-react';
import { api } from '../services/api';
import { LUCKNOW_LOCALITIES } from '../data/seedItems';

const ToolsPage = () => {
  const [visitFormData, setVisitFormData] = useState({
    customerName: '',
    phone: '',
    visitDate: '',
    timeSlot: 'Evening (4:00 PM – 7:00 PM)',
    inspectionType: 'Visit Dwarka Shri Lawn (Opp. Pillar No. 37, Kanpur Road)',
    locality: 'Kanpur Road / Daroga Kheda',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVisitFormData(prev => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleVisitSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!visitFormData.customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanPhone = visitFormData.phone.replace(/[\s-]/g, '');
    const phoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setErrorMessage('Please enter a valid 10-digit Indian phone number (e.g. 9876543210).');
      return;
    }

    if (!visitFormData.visitDate) {
      setErrorMessage('Please select a preferred date for the site visit.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        enquiryType: 'site_visit',
        customerName: visitFormData.customerName.trim(),
        phone: cleanPhone,
        serviceRequired: 'Site Inspection / Venue Visit Request',
        eventDate: visitFormData.visitDate,
        locality: visitFormData.locality,
        eventVenueAddress: visitFormData.inspectionType,
        notes: `Preferred Time Slot: ${visitFormData.timeSlot}. Requirements: ${visitFormData.notes}`
      };

      const res = await api.submitEnquiry(payload);

      if (res.success) {
        setSubmissionSuccess({
          referenceId: res.referenceId,
          whatsappLink: res.whatsappLink,
          message: 'Your site visit request has been received! Our venue manager will call to confirm the exact meeting time.'
        });
      } else {
        setErrorMessage(res.message || 'Could not schedule visit. Please submit a callback request online.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Network error requesting site visit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 pb-20 animate-fadeIn">
      
      {/* Header */}
      <section className="royal-gradient text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-gold text-brand-dark">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Event Planning & Coordination Tools</span>
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-white">
            Client Tools & Site Inspection
          </h1>
          <p className="text-sm sm:text-base text-neutral-200 max-w-2xl mx-auto leading-relaxed">
            Schedule an on-site visit to inspect <strong>Dwarka Shri Lawn</strong> or request an expert ground-measurement visit for your private venue in Lucknow.
          </p>
        </div>
      </section>

      {/* Main Tools Container */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Tool 1: Site Inspection / Venue Visit Request Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/80 shadow-royal space-y-6">
            
            <div className="space-y-2">
              <span className="text-xs font-bold text-brand-purple uppercase tracking-widest">
                Active Service Tool
              </span>
              <h2 className="text-2xl font-serif font-bold text-brand-primary">
                Book a Site Inspection / Venue Visit
              </h2>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Whether you want to inspect Dwarka Shri Lawn's lawn grounds & bridal suites, or request our team to inspect your home/plot for tent sizing, book a convenient time below.
              </p>
            </div>

            {submissionSuccess ? (
              <div className="text-center py-8 space-y-4 bg-brand-cream/80 rounded-2xl p-6 border border-brand-border animate-fadeIn">
                <div className="w-16 h-16 bg-amber-50 border border-brand-gold/30 rounded-full flex items-center justify-center mx-auto text-brand-gold shadow-sm">
                  <CheckCircle className="w-9 h-9 text-brand-primary" />
                </div>
                <h3 className="text-xl font-serif font-bold text-brand-primary">
                  Site Inspection Request Received
                </h3>
                <div className="p-4 bg-white/90 border border-brand-border rounded-xl max-w-sm mx-auto shadow-xs text-left space-y-2">
                  <p className="text-xs text-neutral-700 leading-relaxed">
                    Thank you for contacting <strong>Kandhari Tent & Caterers</strong>! Your site visit request for <strong>Dwarka Shri Lawn</strong> has been received successfully. Our team will review your requested time slot and get in touch with you shortly.
                  </p>
                  <p className="text-[11px] text-neutral-500 border-t border-brand-border/60 pt-2">
                    📍 Opp. Pillar No. 37, Daroga Kheda, Kanpur Road, Lucknow.
                  </p>
                </div>
                {submissionSuccess.whatsappLink && (
                  <div className="pt-2">
                    <a
                      href={submissionSuccess.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-sm transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Open WhatsApp with Inspection Details</span>
                    </a>
                    <p className="text-[11px] text-neutral-500 mt-2">
                      Opens WhatsApp to coordinate directions and timing directly with our venue manager (Official Desk)
                    </p>
                  </div>
                )}
                <button
                  onClick={() => setSubmissionSuccess(null)}
                  className="mt-3 text-xs text-brand-primary font-semibold hover:underline block mx-auto"
                >
                  Schedule another inspection
                </button>
              </div>
            ) : (
              <form onSubmit={handleVisitSubmit} className="space-y-4 text-xs">
                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Your Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        name="customerName"
                        required
                        value={visitFormData.customerName}
                        onChange={handleChange}
                        placeholder="e.g. Sunil Tandon"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      10-Digit Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={visitFormData.phone}
                        onChange={handleChange}
                        placeholder="e.g. 9876543210"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Inspection Type */}
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    What would you like to inspect?
                  </label>
                  <select
                    name="inspectionType"
                    value={visitFormData.inspectionType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none bg-white font-medium text-neutral-800"
                  >
                    <option value="Visit Dwarka Shri Lawn (Opp. Pillar No. 37, Kanpur Road)">
                      Visit Dwarka Shri Lawn (Opp. Pillar No. 37, Kanpur Road)
                    </option>
                    <option value="Request Tent Team to Inspect My Home / Private Plot for Tent Sizing">
                      Request Tent Team to Inspect My Home / Private Plot for Tent Sizing
                    </option>
                  </select>
                </div>

                {/* Preferred Date & Time Slot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Preferred Date *
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                      <input
                        type="date"
                        name="visitDate"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={visitFormData.visitDate}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Preferred Time Window
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                      <select
                        name="timeSlot"
                        value={visitFormData.timeSlot}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none bg-white font-medium text-neutral-800"
                      >
                        <option value="Morning (9:00 AM – 12:00 PM)">Morning (9:00 AM – 12:00 PM)</option>
                        <option value="Afternoon (1:00 PM – 4:00 PM)">Afternoon (1:00 PM – 4:00 PM)</option>
                        <option value="Evening (4:00 PM – 7:00 PM)">Evening (4:00 PM – 7:00 PM)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Locality in Lucknow */}
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Locality / Area
                  </label>
                  <select
                    name="locality"
                    value={visitFormData.locality}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none bg-white font-medium text-neutral-800"
                  >
                    {LUCKNOW_LOCALITIES.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Special Notes or Landmark (Optional)
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    value={visitFormData.notes}
                    onChange={handleChange}
                    placeholder="Specific questions you would like our coordinator to answer on site..."
                    className="w-full p-2.5 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                  />
                </div>

                <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-500 leading-normal">
                  ℹ️ <strong>Note:</strong> We will confirm the visit with you via call/WhatsApp before dispatching staff or reserving the lawn walkthrough slot.
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl royal-gradient hover:opacity-95 text-white font-bold text-xs shadow-royal flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-brand-gold" />
                      <span>Request Site Inspection Slot</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

          {/* Tool 2: AI Creative Director & 24/7 AI Advisor */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* FestiveAgent AI Card */}
            <div className="bg-gradient-to-br from-brand-primary via-brand-purple to-purple-900 rounded-3xl p-8 text-white shadow-royal relative overflow-hidden space-y-5">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-brand-gold text-brand-dark uppercase tracking-widest">
                  External Creative Tool
                </span>
                <Sparkles className="w-6 h-6 text-brand-gold" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold text-white">
                  FestiveAgent AI — Creative Director
                </h3>
                <p className="text-xs text-brand-goldLight leading-relaxed">
                  Interactive AI Creative Director designed to transform festival references and business assets into customized promotional creatives with persistent preference storage.
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-neutral-200 pt-1">
                <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                  <span>
                    <strong>Festival Specific Creatives:</strong> Generate festival banners, promotional flyers, and social media announcements.
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                  <span>
                    <strong>Persistent Preferences:</strong> Stores branding rules and visual styles across design workflows.
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href="https://festive-agent.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 bg-brand-gold text-neutral-950 font-bold rounded-xl text-xs hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 shadow"
                >
                  <span>Launch FestiveAgent AI</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </a>
                <a
                  href="/tools/creative-director"
                  className="py-3 px-4 bg-white/15 hover:bg-white/20 text-white font-semibold rounded-xl text-xs transition-colors text-center border border-white/20"
                >
                  View Details
                </a>
              </div>
            </div>

            {/* Tool 3: 24/7 AI Event Advisor Trigger Card */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-brand-purple flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-neutral-900">24/7 AI Event Advisor</h4>
                  <p className="text-xs text-neutral-500">Instant answers in English & हिन्दी</p>
                </div>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Need immediate guidance on tent sizing, lawn dates, or want to browse 5 genuine setup photographs? Chat with our persistent AI Advisor anytime.
              </p>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-ai-chat', { detail: { initialMessage: 'Namaste! Mujhe event planning me help chahiye.' } }))}
                className="w-full py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-brand-primary transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                <span>Open AI Event Advisor Chat</span>
              </button>
            </div>

            {/* Direct Urgent Assistance Card */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm space-y-3">
              <h4 className="text-sm font-serif font-bold text-brand-primary flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-gold" />
                <span>Need Instant Answers Today?</span>
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                You do not need to wait for AI tools—our senior event coordinators in Lucknow are available right now to consult on your event setup:
              </p>
              <div className="pt-1 flex flex-col gap-2">
                <a
                  href="/contact"
                  className="py-2.5 px-4 rounded-xl bg-purple-50 text-brand-purple font-bold text-xs text-center hover:bg-purple-100 transition flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Toll-Free Booking Desk: 1800-XXX-XXXX</span>
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};

export default ToolsPage;
