import React, { useState } from 'react';
import { api } from '../services/api';
import { 
  CreditCard, ShieldCheck, CheckCircle2, AlertCircle, 
  X, Lock, ArrowRight, Printer, Sparkles, Building2, Calendar
} from 'lucide-react';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const RazorpayCheckoutModal = ({ enquiry, isOpen, onClose, onSuccess }) => {
  const [paymentType, setPaymentType] = useState('advance'); // 'advance' (50%) or 'full' (100%)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  if (!isOpen || !enquiry) return null;

  const totalAmount = enquiry.grandTotal || enquiry.estimatedCost || 0;
  const advanceAmount = Math.ceil(totalAmount * 0.5);
  const payableAmount = paymentType === 'advance' ? advanceAmount : totalAmount;

  const handleInitiatePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Create Order on backend
      const res = await api.createPaymentOrder({
        enquiryId: enquiry.id,
        paymentType
      });

      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to initialize payment order');
      }

      const orderData = res.data;

      // Check if running in simulated sandbox mode
      if (orderData.isTestMode && (!orderData.keyId || orderData.keyId.includes('test_dummy'))) {
        // Automatically verify simulated test transaction
        const verifyRes = await api.verifyPayment({
          enquiryId: enquiry.id,
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: `pay_sim_${Date.now()}`,
          razorpay_signature: 'simulated_authorized_signature',
          amount: orderData.amountToPay
        });

        if (verifyRes.success) {
          setPaymentSuccess(verifyRes.data);
          if (onSuccess) onSuccess(verifyRes.data);
          return;
        } else {
          throw new Error(verifyRes.message || 'Payment verification failed');
        }
      }

      // 2. Load Razorpay Checkout Script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Could not load Razorpay payment gateway. Please check your internet connection.');
      }

      // 3. Launch Razorpay Checkout Modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amountInPaise,
        currency: 'INR',
        name: 'Kandhari Tent & Caterers',
        description: `Booking Deposit for ${enquiry.id} (${enquiry.eventType || 'Event'})`,
        image: '/media/logos/kandhari-logo.png',
        order_id: orderData.orderId,
        prefill: {
          name: enquiry.customerName || enquiry.clientName || '',
          email: enquiry.email || '',
          contact: enquiry.phone || enquiry.mobileNumber || ''
        },
        notes: {
          enquiryId: enquiry.id,
          eventType: enquiry.eventType || 'Wedding / Event',
          eventDate: enquiry.eventDate || ''
        },
        theme: {
          color: '#5B1428' // Kandhari Maroon
        },
        handler: async function (response) {
          try {
            setLoading(true);
            const verifyRes = await api.verifyPayment({
              enquiryId: enquiry.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: orderData.amountToPay
            });

            if (verifyRes.success) {
              setPaymentSuccess(verifyRes.data);
              if (onSuccess) onSuccess(verifyRes.data);
            } else {
              setError(verifyRes.message || 'Payment verification failed. Please contact our support team.');
            }
          } catch (err) {
            setError(err.message || 'Error verifying payment signature');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        setError(resp.error?.description || 'Payment was declined or cancelled');
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.message || 'Failed to process payment');
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-neutral-100 max-w-lg w-full overflow-hidden transition-all transform animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-brand-primary text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close payment modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-widest uppercase text-brand-gold">
              Razorpay Secured Gateway
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <h2 className="text-xl font-serif font-bold text-white mt-1">
            {paymentSuccess ? 'Booking Confirmed & Paid!' : 'Complete Booking Deposit'}
          </h2>
          <p className="text-xs text-white/80 mt-1">
            Kandhari Tent & Caterers &bull; Dwarka Shri Lawn, Kanpur Road, Lucknow
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {paymentSuccess ? (
            /* Success View */
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-neutral-900">
                  Payment Received & Booking Confirmed!
                </h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                  Your event dates and rental inventory are officially secured on the Kandhari Tent schedule.
                </p>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-neutral-200/60">
                  <span className="text-neutral-500">Booking Ref:</span>
                  <span className="font-mono font-bold text-brand-primary">{enquiry.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-200/60">
                  <span className="text-neutral-500">Event Date:</span>
                  <span className="font-semibold text-neutral-800">{enquiry.eventDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-200/60">
                  <span className="text-neutral-500">Event Type:</span>
                  <span className="font-semibold text-neutral-800">{enquiry.eventType || 'Celebration'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-200/60">
                  <span className="text-neutral-500">Payment Status:</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Confirmed (Paid)
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-500">Advance Paid:</span>
                  <span className="font-bold text-neutral-900 text-sm">
                    ₹{paymentSuccess.advancePaid?.toLocaleString('en-IN') || payableAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handlePrintReceipt}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print Receipt
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/95 text-xs font-bold transition-all shadow-md"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Checkout View */
            <div className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Order Summary Box */}
              <div className="bg-brand-cream/60 rounded-2xl p-4 border border-brand-primary/10">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-brand-primary bg-white px-2 py-0.5 rounded border border-brand-primary/20">
                      {enquiry.id}
                    </span>
                    <h3 className="text-sm font-bold text-neutral-900 mt-1">
                      {enquiry.eventType || 'Event Setup & Catering'}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-neutral-500 block">Total Quotation</span>
                    <span className="text-base font-bold text-neutral-900 font-serif">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-brand-primary/10 text-xs text-neutral-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                    <span>{enquiry.eventDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="truncate">{enquiry.locality || 'Lucknow'}</span>
                  </div>
                </div>
              </div>

              {/* Payment Tier Selector */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-2">
                  Select Deposit Amount
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentType('advance')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentType === 'advance'
                        ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-neutral-900">50% Advance</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                        Standard
                      </span>
                    </div>
                    <div className="text-sm font-bold text-brand-primary">
                      ₹{advanceAmount.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      Locks event dates & inventory
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType('full')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentType === 'full'
                        ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-neutral-900">Full 100%</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        Full Settlement
                      </span>
                    </div>
                    <div className="text-sm font-bold text-brand-primary">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      Zero balance on event day
                    </p>
                  </button>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-500">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Payments encrypted via 256-bit SSL. Supported: UPI (GPay, PhonePe, Paytm), Netbanking, Debit & Credit Cards.
                </span>
              </div>

              {/* Action Button */}
              <button
                type="button"
                disabled={loading}
                onClick={handleInitiatePayment}
                className="w-full py-3.5 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Contacting Payment Gateway...</span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay ₹{payableAmount.toLocaleString('en-IN')} Securely</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RazorpayCheckoutModal;
