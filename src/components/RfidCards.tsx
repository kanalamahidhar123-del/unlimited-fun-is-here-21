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
  Printer,
  Send,
} from 'lucide-react';
import { SITE } from '@/data/site';
import { createBooking, type BookingRecord } from '@/lib/bookingStore';

export type RfidCardType = 'Basic' | 'Premium';

interface RfidFormState {
  full_name: string;
  mobile_number: string;
  whatsapp_number: string;
  email: string;
  card_type: RfidCardType;
  quantity: number;
  visit_date: string;
  preferred_time: string;
  special_request: string;
}

const initialForm: RfidFormState = {
  full_name: '',
  mobile_number: '',
  whatsapp_number: '',
  email: '',
  card_type: 'Basic',
  quantity: 1,
  visit_date: '',
  preferred_time: '',
  special_request: '',
};

export default function RfidCards() {
  const [form, setForm] = useState<RfidFormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof RfidFormState, string>>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);

  const cardPrices: Record<RfidCardType, number> = {
    Basic: 100,
    Premium: 500,
  };

  const handleSelectCard = (type: RfidCardType) => {
    setForm((prev) => ({ ...prev, card_type: type }));
    const formElement = document.getElementById('rfid-booking-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof RfidFormState, string>> = {};
    if (!form.full_name.trim()) e.full_name = 'Full name is required';
    if (!form.mobile_number.trim()) {
      e.mobile_number = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(form.mobile_number.replace(/\D/g, ''))) {
      e.mobile_number = 'Enter a valid 10-digit mobile number';
    }
    if (form.whatsapp_number && !/^\d{10}$/.test(form.whatsapp_number.replace(/\D/g, ''))) {
      e.whatsapp_number = 'Enter a valid 10-digit WhatsApp number';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Enter a valid email address';
    }
    if (!form.quantity || form.quantity < 1) {
      e.quantity = 'Quantity must be at least 1';
    }
    if (!form.visit_date) e.visit_date = 'Preferred visit date is required';
    if (!form.preferred_time) e.preferred_time = 'Preferred time slot is required';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    if (status === 'submitting') return; // Prevent duplicate submissions

    setStatus('submitting');
    setErrorMessage(null);

    try {
      const record = await createBooking({
        type: 'RFID',
        full_name: form.full_name.trim(),
        mobile_number: form.mobile_number.trim(),
        whatsapp_number: form.whatsapp_number.trim() || form.mobile_number.trim(),
        email: form.email.trim() || null,
        visit_date: form.visit_date,
        preferred_time: form.preferred_time,
        category: `${form.card_type} RFID Card`,
        duration: 'N/A',
        quantity: form.quantity,
        adults: form.quantity,
        children: 0,
        rfid_card_type: `${form.card_type} RFID Card`,
        price_per_unit: cardPrices[form.card_type],
        booking_amount: cardPrices[form.card_type] * form.quantity,
        paid_amount: 0,
        payment_method: 'Registration Only',
        payment_status: 'Not Required',
        booking_status: 'Pending Payment',
        utr: 'N/A',
        special_request: form.special_request.trim() || null,
      });

      setConfirmedBooking(record);
      setStatus('success');
      setForm(initialForm);
    } catch (err) {
      console.error('RFID submission error:', err);
      setErrorMessage('Something went wrong submitting your RFID details. Please try again or call us.');
      setStatus('error');
    }
  };

  const update = (field: keyof RfidFormState, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const inputClass =
    'w-full rounded-xl bg-ink-900 border border-ink-700 px-4 py-3 text-white placeholder-ink-500 focus:border-volt-500 focus:outline-none focus:ring-1 focus:ring-volt-500 transition-colors text-sm';
  const labelClass = 'block text-xs font-bold uppercase tracking-wider text-ink-300 mb-1.5';
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
              {form.card_type === 'Basic' ? 'SELECTED • REQUEST CARD' : 'REQUEST CARD'}
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
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-flame-500 to-volt-500 px-4 py-1 text-xs font-extrabold text-ink-950 shadow-md flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 fill-ink-950" /> PREMIUM / POPULAR
            </div>

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
                  VIP ACCESS PASS
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-ink-800/80">
                <span className="text-[11px] font-mono text-ink-500">
                  PRIORITY PLAY
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
              {form.card_type === 'Premium' ? 'SELECTED • REQUEST CARD' : 'REQUEST CARD'}
            </button>
          </div>
        </div>

        {/* RFID Card Booking Form Section */}
        <div id="rfid-booking-form" className="max-w-3xl mx-auto scroll-mt-28">
          {status === 'success' && confirmedBooking ? (
            <div className="rounded-3xl bg-ink-900 border border-volt-500/40 p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-48 h-48 bg-volt-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="inline-flex p-4 rounded-full bg-volt-500/10 border border-volt-500/30 text-volt-400 mb-4 animate-bounce">
                <CheckCircle2 className="h-12 w-12" />
              </div>

              <h3 className="font-display font-black text-3xl sm:text-4xl text-white mb-2">
                Your details have been submitted successfully! 🎉
              </h3>
              <p className="text-lg font-bold text-volt-400 mb-2">
                Thank you for requesting your RFID Pass!
              </p>
              <p className="text-ink-300 text-sm sm:text-base leading-relaxed max-w-lg mx-auto mb-8">
                Your card request has been recorded. Our team will prepare your RFID card for your visit.
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
                    <span className="text-xs text-ink-400 block">WhatsApp Number</span>
                    <span className="text-white font-semibold">
                      {confirmedBooking.whatsapp_number || confirmedBooking.mobile_number}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-ink-400 block">Card Type & Qty</span>
                    <span className="text-white font-semibold">
                      {confirmedBooking.category} × {confirmedBooking.quantity}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-ink-400 block">Visit Date & Time</span>
                    <span className="text-white font-semibold">
                      {confirmedBooking.visit_date} at {confirmedBooking.preferred_time}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-ink-400 block">Status</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 mt-0.5">
                      🟡 Pending Payment
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
                  <Printer className="h-4 w-4" /> Print / Save Confirmation
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
                  }}
                  className="w-full sm:w-auto text-xs text-ink-400 hover:text-white underline py-2"
                >
                  Request Another Card
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-ink-900 border border-ink-800 p-6 sm:p-10 shadow-2xl">
              <div className="border-b border-ink-800 pb-6 mb-8">
                <h3 className="font-display font-black text-2xl sm:text-3xl text-white flex items-center gap-3">
                  <span>💳</span> RFID CARD REQUEST FORM
                </h3>
                <p className="text-ink-400 text-sm mt-1">
                  Fill in your details below. Pre-booking ensures your card is programmed and ready upon arrival.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-6 rounded-xl bg-flame-500/10 border border-flame-500/30 p-4 flex items-center gap-2 text-flame-400 text-sm">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
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

                {/* WhatsApp & Email */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>
                      WhatsApp Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={form.whatsapp_number}
                      onChange={(e) => update('whatsapp_number', e.target.value)}
                      className={inputClass}
                      placeholder="Same as mobile or alternate"
                    />
                    {errors.whatsapp_number && (
                      <p className={errClass}>
                        <AlertCircle className="h-3 w-3" /> {errors.whatsapp_number}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>Email Address (Optional)</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      className={inputClass}
                      placeholder="name@example.com"
                    />
                    {errors.email && (
                      <p className={errClass}>
                        <AlertCircle className="h-3 w-3" /> {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className={labelClass}>
                    Number of Cards <span className="text-flame-400">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => update('quantity', Math.max(1, form.quantity - 1))}
                      className="h-11 w-11 rounded-xl bg-ink-800 hover:bg-ink-700 text-white font-bold flex items-center justify-center border border-ink-700"
                    >
                      -
                    </button>
                    <span className="font-display font-black text-xl text-white w-12 text-center">
                      {form.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => update('quantity', Math.min(20, form.quantity + 1))}
                      className="h-11 w-11 rounded-xl bg-ink-800 hover:bg-ink-700 text-white font-bold flex items-center justify-center border border-ink-700"
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
                      Preferred Time Slot <span className="text-flame-400">*</span>
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-volt-500 px-6 py-4 text-base font-black text-ink-950 hover:bg-volt-400 transition-all active:scale-95 shadow-xl shadow-volt-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      SUBMITTING DETAILS...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      SUBMIT RFID REQUEST
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
