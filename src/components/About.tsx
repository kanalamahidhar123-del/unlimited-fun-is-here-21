import { Users, Heart, Trophy, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'For Everyone',
    text: 'Children, teenagers, adults, families and groups — there is something for every age and energy level.',
  },
  {
    icon: Trophy,
    title: 'Friendly Competition',
    text: 'Challenge your friends and family across 13 exciting activities designed for active fun.',
  },
  {
    icon: Heart,
    title: 'Family Fun',
    text: 'Create unforgettable memories together in a safe, energetic indoor environment.',
  },
  {
    icon: Sparkles,
    title: 'Memorable Experiences',
    text: 'Every visit is packed with adventure, excitement and moments worth remembering.',
  },
];

export default function About() {
  return (
    <section id="about" className="py-20 sm:py-28 bg-ink-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <span className="inline-block text-sm font-bold text-volt-500 tracking-widest uppercase mb-3">
              The Experience
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
              THE ULTIMATE
              <br />
              <span className="text-volt-500">FUN EXPERIENCE</span>
            </h2>
            <p className="mt-6 text-lg text-ink-300 leading-relaxed">
              Unlimited Fun is an indoor trampoline and adventure destination in
              Bhimavaram designed for children, teenagers, adults, families and
              groups. We bring together active entertainment, adventure and
              friendly competition under one roof.
            </p>
            <p className="mt-4 text-base text-ink-400 leading-relaxed">
              Whether you are looking to challenge yourself on the climbing wall,
              soar across the main trampoline court, or celebrate a special day
              with friends — Unlimited Fun is where memories are made.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl bg-ink-900 border border-ink-800 p-6 hover:border-volt-500/40 transition-all hover:bg-ink-800"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-volt-500/10 group-hover:bg-volt-500/20 transition-colors mb-4">
                  <f.icon className="h-6 w-6 text-volt-500" />
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-ink-400 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
