import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const GalleryViewer = ({ image, onClose, onPrev, onNext, hasPrev, hasNext }) => {
  if (!image) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition z-10"
        aria-label="Close lightbox"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev / Next controls */}
      {hasPrev && (
        <button
          onClick={onPrev}
          className="absolute left-4 sm:left-8 p-3 rounded-full bg-white/10 text-white hover:bg-white/25 transition z-10"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-4 sm:right-8 p-3 rounded-full bg-white/10 text-white hover:bg-white/25 transition z-10"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Center Image & Caption */}
      <div className="max-w-4xl max-h-[85vh] flex flex-col items-center">
        <img
          src={image.imageUrl || image.url}
          alt={image.title || image.caption}
          className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
        />
        <div className="mt-4 text-center text-white">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-gold text-brand-dark mb-1 inline-block">
            {image.category || 'Event Showcase'}
          </span>
          <h3 className="text-base font-serif font-bold text-white mt-1">
            {image.title}
          </h3>
          {image.caption && (
            <p className="text-xs text-neutral-300 max-w-md mx-auto mt-0.5">
              {image.caption}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GalleryViewer;
