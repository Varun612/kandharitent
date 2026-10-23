import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  MapPin, 
  Mail, 
  MessageCircle, 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  Heart,
  Clock,
  ArrowRight
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-brand-dark text-neutral-300 pt-16 pb-8 border-t border-brand-gold/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl royal-gradient flex items-center justify-center text-brand-gold border border-brand-gold/40 shadow-luxury">
                <span className="text-2xl font-serif font-black">K</span>
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-white leading-tight">
                  Kandhari Tent & Caterers
                </h3>
                <p className="text-xs text-brand-gold font-medium">
                  Dwarka Shri Lawn <span className="text-neutral-400 font-normal">(Managed)</span>
                </p>
              </div>
            </div>

            <p className="text-sm text-neutral-400 italic">
              "Making Your Celebrations Memorable"
            </p>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Lucknow’s trusted destination for luxury wedding tent rentals, comprehensive event equipment, and majestic open-air celebrations at Dwarka Shri Lawn.
            </p>

            <div className="pt-2">
              <a
                href="https://wa.me/??text=Namaste%20Kandhari%20Tent%20%26%20Caterers!%20I%20would%20like%20to%20enquire%20about%20event%20rentals%20and%20lawn%20booking."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
              >
                <MessageCircle className="w-4 h-4 fill-emerald-400/20" />
                <span>Online WhatsApp Assistance</span>
              </a>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-brand-gold transition flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/catalogue" className="hover:text-brand-gold transition flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Rental Catalogue</span>
                </Link>
              </li>
              <li>
                <Link to="/lawn" className="text-brand-goldLight hover:text-white transition flex items-center gap-1.5 font-medium">
                  <ArrowRight className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Dwarka Shri Lawn Booking</span>
                </Link>
              </li>
              <li>
                <Link to="/catering" className="text-brand-goldLight hover:text-white transition flex items-center gap-1.5 font-medium">
                  <ArrowRight className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Royal Catering & Menu Designer</span>
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-brand-gold transition flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Services & Tenting</span>
                </Link>
              </li>
              <li>
                <Link to="/tools" className="hover:text-brand-gold transition flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Tools & Site Inspection</span>
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-brand-gold transition flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Event & Wedding Gallery</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-gold transition flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span>About Our Family Business</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-gold transition flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Contact & Directions</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Services */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-gold" />
              Our Services
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li className="flex items-start gap-2">
                <span className="text-brand-gold font-bold">•</span>
                <span>Waterproof German Hangars & Royal Shamianas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-gold font-bold">•</span>
                <span>Banquet Chairs, Chiavari & VIP Sofas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-gold font-bold">•</span>
                <span>Modular Stages, Platforms & Trusses</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-gold font-bold">•</span>
                <span>Industrial Jumbo Coolers & Mist Fans</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-gold font-bold">•</span>
                <span>Fairy Lights, Chandeliers & Stage Illumination</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-gold font-bold">•</span>
                <span>Dwarka Shri Lawn Venue Hosting</span>
              </li>
              <li className="flex items-start gap-2 pt-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-brand-gold border border-amber-500/30">
                  Catering Services — Coming Soon
                </span>
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-gold" />
              Lucknow Address & Contact
            </h4>
            
            <div className="text-xs text-neutral-400 space-y-2.5">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <span>
                  Opp. Pillar No. 37, Daroga Kheda, Kanpur Road, Lucknow, Uttar Pradesh.
                </span>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-white font-semibold">
                    Business Toll-Free Desk:
                  </span>
                  <span className="text-neutral-300">
                    1800-XXX-XXXX (Pending Provisioning)
                  </span>
                  <Link to="/contact" className="text-brand-gold hover:underline text-[11px]">
                    Request a Direct Callback ➔
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-gold shrink-0" />
                <span>Open for Client Visits & Calls: 9:00 AM – 9:00 PM</span>
              </div>

              <div className="pt-2">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-brand-gold transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Control Portal</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <div className="text-center md:text-left">
            <p className="text-neutral-400 font-medium">
              © {new Date().getFullYear()} Kandhari Tent & Caterers & Dwarka Shri Lawn. All rights reserved.
            </p>
            <p className="mt-1 text-[11px] text-neutral-500 max-w-2xl leading-normal">
              <span className="font-semibold text-neutral-400">Important Disclaimer:</span> Submitting an online enquiry does not confirm or guarantee a booking. Our team will verify date and inventory availability and contact you directly with a personalized quotation and confirmation.
            </p>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <Link to="/privacy" className="hover:text-white transition">Privacy Policy & Terms</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-white transition">Get in Touch</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
