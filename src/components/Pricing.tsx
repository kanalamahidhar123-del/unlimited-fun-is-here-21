import { Calendar, CreditCard, AlertTriangle } from 'lucide-react';
import { SITE } from '@/data/site';

interface PriceTier {
  duration: string;
  price: number;
  highlight?: boolean;
}

const trampolineTiers: PriceTier[] = [
  { duration: '30 Minutes', price: 300 },
  { duration: '1 Hour', price: 500 },
  { duration: '2 Hours', price: 850, highlight: true },
  { duration: '3 Hours', price: 1100 },
];

const softPlayTiers: PriceTier[] = [
  { duration: '30 Minutes', price: 200 },
  { duration: '1 Hour', price: 350 },
  { duration: '2 Hours', price: 600 },
  { duration: '3 Hours', price: 800 },
];

const rfidCards = [
  {
    name: 'Basic',
    price: 100,
    desc: 'Simple RFID card for your Unlimited Fun experience.',
  },
  {
    name: 'Premium',
    price: 500,
    desc: 'Premium RFID card for customers looking for a premium experience.',
  },
];

export default function Pricing() {
  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderCard = (tier: PriceTier, categoryName: string, i: number) => (
    <div
      key={i}
      className={`relative rounded-2xl border p-6 flex flex-col transition-all hover:scale-105 ${
        tier.highlight
          ? 'bg-gradient-to-b from-volt-500/15 to-ink-900 border-volt-500/50 shadow-lg shadow-volt-500/10'
          : 'bg-ink-900 border-ink-800 hover:border-ink-600'
      }`}
    >
      {tier.highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-volt-500 px-3 py-1 text-xs font-bold text-ink-950 shadow-sm">
          BEST VALUE
        </span>
      )}
      <p className="text-sm font-semibold text-ink-300 uppercase tracking-wide">
        {categoryName}
      </p>
      <p className="mt-1 text-xs font-medium text-ink-400">{tier.duration}</p>
      <div className="mt-4 mb-6">
        <span className="font-display font-black text-4xl text-white">
          ₹{tier.price.toLocaleString('en-IN')}
        </span>
      </div>
      <button
        onClick={() => scrollTo('#booking')}
        className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-volt-500 px-5 py-2.5 text-sm font-bold text-ink-950 hover:bg-volt-400 transition-all active:scale-95 shadow-md shadow-volt-500/20"
      >
        <Calendar className="h-4 w-4" />
        BOOK NOW
      </button>
    </div>
  );

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-ink-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-bold text-volt-500 tracking-widest uppercase mb-3">
            Pricing
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white">
            CHOOSE YOUR <span className="text-volt-500">FUN</span>
          </h2>
          <p className="mt-4 text-lg text-ink-400">
            Simple, transparent pricing for everyone.
          </p>
        </div>

        {/* Section 1: Trampoline Park */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8 pb-4 border-b border-ink-800">
            <div>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white flex items-center gap-2">
                <span>🏃</span> TRAMPOLINE PARK
              </h3>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-volt-500/10 border border-volt-500/30 px-3.5 py-1 text-xs sm:text-sm font-medium text-volt-400 w-fit">
              <span>Eligibility:</span>
              <span className="font-semibold text-white">
                5 years above OR 2.5 feet above
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trampolineTiers.map((tier, i) =>
              renderCard(tier, 'Trampoline Park', i)
            )}
          </div>
        </div>

        {/* Section 2: Soft Play */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8 pb-4 border-b border-ink-800">
            <div>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white flex items-center gap-2">
                <span>🧸</span> SOFT PLAY
              </h3>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-volt-500/10 border border-volt-500/30 px-3.5 py-1 text-xs sm:text-sm font-medium text-volt-400 w-fit">
              <span>Eligibility:</span>
              <span className="font-semibold text-white">
                5 years below OR 2.5 feet below
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {softPlayTiers.map((tier, i) => renderCard(tier, 'Soft Play', i))}
          </div>
        </div>

        {/* Section 3: RFID Cards */}
        <div className="mb-14">
          <div className="text-center mb-8 pb-4 border-b border-ink-800 max-w-xl mx-auto">
            <h3 className="font-display font-black text-2xl sm:text-3xl text-white flex items-center justify-center gap-2">
              <span>💳</span> RFID CARDS
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-ink-400">
              Required for park entry, digital check-in, and locker access.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {rfidCards.map((card, i) => (
              <div
                key={i}
                className="relative rounded-2xl border border-ink-800 bg-ink-900 p-6 flex flex-col transition-all hover:border-ink-600 hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold uppercase tracking-wider text-ink-300">
                    {card.name} Card
                  </span>
                  <CreditCard className="h-5 w-5 text-volt-500" />
                </div>
                <div className="my-4">
                  <span className="font-display font-black text-3xl sm:text-4xl text-white">
                    ₹{card.price.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-xs text-ink-400 mb-6 leading-relaxed">
                  {card.desc}
                </p>
                <button
                  onClick={() => scrollTo('#rfid-cards')}
                  className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-volt-500/20 border border-volt-500/50 px-5 py-2 text-sm font-bold text-volt-400 hover:bg-volt-500 hover:text-ink-950 transition-all active:scale-95"
                >
                  <CreditCard className="h-4 w-4" />
                  BOOK RFID CARD
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Important Pricing Note */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-2.5 rounded-full bg-ink-900/90 border border-ink-800 px-5 py-2.5 text-ink-300 text-xs sm:text-sm font-medium shadow-sm">
            <AlertTriangle className="h-4 w-4 text-volt-500 flex-shrink-0" />
            <span>⚠️ Participants must be below {SITE.weightLimit}.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
