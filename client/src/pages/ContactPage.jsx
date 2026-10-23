import React, { useState } from 'react';
import { 
  Phone, 
  MapPin, 
  Mail, 
  MessageCircle, 
  Calendar, 
  Clock, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import SEO from '../components/SEO';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    eventDate: '',
    eventLocation: 'Lucknow',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanPhone = formData.phone.replace(/[\s-]/g, '');
    const phoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setErrorMessage('Please enter a valid 10-digit Indian phone number.');
      return;
    }

    if (!formData.eventDate) {
      setErrorMessage('Please select an event date.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        enquiryType: 'general',
        customerName: formData.customerName.trim(),
        phone: cleanPhone,
        email: formData.email.trim(),
        eventDate: formData.eventDate,
        eventLocation: formData.eventLocation.trim() || 'Lucknow',
        notes: formData.notes.trim()
      };

      const res = await api.submitEnquiry(payload);

      if (res.success) {
        setSubmissionSuccess({
          referenceId: res.referenceId,
          whatsappLink: res.whatsappLink,
          message: res.message
        });
        setFormData({
          customerName: '',
          phone: '',
          email: '',
          eventDate: '',
          eventLocation: 'Lucknow',
          notes: ''
        });
      } else {
        setErrorMessage(res.message || 'Could not send enquiry. Please call us directly.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Network error sending enquiry. Please try again or request a callback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 pb-20 animate-fadeIn">
      <SEO
        title="Contact Kandhari Tent & Caterers | Kanpur Road, Lucknow"
        description="Contact Kandhari Tent & Caterers & Dwarka Shri Lawn: Opp. Pillar No. 37, Kanpur Road, Lucknow. Call our toll-free helpline or send booking enquiries online."
        canonical="/contact"
      />
      
      {/* Header */}
      <section className="royal-gradient text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-gold text-brand-dark">
            <Sparkles className="w-3.5 h-3.5" />
            <span>We Are Here to Help</span>
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-white">
            Contact Kandhari Tent & Caterers
          </h1>
          <p className="text-sm sm:text-base text-neutral-200 max-w-2xl mx-auto leading-relaxed">
            Reach out directly for tent equipment quotes, Dwarka Shri Lawn bookings, site visits, or tailored event coordination.
          </p>
        </div>
      </section>

      {/* Main Contact Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left: Contact Info & Numbers */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Phone Numbers Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-royal space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-brand-purple">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-brand-primary">
                    Official Business Helpline
                  </h3>
                  <p className="text-xs text-neutral-500">Toll-Free & Online Support (9:00 AM – 9:00 PM)</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-brand-primary">Toll-Free Customer Line</div>
                    <div className="text-sm font-bold text-neutral-800">1800-XXX-XXXX</div>
                    <div className="text-[10px] text-amber-700 font-medium">Pending Telephony Provisioning</div>
                  </div>
                  <Phone className="w-5 h-5 text-brand-primary" />
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <div className="text-xs font-bold text-neutral-800">Request Instant Callback</div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    Submit your number in the form below. Our operations manager will call you back within 30 minutes.
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('contact-name-input');
                    if (el) el.focus();
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-brand-primary hover:bg-brand-dark text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Request Callback via Form</span>
                </button>
              </div>
            </div>

            {/* Address & Landmark Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-royal space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-brand-gold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-brand-primary">
                    Venue & Office Location
                  </h3>
                  <p className="text-xs text-neutral-500">Kanpur Road Arterial Corridor</p>
                </div>
              </div>

              <div className="text-xs text-neutral-700 space-y-2 pt-1 leading-relaxed">
                <p className="font-semibold text-neutral-900">
                  Kandhari Tent & Caterers & Dwarka Shri Lawn
                </p>
                <p>
                  Opposite Pillar No. 37, Daroga Kheda, Kanpur Road, Lucknow, Uttar Pradesh.
                </p>
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 text-amber-900 text-[11px] font-medium">
                  📍 <strong>Key Landmark:</strong> Highway/Metro Pillar No. 37. Ample parking space available for site visits.
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="https://maps.google.com/?q=Daroga+Kheda+Kanpur+Road+Lucknow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-semibold text-xs transition flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4 text-brand-primary" />
                  <span>View in Google Maps</span>
                </a>
              </div>
            </div>

          </div>

          {/* Right: Validated Enquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/80 shadow-royal space-y-6">
              
              <div>
                <span className="text-xs font-bold text-brand-accent uppercase tracking-widest">
                  Quick Communication
                </span>
                <h2 className="text-2xl font-serif font-bold text-brand-primary mt-1">
                  Send an Event Enquiry
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Fill in your proposed event date and requirements. Our event team will review and contact you with custom details.
                </p>
              </div>

              {submissionSuccess ? (
                <div className="text-center py-8 space-y-4 bg-brand-cream/80 rounded-2xl p-6 border border-brand-border animate-fadeIn">
                  <div className="w-16 h-16 bg-amber-50 border border-brand-gold/30 rounded-full flex items-center justify-center mx-auto text-brand-gold shadow-sm">
                    <CheckCircle className="w-9 h-9 text-brand-primary" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-brand-primary">
                    Inquiry Received Successfully
                  </h3>
                  <div className="p-4 bg-white/90 border border-brand-border rounded-xl max-w-sm mx-auto shadow-xs text-left space-y-2">
                    <p className="text-xs text-neutral-700 leading-relaxed">
                      Thank you for contacting <strong>Kandhari Tent & Caterers</strong>! Your inquiry has been received successfully. Our team will review your requirements and get in touch with you shortly.
                    </p>
                    <p className="text-[11px] text-neutral-500 border-t border-brand-border/60 pt-2">
                      📍 Event desk located opposite Pillar No. 37, Kanpur Road, Lucknow.
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
                        <span>Open WhatsApp with Inquiry Summary</span>
                      </a>
                      <p className="text-[11px] text-neutral-500 mt-2">
                        Opens WhatsApp to send your prefilled details directly to our booking desk (Official Desk)
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => setSubmissionSuccess(null)}
                    className="mt-3 text-xs text-brand-primary font-semibold hover:underline block mx-auto"
                  >
                    Submit another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        name="customerName"
                        required
                        value={formData.customerName}
                        onChange={handleChange}
                        placeholder="e.g. Alok Awasthi"
                        className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        10-Digit Mobile Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. 9876543210"
                        className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Proposed Event Date *
                      </label>
                      <input
                        type="date"
                        name="eventDate"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.eventDate}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Event Location / Area in Lucknow
                      </label>
                      <input
                        type="text"
                        name="eventLocation"
                        value={formData.eventLocation}
                        onChange={handleChange}
                        placeholder="e.g. Dwarka Shri Lawn / Kanpur Road"
                        className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. alok@example.com"
                      className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Enquiry Details / Requirements
                    </label>
                    <textarea
                      name="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Tell us about the event type, estimated guest count, or tent equipment needed..."
                      className="w-full p-3 text-sm border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                    />
                  </div>

                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-500 leading-normal">
                    ℹ️ <strong>Booking Note:</strong> Submitting an enquiry does not constitute a confirmed reservation; our team will contact you to verify date availability and provide a tailored quote.
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl royal-gradient text-white font-bold text-sm shadow-royal hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-brand-gold" />
                        <span>Submit Event Enquiry</span>
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default ContactPage;
