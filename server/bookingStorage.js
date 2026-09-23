import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.resolve(DB_DIR, 'bookings_db.json');

function ensureDbFile() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Error creating database file:', err);
  }
}

export function getAllBookings() {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
  } catch (err) {
    console.error('Error reading bookings from server DB:', err);
    return [];
  }
}

export function saveAllBookings(bookings) {
  ensureDbFile();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(bookings, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving bookings to server DB:', err);
    return false;
  }
}

export function addBooking(booking) {
  ensureDbFile();
  const list = getAllBookings();
  const filtered = list.filter((b) => b.booking_id !== booking.booking_id && b.id !== booking.id);
  filtered.unshift(booking);
  saveAllBookings(filtered);
  return booking;
}

export function updateBooking(id, updates) {
  ensureDbFile();
  const list = getAllBookings();
  const index = list.findIndex((b) => b.id === id || b.booking_id === id);
  if (index === -1) return null;

  list[index] = { ...list[index], ...updates };
  saveAllBookings(list);
  return list[index];
}

export function deleteBookingById(id) {
  ensureDbFile();
  const list = getAllBookings();
  const filtered = list.filter((b) => b.id !== id && b.booking_id !== id);
  if (filtered.length === list.length) return false;
  saveAllBookings(filtered);
  return true;
}

export const DAILY_CAPACITY = 300;

export function getDateBookingCount(dateStr) {
  if (!dateStr) return 0;
  const list = getAllBookings();
  // Count active/confirmed bookings (exclude cancelled)
  return list.filter(
    (b) => b.visit_date === dateStr && b.booking_status !== 'Cancelled' && b.payment_status !== 'Failed'
  ).length;
}

export function isDateFull(dateStr) {
  return getDateBookingCount(dateStr) >= DAILY_CAPACITY;
}

export function getNextAvailableDate(startDateStr) {
  const start = startDateStr ? new Date(startDateStr) : new Date();
  const current = new Date(start);
  
  // Search up to 60 days ahead
  for (let i = 0; i < 60; i++) {
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    if (!isDateFull(dateStr)) {
      return {
        dateStr,
        formatted: current.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        booked: getDateBookingCount(dateStr),
        remaining: Math.max(0, DAILY_CAPACITY - getDateBookingCount(dateStr)),
      };
    }
    current.setDate(current.getDate() + 1);
  }
  return null;
}

export function getCapacitySummary(daysCount = 14) {
  const result = [];
  const current = new Date();

  for (let i = 0; i < daysCount; i++) {
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const booked = getDateBookingCount(dateStr);
    const remaining = Math.max(0, DAILY_CAPACITY - booked);
    const isFull = booked >= DAILY_CAPACITY;

    result.push({
      date: dateStr,
      formattedDate: current.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
      weekday: current.toLocaleDateString('en-US', { weekday: 'short' }),
      capacity: DAILY_CAPACITY,
      booked,
      remaining,
      status: isFull ? 'FULL' : 'Available',
      isFull,
      isToday: i === 0,
    });

    current.setDate(current.getDate() + 1);
  }

  return result;
}

export function clearBookingsDb() {
  ensureDbFile();
  return saveAllBookings([]);
}
