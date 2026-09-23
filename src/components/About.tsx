import React from 'react';
import { Users, Heart, Trophy, Sparkles, Award, ShieldCheck, MapPin, Star } from 'lucide-react';
import { SITE } from '@/data/site';

const features = [
  {
    icon: Users,
    title: 'For Everyone',
    text: 'Children, teenagers, adults, families, and groups — there is something for every age and energy level.',
  },
  {
    icon: Trophy,
    title: 'Friendly Competition',
    text: 'Challenge your friends and family across 10+ exciting activities designed for active jumping and obstacle fun.',
  },
  {
    icon: Heart,
    title: 'Family Fun & Memories',
    text: 'Create unforgettable memories together in a safe, energetic, and fully air-conditioned indoor environment.',
  },
  {
    icon: Sparkles,
    title: 'Laser Glow Ambience',
    text: 'Immerse in dynamic multi-color laser lighting, high-energy music, and neon glow arena sessions.',
  },
];

export default function About() {
  return (
    <section id="about" className="py-16 sm:py-24 bg-ink-950 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-volt-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Experience Grid */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-20">
          <div>
            <span className="inline-block text-xs font-bold text-volt-500 tracking-widest uppercase mb-3 px-3.5 py-1 rounded-full bg-volt-500/10 border border-volt-500/30">
              ABOUT UNLIMITED FUN
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
              BHIMAVARAM'S PREMIER
              <br />
              <span className="text-volt-500">INDOOR ADVENTURE ZONE</span>
            </h2>
            <p className="mt-6 text-base sm:text-lg text-ink-300 leading-relaxed">
              Unlimited Fun is Bhimavaram’s ultimate indoor trampoline and adventure park designed for kids, teenagers, adults, and families. We combine active sports, high-flying trampoline courts, obstacle runs, and sensory toddler discovery zones under one roof.
            </p>
            <p className="mt-4 text-sm sm:text-base text-ink-400 leading-relaxed">
              Whether you are scaling our superhero climbing wall, soaring on the main trampoline court, celebrating a birthday bash, or challenging colleagues in a group private slot — Unlimited Fun delivers pure energy and lasting smiles.
            </p>

            <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold text-ink-300">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-ink-900 border border-ink-800">
                <MapPin className="w-4 h-4 text-volt-500" />
                <span>{SITE.city}, Andhra Pradesh</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-ink-900 border border-ink-800">
                <ShieldCheck className="w-4 h-4 text-volt-500" />
                <span>Safety-First Certified Equipment</span>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl bg-ink-900/90 border border-ink-800 p-6 hover:border-volt-500/40 transition-all hover:bg-ink-800 hover:scale-[1.02] shadow-md"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-volt-500/10 group-hover:bg-volt-500/20 text-volt-500 transition-colors mb-4">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display font-bold text-base sm:text-lg text-white mb-2 group-hover:text-volt-400 transition-colors">
                  {f.title}
                </h3>
                <p className="text-xs sm:text-sm text-ink-400 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 22. THE PEOPLE BEHIND UNLIMITED FUN (FOUNDER / CO-FOUNDER) */}
        <div className="mt-16 pt-12 border-t border-ink-800/80">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-block text-xs font-bold text-volt-500 tracking-widest uppercase mb-2 px-3 py-0.5 rounded-full bg-volt-500/10 border border-volt-500/30">
              LEADERSHIP &amp; VISION
            </span>
            <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white">
              THE PEOPLE BEHIND <span className="text-volt-500">UNLIMITED FUN</span>
            </h3>
            <p className="text-xs sm:text-sm text-ink-400 mt-2">
              Passionate about bringing world-class indoor recreation and active family entertainment to Bhimavaram.
            </p>
          </div>

          {/* Founder Card with subtle entrance animation */}
          <div className="max-w-md mx-auto">
            <div className="group relative rounded-3xl bg-gradient-to-b from-ink-900 via-ink-900 to-ink-950 border border-ink-800 hover:border-volt-500/50 p-8 text-center transition-all duration-300 hover:scale-[1.03] shadow-2xl hover:shadow-volt-500/10 animate-in fade-in slide-in-from-bottom-4">
              {/* Decorative Glow Icon */}
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-volt-400 to-volt-600 text-ink-950 font-black flex items-center justify-center text-2xl shadow-xl shadow-volt-500/25 mb-5 group-hover:rotate-6 transition-transform">
                <Award className="w-8 h-8 text-ink-950" />
              </div>

              <span className="inline-block text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-volt-500/10 text-volt-400 border border-volt-500/30 mb-2">
                FOUNDER &amp; CO-FOUNDER
              </span>

              <h4 className="font-display font-black text-2xl sm:text-3xl text-white mt-1 group-hover:text-volt-400 transition-colors">
                Gelli Bala Krishna
              </h4>

              <p className="text-xs text-ink-400 mt-3 leading-relaxed">
                Dedicated to pioneering healthy entertainment, trampoline sports, and unforgettable celebration experiences for families across the region.
              </p>

              <div className="mt-6 pt-5 border-t border-ink-800/80 flex items-center justify-center gap-1.5 text-xs text-ink-300">
                <Star className="w-3.5 h-3.5 text-volt-500 fill-volt-500" />
                <span>Unlimited Fun · Bhimavaram Zone</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
