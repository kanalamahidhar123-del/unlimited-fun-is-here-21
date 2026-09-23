import { useState } from 'react';
import {
  Calendar,
  Gamepad2,
  Tag,
  Gift,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { SITE } from '@/data/site';

interface HeroProps {
  onNavigate?: (viewId: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  const handleNav = (targetId: string) => {
    if (onNavigate) {
      onNavigate(targetId);
    } else {
      window.location.hash = targetId;
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Real Arena Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/trampoline-court.jpg"
          alt="Unlimited Fun Bhimavaram Arena"
          className="h-full w-full object-cover object-center scale-105"
          loading="eager"
        />
        {/* Dark contrast gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/95 via-ink-950/85 to-ink-950/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/40" />
      </div>

      {/* Main Hero Container */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl">
          {/* Top Location & Open Status Pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-volt-500/10 border border-volt-500/30 px-4 py-1.5 mb-6 text-xs sm:text-sm font-bold text-volt-400">
            <span className="h-2 w-2 rounded-full bg-volt-500 animate-pulse" />
            <span>NOW OPEN ALL 7 DAYS · 9:00 AM – 10:00 PM</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl leading-[1.05] text-white tracking-tight">
            UNLIMITED <span className="text-volt-500">FUN</span>
          </h1>

          {/* Tagline */}
          <p className="mt-3 text-lg sm:text-2xl font-bold text-ink-100">
            Bhimavaram's Indoor Adventure &amp; Fun Zone
          </p>

          <p className="mt-3 text-sm sm:text-base text-ink-300 max-w-xl leading-relaxed">
            Experience high-energy trampoline arenas, climbing walls, obstacle courses, sweeper games, and toddler discovery play zones.
          </p>

          {/* Key Quick Facts */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-ink-300">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-volt-500" />
              <span>{SITE.city}, Andhra Pradesh</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-volt-500" />
              <span>10+ Adventure Activities</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-volt-500" />
              <span>300 Slots Daily Capacity</span>
            </div>
          </div>

          {/* 4 COMMERCIAL ACTION HUB CARDS */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* 1. Book Slot CTA (Primary) */}
            <button
              onClick={() => handleNav('booking')}
              className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-volt-500 hover:bg-volt-400 text-ink-950 font-black text-left transition-all duration-200 shadow-xl shadow-volt-500/20 active:scale-95"
            >
              <div className="flex items-center justify-between mb-3">
                <Calendar className="h-6 w-6 text-ink-950" />
                <ArrowRight className="h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wider text-ink-900 font-bold opacity-80">
                  Reserve Now
                </span>
                <span className="text-sm sm:text-base font-black leading-tight block mt-0.5">
                  BOOK YOUR SLOT
                </span>
              </div>
            </button>

            {/* 2. View Prices CTA */}
            <button
              onClick={() => handleNav('pricing')}
              className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-ink-900/90 hover:bg-ink-800 border border-ink-700 hover:border-volt-500/50 text-white font-bold text-left transition-all duration-200 active:scale-95 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <Tag className="h-6 w-6 text-volt-400" />
                <ArrowRight className="h-4 w-4 text-ink-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wider text-ink-400 font-semibold">
                  From ₹200
                </span>
                <span className="text-sm sm:text-base font-black text-white leading-tight block mt-0.5">
                  VIEW PRICES
                </span>
              </div>
            </button>

            {/* 3. Explore Games CTA */}
            <button
              onClick={() => handleNav('games')}
              className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-ink-900/90 hover:bg-ink-800 border border-ink-700 hover:border-volt-500/50 text-white font-bold text-left transition-all duration-200 active:scale-95 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <Gamepad2 className="h-6 w-6 text-volt-400" />
                <ArrowRight className="h-4 w-4 text-ink-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wider text-ink-400 font-semibold">
                  10+ Activities
                </span>
                <span className="text-sm sm:text-base font-black text-white leading-tight block mt-0.5">
                  EXPLORE GAMES
                </span>
              </div>
            </button>

            {/* 4. View Offers CTA */}
            <button
              onClick={() => handleNav('offers')}
              className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-ink-900/90 hover:bg-ink-800 border border-ink-700 hover:border-volt-500/50 text-white font-bold text-left transition-all duration-200 active:scale-95 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <Gift className="h-6 w-6 text-volt-400" />
                <ArrowRight className="h-4 w-4 text-ink-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wider text-ink-400 font-semibold">
                  Special Deals
                </span>
                <span className="text-sm sm:text-base font-black text-white leading-tight block mt-0.5">
                  VIEW OFFERS
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
