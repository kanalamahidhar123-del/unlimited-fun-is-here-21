import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles,
  ArrowRight,
  Gamepad2,
  PartyPopper,
  Users,
  Camera,
} from 'lucide-react';

export interface GalleryItem {
  src: string;
  title: string;
  category: 'PARK' | 'GAMES' | 'TRAMPOLINE' | 'GROUPS' | 'EVENTS' | 'BIRTHDAYS';
  description?: string;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    src: '/games/game_arena_entrance_facade.jpg',
    title: 'Grand Entrance & Welcome Zone',
    category: 'PARK',
    description: 'Welcome to Unlimited Fun Bhimavaram — where adventure starts the moment you step in.',
  },
  {
    src: '/games/game_mega_arena_glow.jpg',
    title: 'Neon Laser Arena Glow Jump',
    category: 'EVENTS',
    description: 'Concert-grade sound, laser lights, and high-energy glow jumping sessions.',
  },
  {
    src: '/games/game_main_trampoline_court.jpg',
    title: 'Main Trampoline Court & Angled Walls',
    category: 'TRAMPOLINE',
    description: 'Interconnected jumping beds and 45-degree rebound wall trampolines for freestyle bouncing.',
  },
  {
    src: '/games/game_trampoline_basketball.jpg',
    title: 'Slam Dunk Trampoline Basketball',
    category: 'GAMES',
    description: 'Launch off springy runways and slam dunk like a pro into regulation basketball hoops.',
  },
  {
    src: '/games/game_spiderman_climbing_wall.jpg',
    title: 'Spider-Man Superhero Climbing Wall',
    category: 'GAMES',
    description: 'Scale challenging vertical routes on our Marvel Spider-Man themed climbing structure.',
  },
  {
    src: '/games/game_castle_climbing_wall.jpg',
    title: 'Fairytale Castle Climbing Wall',
    category: 'GAMES',
    description: 'Ergonomic handholds over safety padded landing beds for climbers of all skill levels.',
  },
  {
    src: '/games/game_giant_ball_pool_slides.jpg',
    title: 'Ocean Ball Pool & Dual Wave Slides',
    category: 'BIRTHDAYS',
    description: 'Thousands of sanitized soft play balls with twin racing slides for unlimited laughs.',
  },
  {
    src: '/games/game_2tier_soft_play_maze.jpg',
    title: '2-Tier Soft Play Adventure Maze',
    category: 'GROUPS',
    description: 'Multi-level jungle gym with padded crawl tunnels, rope nets, and observation decks.',
  },
  {
    src: '/games/game_toddler_soft_play.jpg',
    title: 'Toddler Candy Play Zone',
    category: 'BIRTHDAYS',
    description: 'Sensory slides, soft foam steps, and miniature obstacles exclusively for little adventurers.',
  },
  {
    src: '/games/game_x_obstacle_tunnel.jpg',
    title: 'X-Beam Crawl & Balance Maze',
    category: 'GAMES',
    description: 'Navigate padded diagonal cross-cylinders and tunnels designed for active motor skills.',
  },
  {
    src: '/games/game_climbing_wall.jpg',
    title: 'Interactive Adventure Rock Wall',
    category: 'GAMES',
    description: 'Build confidence, balance, and upper-body strength on our vibrant climbing arena.',
  },
  {
    src: '/games/game_foam_pit_zorb.jpg',
    title: 'Giant Foam Cube Pit & Bubble Rollers',
    category: 'TRAMPOLINE',
    description: 'Safe, ultra-soft foam landing zones with inflatable rolling bubble spheres.',
  },
  {
    src: '/games/game_ninja_rings_bridge.jpg',
    title: 'Ninja Warrior Suspended Ring Traverse',
    category: 'GROUPS',
    description: 'Swing from ring to ring high above the foam pit in our championship agility course.',
  },
  {
    src: '/games/game_aerial_suspension_bridge.jpg',
    title: 'Aerial Suspension Step Bridge',
    category: 'GROUPS',
    description: 'Cross swinging wooden planks and gymnastic grips over deep foam cube beds.',
  },
  {
    src: '/games/game_rope_ladder_climb.jpg',
    title: 'Disc Rope & Ladder Adventure Climb',
    category: 'EVENTS',
    description: 'Aerial wooden ladders and disc climb ropes suspended under neon glow lighting.',
  },
  {
    src: '/games/game_hanging_tire_bridge.jpg',
    title: 'Acrobatic Hanging Tire Bridge',
    category: 'GAMES',
    description: 'Step across swinging webbed tires suspended on heavy-duty chains over the safety zone.',
  },
  {
    src: '/games/game_night_entry_pathway.jpg',
    title: 'Evening Glow & Night Ambience',
    category: 'PARK',
    description: 'Magical neon illumination welcoming guests for evening family entertainment.',
  },
];

interface GalleryProps {
  isPreview?: boolean;
  onViewFullGallery?: () => void;
  onBookClick?: () => void;
}

