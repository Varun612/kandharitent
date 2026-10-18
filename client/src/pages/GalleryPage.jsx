import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, Eye, Image as ImageIcon, MessageSquare, ArrowRight, Tag, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import GalleryViewer from '../components/GalleryViewer';

export const GALLERY_SECTIONS = [
  'All',
  'Actual wedding and reception setups',
  'Dwarka Shri Lawn venue and grounds',
  'Stage and mandap designs',
  'Tent structures and canopy layouts',
  'Seating and furniture arrangements',
  'Floral and lighting decor',
  'Catering and food counters'
];

const GalleryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get('category') || 'All';

  const [galleryItems, setGalleryItems] = useState([]);
  const [categories, setCategories] = useState(GALLERY_SECTIONS);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [activeImageIndex, setActiveImageIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync category state with URL parameter if present
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam && GALLERY_SECTIONS.includes(catParam)) {
      setSelectedCategory(catParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchGallery = async () => {
      setIsLoading(true);
      try {
        const res = await api.getGallery(selectedCategory !== 'All' ? selectedCategory : undefined);
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
  }, [selectedCategory]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: cat });
    }
  };

  const activeImage = activeImageIndex !== null ? galleryItems[activeImageIndex] : null;

  const handlePrev = () => {
    if (activeImageIndex > 0) {
      setActiveImageIndex(activeImageIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeImageIndex < galleryItems.length - 1) {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fadeIn">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-brand-gold/20 text-brand-gold border border-brand-gold/40">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real Wedding & Banquet Showcase (Lucknow)</span>
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-brand-primary">
          Event & Venue Gallery
        </h1>
        <p className="text-sm text-neutral-600 max-w-2xl mx-auto leading-relaxed">
          Authentic photographs of our heavy German hangar tents, royal carved wedding stages, Vedic phera mandaps, illuminated catering lines, and majestic celebrations at <strong>Dwarka Shri Lawn</strong>, Kanpur Road, Lucknow.
        </p>
      </div>

      {/* 7-Section Filter Tabs */}
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

      {/* Category Description Banner */}
      {selectedCategory !== 'All' && (
        <div className="bg-brand-cream/60 border border-brand-border/60 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-primary">
              Showing Section: {selectedCategory}
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Genuine photographs from recent events and setups in Lucknow.
            </p>
          </div>
          <button
            onClick={() => handleCategoryChange('All')}
            className="text-xs text-brand-purple font-semibold hover:underline"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-brand-primary tracking-wider uppercase">
            Loading Gallery Photographs...
          </p>
        </div>
      ) : galleryItems.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-neutral-300 p-8 space-y-3">
          <ImageIcon className="w-12 h-12 text-neutral-300 mx-auto" />
          <h3 className="text-base font-serif font-bold text-neutral-800">
            No photos found in this section
          </h3>
          <button
            onClick={() => handleCategoryChange('All')}
            className="px-4 py-2 rounded-xl bg-purple-50 text-brand-purple text-xs font-bold hover:bg-purple-100 transition"
          >
            Show All Photos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {galleryItems.map((item, index) => (
            <div
              key={item.id || index}
              onClick={() => setActiveImageIndex(index)}
              className="group relative aspect-4/3 rounded-2xl overflow-hidden bg-neutral-100 shadow-sm hover:shadow-royal cursor-pointer transition duration-300 border border-neutral-200/60"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {item.featured && (
                <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-md bg-amber-500/90 text-white text-[10px] font-bold uppercase tracking-wider shadow">
                  Featured
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between text-white">
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
          ))}
        </div>
      )}

      {/* Lightbox Viewer */}
      <GalleryViewer
        image={activeImage}
        onClose={() => setActiveImageIndex(null)}
        onPrev={handlePrev}
        onNext={handleNext}
        hasPrev={activeImageIndex > 0}
        hasNext={activeImageIndex < galleryItems.length - 1}
      />

    </div>
  );
};

export default GalleryPage;
