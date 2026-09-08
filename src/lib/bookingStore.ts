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
  email: string | null;
  visit_date: string;
  preferred_time: string;
  category: string;
  duration: string;
  quantity: number;
  price_per_unit: number;
  booking_amount: number;      // Calculated package total (e.g. ₹300)
  paid_amount: number;         // Actual amount customer paid via Razorpay/UPI
  total_amount?: number;       // Legacy alias for booking_amount
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
        paid_amount: b.paid_amount ?? b.booking_amount ?? b.total_amount ?? 0,
        payment_method: b.payment_method ?? (b.razorpay_payment_id ? 'Razorpay' : 'UPI Manual'),
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
    // Dispatch custom event so all open views/admin reactive hooks update
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
  const isRegistrationOnly = input.payment_method === 'Registration Only';
  const paymentStatus: PaymentStatus =
    input.payment_status ||
    (isRegistrationOnly ? 'Not Required' : isRazorpaySuccess ? 'Successful' : 'Pending Verification');
  const bookingStatus: BookingStatus =
    input.booking_status ||
    (isRegistrationOnly ? 'Registration Received' : isRazorpaySuccess ? 'Confirmed' : 'Pending');

  const newBooking: BookingRecord = {
    id: input.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
    booking_id: input.booking_id || generateBookingId(input.type),
    ...input,
    booking_amount: Number(input.booking_amount) || 0,
    paid_amount: isRegistrationOnly ? 0 : Number(input.paid_amount) || 0,
    total_amount: Number(input.booking_amount) || 0,
    payment_method: input.payment_method || (isRazorpaySuccess ? 'Razorpay' : 'UPI Manual'),
    razorpay_order_id: input.razorpay_order_id || null,
    razorpay_payment_id: input.razorpay_payment_id || null,
    razorpay_signature: input.razorpay_signature || null,
    razorpay_signature_verified: input.razorpay_signature_verified ?? isRazorpaySuccess,
    payment_verified_at: input.payment_verified_at || (isRazorpaySuccess ? new Date().toISOString() : null),
    payment_status: paymentStatus,
    booking_status: bookingStatus,
    created_at: new Date().toISOString(),
  };

  const existing = getBookings();
  existing.unshift(newBooking);
  saveBookings(existing);

  // Sync to Google Sheet Webhook
  const sheetUrl = import.meta.env.VITE_GOOGLE_SHEET_URL || SITE.googleSheetUrl;
  if (sheetUrl) {
    try {
      await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          type: newBooking.type === 'RFID' ? 'RFID Card Booking' : 'Trampoline Booking',
          booking_id: newBooking.booking_id,
          name: newBooking.full_name,
          phone: newBooking.mobile_number,
          email: newBooking.email || '',
          visit_date: newBooking.visit_date,
          time: newBooking.preferred_time,
          guests: `${newBooking.quantity} ${newBooking.type === 'RFID' ? 'Cards' : 'Guests'}`,
          category: newBooking.category,
          duration: newBooking.duration,
          booking_amount: `₹${newBooking.booking_amount}`,
          paid_amount: `₹${newBooking.paid_amount}`,
          amount: `Paid: ₹${newBooking.paid_amount} (Booking Total: ₹${newBooking.booking_amount})`,
          payment_method: newBooking.payment_method,
          razorpay_payment_id: newBooking.razorpay_payment_id || '',
          utr: newBooking.utr || newBooking.razorpay_payment_id || '',
          payment_status: newBooking.payment_status,
          booking_status: newBooking.booking_status,
          special_request: newBooking.special_request || '',
          submitted_at: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        }),
      });
    } catch (err) {
      console.warn('Google Sheet webhook sync notice:', err);
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
        number_of_people: newBooking.quantity,
        category: newBooking.category,
        duration: newBooking.duration,
        special_request: `[${newBooking.booking_id}] Method: ${newBooking.payment_method} | Rzp ID: ${newBooking.razorpay_payment_id || 'N/A'} | Booking Amount: ₹${newBooking.booking_amount} | Paid Amount: ₹${newBooking.paid_amount} | Status: ${newBooking.payment_status} | ${newBooking.special_request || ''}`,
        agreed_to_terms: true,
      });
    } catch (syncErr) {
      console.warn('Supabase remote sync notice:', syncErr);
    }
  }

  return newBooking;
}

export function updateBookingStatus(
  id: string,
  paymentStatus: PaymentStatus,
  bookingStatus: BookingStatus
): boolean {
  const bookings = getBookings();
  const index = bookings.findIndex((b) => b.id === id || b.booking_id === id);
  if (index === -1) return false;

  // Preserve the exact recorded paid_amount - do NOT overwrite it!
  bookings[index].payment_status = paymentStatus;
  bookings[index].booking_status = bookingStatus;
  saveBookings(bookings);
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
