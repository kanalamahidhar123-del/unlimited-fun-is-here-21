export type AnnouncementCategory =
  | 'Offers'
  | 'Events'
  | 'Holiday'
  | 'Timing'
  | 'Notice'
  | 'General';

export interface Announcement {
  id: string;
  title: string;
  description: string;
  category: AnnouncementCategory;
  is_important: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = 'unlimited_fun_announcements';

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: '🎉 Grand Opening & Unlimited Fun Experience!',
    description:
      'Welcome to Unlimited Fun at Bhimavaram! Book your trampoline and soft play slots in advance. Maximum 50 slots available daily.',
    category: 'General',
    is_important: true,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ann-2',
    title: '⏰ Daily Operating Hours',
    description:
      'We are open all 7 days from 9:00 AM to 10:00 PM. Special birthday party bookings and group discounts available on inquiry!',
    category: 'Timing',
    is_important: false,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ann-3',
    title: '🎟️ Daily 50-Ticket Booking Capacity',
    description:
      'To ensure top safety and a premier jumping experience, daily capacity is capped at 50 bookings. If a date is fully booked, next nearest available dates will be suggested.',
    category: 'Notice',
    is_important: true,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function getAnnouncements(): Announcement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ANNOUNCEMENTS));
      return DEFAULT_ANNOUNCEMENTS;
    }
    const list: Announcement[] = JSON.parse(raw);
    return list.sort((a, b) => {
      if (a.is_important && !b.is_important) return -1;
      if (!a.is_important && b.is_important) return 1;
      return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
    });
  } catch (e) {
    console.error('Failed to load announcements from storage', e);
    return DEFAULT_ANNOUNCEMENTS;
  }
}

export function getPublishedAnnouncements(): Announcement[] {
  return getAnnouncements().filter((a) => a.is_published !== false);
}

export async function fetchAnnouncementsFromServer(): Promise<Announcement[]> {
  try {
    const res = await fetch('/api/announcements');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const serverList: Announcement[] = json.data;
        if (serverList.length > 0) {
          saveAnnouncements(serverList);
          return serverList;
        }
      }
    }
  } catch (e) {
    // server API might be unavailable in static deploy, fallback silently to local
  }
  return getAnnouncements();
}

export function saveAnnouncements(announcements: Announcement[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(announcements));
    window.dispatchEvent(new Event('unlimited_fun_announcements_updated'));
  } catch (e) {
    console.error('Failed to save announcements to storage', e);
  }
}

export async function createAnnouncement(
  input: Omit<Announcement, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
  }
): Promise<Announcement> {
  const now = new Date().toISOString();
  const newAnnouncement: Announcement = {
    id: input.id || `ann-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category || 'General',
    is_important: Boolean(input.is_important),
    is_published: input.is_published !== false,
    created_at: now,
    updated_at: now,
  };

  const list = getAnnouncements();
  list.unshift(newAnnouncement);
  saveAnnouncements(list);

  try {
    fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAnnouncement),
    }).catch((e) => console.warn('Server announcement dispatch notice:', e));
  } catch (e) {
    // ignore
  }

  return newAnnouncement;
}

export async function updateAnnouncement(
  id: string,
  data: Partial<Omit<Announcement, 'id' | 'created_at'>>
): Promise<boolean> {
  const list = getAnnouncements();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return false;

  list[idx] = {
    ...list[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };

  saveAnnouncements(list);

  try {
    fetch('/api/announcements/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    }).catch((e) => console.warn('Server announcement update notice:', e));
  } catch (e) {
    // ignore
  }

  return true;
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  const list = getAnnouncements();
  const filtered = list.filter((a) => a.id !== id);
  if (filtered.length === list.length) return false;

  saveAnnouncements(filtered);

  try {
    fetch('/api/announcements/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch((e) => console.warn('Server announcement delete notice:', e));
  } catch (e) {
    // ignore
  }

  return true;
}

export function getCategoryBadge(category: AnnouncementCategory): {
  label: string;
  badgeClass: string;
  icon: string;
} {
  switch (category) {
    case 'Offers':
      return {
        label: 'Special Offer',
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        icon: '🏷️',
      };
    case 'Events':
      return {
        label: 'Event',
        badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        icon: '🎉',
      };
    case 'Holiday':
      return {
        label: 'Holiday Notice',
        badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        icon: '🏖️',
      };
    case 'Timing':
      return {
        label: 'Timing Update',
        badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
        icon: '⏰',
      };
    case 'Notice':
      return {
        label: 'Important Notice',
        badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        icon: '⚠️',
      };
    default:
      return {
        label: 'General Info',
        badgeClass: 'bg-volt-500/10 text-volt-400 border-volt-500/30',
        icon: '📢',
      };
  }
}
