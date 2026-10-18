import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Send, 
  MessageCircle, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Building,
  Users,
  CreditCard
} from 'lucide-react';
import { useEnquiry } from '../context/EnquiryContext';
import { api } from '../services/api';
import { LUCKNOW_LOCALITIES, SERVICES_LIST } from '../data/seedItems';

const EnquiryDrawer = () => {
  const { 
    enquiryList, 
    removeItem, 
    updateQuantity, 
    clearList, 
    isDrawerOpen, 
    closeDrawer 
  } = useEnquiry();

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    whatsappNumber: '',
    email: '',
    serviceRequired: 'Tent-house equipment rentals',
    eventDate: '',
    locality: 'Kanpur Road / Daroga Kheda',
    eventVenueAddress: '',
    guestCount: 200,
    budgetRange: 'Flexible',
    notes: '',
    consentGiven: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isDrawerOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
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
      setErrorMessage('Please enter a valid 10-digit Indian phone number (e.g. 9305465848).');
      return;
    }

    if (!formData.eventDate) {
      setErrorMessage('Please select your proposed event date.');
      return;
    }

    if (!formData.consentGiven) {
      setErrorMessage('Please check the consent box to allow us to contact you regarding your quotation.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        enquiryType: enquiryList.length > 0 ? 'rental' : 'general',
        customerName: formData.customerName.trim(),
        phone: cleanPhone,
        whatsappNumber: formData.whatsappNumber ? formData.whatsappNumber.replace(/[\s-]/g, '') : cleanPhone,
        email: formData.email.trim(),
        serviceRequired: formData.serviceRequired,
        eventDate: formData.eventDate,
        locality: formData.locality,
        eventVenueAddress: formData.eventVenueAddress.trim(),
        guestCount: parseInt(formData.guestCount, 10) || 0,
        budgetRange: formData.budgetRange,
        items: enquiryList.map(it => ({
          itemId: it.id,
          name: it.name,
          quantity: it.quantity
        })),
        notes: formData.notes.trim(),
        consentGiven: formData.consentGiven
      };

      const res = await api.submitEnquiry(payload);

      if (res.success) {
        setSubmissionSuccess({
          referenceId: res.referenceId,
          whatsappLink: res.whatsappLink,
          message: res.message
        });
        clearList();
      } else {
        setErrorMessage(res.message || 'Could not submit your enquiry. Please call us directly.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Network error submitting enquiry. Please call 9305465848.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetDrawer = () => {
    setSubmissionSuccess(null);
    setErrorMessage('');
    closeDrawer();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col">
          
          {/* Drawer Header */}
          <div className="royal-gradient px-6 py-5 text-white flex items-center justify-between border-b border-purple-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-gold" />
              <div>
                <h2 className="text-lg font-serif font-bold tracking-tight">
                  Event Enquiry & Quote Request
                </h2>
                <p className="text-xs text-brand-goldLight">
                  Direct Coordination for Lucknow Celebrations
                </p>
              </div>
            </div>
            <button 
              onClick={resetDrawer}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              aria-label="Close drawer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {submissionSuccess ? (
              <div className="text-center py-8 space-y-4 animate-fadeIn">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle className="w-10 h-10" />
                </div>
                
                <h3 className="text-xl font-serif font-bold text-brand-primary">
                  Enquiry Registered Successfully!
                </h3>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 inline-block">
                  <p className="text-xs text-neutral-600 font-medium">Your Unique Reference ID:</p>
                  <p className="text-lg font-mono font-bold text-brand-purple">
                    {submissionSuccess.referenceId}
                  </p>
                </div>

                <p className="text-sm text-neutral-600 leading-relaxed max-w-sm mx-auto">
                  Thank you! Our event coordination desk will review equipment availability for your date and locality, and contact you directly with quote details.
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
                      <span>Send Summary Directly on WhatsApp</span>
                    </a>
                    <p className="text-[11px] text-neutral-400 mt-2">
                      Instant direct connection to our Lucknow booking desk (+91 9305465848)
                    </p>
                  </div>
                )}

                <button
                  onClick={resetDrawer}
                  className="mt-4 px-6 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-sm font-medium transition"
                >
                  Continue Browsing
                </button>
              </div>
            ) : (
              <>
                {/* Selected Rental Items Section */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      Selected Rental Items ({enquiryList.length})
                    </h3>
                    {enquiryList.length > 0 && (
                      <button
                        onClick={clearList}
                        className="text-xs text-rose-600 hover:text-rose-700 font-medium transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear All</span>
                      </button>
                    )}
                  </div>

                  {enquiryList.length === 0 ? (
                    <div className="text-center py-6 px-4 bg-brand-cream/60 rounded-2xl border border-dashed border-neutral-300">
                      <ShoppingBag className="w-8 h-8 text-neutral-300 mx-auto mb-1.5" />
                      <p className="text-xs text-neutral-600 font-medium">No specific items in cart.</p>
                      <p className="text-[11px] text-neutral-400">You can still submit a general event enquiry below.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 divide-y divide-neutral-100 max-h-52 overflow-y-auto pr-1">
                      {enquiryList.map((item) => (
                        <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-12 h-12 object-cover rounded-lg shrink-0 border border-neutral-200"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-neutral-800 truncate" title={item.name}>
                              {item.name}
                            </h4>
                            <p className="text-[10px] text-neutral-400">{item.category}</p>
                            <span className="text-[10px] text-brand-purple font-medium bg-purple-50 px-1.5 py-0.5 rounded">
                              Quote on request
                            </span>
                          </div>

                          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-5 h-5 flex items-center justify-center rounded bg-white text-neutral-600 hover:text-brand-purple shadow-xs"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-neutral-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-5 h-5 flex items-center justify-center rounded bg-white text-neutral-600 hover:text-brand-purple shadow-xs"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 text-neutral-400 hover:text-rose-600 transition"
                            aria-label="Remove item"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Comprehensive Enquiry Form */}
                <form onSubmit={handleSubmit} className="pt-4 border-t border-neutral-200 space-y-4">
                  <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-brand-gold" />
                    <span>Customer & Event Information</span>
                  </h3>

                  {errorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Customer Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        name="customerName"
                        required
                        value={formData.customerName}
                        onChange={handleChange}
                        placeholder="e.g. Ramesh Chandra"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                      />
                    </div>
                  </div>

                  {/* Mobile & WhatsApp Numbers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        10-Digit Mobile *
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
                          className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        WhatsApp Number (Optional)
                      </label>
                      <div className="relative">
                        <MessageCircle className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          name="whatsappNumber"
                          value={formData.whatsappNumber}
                          onChange={handleChange}
                          placeholder="Leave blank if same"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Service Required */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Primary Service Required
                    </label>
                    <select
                      name="serviceRequired"
                      value={formData.serviceRequired}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none bg-white font-medium text-neutral-800"
                    >
                      {SERVICES_LIST.map((srv) => (
                        <option key={srv} value={srv}>{srv}</option>
                      ))}
                    </select>
                  </div>

                  {/* Event Date & Locality within Lucknow */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Event Date *
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
                          className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Locality in Lucknow *
                      </label>
                      <select
                        name="locality"
                        value={formData.locality}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none bg-white font-medium text-neutral-800"
                      >
                        {LUCKNOW_LOCALITIES.map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Event Venue or Address */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Event Venue Name or Specific Address (if known)
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        name="eventVenueAddress"
                        value={formData.eventVenueAddress}
                        onChange={handleChange}
                        placeholder="e.g. Dwarka Shri Lawn / Hotel / Private Plot"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                      />
                    </div>
                  </div>

                  {/* Expected Guests & Budget Range */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Expected Guests
                      </label>
                      <div className="relative">
                        <Users className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                        <input
                          type="number"
                          name="guestCount"
                          min="0"
                          step="50"
                          value={formData.guestCount}
                          onChange={handleChange}
                          placeholder="e.g. 250"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Approx Budget Range (Optional)
                      </label>
                      <select
                        name="budgetRange"
                        value={formData.budgetRange}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none bg-white"
                      >
                        <option value="Flexible">Flexible / Discuss on Call</option>
                        <option value="Under ₹50,000">Under ₹50,000</option>
                        <option value="₹50,000 – ₹1,50,000">₹50,000 – ₹1,50,000</option>
                        <option value="₹1,50,000 – ₹3,00,000">₹1,50,000 – ₹3,00,000</option>
                        <option value="₹3,00,000+">₹3,00,000+</option>
                      </select>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Additional Requirements / Notes
                    </label>
                    <textarea
                      name="notes"
                      rows={2}
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="e.g. Special color theme, delivery timing, sound setup, or generator requirements..."
                      className="w-full p-2.5 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                    />
                  </div>

                  {/* Consent Checkbox */}
                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="consentCheck"
                      name="consentGiven"
                      required
                      checked={formData.consentGiven}
                      onChange={handleChange}
                      className="w-4 h-4 text-brand-purple rounded mt-0.5"
                    />
                    <label htmlFor="consentCheck" className="text-[11px] text-neutral-600 leading-tight">
                      I consent to be contacted by <strong>Kandhari Tent & Caterers</strong> via phone/WhatsApp regarding this enquiry and understand that this submission does not confirm a booking until verified.
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-col gap-2">
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
                          <span>Submit Event Enquiry</span>
                        </>
                      )}
                    </button>

                    <a
                      href="tel:9305465848"
                      className="w-full py-2.5 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <Phone className="w-3.5 h-3.5 text-brand-gold" />
                      <span>Immediate Booking Call: +91 9305465848</span>
                    </a>
                  </div>
                </form>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default EnquiryDrawer;
