import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { GALLERY_IMAGES } from '@/data/activities';

export default function Gallery() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const close = useCallback(() => setLightbox(null), []);
  const prev = useCallback(
    () => setLightbox((i) => (i === null ? null : (i - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length)),
    []
  );
  const next = useCallback(
    () => setLightbox((i) => (i === null ? null : (i + 1) % GALLERY_IMAGES.length)),
    []
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, close, prev, next]);

  return (
    <section id="gallery" className="py-20 sm:py-28 bg-ink-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block text-sm font-bold text-volt-500 tracking-widest uppercase mb-3">
            Gallery
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white">
            GALLERY
          </h2>
          <p className="mt-4 text-ink-400">A glimpse of the fun that awaits you.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {GALLERY_IMAGES.map((img, i) => (
            <button
              key={i}
              onClick={() => setLightbox(i)}
              className={`group relative overflow-hidden rounded-xl bg-ink-800 ${
                i === 0 || i === 5 ? 'col-span-2 row-span-2' : ''
              }`}
            >
              <img
                src={img}
                alt={`Unlimited Fun gallery photo ${i + 1}`}
                loading="lazy"
                className={`w-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                  i === 0 || i === 5 ? 'h-full min-h-[200px] sm:min-h-[280px]' : 'h-32 sm:h-44 lg:h-48'
                }`}
              />
              <div className="absolute inset-0 bg-ink-950/0 group-hover:bg-ink-950/30 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-950/95 backdrop-blur-sm animate-fade-in">
          <button
            onClick={close}
            className="absolute top-4 right-4 z-10 inline-flex items-center justify-center w-12 h-12 rounded-full bg-ink-800/80 text-white hover:bg-ink-700 transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            onClick={prev}
            className="absolute left-2 sm:left-4 z-10 inline-flex items-center justify-center w-12 h-12 rounded-full bg-ink-800/80 text-white hover:bg-ink-700 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 sm:right-4 z-10 inline-flex items-center justify-center w-12 h-12 rounded-full bg-ink-800/80 text-white hover:bg-ink-700 transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <img
            src={GALLERY_IMAGES[lightbox]}
            alt={`Unlimited Fun gallery photo ${lightbox + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg animate-scale-in"
          />
        </div>
      )}
    </section>
  );
}
