import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAllBookings, getDateBookingCount } from './bookingStorage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.resolve(DB_DIR, 'booking_dates_db.json');

export const DAILY_CAPACITY = 300;

function getDefaultConfig() {
  const current = new Date();
  const openedMonths = [];
  // Open current month + next 5 months by default
  for (let i = 0; i < 6; i++) {
    const d = new Date(current.getFullYear(), current.getMonth() + i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    openedMonths.push(`${yyyy}-${mm}`);
  }

  return {
    dailyCapacity: DAILY_CAPACITY,
    openedMonths,
    closedDates: [],
    customOpenedDates: [],
    customCapacities: {},
    updatedAt: new Date().toISOString(),
  };
}

function ensureDbFile() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(getDefaultConfig(), null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Error creating date management database file:', err);
  }
}

export function getDateConfig() {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const data = JSON.parse(raw);
    if (!data.openedMonths) data.openedMonths = [];
    if (!data.closedDates) data.closedDates = [];
    if (!data.customOpenedDates) data.customOpenedDates = [];
    if (!data.customCapacities) data.customCapacities = {};
    return data;
  } catch (err) {
    console.error('Error reading date config from DB:', err);
    return getDefaultConfig();
  }
}

export function saveDateConfig(config) {
  ensureDbFile();
  try {
    config.updatedAt = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving date config to DB:', err);
    return false;
  }
}

export function isDateOpen(dateStr) {
  if (!dateStr) return false;
  const config = getDateConfig();
  
  // If explicitly closed/blocked by admin
  if (config.closedDates.includes(dateStr)) {
    return false;
  }

  // If explicitly opened
  if (config.customOpenedDates.includes(dateStr)) {
    return true;
  }

  // Check if its month is in openedMonths
  const yearMonth = dateStr.slice(0, 7);
  return config.openedMonths.includes(yearMonth);
}

export function getDateDetails(dateStr) {
  if (!dateStr) return null;
  const config = getDateConfig();
  const capacity = config.customCapacities[dateStr] || config.dailyCapacity || DAILY_CAPACITY;
  const booked = getDateBookingCount(dateStr);
  const remaining = Math.max(0, capacity - booked);
  const isOpen = isDateOpen(dateStr);
  const isFull = booked >= capacity;

  let status = 'AVAILABLE';
  if (!isOpen) {
    status = 'CLOSED';
  } else if (isFull) {
    status = 'FULL';
  }

  return {
    date: dateStr,
    capacity,
    booked,
    remaining,
    isOpen,
    isFull,
    status, // 'AVAILABLE' | 'FULL' | 'CLOSED'
  };
}

export function openMonth(yearMonth) {
  const config = getDateConfig();
  if (!config.openedMonths.includes(yearMonth)) {
    config.openedMonths.push(yearMonth);
    config.openedMonths.sort();
  }
  // Remove any closed dates in that month if admin opens the whole month
  config.closedDates = config.closedDates.filter((d) => !d.startsWith(yearMonth));
  saveDateConfig(config);
  return config;
}

export function closeMonth(yearMonth) {
  const config = getDateConfig();
  config.openedMonths = config.openedMonths.filter((m) => m !== yearMonth);
  config.customOpenedDates = config.customOpenedDates.filter((d) => !d.startsWith(yearMonth));
  saveDateConfig(config);
  return config;
}

export function setDateStatus(dateStr, status) {
  const config = getDateConfig();
  if (status === 'CLOSED') {
    if (!config.closedDates.includes(dateStr)) {
      config.closedDates.push(dateStr);
    }
    config.customOpenedDates = config.customOpenedDates.filter((d) => d !== dateStr);
  } else {
    // OPEN
    config.closedDates = config.closedDates.filter((d) => d !== dateStr);
    if (!config.customOpenedDates.includes(dateStr)) {
      config.customOpenedDates.push(dateStr);
    }
  }
  saveDateConfig(config);
  return getDateDetails(dateStr);
}

export function setBulkDatesStatus(datesArray, status) {
  const config = getDateConfig();
  if (status === 'CLOSED') {
    datesArray.forEach((dateStr) => {
      if (!config.closedDates.includes(dateStr)) {
        config.closedDates.push(dateStr);
      }
      config.customOpenedDates = config.customOpenedDates.filter((d) => d !== dateStr);
    });
  } else {
    datesArray.forEach((dateStr) => {
      config.closedDates = config.closedDates.filter((d) => d !== dateStr);
      if (!config.customOpenedDates.includes(dateStr)) {
        config.customOpenedDates.push(dateStr);
      }
    });
  }
  saveDateConfig(config);
  return config;
}

