import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  Sparkles,
  CheckCircle2,
  Plus,
  Check,
  Printer,
  Share2,
  Calendar,
  Users,
  MapPin,
  Phone,
  MessageCircle,
  FileText,
  ChevronRight,
  ChevronDown,
  Info,
  X,
  Search,
  Filter,
  Flame,
  Award,
  Coffee,
  HeartHandshake,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CateringPage = () => {
  const { customerUser, isCustomerAuthenticated } = useAuth();

  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [selectedDishes, setSelectedDishes] = useState({}); // { [dishId]: dishObject }
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');

  // Quotation form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    eventDate: '',
    guestCount: 250,
    eventVenue: 'Dwarka Shri Lawn, Kanpur Road',
    specialInstructions: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Official verified packages state
  const [packages, setPackages] = useState([]);
  const [selectedPackageId, setSelectedPackageId] = useState('pkg-full-catering');

  // Load menu and packages data
  useEffect(() => {
    const fetchMenuAndPackages = async () => {
      setIsLoading(true);
      try {
        const [menuRes, pkgRes] = await Promise.allSettled([
          api.getCateringMenu(),
          api.getCateringPackages()
        ]);
        if (menuRes.status === 'fulfilled' && menuRes.value.success) {
          setCategories(menuRes.value.categories || []);
          setDishes(menuRes.value.data || []);
        }
        if (pkgRes.status === 'fulfilled' && pkgRes.value.success) {
          setPackages(pkgRes.value.data || []);
        }
      } catch (err) {
        console.warn('Failed to fetch catering data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenuAndPackages();
  }, []);

  const activePackage = useMemo(() => {
    return packages.find(p => p.id === selectedPackageId) || {
      id: 'pkg-veg-grand-500',
      name: 'Grand Royal Veg Platter (> 500 Guests)',
      ratePerPerson: 650,
      guestTier: '> 500 pax',
      description: 'Complete pure-veg Awadhi banqueting across 17 printed brochure courses for grand celebrations of 500+ guests.'
    };
  }, [packages, selectedPackageId]);

  const estimatedTotal = useMemo(() => {
    const guests = Number(formData.guestCount) || 0;
    if (!activePackage?.ratePerPerson) return null;

    if (activePackage.id === 'pkg-veg-grand-500' || activePackage.id === 'pkg-nonveg-grand-500') {
      if (guests >= 500) return guests * activePackage.ratePerPerson;
      return null;
    }
    if (activePackage.id === 'pkg-full-catering' || activePackage.id === 'pkg-semi-catering') {
      if (guests >= 250) return guests * activePackage.ratePerPerson;
      return null;
    }
    return null;
  }, [formData.guestCount, activePackage]);

  // Prefill user details if authenticated
  useEffect(() => {
    if (isCustomerAuthenticated && customerUser) {
      setFormData(prev => ({
        ...prev,
        name: customerUser.name || prev.name,
        phone: customerUser.phone || prev.phone,
        email: customerUser.email || prev.email
      }));
    }
  }, [isCustomerAuthenticated, customerUser]);

  // Group dishes by category
  const dishesByCategory = useMemo(() => {
    const grouped = {};
    categories.forEach(cat => {
      grouped[cat.name] = [];
    });

    dishes.forEach(dish => {
      if (!grouped[dish.category]) {
        grouped[dish.category] = [];
      }
      grouped[dish.category].push(dish);
    });

    return grouped;
  }, [categories, dishes]);

  // Selection counts per category
  const categoryCounts = useMemo(() => {
    const counts = {};
    Object.values(selectedDishes).forEach(dish => {
      counts[dish.category] = (counts[dish.category] || 0) + 1;
    });
    return counts;
  }, [selectedDishes]);

  // Total selected dishes count
  const totalSelectedCount = useMemo(() => {
    return Object.keys(selectedDishes).length;
  }, [selectedDishes]);

  // Toggle dish selection adhering to category limits
  const handleToggleDish = (dish) => {
    setSelectedDishes(prev => {
      const next = { ...prev };
      if (next[dish.id]) {
        // Deselect
        delete next[dish.id];
      } else {
        // Check if category limit reached
        const currentCount = categoryCounts[dish.category] || 0;
        const maxLimit = dish.maxSelect || 2;
        if (currentCount >= maxLimit) {
          alert(`You can select up to ${maxLimit} dishes in "${dish.category}". Please deselect one to change your choice.`);
          return prev;
        }
        next[dish.id] = dish;
      }
      return next;
    });
  };

  // Filtered categories and dishes
  const displayedCategories = useMemo(() => {
    if (activeCategory === 'All') {
      return categories.filter(cat => {
        if (!searchQuery) return true;
        const catDishes = dishesByCategory[cat.name] || [];
        return catDishes.some(d => 
          d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }
    return categories.filter(c => c.name === activeCategory);
  }, [categories, activeCategory, searchQuery, dishesByCategory]);

  // Generate WhatsApp formatted text
  const getWhatsAppMessage = () => {
    let msg = `*Namaste Kandhari Tent & Caterers!* 🙏\n`;
    msg += `I have selected my catering menu for my upcoming celebration at ${formData.eventVenue}.\n\n`;
    msg += `*Event & Package Details:*\n`;
    msg += `• Name: ${formData.name || 'Valued Guest'}\n`;
    msg += `• Phone: ${formData.phone || 'N/A'}\n`;
    if (formData.eventDate) msg += `• Date: ${formData.eventDate}\n`;
    msg += `• Estimated Guests: ${formData.guestCount}\n`;
    msg += `• Chosen Package: *${activePackage?.name || 'Custom Catering'}*\n`;
    if (estimatedTotal) {
      msg += `• Benchmark Rate: ₹${activePackage.ratePerPerson}/person (Estimated Subtotal: ₹${estimatedTotal.toLocaleString('en-IN')})\n`;
    } else {
      msg += `• Pricing: Customised estimate based on menu selections (< 250 pax)\n`;
    }
    msg += `\n*Selected Custom Menu (${totalSelectedCount} Dishes across ${Object.keys(categoryCounts).length} Categories):*\n`;

    categories.forEach(cat => {
      const catSelected = Object.values(selectedDishes).filter(d => d.category === cat.name);
      if (catSelected.length > 0) {
        msg += `\n*${cat.name} (${catSelected.length}/${cat.maxSelect}):*\n`;
        catSelected.forEach(d => {
          msg += `  - ${d.name}\n`;
        });
      }
    });

    if (formData.specialInstructions) {
      msg += `\n*Special Requirements:* ${formData.specialInstructions}\n`;
    }

    msg += `\n*Note:* All Snacks & Starters served for 2 to 2.5 hours only.\n`;
    msg += `\nPlease confirm availability and provide a tailored catering proposal. Thank you!`;
    return encodeURIComponent(msg);
  };

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/919305465848?text=${getWhatsAppMessage()}`;
    window.open(url, '_blank');
  };

  const handlePrintMenu = () => {
    window.print();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Please provide your name and phone number');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        eventDate: formData.eventDate,
        guestCount: formData.guestCount,
        eventVenue: formData.eventVenue,
        specialInstructions: formData.specialInstructions,
        selectedDishes: Object.values(selectedDishes),
        selectedPackage: activePackage,
        ratePerPerson: activePackage?.ratePerPerson || null,
        estimatedTotal: estimatedTotal,
        userId: customerUser?.id || null
      };

      const res = await api.submitCateringEnquiry(payload);
      if (res.success) {
        setIsSubmitted(true);
        setSubmissionMessage(res.message);
      }
    } catch (err) {
      alert('Failed to submit catering inquiry: ' + (err.message || 'Please try again'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream/40 pb-24">
      
      {/* Hero Header */}
      <section className="relative bg-brand-dark text-white pt-16 pb-20 overflow-hidden border-b border-brand-purple/40 print:hidden">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase bg-brand-gold/20 text-brand-goldLight border border-brand-gold/30">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
              <span>Awadhi Royal Catering & Live Food Counters</span>
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-black tracking-tight text-brand-cream">
              Grand Wedding Catering & Menu Designer
            </h1>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
              Curate your dream celebration menu from our authentic Awadhi, North Indian, and international delicacies. Select your preferred dishes under each category rule, preview your banquet selection, and request a tailored quotation for <strong>Dwarka Shri Lawn</strong> or any venue in Lucknow.
            </p>

            {/* Quick stats pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-neutral-300">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <UtensilsCrossed className="w-3.5 h-3.5 text-brand-gold" />
                <span>14 Banquet Categories</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>65+ Master Chef Dishes</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Pure Vegetarian Banqueting</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <Award className="w-3.5 h-3.5 text-brand-gold" />
                <span>32+ Years Lucknow Legacy</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Real Catering Showcase Gallery Carousel Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 print:hidden">
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-neutral-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-serif font-bold text-brand-primary flex items-center gap-2">
                <span>Real Presentation & Live Counters</span>
                <span className="text-[10px] font-sans font-normal px-2 py-0.5 rounded-md bg-amber-50 text-brand-gold border border-brand-gold/30">
                  Real Lucknow Setups
                </span>
              </h2>
              <p className="text-xs text-neutral-500">
                Photographed at our actual wedding banquets at Dwarka Shri Lawn and VIP events.
              </p>
            </div>
            <Link 
              to="/gallery?category=Catering and food counters"
              className="text-xs font-semibold text-brand-purple hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View full food gallery</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 6].map((num) => (
              <div 
                key={num} 
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-neutral-100 shadow-xs border border-neutral-200/60"
              >
                <img 
                  src={`/media/catering/catering-${num}.jpg`} 
                  alt="Real catering setup" 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition" />
                <span className="absolute bottom-2 left-2 right-2 text-[11px] font-medium text-white truncate drop-shadow-sm">
                  {num === 1 && 'Laser-Cut Illuminated Counter'}
                  {num === 2 && 'Lawn Banquet Buffet Line'}
                  {num === 3 && 'Hot Chafers Presentation'}
                  {num === 6 && 'Desserts & Sweets Display'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Official Verified Banquet Packages Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 print:hidden">
        <div className="bg-gradient-to-br from-white to-amber-50/40 rounded-3xl p-6 sm:p-8 border border-brand-gold/30 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-gold/15 text-brand-dark border border-brand-gold/30">
                <Award className="w-3.5 h-3.5 text-brand-gold" />
                <span>Authentic Booking Benchmarks (From Official Physical Rate Slips)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-brand-primary mt-2">
                Choose Your Catering Plan & Live Estimate
              </h2>
              <p className="text-xs text-neutral-600 mt-1 max-w-2xl">
                Grounded directly in Kandhari Tent &amp; Caterers official contract bookings. Select a package to calibrate your custom menu options and live estimated cost.
              </p>
            </div>
            
            {/* Service Rule Pill from Printed Menu */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 max-w-xs text-xs text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-snug">
                <strong>Official Menu Rule:</strong> All snacks &amp; starters served for <strong>2 to 2.5 hours only</strong>. Full buffet maintained throughout the event.
              </p>
            </div>
          </div>

          {/* Tiered Catering Pricing Rule Banner */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-950 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-sm text-brand-primary">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <span>Tiered Catering Pricing Structure (Official Rate Guidelines)</span>
            </div>
            <p className="leading-relaxed text-neutral-700">
              <strong>Above 500 Guests:</strong> Special bulk rates — <strong>Grand Veg Platter @ ₹650/person</strong> &bull; <strong>Grand Non-Veg Platter @ ₹850/person</strong>.
              <br />
              <strong>250 to 500 Guests:</strong> Standard benchmark — <strong>Royal Full Catering @ ₹750/person</strong> &bull; <strong>Semi Catering @ ₹250/person</strong>.
              <br />
              <strong>Under 250 Guests:</strong> If guest numbers decrease, the rate per plate increases and varies based on specific dishes and live counters selected.
              <br />
              <strong>Service Rule:</strong> All snacks and starters served for <strong>2 to 2.5 hours only</strong>. Client provides generator diesel.
            </p>
          </div>

          {/* Guest Count Quick Adjuster */}
          <div className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-purple" />
              <span className="font-bold text-neutral-800">Your Estimated Guest Count:</span>
              <input
                type="number"
                min="50"
                max="5000"
                step="50"
                value={formData.guestCount}
                onChange={(e) => setFormData(prev => ({ ...prev, guestCount: Math.max(1, parseInt(e.target.value) || 0) }))}
                className="w-24 px-3 py-1.5 rounded-lg border border-neutral-300 font-bold text-brand-primary text-center focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
              />
              <span className="text-neutral-500 font-medium">pax</span>
            </div>

            {/* Quick preset buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[11px] text-neutral-400 font-semibold mr-1">Presets:</span>
              {[150, 300, 500, 700, 1000].map(cnt => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, guestCount: cnt }));
                    if (cnt >= 500 && (selectedPackageId === 'pkg-full-catering' || selectedPackageId === 'pkg-custom-catering')) {
                      setSelectedPackageId('pkg-veg-grand-500');
                    } else if (cnt < 500 && cnt >= 250 && (selectedPackageId === 'pkg-veg-grand-500' || selectedPackageId === 'pkg-nonveg-grand-500')) {
                      setSelectedPackageId('pkg-full-catering');
                    } else if (cnt < 250) {
                      setSelectedPackageId('pkg-custom-catering');
                    }
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                    Number(formData.guestCount) === cnt
                      ? 'royal-gradient text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {cnt} pax
                </button>
              ))}
            </div>
          </div>

          {/* 5 Package Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            
            {/* Card 1: Grand Veg Platter (> 500 pax) */}
            <div 
              onClick={() => setSelectedPackageId('pkg-veg-grand-500')}
              className={`cursor-pointer rounded-2xl p-4.5 border-2 transition-all relative flex flex-col justify-between ${
                selectedPackageId === 'pkg-veg-grand-500'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-700 text-white">
                    &gt; 500 Pax Deal
                  </span>
                  <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${
                    selectedPackageId === 'pkg-veg-grand-500' ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-neutral-300'
                  }`}>
                    {selectedPackageId === 'pkg-veg-grand-500' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-sm text-neutral-900 leading-snug">Grand Royal Veg</h3>
                  <p className="text-[11px] text-neutral-500">Above 500 Guests</p>
                </div>

                <div className="pt-0.5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-emerald-800">₹650</span>
                    <span className="text-[11px] text-neutral-500 font-medium">/ person</span>
                  </div>
                  <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                    Verified rate for &gt; 500 pax
                  </p>
                </div>

                <ul className="text-[11px] space-y-1.5 text-neutral-600 pt-2 border-t border-neutral-100">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Complete 17-course Awadhi veg spread</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Live Chaat, Barbecue Tandoor &amp; Kesaria Jalebi</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Snacks strictly 2 to 2.5 hours</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Illuminated counters &amp; bone china crockery</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 2: Grand Non-Veg Platter (> 500 pax) */}
            <div 
              onClick={() => setSelectedPackageId('pkg-nonveg-grand-500')}
              className={`cursor-pointer rounded-2xl p-4.5 border-2 transition-all relative flex flex-col justify-between ${
                selectedPackageId === 'pkg-nonveg-grand-500'
                  ? 'border-amber-600 bg-amber-50/50 shadow-md ring-2 ring-amber-600/20'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-700 text-white">
                    Non-Veg &gt; 500
                  </span>
                  <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${
                    selectedPackageId === 'pkg-nonveg-grand-500' ? 'border-amber-700 bg-amber-700 text-white' : 'border-neutral-300'
                  }`}>
                    {selectedPackageId === 'pkg-nonveg-grand-500' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-sm text-neutral-900 leading-snug">Grand Royal Non-Veg</h3>
                  <p className="text-[11px] text-neutral-500">Above 500 Guests</p>
                </div>

                <div className="pt-0.5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-amber-900">₹850</span>
                    <span className="text-[11px] text-neutral-500 font-medium">/ person</span>
                  </div>
                  <p className="text-[10px] text-amber-700 font-semibold mt-0.5">
                    Mutton &amp; Chicken Curries + Kebabs
                  </p>
                </div>

                <ul className="text-[11px] space-y-1.5 text-neutral-600 pt-2 border-t border-neutral-100">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>Mutton/Chicken curries &amp; live kebabs</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>Full vegetarian buffet counters included</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>Snacks strictly 2 to 2.5 hours</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>Luxury brass &amp; stainless chafing line</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 3: Royal Full Catering (250–500 pax) */}
            <div 
              onClick={() => setSelectedPackageId('pkg-full-catering')}
              className={`cursor-pointer rounded-2xl p-4.5 border-2 transition-all relative flex flex-col justify-between ${
                selectedPackageId === 'pkg-full-catering'
                  ? 'border-brand-purple bg-purple-50/40 shadow-md ring-2 ring-brand-purple/20'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-purple text-white">
                    250–500 Pax
                  </span>
                  <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${
                    selectedPackageId === 'pkg-full-catering' ? 'border-brand-purple bg-brand-purple text-white' : 'border-neutral-300'
                  }`}>
                    {selectedPackageId === 'pkg-full-catering' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-sm text-neutral-900 leading-snug">Royal Full Catering</h3>
                  <p className="text-[11px] text-neutral-500">250 to 500 Guests</p>
                </div>

                <div className="pt-0.5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-brand-primary">₹750</span>
                    <span className="text-[11px] text-neutral-500 font-medium">/ person</span>
                  </div>
                  <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                    Signature wedding standard
                  </p>
                </div>

                <ul className="text-[11px] space-y-1.5 text-neutral-600 pt-2 border-t border-neutral-100">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>All 17 course sections included</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Live Chinese, Italian &amp; Chokha Bati</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Snacks served for 2 to 2.5 hours</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Full chafing line &amp; trained stewards</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 4: Semi Catering (≥ 250 pax) */}
            <div 
              onClick={() => setSelectedPackageId('pkg-semi-catering')}
              className={`cursor-pointer rounded-2xl p-4.5 border-2 transition-all relative flex flex-col justify-between ${
                selectedPackageId === 'pkg-semi-catering'
                  ? 'border-brand-purple bg-purple-50/40 shadow-md ring-2 ring-brand-purple/20'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                    Service &ge; 250
                  </span>
                  <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${
                    selectedPackageId === 'pkg-semi-catering' ? 'border-brand-purple bg-brand-purple text-white' : 'border-neutral-300'
                  }`}>
                    {selectedPackageId === 'pkg-semi-catering' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-sm text-neutral-900 leading-snug">Standard Semi Catering</h3>
                  <p className="text-[11px] text-neutral-500">&ge; 250 Guests</p>
                </div>

                <div className="pt-0.5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-brand-primary">₹250</span>
                    <span className="text-[11px] text-neutral-500 font-medium">/ person</span>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    Daytime events &amp; poojas
                  </p>
                </div>

                <ul className="text-[11px] space-y-1.5 text-neutral-600 pt-2 border-t border-neutral-100">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Stainless &amp; brass counter warmers</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Table service &amp; clearing staff</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Host arranges raw food items</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Formal layout &amp; supervisors</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 5: Custom / Under 250 pax */}
            <div 
              onClick={() => setSelectedPackageId('pkg-custom-catering')}
              className={`cursor-pointer rounded-2xl p-4.5 border-2 transition-all relative flex flex-col justify-between ${
                selectedPackageId === 'pkg-custom-catering'
                  ? 'border-brand-purple bg-purple-50/40 shadow-md ring-2 ring-brand-purple/20'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    &lt; 250 Pax
                  </span>
                  <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${
                    selectedPackageId === 'pkg-custom-catering' ? 'border-brand-purple bg-brand-purple text-white' : 'border-neutral-300'
                  }`}>
                    {selectedPackageId === 'pkg-custom-catering' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-sm text-neutral-900 leading-snug">Bespoke Gathering</h3>
                  <p className="text-[11px] text-neutral-500">50 to 249 Guests</p>
                </div>

                <div className="pt-0.5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-brand-primary">Custom Quote</span>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    Rate increases for smaller pax
                  </p>
                </div>

                <ul className="text-[11px] space-y-1.5 text-neutral-600 pt-2 border-t border-neutral-100">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>Price per plate varies with menu</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>Intimate gathering arrangements</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>Direct catering manager consultation</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>Dwarka Shri Lawn or private venue</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>

          {/* Live Estimate Calculator Ribbon */}
          {estimatedTotal ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  ₹
                </div>
                <div>
                  <span className="font-bold text-emerald-950">
                    Live Banquet Calculation: {activePackage.name}
                  </span>
                  <p className="text-emerald-800 text-[11px]">
                    ₹{activePackage.ratePerPerson}/person × {formData.guestCount} guests
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-lg font-black text-emerald-900">
                  ₹{estimatedTotal.toLocaleString('en-IN')}
                </span>
                <p className="text-[10px] text-emerald-700">Estimated banquet subtotal (excl. venue/decor)</p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {Number(formData.guestCount) < 250 ? (
                    <>For gatherings under 250 guests, per-plate price increases and varies based on menu choices. Select dishes below for a bespoke quote.</>
                  ) : (selectedPackageId === 'pkg-veg-grand-500' || selectedPackageId === 'pkg-nonveg-grand-500') && Number(formData.guestCount) < 500 ? (
                    <>The ₹{activePackage.ratePerPerson}/person rate is discounted for gatherings above 500 guests. For 250–500 guests, choose our ₹750/person Royal Full package, or set your guest count to &ge; 500.</>
                  ) : (
                    <>Custom rate depends on selected menu items and live counter setup.</>
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsQuotationModalOpen(true)}
                className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition"
              >
                Request Custom Quote
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Main Content: Filter, Search & Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        
        {/* Interactive Controls Bar */}
        <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-neutral-200 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes (e.g. Shahi Paneer, Chaat, Biryani, Jalebi)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl royal-gradient text-white text-xs font-bold shadow-md hover:opacity-95 transition"
            >
              <UtensilsCrossed className="w-4 h-4 text-brand-gold" />
              <span>Chosen Menu</span>
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-extrabold bg-brand-gold text-brand-dark rounded-full">
                {totalSelectedCount}
              </span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              disabled={totalSelectedCount === 0}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition ${
                totalSelectedCount > 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
              }`}
              title="Share Menu on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={handlePrintMenu}
              disabled={totalSelectedCount === 0}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition ${
                totalSelectedCount > 0
                  ? 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                  : 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
              }`}
              title="Print Custom Menu"
            >
              <Printer className="w-4 h-4 text-neutral-500" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar print:hidden">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeCategory === 'All'
                ? 'royal-gradient text-white shadow-sm'
                : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            All Categories ({categories.length})
          </button>
          {categories.map(cat => {
            const count = categoryCounts[cat.name] || 0;
            const isFilled = count >= cat.maxSelect;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeCategory === cat.name
                    ? 'royal-gradient text-white shadow-sm'
                    : isFilled
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                  activeCategory === cat.name
                    ? 'bg-white/20 text-white'
                    : isFilled
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-100 text-neutral-600'
                }`}>
                  {count}/{cat.maxSelect}
                </span>
              </button>
            );
          })}
        </div>

        {/* Categories & Dishes Grid */}
        <div className="space-y-12">
          {displayedCategories.map((category) => {
            const catDishes = dishesByCategory[category.name] || [];
            const selectedInCat = categoryCounts[category.name] || 0;
            const isComplete = selectedInCat >= category.maxSelect;

            return (
              <div 
                key={category.id} 
                className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-md space-y-6"
              >
                {/* Category Header with Selection Allowance Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-brand-gold" />
                      <h3 className="text-lg sm:text-xl font-serif font-black text-brand-primary">
                        {category.name}
                      </h3>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Standard banqueting rule: <strong>{category.selectionRule}</strong> ({category.maxSelect} selections allowed)
                    </p>
                  </div>

                  {/* Status Indicator Badge */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                      isComplete
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : selectedInCat > 0
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                    }`}>
                      {isComplete ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Category Complete ({selectedInCat}/{category.maxSelect})</span>
                        </>
                      ) : (
                        <>
                          <span>{selectedInCat} of {category.maxSelect} selected</span>
                          <span className="text-[10px] text-neutral-400">({category.maxSelect - selectedInCat} remaining)</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Dishes Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catDishes.map((dish) => {
                    const isSelected = Boolean(selectedDishes[dish.id]);

                    return (
                      <div
                        key={dish.id}
                        onClick={() => handleToggleDish(dish)}
                        className={`group cursor-pointer rounded-2xl p-4 border transition-all duration-200 relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-50/60 border-brand-gold shadow-md'
                            : 'bg-white border-neutral-200/90 hover:border-neutral-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Pure Veg Badge */}
                              <span className="w-3.5 h-3.5 rounded-xs border border-emerald-600 flex items-center justify-center" title="100% Pure Vegetarian">
                                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                              </span>
                              <h4 className="text-sm font-bold text-neutral-800 group-hover:text-brand-purple transition leading-snug">
                                {dish.name}
                              </h4>
                            </div>

                            {/* Selection Checkbox */}
                            <button
                              type="button"
                              className={`w-6 h-6 rounded-lg flex items-center justify-center transition shrink-0 ${
                                isSelected
                                  ? 'bg-brand-primary text-white shadow-xs'
                                  : 'border border-neutral-300 text-transparent group-hover:border-neutral-400'
                              }`}
                              aria-label={isSelected ? 'Deselect dish' : 'Select dish'}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                          </div>

                          <p className="text-xs text-neutral-500 leading-relaxed line-clamp-3">
                            {dish.description}
                          </p>
                        </div>

                        {/* Card Footer */}
                        <div className="pt-3 mt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                          {dish.isPopular ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                              <Sparkles className="w-3 h-3 text-brand-gold" />
                              <span>Banquet Special</span>
                            </span>
                          ) : (
                            <span className="text-neutral-400 font-medium">Standard Choice</span>
                          )}

                          <span className={`font-semibold ${isSelected ? 'text-brand-primary' : 'text-neutral-400'}`}>
                            {isSelected ? 'Selected' : 'Tap to select'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quotation Request Banner */}
        <div className="bg-brand-dark text-white rounded-3xl p-8 sm:p-10 border border-brand-purple/40 shadow-xl relative overflow-hidden print:hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs uppercase tracking-widest text-brand-gold font-bold">
              Transparent & Custom Tailored
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-black text-brand-cream">
              Request a Customised Catering Quotation
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Every wedding is unique. We do not use arbitrary generic prices; our quotations are custom-calculated based on your chosen dishes, live counter requirements, guest count, and service style.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsQuotationModalOpen(true)}
                disabled={totalSelectedCount === 0}
                className={`px-6 py-3 rounded-xl font-bold text-xs shadow-luxury transition inline-flex items-center gap-2 ${
                  totalSelectedCount > 0
                    ? 'royal-gradient text-white hover:opacity-95'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                <span>Request Custom Quotation ({totalSelectedCount} Dishes)</span>
                <ArrowRight className="w-4 h-4 text-brand-gold" />
              </button>

              <button
                onClick={handleShareWhatsApp}
                disabled={totalSelectedCount === 0}
                className={`px-4 py-3 rounded-xl font-semibold text-xs border transition inline-flex items-center gap-2 ${
                  totalSelectedCount > 0
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-white/5 text-neutral-500 border-white/10 cursor-not-allowed'
                }`}
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Quick WhatsApp Quote</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Bottom Menu Bar (Mobile & Quick Access) */}
      <div className="fixed bottom-4 left-4 right-4 z-40 max-w-xl mx-auto bg-brand-dark/95 backdrop-blur-md text-white rounded-2xl p-3 shadow-2xl border border-brand-purple/40 flex items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3 pl-2">
          <div className="w-10 h-10 rounded-xl bg-brand-purple/40 border border-brand-gold/30 flex items-center justify-center text-brand-gold font-serif font-bold text-base shrink-0">
            {totalSelectedCount}
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-100 flex items-center gap-1.5 flex-wrap">
              <span>{totalSelectedCount === 0 ? 'No dishes selected yet' : `${totalSelectedCount} Dishes Chosen`}</span>
              {estimatedTotal && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-500/30">
                  ₹{estimatedTotal.toLocaleString('en-IN')}
                </span>
              )}
            </p>
            <p className="text-[10px] text-neutral-400">
              {activePackage?.name ? `${activePackage.name} (${activePackage.ratePerPerson ? `₹${activePackage.ratePerPerson}/pp` : 'Custom'})` : 'Tap to review'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 transition"
          >
            Review Menu
          </button>
          <button
            onClick={() => setIsQuotationModalOpen(true)}
            disabled={totalSelectedCount === 0}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              totalSelectedCount > 0
                ? 'royal-gradient text-white shadow-md hover:opacity-95'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            Get Quote
          </button>
        </div>
      </div>

      {/* Custom Menu Review Slide-Over Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden print:hidden">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              
              {/* Drawer Header */}
              <div className="p-6 bg-brand-dark text-white border-b border-brand-purple/40 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold">
                      Banquet Selection
                    </span>
                    {activePackage && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-brand-goldLight font-semibold border border-white/15">
                        {activePackage.name}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-serif font-bold text-neutral-100">
                    Your Custom Catering Menu
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-neutral-300">
                    <span>{totalSelectedCount} items chosen</span>
                    {estimatedTotal && (
                      <span className="text-emerald-400 font-bold">
                        • Est: ₹{estimatedTotal.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body - List of Selected Dishes */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {totalSelectedCount === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <UtensilsCrossed className="w-12 h-12 text-neutral-300 mx-auto stroke-1" />
                    <p className="text-sm font-semibold text-neutral-600">No dishes selected yet</p>
                    <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                      Explore the categories on the menu and tap dishes to add them to your custom event banquet.
                    </p>
                  </div>
                ) : (
                  categories.map(cat => {
                    const catSelected = Object.values(selectedDishes).filter(d => d.category === cat.name);
                    if (catSelected.length === 0) return null;

                    return (
                      <div key={cat.id} className="space-y-2 border-b border-neutral-100 pb-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-brand-primary">{cat.name}</span>
                          <span className="text-neutral-400 font-medium">
                            {catSelected.length}/{cat.maxSelect}
                          </span>
                        </div>

                        <ul className="space-y-2">
                          {catSelected.map(dish => (
                            <li 
                              key={dish.id} 
                              className="flex items-center justify-between text-xs bg-brand-cream/40 p-2.5 rounded-xl border border-brand-border/40"
                            >
                              <span className="font-medium text-neutral-800">{dish.name}</span>
                              <button
                                onClick={() => handleToggleDish(dish)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Remove dish"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 bg-neutral-50 border-t border-neutral-200 space-y-3">
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setIsQuotationModalOpen(true);
                  }}
                  disabled={totalSelectedCount === 0}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs shadow-md transition ${
                    totalSelectedCount > 0
                      ? 'royal-gradient text-white hover:opacity-95'
                      : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  Request Customized Quotation
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleShareWhatsApp}
                    disabled={totalSelectedCount === 0}
                    className="py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={handlePrintMenu}
                    disabled={totalSelectedCount === 0}
                    className="py-2.5 rounded-xl bg-white text-neutral-700 border border-neutral-200 text-xs font-semibold hover:bg-neutral-100 transition flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Print Menu</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Quotation Request Modal */}
      {isQuotationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto print:hidden">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 relative my-8 animate-fadeIn">
            <button
              onClick={() => {
                setIsQuotationModalOpen(false);
                setIsSubmitted(false);
              }}
              className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>

            {isSubmitted ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-serif font-black text-brand-primary">
                  Catering Request Received!
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {submissionMessage || 'Thank you for contacting Kandhari Tent & Caterers! Your catering inquiry has been received successfully. Our catering manager will review your chosen menu and get in touch with you shortly with a tailored quotation.'}
                </p>

                <div className="bg-brand-cream/60 p-4 rounded-2xl border border-brand-border/60 text-xs text-neutral-700 text-left space-y-1.5">
                  <p><strong>Selected Package:</strong> <span className="font-semibold text-brand-purple">{activePackage?.name || 'Custom Catering'}</span></p>
                  {activePackage?.ratePerPerson ? (
                    <p><strong>Estimated Budget:</strong> ₹{activePackage.ratePerPerson}/person {estimatedTotal ? `(approx. ₹${estimatedTotal.toLocaleString('en-IN')} for ${formData.guestCount} guests)` : ''}</p>
                  ) : null}
                  <p><strong>Name:</strong> {formData.name}</p>
                  <p><strong>Phone:</strong> {formData.phone}</p>
                  <p><strong>Estimated Guests:</strong> {formData.guestCount}</p>
                  <p><strong>Dishes Selected:</strong> {totalSelectedCount} items</p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleShareWhatsApp}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Send on WhatsApp</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsQuotationModalOpen(false);
                      setIsSubmitted(false);
                    }}
                    className="px-4 py-3 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-semibold hover:bg-neutral-200 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold tracking-widest text-brand-gold uppercase">
                    Tailored Pricing
                  </span>
                  <h3 className="text-xl font-serif font-bold text-brand-primary">
                    Request Catering Quote
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Reviewing {totalSelectedCount} selected dishes. Enter your event details below:
                  </p>
                </div>

                {/* Selected Package Banner in Modal */}
                <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-brand-primary flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                      {activePackage?.name || 'Custom Catering'}
                    </span>
                    <span className="font-extrabold text-brand-purple">
                      {activePackage?.ratePerPerson ? `₹${activePackage.ratePerPerson}/person` : 'Custom Quote'}
                    </span>
                  </div>
                  {activePackage?.ratePerPerson && formData.guestCount && (
                    <div className="text-[11px] text-amber-800 flex items-center justify-between border-t border-amber-200/60 pt-1.5 font-medium">
                      <span>Est. Catering Cost ({formData.guestCount} guests):</span>
                      <span className="font-bold text-neutral-900">
                        ₹{(activePackage.ratePerPerson * formData.guestCount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  <p className="text-[10px] text-amber-700 italic border-t border-amber-200/40 pt-1">
                    * Printed Menu Rule: All Snacks & Starters served for 2 to 2.5 hours only. Generator diesel provided by client.
                  </p>
                </div>

                {isCustomerAuthenticated && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-xs text-brand-purple flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Logged in as <strong>{customerUser?.name}</strong>. Details prefilled.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Mobile Number (WhatsApp) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9305465848"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Expected Event Date</label>
                    <input
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Estimated Guests *</label>
                    <input
                      type="number"
                      min="50"
                      max="3000"
                      step="25"
                      value={formData.guestCount}
                      onChange={(e) => setFormData({ ...formData, guestCount: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Event Venue Location</label>
                  <input
                    type="text"
                    placeholder="Dwarka Shri Lawn, Kanpur Road or your private venue"
                    value={formData.eventVenue}
                    onChange={(e) => setFormData({ ...formData, eventVenue: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Special Preferences / Live Counters</label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Jain food counters, extra sonth for chaat, mild spices for seniors..."
                    value={formData.specialInstructions}
                    onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl royal-gradient text-white text-xs font-bold shadow-luxury hover:opacity-95 transition flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Sending inquiry...</span>
                    ) : (
                      <>
                        <span>Submit Catering Inquiry</span>
                        <ArrowRight className="w-4 h-4 text-brand-gold" />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-center text-neutral-400 mt-2">
                    Our catering team will contact you directly within 2 hours.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Print-Only Banqueting Menu View */}
      <div className="hidden print:block p-8 bg-white text-black font-serif">
        <div className="border-b-2 border-black pb-4 mb-6 text-center">
          <h1 className="text-3xl font-bold uppercase tracking-wider">Kandhari Tent & Caterers</h1>
          <p className="text-sm font-sans mt-1">Dwarka Shri Lawn, Kanpur Road, Lucknow | Phone: 9305465848 / 9307908994</p>
          <p className="text-xs font-sans mt-1">Custom Wedding Catering Menu Proposal</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs font-sans mb-6 border p-4 rounded">
          <div>
            <p><strong>Customer:</strong> {formData.name || 'Valued Guest'}</p>
            <p><strong>Phone:</strong> {formData.phone || 'N/A'}</p>
            <p><strong>Venue:</strong> {formData.eventVenue}</p>
            <p><strong>Package:</strong> {activePackage?.name || 'Custom Catering'} {activePackage?.ratePerPerson ? `(@ ₹${activePackage.ratePerPerson}/person)` : ''}</p>
          </div>
          <div>
            <p><strong>Event Date:</strong> {formData.eventDate || 'To be scheduled'}</p>
            <p><strong>Estimated Guests:</strong> {formData.guestCount}</p>
            <p><strong>Total Dishes:</strong> {totalSelectedCount}</p>
            {activePackage?.ratePerPerson && formData.guestCount && (
              <p><strong>Estimated Total:</strong> ₹{(activePackage.ratePerPerson * formData.guestCount).toLocaleString('en-IN')}</p>
            )}
          </div>
        </div>
        <p className="text-[11px] font-sans italic text-neutral-600 mb-4">* Note: All Snacks & Starters served for 2 to 2.5 hours only. Generator diesel to be provided by client.</p>

        <div className="space-y-4">
          {categories.map(cat => {
            const catSelected = Object.values(selectedDishes).filter(d => d.category === cat.name);
            if (catSelected.length === 0) return null;

            return (
              <div key={cat.id} className="border-b pb-2">
                <h4 className="text-sm font-bold uppercase tracking-wide text-neutral-800">
                  {cat.name} ({catSelected.length}/{cat.maxSelect})
                </h4>
                <ul className="list-disc list-inside text-xs mt-1 space-y-0.5">
                  {catSelected.map(d => (
                    <li key={d.id}><strong>{d.name}</strong> - <span className="font-sans text-neutral-600">{d.description}</span></li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-4 border-t text-center text-[10px] font-sans text-neutral-500">
          Generated via Kandhari Tent & Caterers Digital Catering Designer | Kanpur Road, Lucknow
        </div>
      </div>

    </div>
  );
};

export default CateringPage;
