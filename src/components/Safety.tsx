import { Shield, Info } from 'lucide-react';

const rules = [
  'Follow staff instructions.',
  'Follow activity-specific rules.',
  'Use required safety equipment.',
  'Follow all park guidelines.',
  'Respect other visitors.',
  'Do not enter restricted areas.',
  'Participants must be below 120 kg.',
];

export default function Safety() {
  return (
    <section id="safety" className="py-20 sm:py-28 bg-ink-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-volt-500/20 mb-6">
            <Shield className="h-7 w-7 text-volt-500" />
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white">
            FUN WITH <span className="text-volt-500">SAFETY</span>
          </h2>
          <p className="mt-4 text-ink-400 max-w-2xl mx-auto">
            Your safety is our priority. Please follow these guidelines to
            ensure a great experience for everyone.
          </p>
        </div>

        <div className="rounded-2xl bg-ink-900 border border-ink-800 p-6 sm:p-8">
          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
            {rules.map((rule, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-volt-500/15 text-volt-500 text-xs font-bold">
                  {i + 1}
                </span>
                <span className="text-ink-200 leading-relaxed">{rule}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 pt-6 border-t border-ink-800 flex items-start gap-3">
            <Info className="h-5 w-5 text-ink-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-ink-400">
              Rules and requirements may vary depending on the activity.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
