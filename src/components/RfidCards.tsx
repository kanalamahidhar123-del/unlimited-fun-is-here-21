import { useState, type FormEvent } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Wifi,
  ShieldCheck,
  Zap,
  QrCode,
  ArrowLeft,
  Copy,
  Check,
  Lock,
  Printer,
} from 'lucide-react';
import { SITE } from '@/data/site';
import { createBooking, getSystemPaymentMode, type BookingRecord, type SystemPaymentMode } from '@/lib/bookingStore';
import { initiateRazorpayCheckout } from '@/lib/razorpay';

export type RfidCardType = 'Basic' | 'Premium';

interface RfidFormState {
  full_name: string;
  mobile_number: string;
  email: string;
  card_type: RfidCardType;
  quantity: number;
  visit_date: string;
  preferred_time: string;
  special_request: string;
  paid_amount: string;
  utr: string;
  confirmed_payment: boolean;
}

const initialForm: RfidFormState = {
  full_name: '',
  mobile_number: '',
  email: '',
  card_type: 'Basic',
  quantity: 1,
  visit_date: '',
  preferred_time: '',
  special_request: '',
  paid_amount: '',
  utr: '',
  confirmed_payment: false,
};

export default function RfidCards() {
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [paymentMode, setPaymentMode] = useState<'razorpay' | 'manual_upi'>('razorpay');
  const [systemPaymentMode, setSystemPaymentModeState] = useState<SystemPaymentMode>(getSystemPaymentMode());
  const [form, setForm] = useState<RfidFormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof RfidFormState, string>>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'processing_payment' | 'success' | 'error'>('idle');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  useEffect(() => {
    const handleModeUpdate = () => {
      setSystemPaymentModeState(getSystemPaymentMode());
    };
    window.addEventListener('unlimited_fun_payment_mode_updated', handleModeUpdate);
    return () => window.removeEventListener('unlimited_fun_payment_mode_updated', handleModeUpdate);
  }, []);

  const cardPrices: Record<RfidCardType, number> = {
    Basic: 100,
    Premium: 500,
  };

  const currentPricePerCard = cardPrices[form.card_type];
  const bookingTotalAmount = currentPricePerCard * Math.max(1, form.quantity || 1);

  const handleSelectCard = (type: RfidCardType) => {
    setForm((prev) => ({ ...prev, card_type: type }));
    const formElement = document.getElementById('rfid-booking-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const validateStep1 = (): boolean => {
    const e: Partial<Record<keyof RfidFormState, string>> = {};
    if (!form.full_name.trim()) e.full_name = 'Full name is required';
    if (!form.mobile_number.trim()) {
      e.mobile_number = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(form.mobile_number.replace(/\D/g, ''))) {
      e.mobile_number = 'Enter a valid 10-digit mobile number';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Enter a valid email address';
    }
    if (!form.quantity || form.quantity < 1) {
      e.quantity = 'Quantity must be at least 1';
    }
    if (!form.visit_date) e.visit_date = 'Preferred date is required';
    if (!form.preferred_time) e.preferred_time = 'Preferred time is required';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    const e: Partial<Record<keyof RfidFormState, string>> = {};
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
      if (status === 'submitting') return;
      setStatus('submitting');
      try {
        const record = await createBooking({
          type: 'RFID',
          full_name: form.full_name.trim(),
          mobile_number: form.mobile_number.trim(),
          email: form.email.trim() || null,
          visit_date: form.visit_date,
          preferred_time: form.preferred_time,
          category: `${form.card_type} RFID Card`,
          duration: 'N/A',
          quantity: form.quantity,
          price_per_unit: cardPrices[form.card_type],
          booking_amount: bookingTotalAmount,
          paid_amount: 0,
          payment_method: 'Registration Only',
          payment_status: 'Not Required',
          booking_status: 'Registration Received',
          utr: 'N/A',
          special_request: form.special_request.trim() || null,
        });

        setConfirmedBooking(record);
        setStatus('success');
        setForm(initialForm);
        setStep('details');
      } catch (err) {
        console.error('RFID registration error:', err);
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
    const formElement = document.getElementById('rfid-booking-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 1. Razorpay Payment Handler for RFID
  const handleRazorpayPayment = async () => {
    setPaymentError(null);
    setStatus('processing_payment');

    await initiateRazorpayCheckout({
      bookingData: {
        type: 'RFID',
        category: `${form.card_type} RFID Card`,
        duration: 'N/A',
        quantity: form.quantity,
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
            type: 'RFID',
            full_name: form.full_name.trim(),
            mobile_number: form.mobile_number.trim(),
            email: form.email.trim() || null,
            visit_date: form.visit_date,
            preferred_time: form.preferred_time,
            category: `${form.card_type} RFID Card`,
            duration: 'N/A',
            quantity: form.quantity,
            price_per_unit: cardPrices[form.card_type],
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

          setConfirmedBooking(record);
          setStatus('success');
          setForm(initialForm);
          setStep('details');
        } catch (saveErr) {
          console.error('Error saving RFID Razorpay booking:', saveErr);
          setPaymentError('Payment completed, but recording booking failed. Please contact support.');
          setStatus('error');
        }
      },
      onError: (errMsg) => {
        setPaymentError(errMsg);
        setStatus('idle');
      },
      onDismiss: () => {
        setStatus('idle');
      },
    });
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validateStep2()) return;
    setStatus('submitting');
    setPaymentError(null);

    const actualPaid = parseFloat(form.paid_amount) || bookingTotalAmount;

    try {
      const record = await createBooking({
        type: 'RFID',
        full_name: form.full_name.trim(),
        mobile_number: form.mobile_number.trim(),
        email: form.email.trim() || null,
        visit_date: form.visit_date,
        preferred_time: form.preferred_time,
        category: `${form.card_type} RFID Card`,
        duration: 'N/A',
        quantity: form.quantity,
        price_per_unit: cardPrices[form.card_type],
        booking_amount: bookingTotalAmount,
        paid_amount: actualPaid,
        payment_method: 'UPI Manual',
        utr: form.utr.trim(),
        special_request: form.special_request.trim() || null,
      });

      setConfirmedBooking(record);
      setStatus('success');
      setForm(initialForm);
      setStep('details');
    } catch (err) {
      console.error('RFID submission error:', err);
      setPaymentError('Something went wrong submitting your booking. Please try again.');
      setStatus('error');
    }
  };

  const update = (field: keyof RfidFormState, value: string | number | boolean) => {
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

  return (
    <section id="rfid-cards" className="py-20 sm:py-28 bg-ink-950/90 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-volt-500/10 border border-volt-500/30 px-4 py-1.5 text-xs sm:text-sm font-bold text-volt-400 uppercase tracking-widest mb-4">
            <CreditCard className="h-4 w-4" /> SMART PARK ACCESS
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white">
            RFID <span className="text-volt-500">CARDS</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-ink-400 max-w-2xl mx-auto">
            Choose your RFID card for quick check-in, park entry, and digital locker access at Unlimited Fun.
          </p>
        </div>

        {/* 2 RFID Card Display Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* 1. BASIC RFID CARD */}
          <div
            className={`relative rounded-3xl border transition-all duration-300 flex flex-col p-6 sm:p-8 ${
              form.card_type === 'Basic'
                ? 'bg-gradient-to-b from-ink-900 via-ink-900 to-ink-950 border-volt-500 shadow-xl shadow-volt-500/10 ring-2 ring-volt-500/40'
                : 'bg-ink-900/90 border-ink-800 hover:border-ink-700'
            }`}
          >
            {/* Visual Card Graphic */}
            <div className="w-full h-44 sm:h-48 rounded-2xl bg-gradient-to-tr from-ink-950 via-slate-900 to-ink-800 border border-ink-700/60 p-5 flex flex-col justify-between mb-6 shadow-inner relative overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-volt-500/10 blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-volt-400 rotate-90" />
                  <span className="text-xs font-mono font-bold tracking-widest text-ink-400 uppercase">
                    RFID PASS
                  </span>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-ink-800 text-ink-300 border border-ink-700">
                  STANDARD
                </span>
              </div>
              <div className="space-y-1">
                <span className="font-display font-black text-xl text-white tracking-wider block">
                  UNLIMITED FUN
                </span>
                <span className="text-xs font-mono text-ink-400 block tracking-widest">
                  BASIC ACCESS CARD
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-ink-800/80">
                <span className="text-[11px] font-mono text-ink-500">
                  TAP & PLAY
                </span>
                <span className="text-xs font-bold text-volt-400">₹100</span>
              </div>
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <h3 className="font-display font-black text-2xl text-white">
                BASIC RFID CARD
              </h3>
              <span className="font-display font-black text-3xl text-volt-400">
                ₹100
              </span>
            </div>
            <p className="text-sm text-ink-300 leading-relaxed mb-6">
              Simple RFID card for your Unlimited Fun experience.
            </p>

            <ul className="space-y-2.5 text-xs sm:text-sm text-ink-400 mb-8 mt-auto">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-volt-500 flex-shrink-0" />
                <span>Single-visit or reloadable access</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-volt-500 flex-shrink-0" />
                <span>Fast tap-and-go turnstile entry</span>
              </li>
            </ul>

            <button
              type="button"
              onClick={() => handleSelectCard('Basic')}
              className={`w-full py-3.5 px-6 rounded-full font-bold text-sm tracking-wide transition-all active:scale-95 flex items-center justify-center gap-2 ${
                form.card_type === 'Basic'
                  ? 'bg-volt-500 text-ink-950 shadow-lg shadow-volt-500/25 hover:bg-volt-400'
                  : 'bg-ink-800 text-white hover:bg-ink-700 border border-ink-700'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              {form.card_type === 'Basic' ? 'SELECTED • BOOK NOW' : 'BOOK NOW'}
            </button>
          </div>

          {/* 2. PREMIUM RFID CARD */}
          <div
            className={`relative rounded-3xl border transition-all duration-300 flex flex-col p-6 sm:p-8 ${
              form.card_type === 'Premium'
                ? 'bg-gradient-to-b from-ink-900 via-ink-900 to-ink-950 border-flame-500 shadow-xl shadow-flame-500/10 ring-2 ring-flame-500/40'
                : 'bg-ink-900/90 border-ink-800 hover:border-ink-700'
            }`}
          >
            {/* Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-flame-500 to-volt-500 px-4 py-1 text-xs font-extrabold text-ink-950 shadow-md flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 fill-ink-950" /> PREMIUM / POPULAR
            </div>

            {/* Visual Card Graphic */}
            <div className="w-full h-44 sm:h-48 rounded-2xl bg-gradient-to-tr from-amber-950/40 via-ink-900 to-flame-950/60 border border-flame-500/40 p-5 flex flex-col justify-between mb-6 shadow-xl relative overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-flame-500/20 blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-flame-400 rotate-90" />
                  <span className="text-xs font-mono font-bold tracking-widest text-flame-300 uppercase">
                    RFID VIP PASS
                  </span>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-flame-500/20 text-flame-300 border border-flame-500/40 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> PREMIUM
                </span>
              </div>
              <div className="space-y-1">
                <span className="font-display font-black text-xl text-white tracking-wider block">
                  UNLIMITED FUN
                </span>
                <span className="text-xs font-mono text-flame-300/80 block tracking-widest">
                  HIGH-DURABILITY CARD
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-flame-500/20">
                <span className="text-[11px] font-mono text-ink-400">
                  EXPRESS ACCESS & REUSABLE
                </span>
                <span className="text-xs font-bold text-flame-400">₹500</span>
              </div>
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <h3 className="font-display font-black text-2xl text-white">
                PREMIUM RFID CARD
              </h3>
              <span className="font-display font-black text-3xl text-flame-400">
                ₹500
              </span>
            </div>
            <p className="text-sm text-ink-300 leading-relaxed mb-6">
              Premium RFID card for customers looking for a premium experience.
            </p>

            <ul className="space-y-2.5 text-xs sm:text-sm text-ink-400 mb-8 mt-auto">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-flame-400 flex-shrink-0" />
                <span>Heavy-duty waterproof material & collectible badge</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-flame-400 flex-shrink-0" />
                <span>Express check-in & priority digital locker linkage</span>
              </li>
            </ul>

            <button
              type="button"
              onClick={() => handleSelectCard('Premium')}
              className={`w-full py-3.5 px-6 rounded-full font-bold text-sm tracking-wide transition-all active:scale-95 flex items-center justify-center gap-2 ${
                form.card_type === 'Premium'
                  ? 'bg-gradient-to-r from-flame-500 to-volt-500 text-ink-950 shadow-lg shadow-flame-500/25 hover:brightness-110'
                  : 'bg-ink-800 text-white hover:bg-ink-700 border border-ink-700'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              {form.card_type === 'Premium' ? 'SELECTED • BOOK NOW' : 'BOOK NOW'}
            </button>
          </div>
        </div>

        {/* RFID Card Booking Form Section */}
        <div id="rfid-booking-form" className="max-w-3xl mx-auto scroll-mt-28">
          {status === 'success' && confirmedBooking ? (
            <div className="rounded-3xl bg-ink-900 border border-volt-500/40 p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-48 h-48 bg-volt-500/10 rounded-full blur-3xl pointer-events-none" />

              {confirmedBooking.payment_method === 'Registration Only' || confirmedBooking.payment_status === 'Not Required' ? (
                <div className="inline-flex p-4 rounded-full bg-volt-500/10 border border-volt-500/30 text-volt-400 mb-4 animate-bounce">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
              ) : confirmedBooking.payment_status === 'Successful' ? (
                <div className="inline-flex p-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4 animate-bounce">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
              ) : (
                <div className="inline-flex p-4 rounded-full bg-volt-500/10 border border-volt-500/30 text-volt-400 mb-4 animate-pulse">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
              )}

              <h3 className="font-display font-black text-3xl sm:text-4xl text-white mb-2">
                {confirmedBooking.payment_method === 'Registration Only' || confirmedBooking.payment_status === 'Not Required'
                  ? 'RFID Registration Received! 🎉'
                  : confirmedBooking.payment_status === 'Successful'
                  ? 'RFID Card Confirmed! 🎉'
                  : 'Booking Received! 🎉'}
              </h3>
              <p className="text-lg font-bold text-volt-400 mb-2">
                {confirmedBooking.payment_method === 'Registration Only' || confirmedBooking.payment_status === 'Not Required'
                  ? 'Your RFID card registration details have been saved.'
                  : confirmedBooking.payment_status === 'Successful'
                  ? 'Your RFID access card has been successfully paid & confirmed.'
                  : 'Your RFID card booking request has been received.'}
              </p>
              <p className="text-ink-300 text-sm sm:text-base leading-relaxed max-w-lg mx-auto mb-8">
                {confirmedBooking.payment_method === 'Registration Only' || confirmedBooking.payment_status === 'Not Required'
                  ? 'Payment is not required at this time. Please present your Booking ID at the front desk upon arrival.'
                  : confirmedBooking.payment_status === 'Successful'
                  ? 'Your card will be pre-programmed and ready for instant pickup at the front desk upon arrival.'
                  : 'Your manual payment is pending verification. Our team will verify and confirm your RFID card shortly.'}
              </p>

              {/* Order Summary Box */}
              <div className="bg-ink-950/90 border border-ink-800 rounded-2xl p-6 text-left mb-8 space-y-4 shadow-inner">
                <div className="flex justify-between items-center border-b border-ink-800 pb-3">
                  <span className="text-xs font-bold text-ink-400 tracking-wider uppercase">
                    RFID Reference
                  </span>
                  <span className="font-mono text-sm font-black text-volt-400 bg-volt-500/10 px-2.5 py-1 rounded border border-volt-500/30">
                    {confirmedBooking.booking_id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-ink-400 block">Customer Name</span>
                    <span className="text-white font-semibold">{confirmedBooking.full_name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-ink-400 block">Mobile Number</span>
                    <span className="text-white font-semibold">{confirmedBooking.mobile_number}</span>
                  </div>
                  <div>
                    <span className="text-xs text-ink-400 block">Card Type & Qty</span>
                    <span className="text-white font-semibold">
                      {confirmedBooking.category} × {confirmedBooking.quantity}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-ink-400 block">Payment Method</span>
                    <span className="text-white font-semibold text-xs flex items-center gap-1 mt-0.5">
                      <CreditCard className="h-3.5 w-3.5 text-volt-400" />
                      {confirmedBooking.payment_method || 'Online Payment'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-volt-400 font-bold block">Actual Paid Amount</span>
                    <span className="text-volt-400 font-black text-lg">
                      {confirmedBooking.payment_method === 'Registration Only' || confirmedBooking.payment_status === 'Not Required'
                        ? '₹0 (Payment Not Required)'
                        : `₹${confirmedBooking.paid_amount.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-ink-400 block">Date & Time</span>
                    <span className="text-white font-semibold">
                      {confirmedBooking.visit_date} at {confirmedBooking.preferred_time}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-ink-400 block">Payment / Transaction ID</span>
                    <span className="text-white font-mono text-xs break-all bg-ink-900 px-3 py-1.5 rounded-lg border border-ink-800 inline-block mt-1">
                      {confirmedBooking.razorpay_payment_id || confirmedBooking.utr || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-ink-800 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-ink-400">Payment Status:</span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        confirmedBooking.payment_status === 'Successful'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : confirmedBooking.payment_status === 'Not Required'
                          ? 'bg-ink-800 text-ink-300 border border-ink-700'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {confirmedBooking.payment_status === 'Successful' && '🟢 Verified Successful'}
                      {confirmedBooking.payment_status === 'Not Required' && '⚪ Not Required'}
                      {confirmedBooking.payment_status === 'Pending Verification' && '🟡 Pending Verification'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-ink-400">Card Status:</span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        confirmedBooking.booking_status === 'Confirmed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : confirmedBooking.booking_status === 'Registration Received'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                          : 'bg-ink-800 text-ink-300 border border-ink-700'
                      }`}
                    >
                      {confirmedBooking.booking_status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
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
                  type="button"
                  onClick={() => {
                    setStatus('idle');
                    setConfirmedBooking(null);
                    setStep('details');
                  }}
                  className="w-full sm:w-auto text-xs text-ink-400 hover:text-white underline py-2"
                >
                  Book Another Card
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-ink-900 border border-ink-800 p-6 sm:p-10 shadow-2xl">
              <div className="border-b border-ink-800 pb-6 mb-8">
                <h3 className="font-display font-black text-2xl sm:text-3xl text-white flex items-center gap-3">
                  <span>💳</span> RFID CARD BOOKING FORM
                </h3>
                <p className="text-ink-400 text-sm mt-1">
                  {step === 'details'
                    ? 'Fill in your details below. Pre-booking ensures your card is programmed and ready upon arrival.'
                    : 'Scan the PhonePe UPI QR code to complete payment and enter your UTR & actual paid amount.'}
                </p>
              </div>

              {step === 'details' ? (
                /* STEP 1: RFID DETAILS FORM */
                <form onSubmit={handleProceedToPayment} className="space-y-6">
                  {/* Card Type Selector */}
                  <div>
                    <label className={labelClass}>
                      Select RFID Card Type <span className="text-flame-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => update('card_type', 'Basic')}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          form.card_type === 'Basic'
                            ? 'border-volt-500 bg-volt-500/10 text-white ring-1 ring-volt-500'
                            : 'border-ink-800 bg-ink-950/60 text-ink-400 hover:border-ink-700'
                        }`}
                      >
                        <div className="text-sm font-bold text-white">Basic Card</div>
                        <div className="text-lg font-black text-volt-400 mt-1">₹100</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => update('card_type', 'Premium')}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          form.card_type === 'Premium'
                            ? 'border-flame-500 bg-flame-500/10 text-white ring-1 ring-flame-500'
                            : 'border-ink-800 bg-ink-950/60 text-ink-400 hover:border-ink-700'
                        }`}
                      >
                        <div className="text-sm font-bold text-white flex items-center justify-between">
                          <span>Premium Card</span>
                          <span className="text-[10px] bg-flame-500/20 text-flame-400 border border-flame-500/40 px-1.5 py-0.5 rounded font-bold">
                            POPULAR
                          </span>
                        </div>
                        <div className="text-lg font-black text-flame-400 mt-1">₹500</div>
                      </button>
                    </div>
                  </div>

                  {/* Name & Phone */}
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
                        placeholder="Enter your full name"
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

                  {/* Email & Quantity */}
                  <div className="grid sm:grid-cols-2 gap-5">
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

                    <div>
                      <label className={labelClass}>
                        Quantity <span className="text-flame-400">*</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => update('quantity', Math.max(1, form.quantity - 1))}
                          className="h-12 w-12 rounded-xl bg-ink-800 border border-ink-700 text-white font-bold text-lg hover:bg-ink-700 active:scale-95 transition-all flex items-center justify-center"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={form.quantity}
                          onChange={(e) => update('quantity', Math.max(1, parseInt(e.target.value) || 1))}
                          className={`${inputClass} text-center font-bold text-lg`}
                        />
                        <button
                          type="button"
                          onClick={() => update('quantity', form.quantity + 1)}
                          className="h-12 w-12 rounded-xl bg-ink-800 border border-ink-700 text-white font-bold text-lg hover:bg-ink-700 active:scale-95 transition-all flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      {errors.quantity && (
                        <p className={errClass}>
                          <AlertCircle className="h-3 w-3" /> {errors.quantity}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>
                        Preferred Visit Date <span className="text-flame-400">*</span>
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

                  {/* Special Request */}
                  <div>
                    <label className={labelClass}>Special Request / Message (Optional)</label>
                    <textarea
                      rows={2}
                      value={form.special_request}
                      onChange={(e) => update('special_request', e.target.value)}
                      className={inputClass}
                      placeholder="Any notes or special requirements for your RFID cards..."
                    />
                  </div>

                  {/* Real-time Total Price Calculation Box */}
                  <div className="rounded-2xl bg-ink-950/80 border border-volt-500/30 p-5 space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm text-ink-400">
                      <span>Selected Card:</span>
                      <span className="font-semibold text-white">{form.card_type} RFID Card</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm text-ink-400">
                      <span>Price per Card:</span>
                      <span className="font-semibold text-white">₹{currentPricePerCard}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm text-ink-400">
                      <span>Quantity:</span>
                      <span className="font-semibold text-white">{form.quantity}</span>
                    </div>
                    <div className="border-t border-ink-800 pt-3 flex justify-between items-baseline">
                      <span className="text-sm sm:text-base font-bold text-ink-200">Booking Amount:</span>
                      <span className="font-display font-black text-2xl sm:text-3xl text-volt-400">
                        ₹{bookingTotalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

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
                /* STEP 2: PAYMENT METHOD SELECTION & CHECKOUT FOR RFID */
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-ink-800 pb-4">
                    <button
                      type="button"
                      onClick={() => setStep('details')}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-ink-300 hover:text-white transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" /> Edit Card Details
                    </button>
                    <span className="text-xs font-mono font-bold text-volt-400 uppercase tracking-wider bg-volt-500/10 px-2.5 py-1 rounded border border-volt-500/30">
                      Step 2 of 2
                    </span>
                  </div>

                  {/* Order Recap */}
                  <div className="bg-ink-950/70 border border-ink-800 rounded-2xl p-4 sm:p-5">
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
                      <p><strong>Item:</strong> {form.card_type} RFID Card · {form.quantity} {form.quantity > 1 ? 'Cards' : 'Card'} (₹{currentPricePerCard} each)</p>
                      <p><strong>Visit:</strong> {form.visit_date} at {form.preferred_time}</p>
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
                          Instant Online Pass
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
                          PhonePe QR + UTR
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
                          Pay for RFID Cards Online
                        </h4>
                        <p className="text-xs text-ink-400 max-w-md mx-auto">
                          Supports <strong>Google Pay</strong>, <strong>PhonePe</strong>, <strong>Paytm</strong>, <strong>Cards</strong> (Debit/Credit), and <strong>NetBanking</strong>.
                        </p>
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
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="rounded-2xl bg-black/60 border border-volt-500/30 p-6 text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-volt-500/10 border border-volt-500/30 text-xs font-bold text-volt-400 uppercase tracking-wider">
                          <QrCode className="h-4 w-4" /> Scan & Pay using PhonePe
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
                            placeholder="12-digit UPI reference / UTR"
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
                          I confirm that I have completed the UPI payment of ₹{form.paid_amount || bookingTotalAmount} using PhonePe.
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
                            SUBMITTING RFID BOOKING...
                          </>
                        ) : (
                          'SUBMIT RFID BOOKING & UTR'
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
