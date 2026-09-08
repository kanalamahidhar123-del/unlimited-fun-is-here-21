import { useState, useEffect, type FormEvent } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Scale,
  CreditCard,
  QrCode,
  ArrowLeft,
  Copy,
  Check,
  Search,
  RefreshCw,
  Clock,
  XCircle,
  Calendar,
  Users,
  Sparkles,
  ShieldCheck,
  Lock,
  Printer,
} from 'lucide-react';
import { SITE } from '@/data/site';
import { createBooking, getBookings, getSystemPaymentMode, type BookingRecord, type SystemPaymentMode } from '@/lib/bookingStore';
import { initiateRazorpayCheckout } from '@/lib/razorpay';

interface FormState {
  full_name: string;
  mobile_number: string;
  email: string;
  visit_date: string;
  preferred_time: string;
  number_of_people: string;
  category: 'Trampoline Park' | 'Soft Play' | '';
  duration: '30 Minutes' | '1 Hour' | '2 Hours' | '3 Hours' | '';
  special_request: string;
  agreed_to_terms: boolean;
  paid_amount: string;
  utr: string;
  confirmed_payment: boolean;
}

const initial: FormState = {
  full_name: '',
  mobile_number: '',
  email: '',
  visit_date: '',
  preferred_time: '',
  number_of_people: '1',
  category: 'Trampoline Park',
  duration: '1 Hour',
  special_request: '',
  agreed_to_terms: false,
  paid_amount: '',
  utr: '',
  confirmed_payment: false,
};

const pricingTable: Record<string, Record<string, number>> = {
  'Trampoline Park': {
    '30 Minutes': 300,
    '1 Hour': 500,
    '2 Hours': 850,
    '3 Hours': 1100,
  },
  'Soft Play': {
    '30 Minutes': 200,
    '1 Hour': 350,
    '2 Hours': 600,
    '3 Hours': 800,
  },
};

