import { useState } from 'react';
import { ArrowRight, X, Shield, Calendar } from 'lucide-react';
import { ACTIVITIES, type Activity } from '@/data/activities';

export default function Games() {
  const [selected, setSelected] = useState<Activity | null>(null);

  const scrollTo = (href: string) => {
    setSelected(null);
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <section id="games" className="py-20 sm:py-28 bg-ink-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block text-sm font-bold text-volt-500 tracking-widest uppercase mb-3">
            Games &amp; Activities
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white">
            13 EXCITING <span className="text-volt-500">GAMES &amp; ACTIVITIES</span>
          </h2>
          <p className="mt-4 text-lg text-ink-400 max-w-2xl mx-auto">
            From trampolines to climbing walls, every activity is designed for
            maximum fun and adventure.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ACTIVITIES.map((activity) => (
            <div
              key={activity.id}
              className="group relative overflow-hidden rounded-2xl bg-ink-800 border border-ink-700 hover:border-volt-500/40 transition-all"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={activity.image}
                  alt={activity.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-800 via-ink-800/20 to-transparent" />
              </div>
              <div className="p-5">
                <h3 className="font-display font-bold text-base text-white mb-2 leading-snug">
                  {activity.name}
                </h3>
                <p className="text-sm text-ink-400 leading-relaxed mb-4 line-clamp-2">
                  {activity.shortDescription}
                </p>
                <button
                  onClick={() => setSelected(activity)}
                  className="inline-flex items-center gap-2 text-sm font-bold text-volt-500 hover:text-volt-400 transition-colors group/btn"
                >
                  VIEW ACTIVITY
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </div>
          ))}

          {/* Placeholder card for remaining activities */}
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-600 p-8 text-center min-h-[280px]">
            <p className="text-ink-400 font-semibold mb-2">More Activities Coming Soon</p>
            <p className="text-sm text-ink-500">
              We have {13 - ACTIVITIES.length} more exciting activities to reveal.
              Stay tuned!
            </p>
          </div>
        </div>
      </div>

      {/* Activity Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-ink-800 border border-ink-700 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 z-10 inline-flex items-center justify-center w-10 h-10 rounded-full bg-ink-900/80 text-ink-300 hover:text-white hover:bg-ink-700 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative h-64 sm:h-80 overflow-hidden rounded-t-2xl">
              <img
                src={selected.image}
                alt={selected.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-800 to-transparent" />
              <h3 className="absolute bottom-4 left-5 right-5 font-display font-black text-xl sm:text-2xl text-white">
                {selected.name}
              </h3>
            </div>
            <div className="p-6">
              <p className="text-ink-300 leading-relaxed mb-6">
                {selected.fullDescription}
              </p>
              <div className="rounded-xl bg-ink-900/60 border border-ink-700 p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-volt-500" />
                  <h4 className="font-bold text-white text-sm">Safety Information</h4>
                </div>
                <p className="text-sm text-ink-400 leading-relaxed">
                  {selected.safetyInfo}
                </p>
              </div>
              <button
                onClick={() => scrollTo('#booking')}
                className="inline-flex items-center gap-2 rounded-full bg-volt-500 px-6 py-3 text-sm font-bold text-ink-950 hover:bg-volt-400 transition-all hover:scale-105 active:scale-95 w-full justify-center"
              >
                <Calendar className="h-5 w-5" />
                BOOK YOUR SLOT
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
