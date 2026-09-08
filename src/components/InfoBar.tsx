import { MapPin, Clock, Calendar, Zap, Scale } from 'lucide-react';
import { SITE } from '@/data/site';

const items = [
  { icon: MapPin, label: SITE.city },
  { icon: Clock, label: SITE.hoursShort },
  { icon: Calendar, label: SITE.workingDays },
  { icon: Zap, label: `${SITE.activityCount} Exciting Activities` },
  { icon: Scale, label: `Weight Limit: Below ${SITE.weightLimit}` },
];

export default function InfoBar() {
  return (
    <section id="info-bar" className="bg-ink-900 border-y border-ink-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 py-5">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <item.icon className="h-5 w-5 text-volt-500 flex-shrink-0" />
              <span className="text-sm font-semibold text-ink-100">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
