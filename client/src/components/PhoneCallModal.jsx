import React from 'react';
import { Phone, MessageCircle, X, ShieldCheck, MapPin, Sparkles, Clock, UserCheck } from 'lucide-react';

const PhoneCallModal = ({ isOpen, onClose, onOpenVoiceAi }) => {
  if (!isOpen) return null;

  const phoneNumbers = [
    {
      label: "Founder & Primary Booking Line",
      number: "+91 9305465848",
      tel: "9305465848",
      desc: "Direct contact for wedding quotations, German hangars, and urgent event booking.",
      badge: "Primary Line",
      badgeColor: "bg-amber-500 text-black",
      isPrimary: true
    },
    {
      label: "Lawn & Venue Reservations",
      number: "+91 7355059566",
      tel: "7355059566",
      desc: "Dwarka Shri Lawn site inspections, date availability, and bride/groom suites.",
      badge: "Venue Desk",
      badgeColor: "bg-purple-600 text-white",
      isPrimary: false
    },
    {
      label: "Catering & Logistics Coordinator",
      number: "+91 9307908994",
      tel: "9307908994",
      desc: "Awadhi catering packages, Halwai seating, furniture deliveries, and cartage.",
      badge: "Logistics Desk",
      badgeColor: "bg-emerald-600 text-white",
      isPrimary: false
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#11081e] text-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-amber-500/40 relative overflow-hidden">
        
        {/* Subtle patterned gold top bar */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <Phone className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="font-serif font-black text-lg text-white">
                Contact Kandhari Family Desk
              </h3>
              <p className="text-xs text-amber-300 font-semibold">
                Direct Owner Communication &bull; Kanpur Road, Lucknow
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center font-bold transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Founder tribute badge */}
        <div className="my-4 p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center gap-3">
          <img
            src="/media/founder/mahendra-kandhari-founder-portrait.jpg"
            alt="Shri Mahendra Kandhari"
            className="w-10 h-10 rounded-full object-cover border border-amber-400 shrink-0"
          />
          <div className="text-xs">
            <span className="font-bold text-amber-300 block">Founded by Shri Mahendra Kandhari</span>
            <span className="text-neutral-300 text-[11px]">Direct family supervision on all bookings. No middlemen.</span>
          </div>
        </div>

        {/* Direct Phone Lines Roster */}
        <div className="space-y-3">
          {phoneNumbers.map((p) => (
            <div
              key={p.tel}
              className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                p.isPrimary
                  ? 'bg-amber-950/20 border-amber-500/60 ring-1 ring-amber-500/20'
                  : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${p.badgeColor}`}>
                    {p.badge}
                  </span>
                  <span className="text-xs font-bold text-neutral-300">{p.label}</span>
                </div>
                <div className="text-lg font-mono font-bold text-white tracking-wide">
                  {p.number}
                </div>
                <p className="text-[11px] text-neutral-400 leading-snug">
                  {p.desc}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`tel:${p.tel}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </a>
                {p.isPrimary && (
                  <a
                    href={`https://wa.me/919305465848?text=Namaste%2C%20I%20am%20calling%20regarding%20tent%20and%20lawn%20booking.`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* AI Voice Receptionist Switcher */}
        {onOpenVoiceAi && (
          <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between">
            <div className="text-xs text-neutral-400">
              <span className="block font-semibold text-neutral-200">Need instant automated assistance?</span>
              <span className="text-[11px]">Talk directly with Veronica AI Receptionist in browser.</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenVoiceAi();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs shadow-md transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Voice AI Desk</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default PhoneCallModal;
