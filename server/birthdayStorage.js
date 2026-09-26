import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.resolve(DB_DIR, 'birthday_enquiries_db.json');

function ensureDbFile() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Error creating birthday enquiries database file:', err);
  }
}

export function getAllBirthdayEnquiries() {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
  } catch (err) {
    console.error('Error reading birthday enquiries from server DB:', err);
    return [];
  }
}

export function saveAllBirthdayEnquiries(enquiries) {
  ensureDbFile();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(enquiries, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving birthday enquiries to server DB:', err);
    return false;
  }
}

export function addBirthdayEnquiry(enquiry) {
  ensureDbFile();
  const list = getAllBirthdayEnquiries();
  const id = enquiry.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));
  const item = {
    id,
    name: enquiry.name || '',
    phone: enquiry.phone || '',
    email: enquiry.email || '',
    preferred_date: enquiry.preferred_date || enquiry.visit_date || '',
    number_of_guests: enquiry.number_of_guests ? Number(enquiry.number_of_guests) : (enquiry.guests || 0),
    package_name: enquiry.package_name || enquiry.package || 'Birthday Party',
    message: enquiry.message || enquiry.special_request || '',
    status: enquiry.status || 'New',
    created_at: enquiry.created_at || new Date().toISOString(),
  };

  const filtered = list.filter((e) => e.id !== item.id);
  filtered.unshift(item);
  saveAllBirthdayEnquiries(filtered);
  return item;
}

export function updateBirthdayEnquiry(id, updates) {
  ensureDbFile();
  const list = getAllBirthdayEnquiries();
  const index = list.findIndex((e) => e.id === id);
  if (index === -1) return null;

  list[index] = { ...list[index], ...updates };
  saveAllBirthdayEnquiries(list);
  return list[index];
}

export function deleteBirthdayEnquiryById(id) {
  ensureDbFile();
  const list = getAllBirthdayEnquiries();
  const filtered = list.filter((e) => e.id !== id);
  if (filtered.length === list.length) return false;
  saveAllBirthdayEnquiries(filtered);
  return true;
}
