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
    if (!raw) return [];
    const list: BookingRecord[] = JSON.parse(raw);
    return list
      .map((b) => ({
        ...b,
        booking_amount: b.booking_amount ?? b.total_amount ?? 0,
        paid_amount: b.paid_amount ?? 0,
        payment_method: b.payment_method ?? 'Registration Only',
      }))
      .sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  } catch (e) {
    console.error('Failed to load bookings from storage', e);
    return [];
  }
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

  // Sync to Supabase if configured
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder.supabase.co');
  if (isConfigured) {
    try {
      await supabase.from('bookings').insert({
        full_name: newBooking.full_name,
        mobile_number: newBooking.mobile_number,
        email: newBooking.email,
        visit_date: newBooking.visit_date,
        preferred_time: newBooking.preferred_time,
        number_of_people: (newBooking.adults || 0) + (newBooking.children || 0) || newBooking.quantity,
        category: newBooking.category,
        duration: newBooking.duration,
        special_request: `[${newBooking.booking_id}] Method: ${newBooking.payment_method} | Status: ${newBooking.booking_status} | ${newBooking.special_request || ''}`,
        agreed_to_terms: true,
      });
    } catch (syncErr) {
      console.warn('Supabase remote sync notice:', syncErr);
    }
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

export function getDashboardStats() {
  const bookings = getBookings();
  const todayStr = new Date().toISOString().split('T')[0];

  const totalBookings = bookings.length;
  const todayBookings = bookings.filter((b) => b.created_at.startsWith(todayStr) || b.visit_date === todayStr).length;
  const pendingPayments = bookings.filter((b) => b.payment_status === 'Pending Verification').length;
  const successfulPayments = bookings.filter((b) => b.payment_status === 'Successful').length;
  const failedPayments = bookings.filter((b) => b.payment_status === 'Failed').length;
  const confirmedBookings = bookings.filter((b) => b.booking_status === 'Confirmed').length;
  const cancelledBookings = bookings.filter((b) => b.booking_status === 'Cancelled').length;
  const totalRfidBookings = bookings.filter((b) => b.type === 'RFID').length;

  // IMPORTANT: Revenue strictly sums the actual paid_amount for bookings where payment_status === 'Successful'
  // Booking Amount is NOT counted as revenue!
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
    return true;
  } catch (e) {
    console.error('Failed to delete booking', e);
    return false;
  }
}

export function clearAllBookings(): boolean {
  try {
    saveBookings([]);
    return true;
  } catch (e) {
    console.error('Failed to clear bookings', e);
    return false;
  }
}
