import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, Eye, Image as ImageIcon, Video, Search, X, MessageSquare, Film, Filter, ChevronDown } from 'lucide-react';
import { api } from '../services/api';
import GalleryViewer from '../components/GalleryViewer';

export const GALLERY_SECTIONS = [
  'All',
  'Wedding and reception setups',
  'Dwarka Shri Lawn venue and grounds',
  'Stage and mandap designs',
  'Tent structures and canopy layouts',
  'Seating and furniture arrangements',
  'Floral decoration and lighting',
  'Catering and food counters',
  'Other event photographs'
];

const ITEMS_PER_PAGE = 24;

const GalleryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get('category') || 'All';
  const initialMedia = searchParams.get('mediaType') || 'All';

  const [galleryItems, setGalleryItems] = useState([]);
  const [categories, setCategories] = useState(GALLERY_SECTIONS);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [mediaType, setMediaType] = useState(initialMedia); // 'All' | 'image' | 'video'
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [activeImageIndex, setActiveImageIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync category state with URL parameter if present
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) {
      setSelectedCategory(catParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchGallery = async () => {
      setIsLoading(true);
      try {
        const res = await api.getGallery();
        if (res.success && res.data) {
          setGalleryItems(res.data);
          if (res.categories && res.categories.length > 0) {
            setCategories(['All', ...res.categories]);
          }
        }
      } catch (err) {
        console.warn('Error fetching gallery items, using defaults', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setVisibleCount(ITEMS_PER_PAGE);
    if (cat === 'All') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ ...Object.fromEntries(searchParams.entries()), category: cat });
    }
  };

  const handleMediaTypeChange = (type) => {
    setMediaType(type);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  // Filter items in memory for instant feedback and rich multi-criteria matching
  const filteredItems = useMemo(() => {
    return galleryItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All') {
        const matchCat =
          (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase()) ||
          (item.categorySlug && item.categorySlug.toLowerCase() === selectedCategory.toLowerCase());
        if (!matchCat) return false;
      }

      // Media type filter
      if (mediaType !== 'All') {
        const itemType = (item.mediaType || 'image').toLowerCase();
        if (itemType !== mediaType.toLowerCase()) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const inTitle = item.title && item.title.toLowerCase().includes(q);
        const inCaption = item.caption && item.caption.toLowerCase().includes(q);
        const inCat = item.category && item.category.toLowerCase().includes(q);
        const inTags = Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase().includes(q));
        if (!inTitle && !inCaption && !inCat && !inTags) return false;
      }

      return true;
    });
  }, [galleryItems, selectedCategory, mediaType, searchQuery]);

  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  const activeImage = activeImageIndex !== null ? visibleItems[activeImageIndex] : null;

  const handlePrev = () => {
    if (activeImageIndex > 0) {
      setActiveImageIndex(activeImageIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeImageIndex < visibleItems.length - 1) {
      setActiveImageIndex(activeImageIndex + 1);
    }
  };

  const handleEnquireStyle = (e, item) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('open-ai-chat', {
        detail: {
          initialMessage: `Namaste! Mujhe gallery se "${item.title}" (${item.category}) ka setup pasand aaya. Is tarah ka arrangement karwane ke liye availability aur details batayein.`
        }
      })
    );
  };

  const videoCount = useMemo(() => galleryItems.filter(i => i.mediaType === 'video').length, [galleryItems]);
  const photoCount = useMemo(() => galleryItems.filter(i => i.mediaType !== 'video').length, [galleryItems]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-brand-gold/20 text-brand-gold border border-brand-gold/40">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real Business Showcase &bull; 220+ Authentic Photos & Reels</span>
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-brand-primary">
          Event & Venue Gallery
        </h1>
        <p className="text-sm text-neutral-600 max-w-2xl mx-auto leading-relaxed">
          Authentic photographs and video walkthroughs of our heavy German hangar tents, royal carved wedding stages, Vedic phera mandaps, illuminated catering lines, and majestic celebrations at <strong>Dwarka Shri Lawn</strong>, Kanpur Road, Lucknow.
        </p>
      </div>

      {/* Search & Media Type Filter Bar */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(ITEMS_PER_PAGE);
            }}
            placeholder="Search real setups, mandaps, German hangar tents, lighting, catering..."
            className="w-full pl-10 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-neutral-50 border border-neutral-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Media Type Toggle */}
        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => handleMediaTypeChange('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              mediaType === 'All'
                ? 'bg-white text-brand-primary shadow-xs'
                : 'text-neutral-600 hover:text-brand-primary'
            }`}
          >
            <span>All</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-200/80 font-medium">
              {galleryItems.length}
            </span>
          </button>

          <button
            onClick={() => handleMediaTypeChange('image')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              mediaType === 'image'
                ? 'bg-white text-brand-primary shadow-xs'
                : 'text-neutral-600 hover:text-brand-primary'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Photos</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-200/80 font-medium">
              {photoCount}
            </span>
          </button>

          <button
            onClick={() => handleMediaTypeChange('video')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              mediaType === 'video'
                ? 'bg-white text-brand-primary shadow-xs'
                : 'text-neutral-600 hover:text-brand-primary'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Walkthroughs</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold">
              {videoCount}
            </span>
          </button>
        </div>
      </div>

      {/* 8 Canonical Category Tabs */}
      <div className="flex justify-start sm:justify-center overflow-x-auto pb-2 no-scrollbar">
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-neutral-200 shadow-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'royal-gradient text-white shadow-sm'
                  : 'text-neutral-600 hover:text-brand-purple hover:bg-neutral-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filter & Count Status Banner */}
      <div className="bg-brand-cream/60 border border-brand-border/60 rounded-2xl p-3.5 px-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-brand-primary">
            Showing {visibleItems.length} of {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
          </span>
          {selectedCategory !== 'All' && (
            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-brand-purple font-semibold text-[11px]">
              {selectedCategory}
            </span>
          )}
          {mediaType !== 'All' && (
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-semibold text-[11px] capitalize">
              {mediaType === 'video' ? 'Video Reels Only' : 'Photos Only'}
            </span>
          )}
          {searchQuery && (
            <span className="text-neutral-500 italic">
              Matching "{searchQuery}"
            </span>
          )}
        </div>

        {(selectedCategory !== 'All' || mediaType !== 'All' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategory('All');
              setMediaType('All');
              setSearchQuery('');
              searchParams.delete('category');
              setSearchParams(searchParams);
            }}
            className="text-xs text-brand-purple font-bold hover:underline"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-brand-primary tracking-wider uppercase">
            Loading Gallery Media...
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-neutral-300 p-8 space-y-3">
          <ImageIcon className="w-12 h-12 text-neutral-300 mx-auto" />
          <h3 className="text-base font-serif font-bold text-neutral-800">
            No media found matching your filters
          </h3>
          <p className="text-xs text-neutral-500">
            Try resetting your search or picking another category.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setMediaType('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-purple-50 text-brand-purple text-xs font-bold hover:bg-purple-100 transition"
          >
            Show All Media
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleItems.map((item, index) => {
              const isVideoItem = item.mediaType === 'video' || (item.videoUrl && item.videoUrl.length > 0);

              return (
                <div
                  key={item.id || index}
                  onClick={() => setActiveImageIndex(index)}
                  className="group relative aspect-4/3 rounded-2xl overflow-hidden bg-neutral-900 shadow-sm hover:shadow-royal cursor-pointer transition duration-300 border border-neutral-200/60"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
                  />

                  {/* Badges: Video Reel or Featured */}
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                    {isVideoItem && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500 text-neutral-950 text-[10px] font-bold uppercase tracking-wider shadow flex items-center gap-1">
                        <Film className="w-3 h-3 fill-current" />
                        <span>Video Reel</span>
                      </span>
                    )}
                    {item.featured && (
                      <span className="px-2 py-0.5 rounded-md bg-brand-purple text-white text-[10px] font-bold uppercase tracking-wider shadow">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Video Play Icon in Center if Video */}
                  {isVideoItem && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-lg">
                        <Film className="w-5 h-5 text-amber-300 fill-amber-300 ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between text-white">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-gold text-brand-dark uppercase tracking-wider truncate max-w-[200px]">
                        {item.category}
                      </span>
                      <div className="p-1.5 rounded-full bg-white/20 backdrop-blur-md">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <h3 className="text-xs sm:text-sm font-serif font-bold text-white line-clamp-1">
                          {item.title}
                        </h3>
                        {item.caption && (
                          <p className="text-[11px] text-neutral-300 mt-0.5 line-clamp-2">
                            {item.caption}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleEnquireStyle(e, item)}
                        className="w-full py-1.5 bg-brand-gold text-neutral-950 font-bold text-[11px] rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-1.5 shadow"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Enquire About This Setup</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {visibleCount < filteredItems.length && (
            <div className="pt-6 pb-2 text-center">
              <button
                onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full royal-gradient text-white font-serif font-bold text-sm shadow-md hover:shadow-royal hover:scale-[1.02] active:scale-[0.98] transition"
              >
                <span>Load More Media ({filteredItems.length - visibleCount} remaining)</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Lightbox Viewer */}
      <GalleryViewer
        image={activeImage}
        onClose={() => setActiveImageIndex(null)}
        onPrev={handlePrev}
        onNext={handleNext}
        hasPrev={activeImageIndex > 0}
        hasNext={activeImageIndex < visibleItems.length - 1}
      />

    </div>
  );
};

export default GalleryPage;
