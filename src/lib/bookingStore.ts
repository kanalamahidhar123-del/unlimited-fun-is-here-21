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
  existing.unshift(newBooking);
  saveBookings(existing);

  // Sync to Google Sheet Webhook with required columns
  const sheetUrl = import.meta.env.VITE_GOOGLE_SHEET_URL || SITE.googleSheetUrl;
  if (sheetUrl) {
    try {
      const nowStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          // Columns required by user:
          timestamp: nowStr,
          Timestamp: nowStr,
          full_name: newBooking.full_name,
          "Full Name": newBooking.full_name,
          mobile_number: newBooking.mobile_number,
          "Mobile Number": newBooking.mobile_number,
          whatsapp_number: newBooking.whatsapp_number || newBooking.mobile_number,
          "WhatsApp Number": newBooking.whatsapp_number || newBooking.mobile_number,
          email: newBooking.email || '',
          Email: newBooking.email || '',
          visit_date: newBooking.visit_date,
          "Visit Date": newBooking.visit_date,
          time: newBooking.preferred_time,
          Time: newBooking.preferred_time,
          adults: newBooking.adults || 0,
          Adults: newBooking.adults || 0,
          children: newBooking.children || 0,
          Children: newBooking.children || 0,
          package: `${newBooking.category} (${newBooking.duration})`,
          Package: `${newBooking.category} (${newBooking.duration})`,
          rfid_card: newBooking.rfid_card_type || 'None',
          "RFID Card": newBooking.rfid_card_type || 'None',
          booking_status: 'Pending Payment',
          "Booking Status": 'Pending Payment',
          special_request: newBooking.special_request || '',
          "Special Request": newBooking.special_request || '',
          booking_id: newBooking.booking_id,
          type: newBooking.type === 'RFID' ? 'RFID Card Booking' : 'Trampoline Booking',
          guests: `${(newBooking.adults || 0) + (newBooking.children || 0) || newBooking.quantity} Guests`,
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
