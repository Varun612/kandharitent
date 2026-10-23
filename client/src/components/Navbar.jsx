import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Phone, 
  MapPin, 
  ShoppingBag, 
  Menu, 
  X, 
  Sparkles, 
  Calendar,
  MessageCircle,
  User,
  ExternalLink,
  ChevronDown,
  Truck
} from 'lucide-react';
import { useEnquiry } from '../context/EnquiryContext';
import { useAuth } from '../context/AuthContext';
import PhoneCallModal from './PhoneCallModal';
import TrackOrderModal from './TrackOrderModal';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItemsCount, openDrawer } = useEnquiry();
  const { isCustomerAuthenticated, customerUser, unreadNotifsCount } = useAuth();

  const lastOrderId = localStorage.getItem('lastEnquiryReference') || customerUser?.lastOrderId;

  const handleTrackClick = (e) => {
    e.preventDefault();
    if (lastOrderId) {
      navigate(`/track/${lastOrderId}`);
    } else {
      setIsTrackModalOpen(true);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Rental Catalogue', path: '/catalogue' },
    { 
      name: 'Track Order', 
      path: '/track',
      isCustomTrack: true
    },
    { name: 'Dwarka Shri Lawn', path: '/lawn', highlight: true },
    { name: 'Catering Menu', path: '/catering', highlight: true },
    { name: 'Services', path: '/services' },
    { 
      name: 'Tools', 
      path: '/tools',
      hasDropdown: true
    },
    { name: 'Gallery', path: '/gallery' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full shadow-md">
      {/* Top Urgent Info / Announcement Bar */}
      <div className="bg-brand-dark text-neutral-200 text-xs py-2 px-4 border-b border-brand-purple/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
            <span className="flex items-center gap-1.5 text-brand-goldLight font-medium">
              <MapPin className="w-3.5 h-3.5 text-brand-gold" />
              Opp. Pillar No. 37, Daroga Kheda, Kanpur Road, Lucknow
            </span>
            <span className="hidden md:inline-block text-neutral-500">|</span>
            <span className="hidden md:flex items-center gap-1.5 text-neutral-300">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
              Dwarka Shri Lawn &bull; Managed by Kandhari Tent House
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsPhoneModalOpen(true)}
              className="flex items-center gap-1 text-white hover:text-brand-gold font-semibold transition cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-brand-gold animate-bounce" />
              <span>Helpline: +91 9305465848</span>
            </button>
            <span className="hidden sm:inline text-neutral-500">|</span>
            <button
              onClick={handleTrackClick}
              className="inline-flex items-center gap-1 text-amber-300 hover:text-white font-medium transition cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>Track Order</span>
              {lastOrderId && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" title="Active Booking Running" />
              )}
            </button>
            <span className="hidden sm:inline text-neutral-500">|</span>
            <button
              onClick={openDrawer}
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-emerald-400/20" />
              <span className="hidden sm:inline">Online Quote</span>
            </button>

            {/* Customer Account Portal Link */}
            <Link 
              to={isCustomerAuthenticated ? "/account" : "/account/login"}
              className="text-neutral-300 hover:text-brand-gold ml-2 transition flex items-center gap-1.5 relative"
              title="Customer Account"
            >
              <User className="w-3.5 h-3.5 text-brand-gold" />
              <span className="hidden md:inline text-[11px]">
                {isCustomerAuthenticated ? (customerUser?.name?.split(' ')[0] || 'My Account') : 'Client Login'}
              </span>
              {isCustomerAuthenticated && unreadNotifsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ring-2 ring-neutral-900" title={`${unreadNotifsCount} new updates`} />
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Brand Logo & Title */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl royal-gradient flex items-center justify-center text-brand-gold shadow-md group-hover:scale-105 transition transform">
                <span className="text-2xl font-serif font-black tracking-wider">K</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-serif font-bold text-brand-primary tracking-tight leading-tight group-hover:text-brand-purple transition">
                  Kandhari Tent &amp; Caterers
                </span>
                <span className="text-[11px] font-bold text-amber-600 tracking-wide flex items-center gap-1">
                  <span>Founded by Shri Mahendra Kandhari</span>
                  <span className="text-neutral-400">&bull;</span>
                  <span className="text-neutral-600 font-normal">Dwarka Shri Lawn</span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {navLinks.map((link) => {
                if (link.hasDropdown) {
                  return (
                    <div 
                      key={link.name} 
                      className="relative"
                      onMouseEnter={() => setToolsDropdownOpen(true)}
                      onMouseLeave={() => setToolsDropdownOpen(false)}
                    >
                      <button
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                          isActive(link.path)
                            ? 'text-brand-purple font-bold bg-purple-50'
                            : 'text-neutral-700 hover:text-brand-purple hover:bg-neutral-50'
                        }`}
                      >
                        <span>{link.name}</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Dropdown */}
                      {toolsDropdownOpen && (
                        <div className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-xl border border-neutral-100 py-2 z-50 animate-fadeIn">
                          <Link
                            to="/tools/creative-director"
                            onClick={() => setToolsDropdownOpen(false)}
                            className="flex items-start gap-3 px-4 py-2.5 hover:bg-purple-50/60 transition-colors group"
                          >
                            <div className="p-2 rounded-lg bg-purple-100 text-brand-purple mt-0.5 group-hover:bg-brand-purple group-hover:text-white transition-colors">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-xs text-neutral-800 flex items-center gap-1">
                                <span>AI Creative Director</span>
                                <ExternalLink className="w-3 h-3 text-neutral-400" />
                              </p>
                              <p className="text-[11px] text-neutral-500">FestiveAgent AI generator</p>
                            </div>
                          </Link>

                          <Link
                            to="/tools"
                            onClick={() => setToolsDropdownOpen(false)}
                            className="flex items-start gap-3 px-4 py-2.5 hover:bg-purple-50/60 transition-colors group border-t border-neutral-50"
                          >
                            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 mt-0.5 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-xs text-neutral-800">Site Visit Scheduler</p>
                              <p className="text-[11px] text-neutral-500">Schedule lawn & venue inspection</p>
                            </div>
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                }

                if (link.isCustomTrack) {
                  return (
                    <button
                      key={link.name}
                      onClick={handleTrackClick}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition flex items-center gap-1.5 cursor-pointer ${
                        isActive(link.path)
                          ? 'text-brand-primary font-bold bg-brand-cream border border-brand-border/60'
                          : 'text-neutral-700 hover:text-brand-primary hover:bg-brand-cream/60'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5 text-amber-500" />
                      <span>{link.name}</span>
                      {lastOrderId && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Active Booking" />
                      )}
                    </button>
                  );
                }

                return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition ${
                        isActive(link.path)
                          ? 'text-brand-primary font-bold bg-brand-cream border border-brand-border/60'
                          : link.highlight
                          ? 'text-brand-primary bg-amber-50/80 border border-brand-gold/40 hover:bg-amber-100/70'
                          : 'text-neutral-700 hover:text-brand-primary hover:bg-brand-cream/60'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>

              {/* Action Buttons: Enquiry Cart & Plan Event */}
              <div className="hidden sm:flex items-center gap-3">
                <button
                  onClick={openDrawer}
                  className="relative inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-brand-cream hover:bg-brand-creamDark text-brand-primary border border-brand-border font-semibold text-xs transition shadow-xs"
                  aria-label="View Enquiry Cart"
                >
                  <ShoppingBag className="w-4 h-4 text-brand-gold" />
                  <span>Enquiry Cart</span>
                  {totalItemsCount > 0 && (
                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-white bg-brand-accent rounded-full animate-pulse">
                      {totalItemsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={openDrawer}
                  className="hidden xl:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl royal-gradient text-white text-xs font-bold hover:opacity-95 shadow-luxury transition"
                >
                  <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Plan Your Event</span>
                </button>
              </div>

            {/* Mobile Hamburger & Mobile Cart Trigger */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={openDrawer}
                className="relative p-2.5 rounded-xl bg-purple-50 text-brand-purple border border-purple-200"
                aria-label="Enquiry items"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white bg-brand-accent rounded-full">
                    {totalItemsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl text-neutral-700 hover:text-brand-purple hover:bg-neutral-100 transition"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl animate-fadeIn">
            {navLinks.map((link) => {
              if (link.isCustomTrack) {
                return (
                  <button
                    key={link.name}
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      handleTrackClick(e);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl text-base font-medium transition flex items-center justify-between text-neutral-700 hover:text-brand-purple hover:bg-neutral-50 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-amber-500" />
                      <span>{link.name}</span>
                    </span>
                    {lastOrderId && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Active Order
                      </span>
                    )}
                  </button>
                );
              }

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition ${
                    isActive(link.path)
                      ? 'text-brand-purple font-bold bg-purple-50'
                      : 'text-neutral-700 hover:text-brand-purple hover:bg-neutral-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            <Link
              to="/tools/creative-director"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-brand-purple bg-purple-50 border border-purple-200"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-gold" />
                <span>AI Creative Director (FestiveAgent)</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <Link
              to={isCustomerAuthenticated ? "/account" : "/account/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              <User className="w-4 h-4 text-brand-purple" />
              <span>{isCustomerAuthenticated ? 'My Account & Enquiries' : 'Customer Login / Register'}</span>
            </Link>

            <div className="pt-4 border-t border-neutral-100 flex flex-col gap-2">
              <Link
                to="/lawn"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl royal-gradient text-white font-semibold text-center shadow-md flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 text-brand-gold" />
                <span>Book Dwarka Shri Lawn</span>
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsPhoneModalOpen(true);
                }}
                className="w-full py-3 rounded-xl bg-amber-50 text-brand-primary border border-amber-200 font-semibold text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone className="w-4 h-4 text-brand-gold animate-bounce" />
                <span>Direct Helpline (+91 9305465848)</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Multi-Line Phone Connect Modal */}
      <PhoneCallModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onOpenVoiceAi={() => {
          window.dispatchEvent(new CustomEvent('open-ai-chat', {
            detail: { mode: 'voice', initialMessage: 'Namaste Veronica, I want to discuss a rental booking.' }
          }));
        }}
      />

      {/* Smart Track Order Modal (for guests/empty cart) */}
      <TrackOrderModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        onOpenRentalCatalogue={() => openDrawer()}
      />
    </header>
  );
};

export default Navbar;