export default function Booking() {
  const [activeTab, setActiveTab] = useState<'book' | 'status'>('book');
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [paymentMode, setPaymentMode] = useState<'razorpay' | 'manual_upi'>('razorpay');
  const [systemPaymentMode, setSystemPaymentModeState] = useState<SystemPaymentMode>(getSystemPaymentMode());
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'processing_payment' | 'success' | 'error'>('idle');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  useEffect(() => {
    const handleModeUpdate = () => {
      setSystemPaymentModeState(getSystemPaymentMode());
    };
    window.addEventListener('unlimited_fun_payment_mode_updated', handleModeUpdate);
    return () => window.removeEventListener('unlimited_fun_payment_mode_updated', handleModeUpdate);
  }, []);

  // Status Lookup State
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<BookingRecord[] | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const guestsCount = Math.max(1, parseInt(form.number_of_people) || 1);
  const pricePerPerson =
    form.category && form.duration
      ? pricingTable[form.category]?.[form.duration] || 500
      : 500;
  const bookingTotalAmount = pricePerPerson * guestsCount;

  // Retrieve confirmed booking in real-time from store
  const liveConfirmedBooking = confirmedBookingId
    ? getBookings().find((b) => b.id === confirmedBookingId || b.booking_id === confirmedBookingId) || null
    : null;

  const validateStep1 = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.full_name.trim()) e.full_name = 'Full name is required';
    if (!form.mobile_number.trim()) e.mobile_number = 'Mobile number is required';
    else if (!/^\d{10}$/.test(form.mobile_number.replace(/\D/g, '')))
      e.mobile_number = 'Enter a valid 10-digit mobile number';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email address';
    if (!form.visit_date) e.visit_date = 'Visit date is required';
    if (!form.preferred_time) e.preferred_time = 'Preferred time is required';
    if (!form.number_of_people || Number(form.number_of_people) < 1)
      e.number_of_people = 'At least 1 person required';
    if (!form.category) e.category = 'Please select a category';
    if (!form.duration) e.duration = 'Please select a duration';
    if (!form.agreed_to_terms)
      e.agreed_to_terms = 'You must agree to the safety rules and terms';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    const paidNum = parseFloat(form.paid_amount);
    if (!form.paid_amount.trim() || isNaN(paidNum) || paidNum <= 0) {
      e.paid_amount = 'Please enter the exact amount you paid (e.g. ' + bookingTotalAmount + ')';
    }
    if (!form.utr.trim()) {
      e.utr = 'UPI Transaction ID / UTR is mandatory';
    } else if (form.utr.trim().length < 6) {
      e.utr = 'Enter a valid Transaction ID / UTR (minimum 6 characters)';
    }
    if (!form.confirmed_payment) {
      e.confirmed_payment = 'Please check the box confirming payment completion';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleProceedToPayment = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validateStep1()) return;
    setPaymentError(null);

    // REGISTRATION-ONLY MODE: Direct submission with NO payment required
    if (systemPaymentMode === 'REGISTRATION_ONLY') {
      if (status === 'submitting') return; // duplicate prevention
      setStatus('submitting');
      try {
        const record = await createBooking({
          type: 'Trampoline',
          full_name: form.full_name.trim(),
          mobile_number: form.mobile_number.trim(),
          email: form.email.trim() || null,
          visit_date: form.visit_date,
          preferred_time: form.preferred_time,
          category: form.category,
          duration: form.duration,
          quantity: guestsCount,
          price_per_unit: pricePerPerson,
          booking_amount: bookingTotalAmount,
          paid_amount: 0,
          payment_method: 'Registration Only',
          payment_status: 'Not Required',
          booking_status: 'Registration Received',
          utr: 'N/A',
          special_request: form.special_request.trim() || null,
        });

        setConfirmedBookingId(record.booking_id);
        setStatus('success');
        setForm(initial);
        setStep('details');
      } catch (err) {
        console.error('Registration submission error:', err);
        setPaymentError('Something went wrong submitting your registration. Please try again.');
        setStatus('error');
      }
      return;
    }

    // PAYMENT_REQUIRED MODE: Proceed to Step 2
    if (!form.paid_amount) {
      setForm((prev) => ({ ...prev, paid_amount: String(bookingTotalAmount) }));
    }
    setStep('payment');
    const paymentSection = document.getElementById('booking-step-container');
    if (paymentSection) {
      paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 1. Razorpay Instant Online Payment Handler
  const handleRazorpayPayment = async () => {
    setPaymentError(null);
    setStatus('processing_payment');

    await initiateRazorpayCheckout({
      bookingData: {
        type: 'Trampoline',
        category: form.category,
        duration: form.duration,
        quantity: guestsCount,
        full_name: form.full_name.trim(),
        mobile_number: form.mobile_number.trim(),
        email: form.email.trim() || null,
        visit_date: form.visit_date,
        preferred_time: form.preferred_time,
        special_request: form.special_request.trim() || null,
      },
      onSuccess: async (rzpResp) => {
        try {
          const record = await createBooking({
            type: 'Trampoline',
            full_name: form.full_name.trim(),
            mobile_number: form.mobile_number.trim(),
            email: form.email.trim() || null,
            visit_date: form.visit_date,
            preferred_time: form.preferred_time,
            category: form.category,
            duration: form.duration,
            quantity: guestsCount,
            price_per_unit: pricePerPerson,
            booking_amount: bookingTotalAmount,
            paid_amount: rzpResp.calculated_amount || bookingTotalAmount,
            payment_method: 'Razorpay',
            razorpay_order_id: rzpResp.order_id,
            razorpay_payment_id: rzpResp.payment_id,
            razorpay_signature: rzpResp.signature || null,
            razorpay_signature_verified: true,
            payment_verified_at: new Date().toISOString(),
            payment_status: 'Successful',
            booking_status: 'Confirmed',
            utr: rzpResp.payment_id,
            special_request: form.special_request.trim() || null,
          });

          setConfirmedBookingId(record.booking_id);
          setStatus('success');
          setForm(initial);
          setStep('details');
        } catch (saveErr) {
          console.error('Error saving Razorpay booking:', saveErr);
          setPaymentError('Payment was successful, but saving booking data encountered an error. Please contact support.');
          setStatus('error');
        }
      },
      onError: (errMsg) => {
        console.warn('Razorpay checkout error / cancel:', errMsg);
        setPaymentError(errMsg);
        setStatus('idle');
      },
      onDismiss: () => {
        setStatus('idle');
      },
    });
  };

  const handleSubmitBooking = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validateStep2()) return;
    setStatus('submitting');
    setPaymentError(null);

    const actualPaid = parseFloat(form.paid_amount) || bookingTotalAmount;

    try {
      const record = await createBooking({
        type: 'Trampoline',
        full_name: form.full_name.trim(),
        mobile_number: form.mobile_number.trim(),
        email: form.email.trim() || null,
        visit_date: form.visit_date,
        preferred_time: form.preferred_time,
        category: form.category,
        duration: form.duration,
        quantity: guestsCount,
        price_per_unit: pricePerPerson,
        booking_amount: bookingTotalAmount,
        paid_amount: actualPaid,
        payment_method: 'UPI Manual',
        utr: form.utr.trim(),
        special_request: form.special_request.trim() || null,
      });

      setConfirmedBookingId(record.booking_id);
      setStatus('success');
      setForm(initial);
      setStep('details');
    } catch (err) {
      console.error('Booking submission error:', err);
      setPaymentError('Something went wrong submitting your booking. Please try again.');
      setStatus('error');
    }
  };

  const handleLookup = (e: FormEvent) => {
    e.preventDefault();
    setLookupError('');
    const q = lookupQuery.trim().toLowerCase();
    if (!q) {
      setLookupError('Please enter your Booking ID (e.g. UF-TR-12345) or 10-digit mobile number');
      return;
    }

    setIsSearching(true);
    setTimeout(() => {
      const all = getBookings();
      const matches = all.filter(
        (b) =>
          b.booking_id.toLowerCase() === q ||
          b.mobile_number.replace(/\D/g, '') === q.replace(/\D/g, '') ||
          (b.utr && b.utr.toLowerCase() === q)
      );

      if (matches.length > 0) {
        setLookupResult(matches);
      } else {
        setLookupResult([]);
        setLookupError('No bookings found for the provided Booking ID or Phone number. Please verify and try again.');
      }
      setIsSearching(false);
    }, 300);
  };

  const update = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('9059058449@ybl');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const inputClass =
    'w-full rounded-xl bg-ink-900 border border-ink-700 px-4 py-3 text-white placeholder-ink-500 focus:border-volt-500 focus:outline-none focus:ring-1 focus:ring-volt-500 transition-colors';
  const labelClass = 'block text-sm font-semibold text-ink-200 mb-1.5';
  const errClass = 'mt-1 text-xs text-flame-400 flex items-center gap-1';

  // SUCCESS CONFIRMATION VIEW
  if (status === 'success' && liveConfirmedBooking) {
    const isRegistration = liveConfirmedBooking.payment_method === 'Registration Only' || liveConfirmedBooking.payment_status === 'Not Required';
    const isConfirmed = liveConfirmedBooking.payment_status === 'Successful' && liveConfirmedBooking.booking_status === 'Confirmed';
    const isFailed = liveConfirmedBooking.payment_status === 'Failed' || liveConfirmedBooking.booking_status === 'Cancelled';

    return (
      <section id="booking" className="py-20 sm:py-28 bg-ink-950">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-ink-900 border border-volt-500/40 p-8 sm:p-12 text-center shadow-2xl">
            {isRegistration ? (
              <CheckCircle2 className="h-16 w-16 text-volt-400 mx-auto mb-4 animate-bounce" />
            ) : isConfirmed ? (
              <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto mb-4 animate-bounce" />
            ) : isFailed ? (
              <XCircle className="h-16 w-16 text-flame-400 mx-auto mb-4" />
            ) : (
              <Clock className="h-16 w-16 text-volt-400 mx-auto mb-4 animate-pulse" />
            )}

            <h3 className="font-display font-black text-3xl text-white mb-2">
              {isRegistration
                ? 'Registration Successful! 🎉'
                : isConfirmed
                ? 'Payment Successful! 🎉'
                : isFailed
                ? 'Payment Failed / Rejected'
                : 'Thank You! 🎉'}
            </h3>

            <p className="text-lg font-bold text-volt-400 mb-3">
              {isRegistration
                ? 'Your registration has been received.'
                : isConfirmed
                ? 'Your booking has been confirmed.'
                : isFailed
                ? 'Your payment was not approved. Please contact support.'
                : 'Your booking request has been received.'}
            </p>

            <p className="text-ink-300 text-sm sm:text-base leading-relaxed max-w-lg mx-auto mb-8">
              {isRegistration
                ? 'Your booking details have been saved. Payment is not required at this time. Please show your Booking ID at the park reception.'
                : isConfirmed
                ? 'Your payment has been verified by our team. Please show this Booking ID at the park entrance.'
                : isFailed
                ? 'Please call us at 9059058449 for assistance with your payment verification.'
                : 'Your payment is pending verification. Our team will verify your payment and confirm your booking shortly.'}
            </p>

            {/* Booking Details Card */}
            <div className="bg-ink-950/80 border border-ink-800 rounded-2xl p-6 text-left mb-8 space-y-3.5">
              <div className="flex justify-between items-center border-b border-ink-800 pb-3">
                <span className="text-xs font-bold text-ink-400 tracking-wider uppercase">
                  Booking Reference
                </span>
                <span className="font-mono text-sm font-black text-volt-400 bg-volt-500/10 px-2.5 py-1 rounded border border-volt-500/30">
                  {liveConfirmedBooking.booking_id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-ink-400 block">Customer Name</span>
                  <span className="text-white font-semibold">{liveConfirmedBooking.full_name}</span>
                </div>
                <div>
                  <span className="text-xs text-ink-400 block">Mobile Number</span>
                  <span className="text-white font-semibold">{liveConfirmedBooking.mobile_number}</span>
                </div>
                <div>
                  <span className="text-xs text-ink-400 block">Date & Time</span>
                  <span className="text-white font-semibold">
                    {liveConfirmedBooking.visit_date} at {liveConfirmedBooking.preferred_time}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-ink-400 block">Package & Guests</span>
                  <span className="text-white font-semibold">
                    {liveConfirmedBooking.category} ({liveConfirmedBooking.duration}) · {liveConfirmedBooking.quantity} {liveConfirmedBooking.quantity > 1 ? 'Guests' : 'Guest'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-ink-400 block">Payment Method</span>
                  <span className="text-white font-semibold text-xs flex items-center gap-1.5 mt-0.5">
                    <CreditCard className="h-3.5 w-3.5 text-volt-400" />
                    {liveConfirmedBooking.payment_method || 'Online Payment'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-volt-400 font-bold block">Actual Paid Amount</span>
                  <span className="text-volt-400 font-black text-lg">
                    {isRegistration ? '₹0 (Payment Not Required)' : `₹${liveConfirmedBooking.paid_amount.toLocaleString('en-IN')}`}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-ink-400 block">Payment / Transaction Ref ID</span>
                  <span className="text-white font-mono text-xs break-all bg-ink-900 px-3 py-1.5 rounded-lg border border-ink-800 inline-block mt-1">
                    {liveConfirmedBooking.razorpay_payment_id || liveConfirmedBooking.utr || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Live Status Indicators */}
              <div className="border-t border-ink-800 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-400">Payment Status:</span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      liveConfirmedBooking.payment_status === 'Successful'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : liveConfirmedBooking.payment_status === 'Not Required'
                        ? 'bg-ink-800 text-ink-300 border border-ink-700'
                        : liveConfirmedBooking.payment_status === 'Failed'
                        ? 'bg-flame-500/10 text-flame-400 border border-flame-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {liveConfirmedBooking.payment_status === 'Successful' && '🟢 Verified Successful'}
                    {liveConfirmedBooking.payment_status === 'Not Required' && '⚪ Not Required'}
                    {liveConfirmedBooking.payment_status === 'Failed' && '🔴 Failed'}
                    {liveConfirmedBooking.payment_status === 'Pending Verification' && '🟡 Pending Verification'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-400">Booking Status:</span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      liveConfirmedBooking.booking_status === 'Confirmed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : liveConfirmedBooking.booking_status === 'Registration Received'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                        : liveConfirmedBooking.booking_status === 'Cancelled'
                        ? 'bg-flame-500/10 text-flame-400 border border-flame-500/30'
                        : 'bg-ink-800 text-ink-300 border border-ink-700'
                    }`}
                  >
                    {liveConfirmedBooking.booking_status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-ink-800 border border-ink-700 px-6 py-3.5 text-sm font-semibold text-ink-200 hover:text-white hover:bg-ink-700 transition-colors"
              >
                <Printer className="h-4 w-4" /> Print / Save Pass
              </button>
              <a
                href="#home"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-volt-500 px-8 py-3.5 text-sm font-bold text-ink-950 hover:bg-volt-400 transition-colors shadow-lg shadow-volt-500/20"
              >
                BACK TO HOME
              </a>
              <button
                onClick={() => {
                  setStatus('idle');
                  setConfirmedBookingId(null);
                  setStep('details');
                }}
                className="w-full sm:w-auto text-xs text-ink-400 hover:text-white underline py-2"
              >
                Make Another Booking
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="py-20 sm:py-28 bg-ink-950">
      <div id="booking-step-container" className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="text-center mb-8">
          <span className="inline-block text-sm font-bold text-volt-500 tracking-widest uppercase mb-3">
            Bookings & Status
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white">
            BOOK SLOT OR <span className="text-volt-500">CHECK STATUS</span>
          </h2>
          <p className="mt-4 text-ink-400">
            Book your trampoline park visit online or check your payment & booking confirmation live.
          </p>
        </div>

        {/* Tab Switcher: Book Slot vs Track Status */}
        <div className="flex items-center justify-center mb-10">
          <div className="bg-ink-900 border border-ink-800 p-1.5 rounded-full flex items-center gap-2 shadow-lg">
            <button
              onClick={() => setActiveTab('book')}
              className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'book'
                  ? 'bg-volt-500 text-ink-950 shadow-md shadow-volt-500/20'
                  : 'text-ink-400 hover:text-white'
              }`}
            >
              🎟️ Book Your Slot
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'status'
                  ? 'bg-volt-500 text-ink-950 shadow-md shadow-volt-500/20'
                  : 'text-ink-400 hover:text-white'
              }`}
            >
              🔍 Check Booking Status
            </button>
          </div>
        </div>

        {/* TAB 1: BOOK NEW SLOT */}
        {activeTab === 'book' && (
          <div>
            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    step === 'details'
                      ? 'bg-volt-500 text-ink-950 shadow-md shadow-volt-500/20'
                      : 'bg-ink-800 text-ink-300'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-ink-950 text-volt-400 flex items-center justify-center text-[10px]">1</span>
                  <span>Details</span>
                </div>
                <div className="w-8 h-0.5 bg-ink-800" />
                <div
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    step === 'payment'
                      ? 'bg-volt-500 text-ink-950 shadow-md shadow-volt-500/20'
                      : 'bg-ink-800 text-ink-400'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-ink-950 text-volt-400 flex items-center justify-center text-[10px]">2</span>
                  <span>UPI Payment</span>
                </div>
              </div>
            </div>

            {step === 'details' ? (
              /* STEP 1: CUSTOMER & PACKAGE DETAILS FORM */
              <form
                onSubmit={handleProceedToPayment}
                className="rounded-3xl bg-ink-900 border border-ink-800 p-6 sm:p-8 space-y-5 shadow-2xl"
              >
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>
                      Full Name <span className="text-flame-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={(e) => update('full_name', e.target.value)}
                      className={inputClass}
                      placeholder="Your full name"
                    />
                    {errors.full_name && (
                      <p className={errClass}>
                        <AlertCircle className="h-3 w-3" /> {errors.full_name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>
                      Mobile Number <span className="text-flame-400">*</span>
                    </label>
                    <input
                      type="tel"
                      value={form.mobile_number}
                      onChange={(e) => update('mobile_number', e.target.value)}
                      className={inputClass}
                      placeholder="10-digit mobile number"
                    />
                    {errors.mobile_number && (
                      <p className={errClass}>
                        <AlertCircle className="h-3 w-3" /> {errors.mobile_number}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Email (Optional)</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className={inputClass}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className={errClass}>
                      <AlertCircle className="h-3 w-3" /> {errors.email}
                    </p>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>
                      Visit Date <span className="text-flame-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.visit_date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => update('visit_date', e.target.value)}
                      className={inputClass}
                    />
                    {errors.visit_date && (
                      <p className={errClass}>
                        <AlertCircle className="h-3 w-3" /> {errors.visit_date}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>
                      Preferred Time <span className="text-flame-400">*</span>
                    </label>
                    <input
                      type="time"
                      value={form.preferred_time}
                      onChange={(e) => update('preferred_time', e.target.value)}
                      className={inputClass}
                    />
                    {errors.preferred_time && (
                      <p className={errClass}>
                        <AlertCircle className="h-3 w-3" /> {errors.preferred_time}
                      </p>
                    )}
                  </div>
                </div>

                {/* Package & Duration Selection */}
                <div className="grid sm:grid-cols-3 gap-5">
                  <div>
                    <label className={labelClass}>
                      Number of People <span className="text-flame-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.number_of_people}
                      onChange={(e) => update('number_of_people', e.target.value)}
                      className={inputClass}
                      placeholder="1"
                    />
                    {errors.number_of_people && (
                      <p className={errClass}>
                        <AlertCircle className="h-3 w-3" /> {errors.number_of_people}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>
                      Category <span className="text-flame-400">*</span>
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => update('category', e.target.value as any)}
                      className={inputClass}
                    >
                      <option value="Trampoline Park">🏃 Trampoline Park (5+ yrs / 2.5ft+)</option>
                      <option value="Soft Play">🧸 Soft Play (Below 5 yrs / 2.5ft)</option>
                    </select>
                    {errors.category && (
                      <p className={errClass}>
                        <AlertCircle className="h-3 w-3" /> {errors.category}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>
                      Duration <span className="text-flame-400">*</span>
                    </label>
                    <select
                      value={form.duration}
                      onChange={(e) => update('duration', e.target.value as any)}
                      className={inputClass}
                    >
                      <option value="30 Minutes">30 Minutes (₹{pricingTable[form.category || 'Trampoline Park']?.['30 Minutes'] || 300})</option>
                      <option value="1 Hour">1 Hour (₹{pricingTable[form.category || 'Trampoline Park']?.['1 Hour'] || 500})</option>
                      <option value="2 Hours">2 Hours (₹{pricingTable[form.category || 'Trampoline Park']?.['2 Hours'] || 850})</option>
                      <option value="3 Hours">3 Hours (₹{pricingTable[form.category || 'Trampoline Park']?.['3 Hours'] || 1100})</option>
                    </select>
                    {errors.duration && (
                      <p className={errClass}>
                        <AlertCircle className="h-3 w-3" /> {errors.duration}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Special Request / Message (Optional)</label>
                  <textarea
                    value={form.special_request}
                    onChange={(e) => update('special_request', e.target.value)}
                    rows={2}
                    className={inputClass}
                    placeholder="Any special notes or requirements..."
                  />
                </div>

                {/* Live Calculation Summary Banner */}
                <div className="rounded-2xl bg-ink-950/80 border border-volt-500/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-ink-400 block font-semibold uppercase tracking-wider">
                      Calculation Summary
                    </span>
                    <span className="text-sm text-ink-200">
                      {form.category || 'Trampoline'} · {form.duration || '1 Hour'} · {guestsCount} {guestsCount > 1 ? 'Guests' : 'Guest'} (₹{pricePerPerson} / person)
                    </span>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-xs text-ink-400 block">Booking Amount:</span>
                    <span className="font-display font-black text-2xl sm:text-3xl text-volt-400">
                      ₹{bookingTotalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={form.agreed_to_terms}
                    onChange={(e) => update('agreed_to_terms', e.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-ink-600 bg-ink-900 text-volt-500 focus:ring-volt-500"
                  />
                  <span className="text-sm text-ink-300">
                    I agree to follow the park's safety rules and terms. Participants must be below {SITE.weightLimit}.
                  </span>
                </label>
                {errors.agreed_to_terms && (
                  <p className={errClass}>
                    <AlertCircle className="h-3 w-3" /> {errors.agreed_to_terms}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-volt-500 px-6 py-4 text-base font-black text-ink-950 hover:bg-volt-400 transition-all active:scale-95 shadow-xl shadow-volt-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      SUBMITTING REGISTRATION...
                    </>
                  ) : systemPaymentMode === 'REGISTRATION_ONLY' ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      SUBMIT REGISTRATION
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      PROCEED TO PAYMENT (₹{bookingTotalAmount.toLocaleString('en-IN')})
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* STEP 2: PAYMENT METHOD SELECTION & CHECKOUT */
              <div className="rounded-3xl bg-ink-900 border border-ink-800 p-6 sm:p-10 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-ink-800 pb-4">
                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-ink-300 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" /> Edit Booking Details
                  </button>
                  <span className="text-xs font-mono font-bold text-volt-400 uppercase tracking-wider bg-volt-500/10 px-2.5 py-1 rounded border border-volt-500/30">
                    Step 2 of 2
                  </span>
                </div>

                {/* Order Summary Card */}
                <div className="bg-ink-950/80 border border-ink-800 rounded-2xl p-4 sm:p-5">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xs text-ink-400 font-bold uppercase tracking-wider">
                      Payable Amount
                    </span>
                    <span className="font-display font-black text-2xl sm:text-3xl text-volt-400">
                      ₹{bookingTotalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-xs text-ink-300 space-y-1">
                    <p><strong>Customer:</strong> {form.full_name} ({form.mobile_number})</p>
                    <p><strong>Package:</strong> {form.category} · {form.duration} · {guestsCount} {guestsCount > 1 ? 'Guests' : 'Guest'}</p>
                    <p><strong>Slot:</strong> {form.visit_date} at {form.preferred_time}</p>
                  </div>
                </div>

                {/* Mode Selector Tabs */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('razorpay')}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      paymentMode === 'razorpay'
                        ? 'bg-volt-500/10 border-volt-500 ring-1 ring-volt-500'
                        : 'bg-ink-950/60 border-ink-800 hover:border-ink-700 text-ink-400'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-volt-400 block uppercase tracking-wider">
                        ⚡ Recommended
                      </span>
                      <span className="text-sm font-bold text-white block mt-0.5">
                        Razorpay Checkout
                      </span>
                      <span className="text-[11px] text-ink-400">
                        Instant Online Confirmation
                      </span>
                    </div>
                    <Lock className="h-5 w-5 text-volt-400 flex-shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode('manual_upi')}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      paymentMode === 'manual_upi'
                        ? 'bg-volt-500/10 border-volt-500 ring-1 ring-volt-500'
                        : 'bg-ink-950/60 border-ink-800 hover:border-ink-700 text-ink-400'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-ink-400 block uppercase tracking-wider">
                        Alternative
                      </span>
                      <span className="text-sm font-bold text-white block mt-0.5">
                        Manual UPI QR
                      </span>
                      <span className="text-[11px] text-ink-400">
                        PhonePe QR + UTR Verification
                      </span>
                    </div>
                    <QrCode className="h-5 w-5 text-ink-400 flex-shrink-0" />
                  </button>
                </div>

                {paymentError && (
                  <div className="rounded-xl bg-flame-500/10 border border-flame-500/30 p-4 flex items-center gap-2 text-flame-400 text-sm">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}

                {/* OPTION 1: RAZORPAY STANDARD CHECKOUT */}
                {paymentMode === 'razorpay' && (
                  <div className="space-y-5 rounded-2xl bg-ink-950/60 border border-volt-500/30 p-6">
                    <div className="text-center space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-volt-500/10 border border-volt-500/30 text-xs font-bold text-volt-400">
                        <ShieldCheck className="h-4 w-4" /> Official Razorpay Standard Checkout
                      </div>
                      <h4 className="text-base font-bold text-white">
                        All Online Payment Methods Supported
                      </h4>
                      <p className="text-xs text-ink-400 max-w-md mx-auto">
                        Pay securely using <strong>Google Pay</strong>, <strong>PhonePe</strong>, <strong>Paytm</strong>, <strong>BHIM UPI</strong>, <strong>Debit & Credit Cards</strong> (Visa, MasterCard, RuPay), or <strong>NetBanking</strong>.
                      </p>
                    </div>

                    {/* Supported Logos Pill Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs text-ink-300 font-semibold">
                      <div className="p-2.5 rounded-xl bg-ink-900 border border-ink-800">
                        📱 UPI Apps
                      </div>
                      <div className="p-2.5 rounded-xl bg-ink-900 border border-ink-800">
                        💳 Cards
                      </div>
                      <div className="p-2.5 rounded-xl bg-ink-900 border border-ink-800">
                        🏦 NetBanking
                      </div>
                      <div className="p-2.5 rounded-xl bg-ink-900 border border-ink-800">
                        👛 Wallets
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRazorpayPayment}
                      disabled={status === 'processing_payment'}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-volt-500 px-6 py-4 text-base font-black text-ink-950 hover:bg-volt-400 transition-all active:scale-95 shadow-xl shadow-volt-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {status === 'processing_payment' ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          OPENING RAZORPAY CHECKOUT...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          PAY NOW ₹{bookingTotalAmount.toLocaleString('en-IN')} (INSTANT CONFIRMATION)
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-center text-ink-500">
                      🔒 256-bit Encrypted · Certified Razorpay Gateway
                    </p>
                  </div>
                )}

                {/* OPTION 2: MANUAL UPI QR */}
                {paymentMode === 'manual_upi' && (
                  <form onSubmit={handleSubmitBooking} className="space-y-5">
                    <div className="rounded-2xl bg-black/60 border border-volt-500/30 p-6 text-center space-y-4">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-volt-500/10 border border-volt-500/30 text-xs font-bold text-volt-400 uppercase tracking-wider">
                        <QrCode className="h-4 w-4" /> Scan & Pay via PhonePe QR
                      </div>

                      <p className="text-sm font-bold text-white">
                        Pay the exact amount: <span className="text-volt-400 font-black text-lg">₹{bookingTotalAmount.toLocaleString('en-IN')}</span>
                      </p>

                      <div className="mx-auto w-56 h-56 sm:w-60 sm:h-60 bg-white p-3 rounded-2xl shadow-2xl border-2 border-volt-500/60 flex items-center justify-center">
                        <img
                          src="/phonepe-qr.jpg"
                          alt="PhonePe UPI QR Code"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-center gap-2 text-xs">
                        <span className="text-ink-400">UPI ID:</span>
                        <span className="font-mono font-bold text-white bg-ink-800 px-2.5 py-1 rounded border border-ink-700">
                          9059058449@ybl
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="text-volt-400 hover:text-volt-300 inline-flex items-center gap-1 font-semibold"
                        >
                          {copiedUpi ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          {copiedUpi ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>
                          Actual Paid Amount (₹) <span className="text-flame-400">*</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="1"
                          value={form.paid_amount}
                          onChange={(e) => update('paid_amount', e.target.value)}
                          className={`${inputClass} font-bold text-base text-volt-400`}
                          placeholder={String(bookingTotalAmount)}
                        />
                        {errors.paid_amount && (
                          <p className={errClass}>
                            <AlertCircle className="h-3 w-3" /> {errors.paid_amount}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className={labelClass}>
                          UPI Transaction ID / UTR <span className="text-flame-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.utr}
                          onChange={(e) => update('utr', e.target.value)}
                          className={`${inputClass} font-mono text-base font-semibold uppercase tracking-wider`}
                          placeholder="12-digit UTR from UPI app"
                        />
                        {errors.utr && (
                          <p className={errClass}>
                            <AlertCircle className="h-3 w-3" /> {errors.utr}
                          </p>
                        )}
                      </div>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer rounded-xl bg-ink-950/60 border border-ink-800 p-3.5">
                      <input
                        type="checkbox"
                        checked={form.confirmed_payment}
                        onChange={(e) => update('confirmed_payment', e.target.checked)}
                        className="mt-0.5 h-5 w-5 rounded border-ink-600 bg-ink-900 text-volt-500 focus:ring-volt-500"
                      />
                      <span className="text-xs sm:text-sm text-ink-200 font-semibold">
                        I confirm that I have transferred ₹{form.paid_amount || bookingTotalAmount} and submitted the valid UTR.
                      </span>
                    </label>
                    {errors.confirmed_payment && (
                      <p className={errClass}>
                        <AlertCircle className="h-3 w-3" /> {errors.confirmed_payment}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-volt-500 px-6 py-4 text-base font-black text-ink-950 hover:bg-volt-400 transition-all active:scale-95 shadow-xl shadow-volt-500/20 disabled:opacity-60"
                    >
                      {status === 'submitting' ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          SUBMITTING MANUAL PAYMENT...
                        </>
                      ) : (
                        'SUBMIT UTR FOR VERIFICATION'
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LIVE BOOKING & PAYMENT STATUS LOOKUP */}
        {activeTab === 'status' && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-ink-900 border border-ink-800 p-6 sm:p-8 shadow-2xl">
              <h3 className="font-display font-black text-xl sm:text-2xl text-white mb-2 flex items-center gap-2">
                <Search className="h-5 w-5 text-volt-400" />
                Track Your Booking & Payment Status
              </h3>
              <p className="text-xs sm:text-sm text-ink-400 mb-6">
                Enter your <strong>Booking Reference ID</strong> (e.g. <code className="text-volt-400">UF-TR-81641</code> or <code className="text-volt-400">UF-RFID-72369</code>) or your <strong>10-digit Mobile Number</strong> to see your current payment verification and booking confirmation status.
              </p>

              <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500" />
                  <input
                    type="text"
                    value={lookupQuery}
                    onChange={(e) => setLookupQuery(e.target.value)}
                    placeholder="Enter Booking ID (e.g. UF-TR-81641) or Mobile Number"
                    className="w-full rounded-2xl bg-ink-950 border border-ink-700 pl-11 pr-4 py-3.5 text-sm text-white placeholder-ink-500 focus:border-volt-500 focus:outline-none focus:ring-1 focus:ring-volt-500 font-medium"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-volt-500 px-6 py-3.5 text-sm font-black text-ink-950 hover:bg-volt-400 transition-all active:scale-95 shadow-lg shadow-volt-500/20 disabled:opacity-60"
                >
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  CHECK STATUS
                </button>
              </form>

              {lookupError && (
                <div className="mt-4 rounded-xl bg-flame-500/10 border border-flame-500/30 p-3.5 flex items-center gap-2.5 text-flame-400 text-xs sm:text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{lookupError}</span>
                </div>
              )}
            </div>

            {/* Lookup Results Cards */}
            {lookupResult && lookupResult.length > 0 && (
              <div className="space-y-4">
                {lookupResult.map((b) => {
                  const isConfirmed = b.payment_status === 'Successful' && b.booking_status === 'Confirmed';
                  const isFailed = b.payment_status === 'Failed' || b.booking_status === 'Cancelled';
                  const isPending = b.payment_status === 'Pending Verification';

                  return (
                    <div
                      key={b.id}
                      className={`rounded-3xl border p-6 sm:p-8 transition-all ${
                        isConfirmed
                          ? 'bg-ink-900 border-emerald-500/50 shadow-xl shadow-emerald-500/10'
                          : isFailed
                          ? 'bg-ink-900 border-flame-500/50 shadow-xl shadow-flame-500/10'
                          : 'bg-ink-900 border-amber-500/40 shadow-xl shadow-amber-500/10'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-800 pb-4 mb-5">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-black text-volt-400 bg-volt-500/10 px-3 py-1 rounded-lg border border-volt-500/30">
                            {b.booking_id}
                          </span>
                          <span className="text-xs font-bold text-ink-300">
                            {b.type} Booking
                          </span>
                        </div>

                        {/* Payment Status Pill */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                              isConfirmed
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                                : isFailed
                                ? 'bg-flame-500/20 text-flame-400 border border-flame-500/50'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                            }`}
                          >
                            {isConfirmed && '🟢 Payment Successful'}
                            {isFailed && '🔴 Payment Failed'}
                            {isPending && '🟡 Payment Pending Verification'}
                          </span>
                        </div>
                      </div>

                      {/* Status Banner Text */}
                      <div className="mb-6 p-4 rounded-2xl bg-ink-950/80 border border-ink-800">
                        {isConfirmed && (
                          <div className="flex items-start gap-3 text-emerald-300">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-emerald-400 text-sm">Booking Confirmed! 🎉</p>
                              <p className="text-xs text-ink-300 mt-0.5">
                                Your payment of ₹{b.paid_amount.toLocaleString('en-IN')} has been verified by the Unlimited Fun management. Your slot is confirmed.
                              </p>
                            </div>
                          </div>
                        )}

                        {isPending && (
                          <div className="flex items-start gap-3 text-amber-300">
                            <Clock className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
                            <div>
                              <p className="font-bold text-amber-400 text-sm">Payment Pending Verification 🟡</p>
                              <p className="text-xs text-ink-300 mt-0.5">
                                We have received your booking and UTR (<span className="font-mono text-white">{b.utr}</span>). Our admin team will verify your payment and confirm your slot shortly.
                              </p>
                            </div>
                          </div>
                        )}

                        {isFailed && (
                          <div className="flex items-start gap-3 text-flame-300">
                            <XCircle className="h-5 w-5 text-flame-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-flame-400 text-sm">Payment Not Approved / Cancelled 🔴</p>
                              <p className="text-xs text-ink-300 mt-0.5">
                                The submitted payment could not be verified. Please contact our support team at <a href={`tel:${SITE.phone}`} className="text-white underline">{SITE.phone}</a>.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div className="bg-ink-950/60 p-3 rounded-xl border border-ink-800">
                          <span className="text-ink-500 block uppercase font-bold text-[10px]">Customer</span>
                          <span className="text-white font-semibold text-sm mt-0.5 block">{b.full_name}</span>
                          <span className="text-ink-400">{b.mobile_number}</span>
                        </div>

                        <div className="bg-ink-950/60 p-3 rounded-xl border border-ink-800">
                          <span className="text-ink-500 block uppercase font-bold text-[10px]">Slot</span>
                          <span className="text-white font-semibold text-sm mt-0.5 block">{b.visit_date}</span>
                          <span className="text-ink-400">{b.preferred_time}</span>
                        </div>

                        <div className="bg-ink-950/60 p-3 rounded-xl border border-ink-800">
                          <span className="text-ink-500 block uppercase font-bold text-[10px]">Package</span>
                          <span className="text-white font-semibold text-sm mt-0.5 block">{b.category}</span>
                          <span className="text-ink-400">{b.quantity} {b.type === 'RFID' ? 'Cards' : 'Guests'}</span>
                        </div>

                        <div className="bg-ink-950/60 p-3 rounded-xl border border-ink-800">
                          <span className="text-ink-500 block uppercase font-bold text-[10px]">Amount Paid</span>
                          <span className="text-volt-400 font-display font-black text-base mt-0.5 block">
                            ₹{b.paid_amount.toLocaleString('en-IN')}
                          </span>
                          <span className="text-ink-500 text-[10px]">Total: ₹{b.booking_amount}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-ink-800/80 flex items-center justify-between text-[11px] text-ink-500 font-mono">
                        <span>UTR: {b.utr}</span>
                        <button
                          onClick={handleLookup}
                          className="inline-flex items-center gap-1 text-volt-400 hover:text-volt-300 font-semibold"
                        >
                          <RefreshCw className="h-3 w-3" /> Refresh Status
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