export const Gallery: React.FC<GalleryProps> = ({
  isPreview = false,
  onViewFullGallery,
  onBookClick,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const categories = ['ALL', 'PARK', 'GAMES', 'TRAMPOLINE', 'GROUPS', 'EVENTS', 'BIRTHDAYS'];

  const filteredItems = GALLERY_ITEMS.filter((item) => {
    if (activeCategory === 'ALL') return true;
    return item.category === activeCategory;
  });

  const displayItems = isPreview ? filteredItems.slice(0, 8) : filteredItems;

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const prevPhoto = useCallback(() => {
    setLightboxIndex((curr) => {
      if (curr === null) return null;
      return (curr - 1 + filteredItems.length) % filteredItems.length;
    });
  }, [filteredItems.length]);

  const nextPhoto = useCallback(() => {
    setLightboxIndex((curr) => {
      if (curr === null) return null;
      return (curr + 1) % filteredItems.length;
    });
  }, [filteredItems.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'ArrowRight') nextPhoto();
    };
    window.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightboxIndex, closeLightbox, prevPhoto, nextPhoto]);

  // Touch Swipe Handlers for Lightbox on Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextPhoto();
      else prevPhoto();
    }
    setTouchStartX(null);
  };

  return (
    <section
      id="gallery"
      className={`relative ${
        isPreview ? 'py-16 sm:py-24 bg-ink-900' : 'py-16 sm:py-24 bg-ink-950'
      } overflow-hidden`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-block text-xs font-bold text-volt-500 tracking-widest uppercase mb-3 px-3.5 py-1 rounded-full bg-volt-500/10 border border-volt-500/30">
            {isPreview ? 'EXPERIENCE PREVIEW' : 'OFFICIAL PHOTO GALLERY'}
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white">
            EXPLORE THE <span className="text-volt-500">ADVENTURE</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-ink-300">
            Real photos from Unlimited Fun Bhimavaram. Experience the thrills, vibrant laser lighting, trampoline arenas, and family fun.
          </p>

          {/* Category Filter Pills (Always active on full page) */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => {
              const count =
                cat === 'ALL'
                  ? GALLERY_ITEMS.length
                  : GALLERY_ITEMS.filter((it) => it.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                    activeCategory === cat
                      ? 'bg-volt-500 text-ink-950 shadow-md shadow-volt-500/20'
                      : 'bg-ink-900 border border-ink-800 text-ink-300 hover:text-white hover:bg-ink-800'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {displayItems.map((item, idx) => (
            <div
              key={item.src}
              onClick={() => setLightboxIndex(idx)}
              className="group relative h-64 sm:h-72 rounded-2xl overflow-hidden bg-ink-900 border border-ink-800 hover:border-volt-500/60 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-volt-500/10 hover:scale-[1.02] select-none"
            >
              {/* Image */}
              <img
                src={item.src}
                alt={item.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* Category Tag */}
              <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-ink-950/80 backdrop-blur-md text-volt-400 border border-ink-700">
                {item.category}
              </span>

              {/* Zoom Icon Button on Hover */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-volt-500 text-ink-950 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100 shadow-md">
                <Maximize2 className="w-4 h-4" />
              </div>

              {/* Bottom Title & Caption */}
              <div className="absolute bottom-0 inset-x-0 p-4 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                <h3 className="font-display font-black text-sm sm:text-base text-white group-hover:text-volt-400 transition-colors leading-snug">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-[11px] text-ink-300 mt-1 line-clamp-1 opacity-80 group-hover:opacity-100">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* View Full Gallery CTA Button on Home preview */}
        {isPreview && (
          <div className="mt-12 text-center">
            <button
              onClick={onViewFullGallery}
              className="inline-flex items-center gap-2 rounded-full bg-volt-500 hover:bg-volt-400 px-8 py-3.5 text-sm font-black text-ink-950 transition-all shadow-xl shadow-volt-500/20 active:scale-95"
            >
              <span>VIEW FULL GALLERY ({GALLERY_ITEMS.length} PHOTOS)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* LIGHTBOX MODAL */}
      {lightboxIndex !== null && filteredItems[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-ink-950/95 backdrop-blur-md animate-in fade-in duration-200"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-ink-900/90 text-white hover:bg-volt-500 hover:text-ink-950 border border-ink-700 flex items-center justify-center transition-all shadow-xl"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevPhoto();
            }}
            className="absolute left-3 sm:left-6 z-20 w-12 h-12 rounded-full bg-ink-900/90 text-white hover:bg-volt-500 hover:text-ink-950 border border-ink-700 flex items-center justify-center transition-all shadow-xl"
            aria-label="Previous Photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextPhoto();
            }}
            className="absolute right-3 sm:right-6 z-20 w-12 h-12 rounded-full bg-ink-900/90 text-white hover:bg-volt-500 hover:text-ink-950 border border-ink-700 flex items-center justify-center transition-all shadow-xl"
            aria-label="Next Photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Lightbox Image Container */}
          <div
            className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center justify-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filteredItems[lightboxIndex].src}
              alt={filteredItems[lightboxIndex].title}
              className="max-w-full max-h-[72vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />

            {/* Photo Info Bar Below */}
            <div className="mt-4 w-full max-w-2xl bg-ink-900/90 border border-ink-800 backdrop-blur-md rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-volt-500 text-ink-950">
                    {filteredItems[lightboxIndex].category}
                  </span>
                  <span className="text-xs text-ink-400">
                    Photo {lightboxIndex + 1} of {filteredItems.length}
                  </span>
                </div>
                <h4 className="font-display font-black text-base sm:text-lg text-white mt-1">
                  {filteredItems[lightboxIndex].title}
                </h4>
                {filteredItems[lightboxIndex].description && (
                  <p className="text-xs text-ink-300 mt-0.5">
                    {filteredItems[lightboxIndex].description}
                  </p>
                )}
              </div>

              {onBookClick && (
                <button
                  onClick={() => {
                    closeLightbox();
                    onBookClick();
                  }}
                  className="px-4 py-2 rounded-full bg-volt-500 hover:bg-volt-400 text-ink-950 font-bold text-xs whitespace-nowrap self-start sm:self-auto transition-colors"
                >
                  Book Slot Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;
