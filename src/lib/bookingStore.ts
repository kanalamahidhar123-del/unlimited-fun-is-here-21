import { SITE } from '@/data/site';
import { supabase } from '@/lib/supabase';

export type PaymentStatus = 'Pending Verification' | 'Successful' | 'Failed' | 'Processing' | 'Cancelled' | 'Refunded' | 'Not Required';
export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'Pending Payment' | 'Registration Received';
export type BookingType = 'Trampoline' | 'RFID';
export type PaymentMethod = 'Razorpay' | 'UPI Manual' | 'Cash' | 'Registration Only';
export type SystemPaymentMode = 'PAYMENT_REQUIRED' | 'REGISTRATION_ONLY';

export const PAYMENT_MODE_STORAGE_KEY = 'unlimited_fun_payment_mode';

export function getSystemPaymentMode(): SystemPaymentMode {
  try {
    const saved = localStorage.getItem(PAYMENT_MODE_STORAGE_KEY);
    if (saved === 'PAYMENT_REQUIRED' || saved === 'REGISTRATION_ONLY') {
      return saved;
    }
  } catch (e) {
    console.warn('Could not read payment mode from storage', e);
  }
  const envMode = import.meta.env.VITE_PAYMENT_MODE;
  if (envMode === 'REGISTRATION_ONLY') return 'REGISTRATION_ONLY';
  return 'PAYMENT_REQUIRED';
}

export function setSystemPaymentMode(mode: SystemPaymentMode): void {
  try {
    localStorage.setItem(PAYMENT_MODE_STORAGE_KEY, mode);
    window.dispatchEvent(new Event('unlimited_fun_payment_mode_updated'));
  } catch (e) {
    console.error('Could not save payment mode to storage', e);
  }
}

export interface BookingRecord {
  id: string;
  booking_id: string;
  type: BookingType;
  full_name: string;
  mobile_number: string;
  whatsapp_number?: string | null;
  email: string | null;
  visit_date: string;
  preferred_time: string;
  adults?: number;
  children?: number;
  category: string;
  duration: string;
  quantity: number;
  rfid_card_type?: string | null;
  price_per_unit: number;
  booking_amount: number;
  paid_amount: number;
  total_amount?: number;
  utr: string;
  payment_method?: PaymentMethod;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_signature?: string | null;
  razorpay_signature_verified?: boolean;
  payment_verified_at?: string | null;
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  special_request: string | null;
  created_at: string;
}

const STORAGE_KEY = 'unlimited_fun_unified_bookings';

