import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Play, MessageSquare, Sparkles } from 'lucide-react';

const GalleryViewer = ({ image, onClose, onPrev, onNext, hasPrev, hasNext }) => {
  if (!image) return null;

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasPrev, hasNext, onClose, onPrev, onNext]);

  const isVideo = image.mediaType === 'video' || (image.videoUrl && image.videoUrl.length > 0);

  const handleEnquireStyle = (e) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('open-ai-chat', {
        detail: {
          initialMessage: `Namaste! Mujhe gallery se "${image.title}" (${image.category}) ka setup pasand aaya. Is tarah ka arrangement karwane ke liye availability aur custom quotation batayein.`
        }
      })
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/92 backdrop-blur-md animate-fadeIn select-none">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition z-20"
        aria-label="Close lightbox"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Prev / Next controls */}
      {hasPrev && (
        <button
          onClick={onPrev}
          className="absolute left-2 sm:left-6 p-2.5 sm:p-3 rounded-full bg-white/15 text-white hover:bg-white/30 transition z-20 shadow-lg"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-2 sm:right-6 p-2.5 sm:p-3 rounded-full bg-white/15 text-white hover:bg-white/30 transition z-20 shadow-lg"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Center Media & Caption */}
      <div className="max-w-4xl max-h-[90vh] flex flex-col items-center w-full">
        <div className="relative max-h-[72vh] w-auto max-w-full flex items-center justify-center">
          {isVideo ? (
            <video
              key={image.videoUrl}
              src={image.videoUrl}
              poster={image.imageUrl}
              controls
              autoPlay
              playsInline
              className="max-h-[70vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl bg-black border border-white/10"
            />
          ) : (
            <img
              src={image.imageUrl || image.url}
              alt={image.title || image.caption}
              className="max-h-[70vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
            />
          )}
        </div>

        <div className="mt-4 text-center text-white max-w-xl px-4 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-brand-gold text-brand-dark uppercase tracking-wider inline-flex items-center gap-1 shadow">
              {isVideo ? <Play className="w-3 h-3 fill-current" /> : <Sparkles className="w-3 h-3" />}
              <span>{isVideo ? 'Walkthrough Video Reel' : (image.category || 'Event Showcase')}</span>
            </span>
            {image.category && isVideo && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white/10 text-neutral-300">
                {image.category}
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-serif font-bold text-white leading-snug">
            {image.title}
          </h3>

          {image.caption && (
            <p className="text-xs text-neutral-300 leading-relaxed">
              {image.caption}
            </p>
          )}

          <div className="pt-1 flex items-center justify-center gap-3">
            <button
              onClick={handleEnquireStyle}
              className="px-5 py-2 rounded-xl royal-gradient text-white font-bold text-xs shadow-md hover:opacity-95 transition flex items-center gap-2"
            >
              <MessageSquare className="w-3.5 h-3.5 text-brand-gold" />
              <span>Enquire About This Setup</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryViewer;