export function getMonthCalendarView(year, month) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const mm = String(month).padStart(2, '0');
  const days = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dd = String(d).padStart(2, '0');
    const dateStr = `${year}-${mm}-${dd}`;
    const details = getDateDetails(dateStr);
    const dateObj = new Date(year, month - 1, d);
    days.push({
      ...details,
      dayNumber: d,
      weekday: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
      formattedDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    });
  }

  const yearMonth = `${year}-${mm}`;
  const config = getDateConfig();
  const isMonthOpen = config.openedMonths.includes(yearMonth);

  return {
    year,
    month,
    yearMonth,
    isMonthOpen,
    days,
  };
}

export function getNextAvailableOpenDates(startDateStr, limit = 5) {
  const start = startDateStr ? new Date(startDateStr) : new Date();
  const results = [];
  const current = new Date(start);

  for (let i = 0; i < 90 && results.length < limit; i++) {
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const details = getDateDetails(dateStr);
    if (details.isOpen && !details.isFull) {
      results.push({
        dateStr,
        formatted: current.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        booked: details.booked,
        remaining: details.remaining,
        capacity: details.capacity,
      });
    }
    current.setDate(current.getDate() + 1);
  }

  return results;
}

export function getAdminDateSummary() {
  const todayObj = new Date();
  const yyyy = todayObj.getFullYear();
  const mm = String(todayObj.getMonth() + 1).padStart(2, '0');
  const dd = String(todayObj.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const tomorrowObj = new Date(todayObj);
  tomorrowObj.setDate(todayObj.getDate() + 1);
  const tomYyyy = tomorrowObj.getFullYear();
  const tomMm = String(tomorrowObj.getMonth() + 1).padStart(2, '0');
  const tomDd = String(tomorrowObj.getDate()).padStart(2, '0');
  const tomorrowStr = `${tomYyyy}-${tomMm}-${tomDd}`;

  const todayDetails = getDateDetails(todayStr);
  const tomorrowDetails = getDateDetails(tomorrowStr);

  const bookings = getAllBookings();
  const dateCounts = {};
  bookings.forEach((b) => {
    if (b.booking_status === 'Cancelled' || b.payment_status === 'Failed') return;
    const d = b.visit_date || (b.created_at ? b.created_at.split('T')[0] : '');
    if (d) {
      dateCounts[d] = (dateCounts[d] || 0) + 1;
    }
  });

  const fullyBookedDates = [];
  const closedDatesList = [];
  const upcomingOpenDates = [];

  const config = getDateConfig();
  closedDatesList.push(...config.closedDates);

  // Scan next 60 days
  const scanner = new Date(todayObj);
  for (let i = 0; i < 60; i++) {
    const sY = scanner.getFullYear();
    const sM = String(scanner.getMonth() + 1).padStart(2, '0');
    const sD = String(scanner.getDate()).padStart(2, '0');
    const dStr = `${sY}-${sM}-${sD}`;

    const det = getDateDetails(dStr);
    if (det.isFull) fullyBookedDates.push(dStr);
    if (det.isOpen && !det.isFull && upcomingOpenDates.length < 15) {
      upcomingOpenDates.push({
        date: dStr,
        booked: det.booked,
        remaining: det.remaining,
        capacity: det.capacity,
        formatted: scanner.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }),
      });
    }
    scanner.setDate(scanner.getDate() + 1);
  }

  // Monthly breakdown for active bookings
  const monthlyCounts = {};
  bookings.forEach((b) => {
    if (b.booking_status === 'Cancelled' || b.payment_status === 'Failed') return;
    const d = b.visit_date || (b.created_at ? b.created_at.split('T')[0] : '');
    if (d && d.length >= 7) {
      const ym = d.slice(0, 7);
      monthlyCounts[ym] = (monthlyCounts[ym] || 0) + 1;
    }
  });

  return {
    today: {
      date: todayStr,
      booked: todayDetails.booked,
      capacity: todayDetails.capacity,
      remaining: todayDetails.remaining,
      status: todayDetails.status,
    },
    tomorrow: {
      date: tomorrowStr,
      booked: tomorrowDetails.booked,
      capacity: tomorrowDetails.capacity,
      remaining: tomorrowDetails.remaining,
      status: tomorrowDetails.status,
    },
    totalBookingsByDate: dateCounts,
    fullyBookedDates: Array.from(new Set(fullyBookedDates)),
    closedDates: Array.from(new Set(closedDatesList)),
    upcomingOpenDates,
    monthlyCounts,
    openedMonths: config.openedMonths,
  };
}
