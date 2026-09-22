import { useState } from 'react';
import { ArrowRight, X, Shield, Calendar, Sparkles } from 'lucide-react';
import { ACTIVITIES, type Activity } from '@/data/activities';

interface GamesProps {
  onBookClick?: () => void;
}

export default function Games({ onBookClick }: GamesProps) {
  const [selected, setSelected] = useState<Activity | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'Trampoline' | 'Adventure' | 'Kids Soft Play'>('ALL');

  const filtered = ACTIVITIES.filter((act) => {
    if (categoryFilter === 'ALL') return true;
    return act.category === categoryFilter;
  });

  const handleBook = () => {
    setSelected(null);
    if (onBookClick) {
      onBookClick();
    } else {
      window.location.hash = 'booking';
      const el = document.getElementById('booking');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="games" className="py-20 sm:py-28 bg-ink-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-block text-xs font-bold text-volt-500 tracking-widest uppercase mb-3 px-3 py-1 rounded-full bg-volt-500/10 border border-volt-500/30">
            PARK ATTRACTIONS
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white">
            10+ EXCITING <span className="text-volt-500">GAMES &amp; ACTIVITIES</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-ink-300 max-w-2xl mx-auto">
            From high-energy trampoline activities and adventure challenges to fun-filled kids zones, there's something for everyone.
          </p>

          {/* Category Filter Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {(['ALL', 'Trampoline', 'Adventure', 'Kids Soft Play'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  categoryFilter === cat
                    ? 'bg-volt-500 text-ink-950 shadow-md shadow-volt-500/20'
                    : 'bg-ink-900 border border-ink-800 text-ink-300 hover:text-white hover:bg-ink-800'
                }`}
              >
                {cat === 'ALL' ? `All Activities (${ACTIVITIES.length})` : `${cat} (${ACTIVITIES.filter(a => a.category === cat).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* 13 Games Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((activity) => (
            <div
              key={activity.id}
              className="group relative overflow-hidden rounded-3xl bg-ink-900 border border-ink-800 hover:border-volt-500/50 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-volt-500/5"
            >
              <div>
                {/* Real High-Res Photo */}
                <div className="relative h-56 overflow-hidden bg-ink-950">
                  <img
                    src={activity.image}
                    alt={activity.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-transparent to-transparent opacity-90" />
                  
                  {/* Category Pill on Image */}
                  <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-ink-950/80 backdrop-blur-md text-volt-400 border border-ink-700">
                    {activity.category}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-5 sm:p-6">
                  <h3 className="font-display font-black text-lg text-white mb-2 leading-snug group-hover:text-volt-400 transition-colors">
                    {activity.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-300 leading-relaxed line-clamp-2">
                    {activity.shortDescription}
                  </p>
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0">
                <button
                  onClick={() => setSelected(activity)}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-ink-950 hover:bg-volt-500 text-ink-200 hover:text-ink-950 text-xs font-bold border border-ink-800 hover:border-volt-500 transition-all"
                >
                  <span>VIEW DETAILS</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Details Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl bg-ink-900 border border-ink-700 shadow-2xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 z-10 inline-flex items-center justify-center w-10 h-10 rounded-full bg-ink-950/90 text-ink-300 hover:text-white border border-ink-700 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative h-64 sm:h-72 overflow-hidden rounded-t-3xl bg-ink-950">
              <img
                src={selected.image}
                alt={selected.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/30 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-volt-500 text-ink-950 inline-block mb-2">
                  {selected.category}
                </span>
                <h3 className="font-display font-black text-2xl sm:text-3xl text-white">
                  {selected.name}
                </h3>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <p className="text-ink-200 text-sm sm:text-base leading-relaxed">
                {selected.fullDescription}
              </p>

              <div className="rounded-2xl bg-ink-950 border border-ink-800 p-4">
                <div className="flex items-center gap-2 mb-1.5 text-volt-400">
                  <Shield className="h-4 w-4" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                    Safety &amp; Rules
                  </h4>
                </div>
                <p className="text-xs text-ink-400 leading-relaxed">
                  {selected.safetyInfo}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleBook}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-volt-500 hover:bg-volt-400 py-3.5 text-sm font-black text-ink-950 transition-all shadow-lg shadow-volt-500/20"
                >
                  <Calendar className="h-4 w-4" />
                  <span>BOOK YOUR SLOT FOR THIS ACTIVITY</span>
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="px-6 py-3.5 rounded-full bg-ink-950 hover:bg-ink-800 text-ink-300 text-sm font-bold border border-ink-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
