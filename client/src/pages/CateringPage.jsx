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

  // Load menu data
  useEffect(() => {
    const fetchMenu = async () => {
      setIsLoading(true);
      try {
        const res = await api.getCateringMenu();
        if (res.success) {
          setCategories(res.categories || []);
          setDishes(res.data || []);
        }
      } catch (err) {
        console.warn('Failed to fetch catering menu:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenu();
  }, []);

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
    msg += `I have created a custom catering menu for my upcoming event at ${formData.eventVenue}.\n\n`;
    msg += `*Event Details:*\n`;
    msg += `• Name: ${formData.name || 'Guest'}\n`;
    msg += `• Phone: ${formData.phone || 'N/A'}\n`;
    if (formData.eventDate) msg += `• Date: ${formData.eventDate}\n`;
    msg += `• Estimated Guests: ${formData.guestCount}\n\n`;
    msg += `*Selected Custom Menu (${totalSelectedCount} Dishes):*\n`;

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

    msg += `\nPlease review my custom menu and provide a customized catering quotation. Thank you!`;
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
          <div className="w-10 h-10 rounded-xl bg-brand-purple/40 border border-brand-gold/30 flex items-center justify-center text-brand-gold font-serif font-bold text-base">
            {totalSelectedCount}
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-100">
              {totalSelectedCount === 0 ? 'No dishes selected yet' : `${totalSelectedCount} Dishes Chosen`}
            </p>
            <p className="text-[10px] text-neutral-400">
              {totalSelectedCount === 0 ? 'Select dishes from each category' : 'Tap to review custom menu'}
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
                  <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold">
                    Banquet Selection
                  </span>
                  <h3 className="text-lg font-serif font-bold text-neutral-100">
                    Your Custom Catering Menu
                  </h3>
                  <p className="text-xs text-neutral-300">
                    {totalSelectedCount} items selected across {Object.keys(categoryCounts).length} categories
                  </p>
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
                    Request Custom Catering Quote
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Reviewing {totalSelectedCount} custom dishes. Enter your event details below:
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
          </div>
          <div>
            <p><strong>Event Date:</strong> {formData.eventDate || 'To be scheduled'}</p>
            <p><strong>Estimated Guests:</strong> {formData.guestCount}</p>
            <p><strong>Total Dishes:</strong> {totalSelectedCount}</p>
          </div>
        </div>

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
