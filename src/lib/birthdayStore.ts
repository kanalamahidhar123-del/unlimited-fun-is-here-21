import { supabase } from '@/lib/supabase';
import { SITE } from '@/data/site';

export interface BirthdayEnquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  preferred_date: string;
  number_of_guests: number;
  package_name: string;
  message: string;
  status: 'New' | 'Contacted' | 'Confirmed' | 'Cancelled';
  created_at: string;
}

const STORAGE_KEY = 'unlimited_fun_birthday_enquiries';

export function getBirthdayEnquiries(): BirthdayEnquiry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: BirthdayEnquiry[] = raw ? JSON.parse(raw) : [];
    return list.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (e) {
    console.error('Failed to load birthday enquiries from localStorage', e);
    return [];
  }
}

export function saveBirthdayEnquiries(enquiries: BirthdayEnquiry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enquiries));
    window.dispatchEvent(new Event('unlimited_fun_birthday_enquiries_updated'));
  } catch (e) {
    console.error('Failed to save birthday enquiries to localStorage', e);
  }
}

export async function fetchBirthdayEnquiriesFromServer(): Promise<BirthdayEnquiry[]> {
  try {
    const res = await fetch('/api/birthday-enquiries');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const serverList: BirthdayEnquiry[] = json.data;
        const localList = getBirthdayEnquiries();

        const map = new Map<string, BirthdayEnquiry>();
        serverList.forEach((item) => {
          if (item.id) map.set(item.id, item);
        });
        localList.forEach((item) => {
          if (item.id && !map.has(item.id)) {
            map.set(item.id, item);
          }
        });

        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        saveBirthdayEnquiries(merged);
        return merged;
      }
    }
  } catch (e) {
    console.warn('Birthday enquiries server fetch notice:', e);
  }
  return getBirthdayEnquiries();
}

export async function createBirthdayEnquiry(
  input: Omit<BirthdayEnquiry, 'id' | 'created_at' | 'status'> & {
    id?: string;
    status?: BirthdayEnquiry['status'];
  }
): Promise<BirthdayEnquiry> {
  const newEnquiry: BirthdayEnquiry = {
    id: input.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
    name: input.name,
    phone: input.phone,
    email: input.email || '',
    preferred_date: input.preferred_date || '',
    number_of_guests: Number(input.number_of_guests) || 0,
    package_name: input.package_name || 'Birthday Party',
    message: input.message || '',
    status: input.status || 'New',
    created_at: new Date().toISOString(),
  };

  const list = getBirthdayEnquiries();
  const filtered = list.filter((e) => e.id !== newEnquiry.id);
  filtered.unshift(newEnquiry);
  saveBirthdayEnquiries(filtered);

  // Sync to Backend Server API
  try {
    fetch('/api/birthday-enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEnquiry),
    }).catch((e) => console.warn('Server API birthday enquiry dispatch notice:', e));
  } catch (e) {
    // ignore
  }

  // Sync to Supabase table
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.includes('placeholder.supabase.co')) {
    try {
      await supabase.from('birthday_enquiries').insert({
        name: newEnquiry.name,
        phone: newEnquiry.phone,
        email: newEnquiry.email || null,
        preferred_date: newEnquiry.preferred_date || null,
        number_of_guests: newEnquiry.number_of_guests || null,
        message: newEnquiry.message ? `[${newEnquiry.package_name}] ${newEnquiry.message}` : `Package: ${newEnquiry.package_name}`,
        status: 'pending',
      });
    } catch (sErr) {
      console.warn('Supabase birthday enquiry sync notice:', sErr);
    }
  }

  // Sync to Google Sheets Webhook
  const sheetUrl = import.meta.env.VITE_GOOGLE_SHEET_URL || SITE.googleSheetUrl;
  if (sheetUrl) {
    try {
      const nowStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          type: 'Birthday Party Enquiry',
          booking_type: 'Birthday Party Enquiry',
          Timestamp: nowStr,
          timestamp: nowStr,
          name: newEnquiry.name,
          fullName: newEnquiry.name,
          phone: newEnquiry.phone,
          mobile: newEnquiry.phone,
          email: newEnquiry.email || '',
          package: newEnquiry.package_name,
          date: newEnquiry.preferred_date,
          visit_date: newEnquiry.preferred_date,
          guests: newEnquiry.number_of_guests,
          number_of_guests: newEnquiry.number_of_guests,
          notes: newEnquiry.message,
          status: 'New Enquiry',
        }),
      });
    } catch (err) {
      console.warn('Google Sheet birthday sync notice:', err);
    }
  }

  return newEnquiry;
}

export function updateBirthdayStatus(
  id: string,
  status: BirthdayEnquiry['status']
): boolean {
  const list = getBirthdayEnquiries();
  const index = list.findIndex((e) => e.id === id);
  if (index === -1) return false;

  list[index].status = status;
  saveBirthdayEnquiries(list);

  // Sync to Backend Server API
  try {
    fetch('/api/birthday-enquiries/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    }).catch((e) => console.warn('Server API birthday update notice:', e));
  } catch (e) {
    // ignore
  }

  return true;
}

export function deleteBirthdayEnquiry(id: string): boolean {
  try {
    const list = getBirthdayEnquiries();
    const filtered = list.filter((e) => e.id !== id);
    if (filtered.length === list.length) return false;
    saveBirthdayEnquiries(filtered);

    // Sync to Backend Server API
    fetch('/api/birthday-enquiries/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch((e) => console.warn('Server API birthday delete notice:', e));

    return true;
  } catch (e) {
    console.error('Failed to delete birthday enquiry', e);
    return false;
  }
}
