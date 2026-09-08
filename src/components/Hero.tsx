import { useEffect, useState } from 'react';
import { Calendar, MapPin, ChevronDown, Sparkles } from 'lucide-react';
import { SITE } from '@/data/site';

function useCountdown(target: string) {
  const [diff, setDiff] = useState<number>(() =>
    Date.parse(target) - Date.now()
  );
  useEffect(() => {
    const id = setInterval(() => {
      setDiff(Date.parse(target) - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [target]);
  return diff;
}

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, '0');
}

export default function Hero() {
  const targetISO = `${SITE.openingDate}T12:00:00+05:30`;
  const diff = useCountdown(targetISO);
  const isOpen = diff <= 0;

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/trampoline-court.jpg"
          alt="Vibrant indoor trampoline court arena at Unlimited Fun Bhimavaram"
          className="h-full w-full object-cover object-center"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/90 via-ink-950/60 to-ink-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 w-full">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-volt-500/15 border border-volt-500/30 px-4 py-1.5 mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4 text-volt-500" />
            <span className="text-sm font-semibold text-volt-400">
              {isOpen ? 'NOW OPEN' : `OPENING ${new Date(SITE.openingDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long' }).toUpperCase()}`}
            </span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl leading-[1.05] text-white animate-fade-up">
            UNLIMITED FUN
            <br />
            <span className="text-volt-500">IS HERE!</span>
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-ink-200 max-w-xl animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Bhimavaram's ultimate indoor adventure &amp; fun zone.
          </p>

          <div className="mt-4 flex items-center gap-2 text-ink-300 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <MapPin className="h-5 w-5 text-volt-500" />
            <span className="text-sm font-medium">{SITE.city}, {SITE.region}</span>
          </div>

          {/* Countdown or Now Open */}
          {!isOpen ? (
            <div className="mt-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <p className="text-sm font-semibold text-ink-300 mb-3">
                Opening at {SITE.openingTime} — Countdown:
              </p>
              <div className="flex gap-3 sm:gap-4">
                {[
                  { label: 'Days', value: days },
                  { label: 'Hours', value: hours },
                  { label: 'Mins', value: minutes },
                  { label: 'Secs', value: seconds },
                ].map((unit) => (
                  <div
                    key={unit.label}
                    className="flex flex-col items-center rounded-xl bg-ink-900/80 backdrop-blur border border-ink-700 px-3 py-2.5 sm:px-5 sm:py-3 min-w-[64px] sm:min-w-[80px]"
                  >
                    <span className="font-display font-black text-2xl sm:text-3xl text-volt-500 tabular-nums">
                      {pad(unit.value)}
                    </span>
                    <span className="text-[10px] sm:text-xs font-semibold text-ink-300 uppercase tracking-wide mt-1">
                      {unit.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="inline-flex items-center gap-2 rounded-xl bg-volt-500/20 border border-volt-500/40 px-5 py-3">
                <span className="font-display font-black text-xl text-volt-400">NOW OPEN</span>
                <span className="text-ink-300 text-sm">· {SITE.hours}</span>
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 animate-fade-up" style={{ animationDelay: '0.25s' }}>
            <button
              onClick={() => scrollTo('#booking')}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-volt-500 px-7 py-3.5 text-base font-bold text-ink-950 hover:bg-volt-400 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-volt-500/20"
            >
              <Calendar className="h-5 w-5" />
              BOOK YOUR SLOT
            </button>
            <button
              onClick={() => scrollTo('#games')}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/20 bg-white/5 backdrop-blur px-7 py-3.5 text-base font-bold text-white hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
            >
              EXPLORE GAMES
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() => scrollTo('#info-bar')}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-ink-300 hover:text-volt-500 transition-colors animate-float"
        aria-label="Scroll down"
      >
        <ChevronDown className="h-7 w-7" />
      </button>
    </section>
  );
}
