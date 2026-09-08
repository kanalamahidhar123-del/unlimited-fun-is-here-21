import { Instagram, Calendar, Sparkles, CheckCircle2, Flame } from 'lucide-react';
import { SITE } from '@/data/site';

export default function Offers() {
  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="offers"
      className="py-20 sm:py-28 bg-ink-900 relative overflow-hidden"
    >
      {/* Background glow accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-volt-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-flame-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-bold text-volt-500 tracking-widest uppercase mb-3">
            Offers &amp; Deals
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white">
            FOLLOW. PLAY. <span className="text-volt-500">SAVE.</span>
          </h2>
          <p className="mt-4 text-lg text-ink-300 max-w-2xl mx-auto">
            Follow our Instagram and enjoy exclusive discounts!
          </p>
        </div>

        {/* 3 Offer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* OFFER 1: Pre-Booking Offer */}
          <div className="relative rounded-3xl border border-ink-700 bg-ink-950 p-8 flex flex-col transition-all duration-300 hover:border-ink-600 hover:scale-[1.02]">
            <div className="inline-flex items-center gap-2 rounded-full bg-volt-500/10 border border-volt-500/30 px-3.5 py-1 text-xs font-semibold text-volt-400 w-fit mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              <span>PRE-BOOKING SPECIAL</span>
            </div>

            <h3 className="font-display font-black text-2xl lg:text-3xl text-white leading-snug">
              FOLLOW + PRE-BOOK = <span className="text-volt-500">15% OFF</span>
            </h3>

            <p className="mt-4 text-sm text-ink-300 leading-relaxed">
              Follow our Instagram account and pre-book your visit to get 15% OFF.
            </p>

            <div className="mt-6 space-y-2.5 bg-ink-900/70 border border-ink-800 rounded-2xl p-4 text-xs text-ink-300">
              <p className="font-semibold text-white uppercase tracking-wider text-[11px]">
                How to claim:
              </p>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-volt-500 flex-shrink-0 mt-0.5" />
                <span>1. Follow our Instagram account</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-volt-500 flex-shrink-0 mt-0.5" />
                <span>2. Complete your pre-booking online</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-ink-400 italic">
              * The 15% discount applies to eligible pre-bookings.
            </p>

            <button
              onClick={() => scrollTo('#booking')}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-volt-500 px-6 py-3 text-sm font-bold text-ink-950 hover:bg-volt-400 transition-all active:scale-95 shadow-md shadow-volt-500/20"
            >
              <Calendar className="h-4 w-4" />
              BOOK YOUR SLOT
            </button>
          </div>

          {/* OFFER 2: Second Visit Offer (Visually Prominent) */}
          <div className="relative rounded-3xl border-2 border-volt-500 bg-gradient-to-b from-volt-500/15 via-ink-950 to-ink-950 p-8 flex flex-col shadow-2xl shadow-volt-500/15 md:-translate-y-3 transition-all duration-300 hover:shadow-volt-500/25">
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-volt-500 to-volt-400 px-4 py-1.5 text-xs font-black tracking-wider text-ink-950 uppercase shadow-md flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-ink-950 fill-ink-950" />
              MAJOR PROMO
            </span>

            <div className="inline-flex items-center gap-2 rounded-full bg-volt-500/20 border border-volt-500/40 px-3.5 py-1 text-xs font-bold text-volt-400 w-fit mb-6 mt-1">
              <span>DOUBLE THE FUN</span>
            </div>

            <h3 className="font-display font-black text-2xl lg:text-3xl text-white leading-snug">
              SECOND VISIT = <span className="text-volt-500">50% OFF</span>
            </h3>

            <p className="mt-4 text-sm text-ink-200 leading-relaxed font-medium">
              After your first visit, get 50% OFF on your second visit.
            </p>

            <div className="mt-6 rounded-2xl bg-volt-500/10 border border-volt-500/30 p-4 text-center">
              <span className="font-display font-black text-3xl sm:text-4xl text-volt-400">
                SAVE 50%
              </span>
              <p className="text-xs text-ink-300 mt-1">
                Bring your ticket receipt or RFID check-in for half-price admission on your return!
              </p>
            </div>

            <button
              onClick={() => scrollTo('#booking')}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-volt-500 px-6 py-3.5 text-base font-extrabold text-ink-950 hover:bg-volt-400 transition-all active:scale-95 shadow-xl shadow-volt-500/30"
            >
              <Calendar className="h-4 w-4" />
              BOOK YOUR SLOT
            </button>
          </div>

          {/* OFFER 3: Follower Offer */}
          <div className="relative rounded-3xl border border-ink-700 bg-ink-950 p-8 flex flex-col transition-all duration-300 hover:border-ink-600 hover:scale-[1.02]">
            <div className="inline-flex items-center gap-2 rounded-full bg-volt-500/10 border border-volt-500/30 px-3.5 py-1 text-xs font-semibold text-volt-400 w-fit mb-6">
              <Instagram className="h-3.5 w-3.5" />
              <span>COMMUNITY REWARD</span>
            </div>

            <h3 className="font-display font-black text-2xl lg:text-3xl text-white leading-snug">
              FOLLOWERS GET <span className="text-volt-500">10% OFF</span>
            </h3>

            <p className="mt-4 text-sm text-ink-300 leading-relaxed">
              Our Instagram followers get 10% OFF on every visit.
            </p>

            <div className="mt-6 bg-ink-900/70 border border-ink-800 rounded-2xl p-4 text-xs text-ink-300">
              <p className="font-semibold text-white uppercase tracking-wider text-[11px] mb-1">
                How it works:
              </p>
              <p>
                Follow <span className="text-volt-400 font-semibold">{SITE.handle}</span> on Instagram and show your active follow status at the counter.
              </p>
            </div>

            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-flame-500 to-flame-600 px-6 py-3 text-sm font-bold text-white hover:from-flame-400 hover:to-flame-500 transition-all active:scale-95 shadow-md shadow-flame-500/20"
            >
              <Instagram className="h-4 w-4" />
              FOLLOW US ON INSTAGRAM
            </a>
          </div>
        </div>

        {/* Offer Terms */}
        <div className="mt-14 max-w-2xl mx-auto rounded-2xl bg-ink-950/60 border border-ink-800 p-5 text-center">
          <p className="text-xs font-semibold text-ink-300 mb-2 uppercase tracking-wider">
            Offer Terms &amp; Conditions
          </p>
          <ul className="text-xs text-ink-400 space-y-1">
            <li>• Offer terms and conditions apply.</li>
            <li>• Offers cannot be combined unless explicitly stated.</li>
            <li>• Eligibility may be verified at the park.</li>
            <li>• Management reserves the right to modify or withdraw offers.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

