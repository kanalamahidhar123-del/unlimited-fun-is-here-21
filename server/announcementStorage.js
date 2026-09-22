import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.resolve(DB_DIR, 'announcements_db.json');

function ensureDbFile() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      // Default initial announcements
      const initial = [
        {
          id: 'ann-1',
          title: 'Welcome to Unlimited Fun!',
          description: 'Experience Bhimavaram\'s premier trampoline park & soft play adventure zone with over 13+ exciting activities.',
          category: 'General',
          is_important: true,
          status: 'Published',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'ann-2',
          title: 'Weekend Booking Advice',
          description: 'Weekends fill up rapidly! Daily ticket limit is 50 entries. Pre-register your slots early to secure entry.',
          category: 'Notice',
          is_important: false,
          status: 'Published',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Error creating announcements database file:', err);
  }
}

export function getAllAnnouncements(includeDrafts = true) {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    const filtered = includeDrafts ? list : list.filter((item) => item.status === 'Published');
    return filtered.sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
  } catch (err) {
    console.error('Error reading announcements from server DB:', err);
    return [];
  }
}

export function saveAllAnnouncements(announcements) {
  ensureDbFile();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(announcements, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving announcements to server DB:', err);
    return false;
  }
}

export function addAnnouncement(item) {
  ensureDbFile();
  const list = getAllAnnouncements(true);
  const newItem = {
    id: item.id || `ann-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: item.title || '',
    description: item.description || '',
    category: item.category || 'General',
    is_important: Boolean(item.is_important),
    status: item.status || 'Published',
    created_at: item.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  list.unshift(newItem);
  saveAllAnnouncements(list);
  return newItem;
}

export function updateAnnouncement(id, updates) {
  ensureDbFile();
  const list = getAllAnnouncements(true);
  const index = list.findIndex((a) => a.id === id);
  if (index === -1) return null;

  list[index] = {
    ...list[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  saveAllAnnouncements(list);
  return list[index];
}

export function deleteAnnouncementById(id) {
  ensureDbFile();
  const list = getAllAnnouncements(true);
  const filtered = list.filter((a) => a.id !== id);
  if (filtered.length === list.length) return false;
  saveAllAnnouncements(filtered);
  return true;
}
