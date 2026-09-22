import { useState, useEffect } from 'react';
import {
  Bell,
  Sparkles,
  Calendar,
  Clock,
  Tag,
  AlertCircle,
  Megaphone,
} from 'lucide-react';
import {
  getPublishedAnnouncements,
  fetchAnnouncementsFromServer,
  getCategoryBadge,
  type Announcement,
  type AnnouncementCategory,
} from '@/lib/announcementStore';

const CATEGORIES: ('ALL' | AnnouncementCategory)[] = [
  'ALL',
  'Offers',
  'Events',
  'Holiday',
  'Timing',
  'Notice',
  'General',
];

export default function LatestInfo() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(getPublishedAnnouncements());
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | AnnouncementCategory>('ALL');

  const loadData = async () => {
    // Read local cache immediately
    setAnnouncements(getPublishedAnnouncements());
    // Fetch from backend server
    try {
      const serverList = await fetchAnnouncementsFromServer();
      setAnnouncements(serverList.filter((a) => a.is_published !== false));
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('unlimited_fun_announcements_updated', handleUpdate);
    return () => {
      window.removeEventListener('unlimited_fun_announcements_updated', handleUpdate);
    };
  }, []);

  const filtered = announcements.filter((a) => {
    if (selectedCategory !== 'ALL' && a.category !== selectedCategory) return false;
    return true;
  });

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <section id="latest-info" className="py-20 sm:py-28 bg-ink-900/50 border-t border-b border-ink-800/80 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-volt-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-volt-500/10 border border-volt-500/30 text-volt-400 text-xs font-bold tracking-widest uppercase mb-4">
            <Megaphone className="h-3.5 w-3.5" />
            <span>LATEST ANNOUNCEMENTS & NOTICES</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
            KNOW <span className="text-volt-500">LATEST INFO</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-ink-300">
            Stay up to date with special holiday schedules, exciting events, exclusive discounts, and live park updates.
          </p>

          {/* Category Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-volt-500 text-ink-950 shadow-md shadow-volt-500/20'
                    : 'bg-ink-900 border border-ink-800 text-ink-300 hover:text-white hover:bg-ink-800'
                }`}
              >
                {cat === 'ALL' ? 'All Updates' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Announcements List / Grid */}
        {filtered.length === 0 ? (
          <div className="max-w-md mx-auto text-center p-8 rounded-3xl bg-ink-900 border border-ink-800 text-ink-400">
            <Bell className="h-10 w-10 mx-auto text-ink-500 mb-3" />
            <p className="font-bold text-white text-base">No announcements in this category</p>
            <p className="text-xs mt-1">Check back later or view all updates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => {
              const badge = getCategoryBadge(item.category);
              return (
                <div
                  key={item.id}
                  className={`group relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
                    item.is_important
                      ? 'bg-gradient-to-b from-ink-900 to-ink-950 border-2 border-volt-500/60 shadow-xl shadow-volt-500/10 hover:border-volt-400'
                      : 'bg-ink-900/90 border border-ink-800 hover:border-ink-700 hover:bg-ink-900 shadow-lg'
                  }`}
                >
                  <div>
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.badgeClass}`}
                      >
                        <span>{badge.icon}</span>
                        <span>{badge.label}</span>
                      </span>

                      {item.is_important && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-volt-500 text-ink-950 shadow-sm animate-pulse">
                          <Sparkles className="h-3 w-3" />
                          IMPORTANT
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-display font-black text-lg sm:text-xl text-white mb-3 group-hover:text-volt-400 transition-colors leading-snug">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-ink-300 text-sm leading-relaxed whitespace-pre-line mb-6">
                      {item.description}
                    </p>
                  </div>

                  {/* Footer Meta */}
                  <div className="pt-4 border-t border-ink-800 flex items-center justify-between text-xs text-ink-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-volt-500" />
                      {formatDate(item.updated_at || item.created_at)}
                    </span>
                    <span className="text-[11px] text-ink-500">Unlimited Fun</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
