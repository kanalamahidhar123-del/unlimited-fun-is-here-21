import { useState, useEffect } from 'react';

interface BrandIntroProps {
  onComplete: () => void;
}

export default function BrandIntro({ onComplete }: BrandIntroProps) {
  const [phase, setPhase] = useState<'entering' | 'holding' | 'exiting'>('entering');

  useEffect(() => {
    // Phase 1: Logo & brand scale/fade in smoothly (0ms -> 400ms)
    const holdTimer = setTimeout(() => {
      setPhase('holding');
    }, 400);

    // Phase 2: Hold for 600ms then start smooth fade-out (1000ms)
    const exitTimer = setTimeout(() => {
      setPhase('exiting');
    }, 1000);

    // Phase 3: Complete and remove intro (1300ms)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 1300);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink-950 transition-opacity duration-300 pointer-events-none select-none ${
        phase === 'exiting' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center px-4">
        {/* Brand Monogram Icon */}
        <div
          className={`mx-auto mb-5 h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-volt-400 to-volt-600 flex items-center justify-center text-ink-950 font-black text-2xl sm:text-3xl shadow-2xl shadow-volt-500/30 transition-all duration-700 ${
            phase === 'entering' ? 'scale-75 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          UF
        </div>

        {/* Brand Name */}
        <h1
          className={`font-display font-black text-3xl sm:text-5xl text-white tracking-tight transition-all duration-700 delay-100 ${
            phase === 'entering' ? 'translate-y-3 opacity-0' : 'translate-y-0 opacity-100'
          }`}
        >
          <span className="text-volt-500">UNLIMITED</span> FUN
        </h1>

        {/* Tagline */}
        <p
          className={`mt-2 font-mono text-xs sm:text-sm text-ink-300 tracking-widest uppercase transition-all duration-700 delay-200 ${
            phase === 'entering' ? 'translate-y-3 opacity-0' : 'translate-y-0 opacity-100'
          }`}
        >
          Bhimavaram's Indoor Adventure &amp; Fun Zone
        </p>

        {/* Subtle Accent Line */}
        <div
          className={`mt-5 mx-auto h-0.5 bg-gradient-to-r from-transparent via-volt-500 to-transparent transition-all duration-700 delay-300 ${
            phase === 'entering' ? 'w-0 opacity-0' : 'w-32 opacity-100'
          }`}
        />
      </div>
    </div>
  );
}
