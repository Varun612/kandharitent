import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Users, 
  User, 
  Phone, 
  Sparkles, 
  Send, 
  MessageCircle, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import { api } from '../services/api';

const LawnEnquiryModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    eventDate: '',
    eventType: 'Wedding & Reception',
    guestCount: 300,
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

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
      setErrorMessage('Please select your preferred event date.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        enquiryType: 'lawn',
        customerName: formData.customerName.trim(),
        phone: cleanPhone,
        email: formData.email.trim(),
        eventDate: formData.eventDate,
        eventLocation: 'Dwarka Shri Lawn, Kanpur Road, Lucknow',
        eventType: formData.eventType,
        guestCount: parseInt(formData.guestCount, 10) || 0,
        notes: formData.notes.trim()
      };

      const res = await api.submitEnquiry(payload);

      if (res.success) {
        setSubmissionSuccess({
          referenceId: res.referenceId,
          whatsappLink: res.whatsappLink,
          message: res.message
        });
      } else {
        setErrorMessage(res.message || 'Could not submit your lawn enquiry.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Network error submitting enquiry. Please call 9305465848 directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setSubmissionSuccess(null);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-neutral-100 flex flex-col">
        
        {/* Header */}
        <div className="royal-gradient p-6 text-white relative">
          <button
            onClick={resetModal}
            className="absolute top-5 right-5 p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-gold text-brand-dark mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dwarka Shri Lawn</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
            Check Lawn Date Availability
          </h2>
          <p className="text-xs text-brand-goldLight mt-1">
            Opp. Pillar No. 37, Daroga Kheda, Kanpur Road, Lucknow
          </p>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {submissionSuccess ? (
            <div className="text-center py-6 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle className="w-10 h-10" />
              </div>

              <h3 className="text-xl font-serif font-bold text-brand-primary">
                Lawn Availability Request Received!
              </h3>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 inline-block">
                <p className="text-xs text-neutral-600 font-medium">Your Booking Enquiry Ref:</p>
                <p className="text-lg font-mono font-bold text-brand-purple">
                  {submissionSuccess.referenceId}
                </p>
              </div>

              <p className="text-sm text-neutral-600 leading-relaxed">
                Thank you! Our venue manager at <strong>Dwarka Shri Lawn</strong> will review the date calendar and contact you directly to schedule an on-site visit.
              </p>

              {submissionSuccess.whatsappLink && (
                <div className="pt-2">
                  <a
                    href={submissionSuccess.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Confirm Directly on WhatsApp</span>
                  </a>
                </div>
              )}

              <button
                onClick={resetModal}
                className="mt-4 px-6 py-2 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-sm font-medium transition"
              >
                Close
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

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Your Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="customerName"
                    required
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Srivastava"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  10-Digit Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9305465848"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none"
                  />
                </div>
              </div>

              {/* Proposed Event Date */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Proposed Event Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    name="eventDate"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.eventDate}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none"
                  />
                </div>
              </div>

              {/* Event Type & Expected Guests */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Event Type
                  </label>
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none bg-white"
                  >
                    <option value="Wedding & Reception">Wedding & Reception</option>
                    <option value="Sangeet / Mehendi / Haldi">Sangeet / Mehendi / Haldi</option>
                    <option value="Ring Ceremony / Sagai">Ring Ceremony / Sagai</option>
                    <option value="Birthday / Anniversary">Birthday / Anniversary</option>
                    <option value="Corporate / Community Event">Corporate / Community Event</option>
                    <option value="Religious / Pooja Gathering">Religious / Pooja Gathering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Expected Guests
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="number"
                      name="guestCount"
                      min="50"
                      step="50"
                      value={formData.guestCount}
                      onChange={handleChange}
                      placeholder="e.g. 350"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Special Notes */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Additional Requirements (Optional)
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Need German hangar tent, specific stage decor theme, or catering setup details..."
                  className="w-full p-2.5 text-sm border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none"
                />
              </div>

              <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-500 leading-normal">
                ℹ️ <strong>Note:</strong> Lawn availability will be confirmed upon review by Kandhari Tent & Caterers management.
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl royal-gradient hover:opacity-95 text-white font-semibold text-sm shadow-royal flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-brand-gold" />
                      <span>Check Availability & Request Quote</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetModal}
                  className="w-full py-2 text-xs font-medium text-neutral-500 hover:text-neutral-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LawnEnquiryModal;
