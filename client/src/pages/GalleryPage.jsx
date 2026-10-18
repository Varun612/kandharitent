import React, { useState, useEffect } from 'react';
import { Sparkles, Eye, Image as ImageIcon, MessageSquare, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import GalleryViewer from '../components/GalleryViewer';

const GALLERY_CATEGORIES = [
  'All',
  'Entrances',
  'Floral decoration',
  'Lighting',
  'Stage and mandap',
  'Tent structures',
  'Catering',
  'Lawn and venue',
  'Other events'
];

const GalleryPage = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeImageIndex, setActiveImageIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      setIsLoading(true);
      try {
        const res = await api.getGallery(selectedCategory !== 'All' ? selectedCategory : undefined);
        if (res.success && res.data) {
          setGalleryItems(res.data);
        }
      } catch (err) {
        console.warn('Error fetching gallery items, using defaults', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGallery();
  }, [selectedCategory]);

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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-gold text-brand-dark">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real Wedding & Celebration Showcase</span>
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-brand-primary">
          Event & Venue Gallery
        </h1>
        <p className="text-sm text-neutral-600 max-w-2xl mx-auto leading-relaxed">
          Explore authentic photographs of our tent house structures, fresh flower mandaps, grand welcome gates, banquet dining, and celebrations hosted at <strong>Dwarka Shri Lawn</strong>, Kanpur Road, Lucknow.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-start sm:justify-center overflow-x-auto pb-2 no-scrollbar">
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-neutral-200 shadow-xs">
          {GALLERY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
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
            No photos found in this category
          </h3>
          <button
            onClick={() => setSelectedCategory('All')}
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
              className="group relative aspect-4/3 rounded-2xl overflow-hidden bg-neutral-100 shadow-sm hover:shadow-royal cursor-pointer transition duration-300"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-5 flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-brand-gold text-brand-dark uppercase tracking-wider">
                    {item.category}
                  </span>
                  <div className="p-1.5 rounded-full bg-white/20 backdrop-blur-md">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <h3 className="text-sm font-serif font-bold text-white line-clamp-1">
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
                    <span>Enquire About This Style</span>
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
