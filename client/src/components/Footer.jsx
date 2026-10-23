import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  MapPin, 
  Mail, 
  MessageCircle, 
  Sparkles, 
  Calendar, 
  Heart,
  Clock,
  ArrowRight,
  Award
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0B0414] text-neutral-300 pt-16 pb-8 border-t border-amber-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-amber-500/15">
          
          {/* Brand Info & Founder Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1A0512] via-[#3D0C27] to-[#4A0E2E] flex items-center justify-center text-amber-400 border border-amber-500/40 shadow-lg shrink-0">
                <span className="text-2xl font-serif font-black">K</span>
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-white leading-tight">
                  Kandhari Tent &amp; Caterers
                </h3>
                <p className="text-xs text-amber-400 font-medium">
                  Dwarka Shri Lawn <span className="text-neutral-400 font-normal">(Managed)</span>
                </p>
              </div>
            </div>

            {/* Founder Tribute Badge */}
            <div className="p-3 rounded-xl bg-[#140824] border border-amber-500/30 flex items-center gap-3 shadow-md">
              <img 
                src="/media/founder/mahendra-kandhari-founder-portrait.jpg" 
                alt="Shri Mahendra Kandhari - Founder" 
                className="w-11 h-11 rounded-lg object-cover border border-amber-400/50 shrink-0"
              />
              <div>
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold font-serif">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Shri Mahendra Kandhari</span>
                </div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                  Founder &amp; Visionary
                </p>
              </div>
            </div>

            <p className="text-sm text-neutral-400 italic">
              "Making Your Celebrations Memorable"
            </p>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Lucknow's premier destination for luxury wedding tentage, grand German hangars, royal decor, and majestic open-air celebrations at Dwarka Shri Lawn.
            </p>

            <div className="pt-2">
              <a
                href="https://wa.me/919305465848?text=Namaste%20Kandhari%20Tent%20%26%20Caterers!%20I%20would%20like%20to%20enquire%20about%20event%20rentals%20and%20lawn%20booking."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
              >
                <MessageCircle className="w-4 h-4 fill-emerald-400/20" />
                <span>WhatsApp Desk (+91 9305465848)</span>
              </a>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/catalogue" className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Rental Catalogue</span>
                </Link>
              </li>
              <li>
                <Link to="/lawn" className="text-amber-300 hover:text-white transition flex items-center gap-1.5 font-medium">
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dwarka Shri Lawn Booking</span>
                </Link>
              </li>
              <li>
                <Link to="/catering" className="text-amber-300 hover:text-white transition flex items-center gap-1.5 font-medium">
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  <span>Royal Catering &amp; Menu Designer</span>
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Services &amp; Tenting</span>
                </Link>
              </li>
              <li>
                <Link to="/tools" className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Tools &amp; Site Inspection</span>
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Event &amp; Wedding Gallery</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Founder &amp; About Us</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Contact &amp; Directions</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Services */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              Our Services
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>Waterproof German Hangars &amp; Royal Shamianas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>Banquet Chairs, Chiavari &amp; VIP Maharaja Sofas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>Modular Stages, Platforms &amp; Trusses</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>Industrial Jumbo Coolers &amp; Mist Fans</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>Fairy Lights, Chandeliers &amp; Stage Illumination</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>Dwarka Shri Lawn Venue Hosting (1,500+ Capacity)</span>
              </li>
              <li className="flex items-start gap-2 pt-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Catering Services — Awadhi Feast Packages
                </span>
              </li>
            </ul>
          </div>

          {/* Contact & Verified Telephony */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              Direct Contacts &amp; Desk
            </h4>
            
            <div className="text-xs text-neutral-400 space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Opp. Pillar No. 37, Daroga Kheda, Kanpur Road, Lucknow, Uttar Pradesh.
                </span>
              </div>

              {/* Verified Direct Phone Lines */}
              <div className="p-3 rounded-xl bg-[#130720] border border-amber-500/25 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Verified Business Lines:</span>
                </div>
                
                <div className="space-y-1.5 pl-5">
                  <div>
                    <a 
                      href="tel:+919305465848" 
                      className="text-amber-300 hover:text-white font-mono font-bold text-xs flex items-center justify-between group"
                    >
                      <span>+91 9305465848</span>
                      <span className="text-[10px] text-amber-400/80 uppercase font-sans font-normal group-hover:underline">Primary / Founder</span>
                    </a>
                  </div>
                  <div>
                    <a 
                      href="tel:+917355059566" 
                      className="text-neutral-300 hover:text-white font-mono font-semibold text-xs flex items-center justify-between group"
                    >
                      <span>+91 7355059566</span>
                      <span className="text-[10px] text-neutral-400 uppercase font-sans font-normal group-hover:underline">Venue Support</span>
                    </a>
                  </div>
                  <div>
                    <a 
                      href="tel:+919307908994" 
                      className="text-neutral-300 hover:text-white font-mono font-semibold text-xs flex items-center justify-between group"
                    >
                      <span>+91 9307908994</span>
                      <span className="text-[10px] text-neutral-400 uppercase font-sans font-normal group-hover:underline">Lawn &amp; Catering</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-neutral-300">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Client Consultations: 9:00 AM – 9:00 PM (All 7 Days)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <div className="text-center md:text-left">
            <p className="text-neutral-400 font-medium">
              &copy; {new Date().getFullYear()} Kandhari Tent &amp; Caterers &amp; Dwarka Shri Lawn. Founded by Shri Mahendra Kandhari. All rights reserved.
            </p>
            <p className="mt-1 text-[11px] text-neutral-500 max-w-2xl leading-normal">
              <span className="font-semibold text-neutral-400">Important Disclaimer:</span> Submitting an online enquiry does not confirm or guarantee a booking. Our team will verify date and inventory availability and contact you directly with a personalized quotation and confirmation.
            </p>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <Link to="/privacy" className="hover:text-white transition">Privacy Policy &amp; Terms</Link>
            <span>&bull;</span>
            <Link to="/contact" className="hover:text-white transition">Get in Touch</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
