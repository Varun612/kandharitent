import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ShoppingBag, 
  Sparkles, 
  Package, 
  HelpCircle,
  Phone
} from 'lucide-react';
import { api } from '../services/api';
import { CATEGORIES } from '../data/seedItems';
import { useEnquiry } from '../context/EnquiryContext';
import ItemCard from '../components/ItemCard';
import ItemDetailModal from '../components/ItemDetailModal';
import CategoryFilter from '../components/CategoryFilter';
import SEO from '../components/SEO';

const CataloguePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);

  const { totalItemsCount, openDrawer } = useEnquiry();

  // Load items from API with fallbacks
  useEffect(() => {
    const fetchCatalogue = async () => {
      setIsLoading(true);
      try {
        const res = await api.getItems({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchQuery || undefined,
          sort: sortBy
        });

        if (res.success && res.data) {
          setItems(res.data);
        }
      } catch (err) {
        console.warn('Error fetching items from server, using local fallback', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalogue();
  }, [selectedCategory, statusFilter, searchQuery, sortBy]);

  // Update URL params when category changes
  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      <SEO
        title="Event Equipment & Wedding Rental Catalogue Lucknow | Kandhari Tent"
        description="Browse rental wedding tents, German hangars, Maharaja sofas, banquet chairs, sound, mist fans, and stage lighting inventory in Lucknow."
        canonical="/catalogue"
      />
      
      {/* Header Banner */}
      <div className="royal-gradient rounded-3xl p-8 sm:p-12 text-white shadow-royal relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-gold text-brand-dark">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kandhari Event Equipment Catalogue</span>
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-white">
            Rental Equipment Catalogue
          </h1>
          <p className="text-sm text-neutral-200 leading-relaxed">
            Browse our comprehensive inventory of wedding tents, shamianas, banquet chairs, stage trusses, desert coolers, and lighting essentials. Add items to your enquiry list to receive a tailored quotation.
          </p>
        </div>

        {/* Floating Background Accent */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-brand-accent/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="space-y-4">
        
        {/* Category Pill Switcher */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />

        {/* Search, Status, and Sort Row */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chairs, tents, coolers, stages..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition"
            />
          </div>

          {/* Right Filters */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            
            {/* Availability Filter */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
              <Filter className="w-3.5 h-3.5 text-brand-purple" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700 outline-none focus:ring-2 focus:ring-brand-accent"
              >
                <option value="all">All Availability</option>
                <option value="Available">Available Now</option>
                <option value="Limited">Limited Stock</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
              <ArrowUpDown className="w-3.5 h-3.5 text-brand-purple" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700 outline-none focus:ring-2 focus:ring-brand-accent"
              >
                <option value="popular">Most Popular</option>
                <option value="name_asc">Name (A – Z)</option>
                <option value="name_desc">Name (Z – A)</option>
              </select>
            </div>

          </div>
        </div>

      </div>

      {/* Pricing Policy Disclaimer Notice */}
      <div className="p-4 bg-brand-cream/80 border border-brand-gold/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-700">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-brand-gold shrink-0" />
          <span>
            <strong>Transparent Quotations:</strong> Custom pricing is provided upon review of your event date, quantities, and delivery location in Lucknow to offer the best bundled package.
          </span>
        </div>
        <a
          href="tel:9305465848"
          className="font-bold text-brand-purple hover:underline flex items-center gap-1 shrink-0"
        >
          <Phone className="w-3.5 h-3.5 text-brand-gold" />
          <span>Immediate inquiries: 9305465848</span>
        </a>
      </div>

      {/* Catalogue Items Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-brand-primary tracking-wider uppercase">
            Loading Rental Items...
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-neutral-300 p-8 space-y-3">
          <Package className="w-12 h-12 text-neutral-300 mx-auto" />
          <h3 className="text-base font-serif font-bold text-neutral-800">
            No equipment matches your filter criteria
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Try adjusting your search terms or select "All Categories" to view available rental inventory.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-purple-50 text-brand-purple text-xs font-bold hover:bg-purple-100 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4 text-xs font-semibold text-neutral-500">
            <span>Showing {items.length} rental products</span>
            <span>All items maintained and sanitized prior to dispatch</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onSelectDetail={(it) => setSelectedDetailItem(it)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Floating Sticky Cart Indicator if items are selected */}
      {totalItemsCount > 0 && (
        <aside 
          aria-label="Enquiry summary"
          className="fixed bottom-6 right-6 z-30 animate-bounce"
        >
          <button
            onClick={openDrawer}
            className="px-5 py-3.5 rounded-2xl royal-gradient text-white font-bold text-sm shadow-royal-lg hover:opacity-95 transition flex items-center gap-3 border border-brand-gold/30"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-brand-gold" />
              <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-brand-accent text-white text-[10px] flex items-center justify-center font-black">
                {totalItemsCount}
              </span>
            </div>
            <span>Review Enquiry List ({totalItemsCount})</span>
          </button>
        </aside>
      )}

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
      />

    </div>
  );
};

export default CataloguePage;