export function generateBookingId(type: BookingType): string {
  const prefix = type === 'RFID' ? 'UF-RFID' : 'UF-TR';
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${randomNum}`;
}

export function getBookings(): BookingRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: BookingRecord[] = raw ? JSON.parse(raw) : [];
    return list
      .filter((b) => b && (b.booking_id || b.id || b.full_name))
      .map((b, idx) => ({
        id: b.id || b.booking_id || `uf-bk-${idx}-${Date.now()}`,
        booking_id: b.booking_id || (b.id ? `UF-TR-${String(b.id).substring(0, 5).toUpperCase()}` : `UF-TR-${idx + 1000}`),
        type: b.type || 'Trampoline',
        full_name: b.full_name || 'Guest',
        mobile_number: b.mobile_number || 'N/A',
        whatsapp_number: b.whatsapp_number || b.mobile_number || 'N/A',
        email: b.email || null,
        visit_date: b.visit_date || (b.created_at ? b.created_at.split('T')[0] : 'N/A'),
        preferred_time: b.preferred_time || 'N/A',
        adults: Number(b.adults) || 1,
        children: Number(b.children) || 0,
        category: b.category || 'Adult',
        duration: b.duration || '1 Hour',
        quantity: Number(b.quantity) || 1,
        rfid_card_type: b.rfid_card_type || null,
        price_per_unit: Number(b.price_per_unit) || 0,
        booking_amount: Number(b.booking_amount ?? b.total_amount ?? 0) || 0,
        paid_amount: Number(b.paid_amount ?? 0) || 0,
        total_amount: Number(b.booking_amount ?? b.total_amount ?? 0) || 0,
        utr: b.utr || 'N/A',
        payment_method: b.payment_method ?? 'Registration Only',
        razorpay_order_id: b.razorpay_order_id || null,
        razorpay_payment_id: b.razorpay_payment_id || null,
        razorpay_signature: b.razorpay_signature || null,
        razorpay_signature_verified: Boolean(b.razorpay_signature_verified),
        payment_verified_at: b.payment_verified_at || null,
        payment_status: b.payment_status || 'Not Required',
        booking_status: b.booking_status || 'Registration Received',
        special_request: b.special_request || null,
        created_at: b.created_at || new Date().toISOString(),
      }))
      .sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  } catch (e) {
    console.error('Failed to load bookings from storage', e);
    return [];
  }
}

export async function fetchBookingsFromServer(): Promise<BookingRecord[]> {
  try {
    const res = await fetch('/api/bookings');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const serverList: BookingRecord[] = json.data;
        const localList = getBookings();
        
        // Merge server and local bookings without duplicates
        const map = new Map<string, BookingRecord>();
        serverList.forEach((b) => {
          const key = b.booking_id || b.id;
          if (key) map.set(key, b);
        });
        localList.forEach((b) => {
          const key = b.booking_id || b.id;
          if (key && !map.has(key)) map.set(key, b);
        });

        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );

        saveBookings(merged);
        return getBookings();
      }
    }
  } catch (e) {
    // server API might be unavailable in static deploy, fallback silently to local
  }
  return getBookings();
}

export function saveBookings(bookings: BookingRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    window.dispatchEvent(new Event('unlimited_fun_bookings_updated'));
  } catch (e) {
    console.error('Failed to save bookings to storage', e);
  }
}

export async function createBooking(
  input: Omit<
    BookingRecord,
    'id' | 'booking_id' | 'created_at'
  > & {
    id?: string;
    booking_id?: string;
    whatsapp_number?: string | null;
    adults?: number;
    children?: number;
    rfid_card_type?: string | null;
    payment_status?: PaymentStatus;
    booking_status?: BookingStatus;
    payment_method?: PaymentMethod;
    razorpay_order_id?: string | null;
    razorpay_payment_id?: string | null;
    razorpay_signature?: string | null;
    razorpay_signature_verified?: boolean;
    payment_verified_at?: string | null;
  }
): Promise<BookingRecord> {
  const isRazorpaySuccess = Boolean(input.razorpay_payment_id);
  const paymentStatus: PaymentStatus =
    input.payment_status || (isRazorpaySuccess ? 'Successful' : 'Pending Verification');
  const bookingStatus: BookingStatus =
    input.booking_status || 'Pending Payment';

  const newBooking: BookingRecord = {
    id: input.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
    booking_id: input.booking_id || generateBookingId(input.type),
    ...input,
    whatsapp_number: input.whatsapp_number || input.mobile_number,
    adults: input.adults ?? (input.type === 'RFID' ? 0 : input.quantity || 1),
    children: input.children ?? 0,
    rfid_card_type: input.rfid_card_type || (input.type === 'RFID' ? input.category : 'None'),
    booking_amount: Number(input.booking_amount) || 0,
    paid_amount: Number(input.paid_amount) || 0,
    total_amount: Number(input.booking_amount) || 0,
    payment_method: input.payment_method || 'Registration Only',
    razorpay_order_id: input.razorpay_order_id || null,
    razorpay_payment_id: input.razorpay_payment_id || null,
    razorpay_signature: input.razorpay_signature || null,
    razorpay_signature_verified: input.razorpay_signature_verified ?? isRazorpaySuccess,
    payment_verified_at: input.payment_verified_at || null,
    payment_status: paymentStatus,
    booking_status: bookingStatus,
    created_at: new Date().toISOString(),
  };

  const existing = getBookings();
  // Ensure no duplicate with same booking_id
  const filtered = existing.filter((b) => b.booking_id !== newBooking.booking_id && b.id !== newBooking.id);
  filtered.unshift(newBooking);
  saveBookings(filtered);

  // Sync to Google Sheet Webhook with all required columns and alias mappings
  const sheetUrl = import.meta.env.VITE_GOOGLE_SHEET_URL || SITE.googleSheetUrl;
  if (sheetUrl) {
    try {
      const nowStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      const guestTotal = (newBooking.adults || 0) + (newBooking.children || 0) || newBooking.quantity || 1;
      const packageDesc = `${newBooking.category}${newBooking.duration && newBooking.duration !== 'N/A' ? ` (${newBooking.duration})` : ''}`;
      const regStatus = newBooking.booking_status || 'Registration Received';
      const payStatus = newBooking.payment_status || 'Not Required';
      const notes = newBooking.special_request || '';

      const payload: Record<string, any> = {
        // 1. Timestamp
        timestamp: nowStr,
        Timestamp: nowStr,
        created_at: newBooking.created_at,

        // 2. Booking ID
        booking_id: newBooking.booking_id,
        bookingId: newBooking.booking_id,
        "Booking ID": newBooking.booking_id,
        "Booking Id": newBooking.booking_id,
        id: newBooking.booking_id,

        // 3. Full Name
        name: newBooking.full_name,
        fullName: newBooking.full_name,
        full_name: newBooking.full_name,
        customerName: newBooking.full_name,
        customer_name: newBooking.full_name,
        "Full Name": newBooking.full_name,
        "Customer Name": newBooking.full_name,
        "Name": newBooking.full_name,

        // 4. Phone Number / Mobile
        phone: newBooking.mobile_number,
        phoneNumber: newBooking.mobile_number,
        phone_number: newBooking.mobile_number,
        mobile: newBooking.mobile_number,
        mobileNumber: newBooking.mobile_number,
        mobile_number: newBooking.mobile_number,
        "Phone Number": newBooking.mobile_number,
        "Mobile Number": newBooking.mobile_number,
        "Phone": newBooking.mobile_number,
        "Mobile": newBooking.mobile_number,
        whatsapp_number: newBooking.whatsapp_number || newBooking.mobile_number,
        whatsapp: newBooking.whatsapp_number || newBooking.mobile_number,
        "WhatsApp Number": newBooking.whatsapp_number || newBooking.mobile_number,

        // 5. Email
        email: newBooking.email || '',
        Email: newBooking.email || '',
        "Email Address": newBooking.email || '',

        // 6. Booking Type
        booking_type: newBooking.type === 'RFID' ? 'RFID Card Booking' : 'Trampoline Booking',
        bookingType: newBooking.type === 'RFID' ? 'RFID Card Booking' : 'Trampoline Booking',
        type: newBooking.type === 'RFID' ? 'RFID Card Booking' : 'Trampoline Booking',
        "Booking Type": newBooking.type === 'RFID' ? 'RFID Card Booking' : 'Trampoline Booking',
        category: newBooking.category,
        "Category": newBooking.category,

        // 7. Booking Date
        booking_date: newBooking.visit_date,
        bookingDate: newBooking.visit_date,
        visit_date: newBooking.visit_date,
        visitDate: newBooking.visit_date,
        date: newBooking.visit_date,
        "Booking Date": newBooking.visit_date,
        "Visit Date": newBooking.visit_date,
        "Date": newBooking.visit_date,

        // 8. Booking Time
        booking_time: newBooking.preferred_time,
        bookingTime: newBooking.preferred_time,
        preferred_time: newBooking.preferred_time,
        preferredTime: newBooking.preferred_time,
        time: newBooking.preferred_time,
        "Booking Time": newBooking.preferred_time,
        "Preferred Time": newBooking.preferred_time,
        "Time": newBooking.preferred_time,

        // 9. Number of Guests
        guests: guestTotal,
        number_of_guests: guestTotal,
        numberOfGuests: guestTotal,
        "Number of Guests": guestTotal,
        "Guests": `${guestTotal} Guests`,
        adults: newBooking.adults ?? 1,
        Adults: newBooking.adults ?? 1,
        children: newBooking.children ?? 0,
        Children: newBooking.children ?? 0,

        // 10. Selected Duration / Package
        package: packageDesc,
        Package: packageDesc,
        duration: newBooking.duration,
        Duration: newBooking.duration,
        "Selected Duration / Package": packageDesc,
        "Package / Duration": packageDesc,
        rfid_card: newBooking.rfid_card_type || 'None',
        "RFID Card": newBooking.rfid_card_type || 'None',

        // 11. Payment Status
        payment_status: payStatus,
        paymentStatus: payStatus,
        "Payment Status": payStatus,
        payment_method: newBooking.payment_method || 'Registration Only',
        "Payment Method": newBooking.payment_method || 'Registration Only',
        paid_amount: newBooking.paid_amount || 0,
        "Paid Amount": newBooking.paid_amount || 0,
        booking_amount: newBooking.booking_amount || 0,
        "Booking Amount": newBooking.booking_amount || 0,

        // 12. Registration Status
        registration_status: regStatus,
        registrationStatus: regStatus,
        "Registration Status": regStatus,
        booking_status: regStatus,
        bookingStatus: regStatus,
        "Booking Status": regStatus,

        // 13. Additional Notes
        notes: notes,
        additional_notes: notes,
        additionalNotes: notes,
        special_request: notes,
        specialRequest: notes,
        "Additional Notes": notes,
        "Special Request": notes,
        "Notes": notes,
      };

      await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Google Sheet webhook sync error:', err);
    }
  }

  // Sync to Supabase if configured (client side)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder.supabase.co');
  if (isConfigured) {
    try {
      const guestCount = (newBooking.adults || 0) + (newBooking.children || 0) || newBooking.quantity || 1;
      const catVal = newBooking.category === 'Children' ? 'Children' : 'Adult';
      const durVal = newBooking.duration === '2 Hours' ? '2 Hours' : '1 Hour';
      const statusVal = newBooking.booking_status === 'Confirmed' ? 'confirmed' : newBooking.booking_status === 'Cancelled' ? 'cancelled' : 'pending';

      await supabase.from('bookings').insert({
        full_name: newBooking.full_name,
        mobile_number: newBooking.mobile_number,
        email: newBooking.email || null,
        visit_date: newBooking.visit_date,
        preferred_time: newBooking.preferred_time,
        number_of_people: guestCount,
        category: catVal,
        duration: durVal,
        special_request: `[${newBooking.booking_id}] Method: ${newBooking.payment_method} | Status: ${newBooking.booking_status} | ${newBooking.special_request || ''}`,
        agreed_to_terms: true,
        status: statusVal,
        created_at: newBooking.created_at,
      });
    } catch (syncErr) {
      console.warn('Supabase remote sync notice:', syncErr);
    }
  }

  // Sync to Central Server Backend API
  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBooking),
    });
    if (res.ok) {
      // Re-fetch to guarantee synchronized state
      await fetchBookingsFromServer();
    }
  } catch (e) {
    console.warn('Server API booking dispatch notice:', e);
  }

  return newBooking;
}

export function getBookingStatusBadge(booking: BookingRecord): {
  label: string;
  badgeClass: string;
  icon: string;
} {
  if (booking.booking_status === 'Confirmed' || booking.payment_status === 'Successful') {
    return {
      label: 'Confirmed / Successful',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: '🟢',
    };
  }
  if (booking.booking_status === 'Cancelled' || booking.payment_status === 'Failed') {
    return {
      label: 'Cancelled / Rejected',
      badgeClass: 'bg-flame-500/10 text-flame-400 border-flame-500/30',
      icon: '🔴',
    };
  }
  if (
    booking.payment_method === 'Registration Only' ||
    booking.payment_status === 'Not Required' ||
    booking.booking_status === 'Registration Received'
  ) {
    return {
      label: booking.booking_status || 'Registration Received',
      badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      icon: '📝',
    };
  }
  if (booking.payment_status === 'Pending Verification') {
    return {
      label: 'Pending Verification',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      icon: '🟡',
    };
  }
  return {
    label: booking.booking_status || 'Pending Payment',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    icon: '🟡',
  };
}

export function updateBookingStatus(
  id: string,
  paymentStatus: PaymentStatus,
  bookingStatus: BookingStatus
): boolean {
  const bookings = getBookings();
  const index = bookings.findIndex((b) => b.id === id || b.booking_id === id);
  if (index === -1) return false;

  const b = bookings[index];
  b.payment_status = paymentStatus;
  b.booking_status = bookingStatus;
  if (paymentStatus === 'Successful' && (!b.paid_amount || b.paid_amount === 0) && b.booking_amount > 0) {
    b.paid_amount = b.booking_amount;
  }
  b.payment_verified_at = new Date().toISOString();

  saveBookings(bookings);

  // Sync update to Central Server Backend API
  try {
    fetch('/api/bookings/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: b.id,
        booking_id: b.booking_id,
        payment_status: paymentStatus,
        booking_status: bookingStatus,
        paid_amount: b.paid_amount,
        payment_verified_at: b.payment_verified_at,
      }),
    }).catch((e) => console.warn('Server API booking update notice:', e));
  } catch (e) {
    // ignore
  }

  // Sync updated status to Google Sheets webhook
  const sheetUrl = import.meta.env.VITE_GOOGLE_SHEET_URL || SITE.googleSheetUrl;
  if (sheetUrl) {
    try {
      const nowStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'status_update',
          timestamp: nowStr,
          Timestamp: nowStr,
          booking_id: b.booking_id,
          bookingId: b.booking_id,
          "Booking ID": b.booking_id,
          name: b.full_name,
          fullName: b.full_name,
          "Full Name": b.full_name,
          mobile_number: b.mobile_number,
          "Mobile Number": b.mobile_number,
          payment_status: paymentStatus,
          paymentStatus: paymentStatus,
          "Payment Status": paymentStatus,
          booking_status: bookingStatus,
          bookingStatus: bookingStatus,
          "Booking Status": bookingStatus,
          registration_status: bookingStatus,
          "Registration Status": bookingStatus,
        }),
      }).catch((err) => console.warn('Google Sheet status update notice:', err));
    } catch (e) {
      console.warn('Google Sheet dispatch notice:', e);
    }
  }

  // Sync to Supabase if configured
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder.supabase.co');
  if (isConfigured) {
    supabase
      .from('bookings')
      .update({
        special_request: `[${b.booking_id}] Status: ${bookingStatus} | Payment: ${paymentStatus} | Verified at: ${b.payment_verified_at}`,
      })
      .ilike('special_request', `%${b.booking_id}%`)
      .then()
      .catch((e) => console.warn('Supabase status update notice:', e));
  }

  return true;
}

export function getDashboardStats(customBookings?: BookingRecord[]) {
  const bookings = customBookings || getBookings();
  const todayStr = new Date().toISOString().split('T')[0];

  const totalBookings = bookings.length;
  const todayBookings = bookings.filter((b) => b.created_at?.startsWith(todayStr) || b.visit_date === todayStr).length;
  const pendingPayments = bookings.filter((b) => b.payment_status === 'Pending Verification').length;
  const successfulPayments = bookings.filter((b) => b.payment_status === 'Successful' || b.booking_status === 'Confirmed').length;
  const failedPayments = bookings.filter((b) => b.payment_status === 'Failed' || b.booking_status === 'Cancelled').length;
  const confirmedBookings = bookings.filter((b) => b.booking_status === 'Confirmed').length;
  const cancelledBookings = bookings.filter((b) => b.booking_status === 'Cancelled').length;
  const totalRfidBookings = bookings.filter((b) => b.type === 'RFID').length;

  // Revenue strictly sums the actual paid_amount for bookings where payment_status === 'Successful'
  const totalRevenue = bookings
    .filter((b) => b.payment_status === 'Successful')
    .reduce((sum, b) => sum + (Number(b.paid_amount) || 0), 0);

  return {
    totalBookings,
    todayBookings,
    pendingPayments,
    successfulPayments,
    failedPayments,
    confirmedBookings,
    cancelledBookings,
    totalRevenue,
    totalRfidBookings,
  };
}

export function deleteBooking(id: string): boolean {
  try {
    const bookings = getBookings();
    const filtered = bookings.filter((b) => b.id !== id && b.booking_id !== id);
    if (filtered.length === bookings.length) return false;
    saveBookings(filtered);

    // Sync deletion to Central Server Backend API
    fetch('/api/bookings/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch((e) => console.warn('Server API delete notice:', e));

    return true;
  } catch (e) {
    console.error('Failed to delete booking', e);
    return false;
  }
}

export function clearAllBookings(): boolean {
  try {
    saveBookings([]);

    // Sync clear to Central Server Backend API
    fetch('/api/bookings/clear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }).catch((e) => console.warn('Server API clear notice:', e));

    return true;
  } catch (e) {
    console.error('Failed to clear bookings', e);
    return false;
  }
}

// ----------------------------------------------------
// DAILY BOOKING CAPACITY (300 Bookings per Day) & DATE MANAGEMENT
// ----------------------------------------------------
export const DAILY_CAPACITY = 300;

export interface BookingDateConfig {
  dailyCapacity: number;
  openedMonths: string[]; // e.g. ['2026-09', '2026-10', '2026-11', '2026-12', '2027-01', '2027-02']
  closedDates: string[]; // e.g. ['2026-09-28']
  customOpenedDates: string[];
  customCapacities: Record<string, number>;
  updatedAt?: string;
}

const DATE_CONFIG_STORAGE_KEY = 'unlimited_fun_booking_dates_config';

function getDefaultDateConfig(): BookingDateConfig {
  const current = new Date();
  const openedMonths: string[] = [];
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

export function getDateConfig(): BookingDateConfig {
  try {
    const raw = localStorage.getItem(DATE_CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.openedMonths) parsed.openedMonths = [];
      if (!parsed.closedDates) parsed.closedDates = [];
      if (!parsed.customOpenedDates) parsed.customOpenedDates = [];
      if (!parsed.customCapacities) parsed.customCapacities = {};
      return parsed;
    }
  } catch (e) {
    console.error('Failed to read date config from localStorage', e);
  }
  return getDefaultDateConfig();
}

export function saveDateConfig(config: BookingDateConfig): void {
  try {
    config.updatedAt = new Date().toISOString();
    localStorage.setItem(DATE_CONFIG_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event('unlimited_fun_date_config_updated'));
  } catch (e) {
    console.error('Failed to save date config', e);
  }
}

export async function fetchDateConfigFromServer(): Promise<BookingDateConfig> {
  try {
    const res = await fetch('/api/booking-dates');
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        saveDateConfig(json.data);
        return json.data;
      }
    }
  } catch (e) {
    // offline / fallback
  }
  return getDateConfig();
}

export function isDateOpen(dateStr: string): boolean {
  if (!dateStr) return false;
  const config = getDateConfig();
  if (config.closedDates.includes(dateStr)) return false;
  if (config.customOpenedDates.includes(dateStr)) return true;
  const ym = dateStr.slice(0, 7);
  return config.openedMonths.includes(ym);
}

export function getDateBookingCount(date: string): number {
  if (!date) return 0;
  const list = getBookings();
  return list.filter((b) => {
    if (b.booking_status === 'Cancelled' || b.payment_status === 'Failed') return false;
    const bDate = b.visit_date || (b.created_at ? b.created_at.split('T')[0] : '');
    return bDate === date;
  }).length;
}

export function isDateFull(date: string): boolean {
  return getDateBookingCount(date) >= DAILY_CAPACITY;
}

export function isDateAvailableForCustomer(dateStr: string): {
  available: boolean;
  reason?: string;
  booked: number;
  capacity: number;
  remaining: number;
} {
  const booked = getDateBookingCount(dateStr);
  const capacity = DAILY_CAPACITY;
  const remaining = Math.max(0, capacity - booked);

  if (!isDateOpen(dateStr)) {
    return {
      available: false,
      reason: 'This date is currently closed by administration.',
      booked,
      capacity,
      remaining: 0,
    };
  }

  if (booked >= capacity) {
    return {
      available: false,
      reason: "Today's bookings are completely filled. Please try another available date.",
      booked,
      capacity,
      remaining: 0,
    };
  }

  return {
    available: true,
    booked,
    capacity,
    remaining,
  };
}

export function getNextAvailableDate(startDate?: string): string {
  const start = startDate ? new Date(startDate) : new Date();
  for (let i = 1; i <= 90; i++) {
    const next = new Date(start);
    next.setDate(start.getDate() + i);
    const dateStr = next.toISOString().split('T')[0];
    if (isDateOpen(dateStr) && getDateBookingCount(dateStr) < DAILY_CAPACITY) {
      return dateStr;
    }
  }
  const fallback = new Date(start);
  fallback.setDate(start.getDate() + 1);
  return fallback.toISOString().split('T')[0];
}

export function getNextAvailableOpenDates(startDate?: string, count = 5): Array<{ date: string; booked: number; remaining: number }> {
  const start = startDate ? new Date(startDate) : new Date();
  const results: Array<{ date: string; booked: number; remaining: number }> = [];

  for (let i = 1; i <= 120 && results.length < count; i++) {
    const next = new Date(start);
    next.setDate(start.getDate() + i);
    const dateStr = next.toISOString().split('T')[0];
    if (isDateOpen(dateStr)) {
      const booked = getDateBookingCount(dateStr);
      if (booked < DAILY_CAPACITY) {
        results.push({
          date: dateStr,
          booked,
          remaining: Math.max(0, DAILY_CAPACITY - booked),
        });
      }
    }
  }
  return results;
}

export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (e) {
    return dateStr;
  }
}

export interface DayCapacity {
  date: string;
  booked: number;
  capacity: number;
  remaining: number;
  isOpen: boolean;
  isFull: boolean;
  status: 'AVAILABLE' | 'FULL' | 'CLOSED';
}

export function getCapacitySummary(daysCount = 14): DayCapacity[] {
  const result: DayCapacity[] = [];
  const today = new Date();
  for (let i = 0; i < daysCount; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const booked = getDateBookingCount(dateStr);
    const remaining = Math.max(0, DAILY_CAPACITY - booked);
    const isOpen = isDateOpen(dateStr);
    const isFull = booked >= DAILY_CAPACITY;
    let status: 'AVAILABLE' | 'FULL' | 'CLOSED' = 'AVAILABLE';
    if (!isOpen) status = 'CLOSED';
    else if (isFull) status = 'FULL';

    result.push({
      date: dateStr,
      booked,
      capacity: DAILY_CAPACITY,
      remaining,
      isOpen,
      isFull,
      status,
    });
  }
  return result;
}

export async function toggleDateStatusRemote(date: string, open: boolean): Promise<boolean> {
  // Update local
  const config = getDateConfig();
  if (open) {
    config.closedDates = config.closedDates.filter((d) => d !== date);
    if (!config.customOpenedDates.includes(date)) config.customOpenedDates.push(date);
  } else {
    config.customOpenedDates = config.customOpenedDates.filter((d) => d !== date);
    if (!config.closedDates.includes(date)) config.closedDates.push(date);
  }
  saveDateConfig(config);

  // Sync with server
  try {
    await fetch('/api/booking-dates/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, open }),
    });
  } catch (e) {
    console.warn('Could not sync date toggle to server:', e);
  }
  return true;
}

export async function openMonthRemote(year: number, month: number): Promise<boolean> {
  const ym = `${year}-${String(month).padStart(2, '0')}`;
  const config = getDateConfig();
  if (!config.openedMonths.includes(ym)) {
    config.openedMonths.push(ym);
  }
  // Clear any closed dates in this month
  config.closedDates = config.closedDates.filter((d) => !d.startsWith(ym));
  saveDateConfig(config);

  try {
    await fetch('/api/booking-dates/open-month', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year, month }),
    });
  } catch (e) {
    console.warn('Could not sync open-month to server:', e);
  }
  return true;
}

export async function closeMonthRemote(year: number, month: number): Promise<boolean> {
  const ym = `${year}-${String(month).padStart(2, '0')}`;
  const config = getDateConfig();
  config.openedMonths = config.openedMonths.filter((m) => m !== ym);
  config.customOpenedDates = config.customOpenedDates.filter((d) => !d.startsWith(ym));
  saveDateConfig(config);

  try {
    await fetch('/api/booking-dates/close-month', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year, month }),
    });
  } catch (e) {
    console.warn('Could not sync close-month to server:', e);
  }
  return true;
}

export function getAdminDateSummary() {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const todayBooked = getDateBookingCount(todayStr);
  const tomorrowBooked = getDateBookingCount(tomorrowStr);

  const bookings = getBookings();
  const dateCounts: Record<string, number> = {};
  const monthCounts: Record<string, number> = {};

  bookings.forEach((b) => {
    if (b.booking_status === 'Cancelled' || b.payment_status === 'Failed') return;
    const d = b.visit_date || (b.created_at ? b.created_at.split('T')[0] : '');
    if (d) {
      dateCounts[d] = (dateCounts[d] || 0) + 1;
      const m = d.slice(0, 7);
      monthCounts[m] = (monthCounts[m] || 0) + 1;
    }
  });

  const fullyBookedDates = Object.entries(dateCounts)
    .filter(([_, count]) => count >= DAILY_CAPACITY)
    .map(([date, count]) => ({ date, count, capacity: DAILY_CAPACITY }));

  const config = getDateConfig();

  return {
    dailyCapacity: DAILY_CAPACITY,
    today: {
      date: todayStr,
      booked: todayBooked,
      capacity: DAILY_CAPACITY,
      remaining: Math.max(0, DAILY_CAPACITY - todayBooked),
      isFull: todayBooked >= DAILY_CAPACITY,
      isOpen: isDateOpen(todayStr),
    },
    tomorrow: {
      date: tomorrowStr,
      booked: tomorrowBooked,
      capacity: DAILY_CAPACITY,
      remaining: Math.max(0, DAILY_CAPACITY - tomorrowBooked),
      isFull: tomorrowBooked >= DAILY_CAPACITY,
      isOpen: isDateOpen(tomorrowStr),
    },
    closedDates: config.closedDates,
    openedMonths: config.openedMonths,
    fullyBookedDates,
    dateCounts,
    monthCounts,
    upcomingOpenDates: getNextAvailableOpenDates(todayStr, 7),
  };
}


