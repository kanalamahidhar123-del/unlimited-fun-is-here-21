import { useState, type FormEvent } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Clock,
  Printer,
  Sparkles,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { SITE } from '@/data/site';
import {
  createBooking,
  getBookings,
  getBookingStatusBadge,
  type BookingRecord,
} from '@/lib/bookingStore';

interface FormState {
  full_name: string;
  mobile_number: string;
  whatsapp_number: string;
  email: string;
  visit_date: string;
  preferred_time: string;
  adults: string;
  children: string;
  category: 'Trampoline Park' | 'Soft Play' | '';
  duration: '30 Minutes' | '1 Hour' | '2 Hours' | '3 Hours' | '';
  rfid_card_type: 'None' | 'Basic RFID Card (₹100)' | 'Premium RFID Card (₹500)';
  special_request: string;
  agreed_to_terms: boolean;
}

const initial: FormState = {
  full_name: '',
  mobile_number: '',
  whatsapp_number: '',
  email: '',
  visit_date: '',
  preferred_time: '',
  adults: '1',
  children: '0',
  category: 'Trampoline Park',
  duration: '1 Hour',
  rfid_card_type: 'None',
  special_request: '',
  agreed_to_terms: false,
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
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  // Status Lookup State
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<BookingRecord[] | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const adultsCount = Math.max(0, parseInt(form.adults) || 0);
  const childrenCount = Math.max(0, parseInt(form.children) || 0);
  const totalGuests = Math.max(1, adultsCount + childrenCount);

  const pricePerPerson =
    form.category && form.duration
      ? pricingTable[form.category]?.[form.duration] || 500
      : 500;
  const estimatedAmount = pricePerPerson * totalGuests;

  // Retrieve confirmed booking in real-time from store
  const liveConfirmedBooking = confirmedBookingId
    ? getBookings().find((b) => b.id === confirmedBookingId || b.booking_id === confirmedBookingId) || null
    : null;

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
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
    if (!form.visit_date) e.visit_date = 'Visit date is required';
    if (!form.preferred_time) e.preferred_time = 'Preferred time is required';
    if (adultsCount + childrenCount < 1) {
      e.adults = 'At least 1 visitor (adult or child) is required';
    }
    if (!form.category) e.category = 'Please select a category';
    if (!form.duration) e.duration = 'Please select a duration';
    if (!form.agreed_to_terms) {
      e.agreed_to_terms = 'You must agree to the safety rules and terms';
    }

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
        type: 'Trampoline',
        full_name: form.full_name.trim(),
        mobile_number: form.mobile_number.trim(),
        whatsapp_number: form.whatsapp_number.trim() || form.mobile_number.trim(),
        email: form.email.trim() || null,
        visit_date: form.visit_date,
        preferred_time: form.preferred_time,
        adults: adultsCount,
        children: childrenCount,
        category: form.category,
        duration: form.duration,
        quantity: totalGuests,
        rfid_card_type: form.rfid_card_type,
        price_per_unit: pricePerPerson,
        booking_amount: estimatedAmount,
        paid_amount: 0,
        payment_method: 'Registration Only',
        payment_status: 'Not Required',
        booking_status: 'Pending Payment',
        utr: 'N/A',
        special_request: form.special_request.trim() || null,
      });

      setConfirmedBookingId(record.booking_id);
      setStatus('success');
      setForm(initial);
    } catch (err) {
      console.error('Submission error:', err);
      setErrorMessage('Something went wrong submitting your details. Please try again or call us.');
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
          (b.whatsapp_number && b.whatsapp_number.replace(/\D/g, '') === q.replace(/\D/g, ''))
      );

      if (matches.length > 0) {
        setLookupResult(matches);
      } else {
        setLookupResult([]);
        setLookupError('No records found for the provided Booking ID or Phone number. Please verify and try again.');
      }
      setIsSearching(false);
    }, 300);
  };

  const update = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const inputClass =
    'w-full rounded-xl bg-ink-900 border border-ink-700 px-4 py-3 text-white placeholder-ink-500 focus:border-volt-500 focus:outline-none focus:ring-1 focus:ring-volt-500 transition-colors text-sm';
  const labelClass = 'block text-xs font-bold uppercase tracking-wider text-ink-300 mb-1.5';
  const errClass = 'mt-1 text-xs text-flame-400 flex items-center gap-1';

  // 1. SUCCESS CONFIRMATION VIEW
  if (status === 'success' && liveConfirmedBooking) {
    return (
      <section id="booking" className="py-20 sm:py-28 bg-ink-950">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-ink-900 border border-volt-500/40 p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-volt-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex p-4 rounded-full bg-volt-500/10 border border-volt-500/30 text-volt-400 mb-4 animate-bounce">
              <CheckCircle2 className="h-12 w-12" />
            </div>

            <h3 className="font-display font-black text-3xl sm:text-4xl text-white mb-2">
              Your details have been submitted successfully! 🎉
            </h3>

            <p className="text-lg font-bold text-volt-400 mb-3">
              Thank you for choosing Unlimited Fun!
            </p>

            <p className="text-ink-300 text-sm sm:text-base leading-relaxed max-w-lg mx-auto mb-8">
              Your details have been saved directly to our system. Our team has received your information and will contact you shortly to confirm your visit.
            </p>

            {/* Booking Details Card */}
            <div className="bg-ink-950/80 border border-ink-800 rounded-2xl p-6 text-left mb-8 space-y-3.5 shadow-inner">
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
                  <span className="text-xs text-ink-400 block">WhatsApp Number</span>
                  <span className="text-white font-semibold">
                    {liveConfirmedBooking.whatsapp_number || liveConfirmedBooking.mobile_number}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-ink-400 block">Visit Date & Time</span>
                  <span className="text-white font-semibold">
                    {liveConfirmedBooking.visit_date} at {liveConfirmedBooking.preferred_time}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-ink-400 block">Package & Duration</span>
                  <span className="text-white font-semibold">
                    {liveConfirmedBooking.category} ({liveConfirmedBooking.duration})
                  </span>
                </div>
                <div>
                  <span className="text-xs text-ink-400 block">Visitors</span>
                  <span className="text-white font-semibold">
                    {liveConfirmedBooking.adults || 0} Adults, {liveConfirmedBooking.children || 0} Children
                  </span>
                </div>
                {liveConfirmedBooking.rfid_card_type && liveConfirmedBooking.rfid_card_type !== 'None' && (
                  <div>
                    <span className="text-xs text-ink-400 block">RFID Card</span>
                    <span className="text-volt-400 font-semibold">{liveConfirmedBooking.rfid_card_type}</span>
                  </div>
                )}
                <div>
                  <span className="text-xs text-ink-400 block">Status</span>
                  {(() => {
                    const badge = getBookingStatusBadge(liveConfirmedBooking);
                    return (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border mt-0.5 ${badge.badgeClass}`}>
                        <span>{badge.icon}</span> {badge.label}
                      </span>
                    );
                  })()}
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
                  setConfirmedBookingId(null);
                }}
                className="w-full sm:w-auto text-xs text-ink-400 hover:text-white underline py-2"
              >
                Submit Another Booking
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 2. MAIN BOOKING SECTION VIEW
  return (
    <section id="booking" className="py-20 sm:py-28 bg-ink-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-sm font-bold text-volt-500 tracking-widest uppercase mb-3">
            Book Your Slot
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white">
            RESERVE YOUR <span className="text-volt-500">EXPERIENCE</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-ink-400 max-w-2xl mx-auto">
            Fill in your details below. Our team will receive your information and reach out to confirm your visit.
          </p>

          {/* Navigation Tabs */}
          <div className="mt-8 inline-flex p-1 rounded-full bg-ink-900 border border-ink-800">
            <button
              onClick={() => setActiveTab('book')}
              className={`px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'book'
                  ? 'bg-volt-500 text-ink-950 shadow-md shadow-volt-500/20'
                  : 'text-ink-400 hover:text-white'
              }`}
            >
              Book Slot
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'status'
                  ? 'bg-volt-500 text-ink-950 shadow-md shadow-volt-500/20'
                  : 'text-ink-400 hover:text-white'
              }`}
            >
              Check Status
            </button>
          </div>
        </div>

        {activeTab === 'status' ? (
          /* STATUS LOOKUP TAB */
          <div className="max-w-2xl mx-auto">
            <div className="rounded-3xl bg-ink-900 border border-ink-800 p-6 sm:p-10 shadow-2xl">
              <div className="text-center mb-6">
                <Search className="h-10 w-10 text-volt-400 mx-auto mb-2" />
                <h3 className="font-display font-black text-xl sm:text-2xl text-white">
                  Check Booking Status
                </h3>
                <p className="text-xs sm:text-sm text-ink-400 mt-1">
                  Enter your Booking Reference ID (e.g. UF-TR-12345) or 10-digit mobile number
                </p>
              </div>

              <form onSubmit={handleLookup} className="space-y-4 mb-6">
                <div className="relative">
                  <input
                    type="text"
                    value={lookupQuery}
                    onChange={(e) => setLookupQuery(e.target.value)}
                    placeholder="Enter Booking ID or Phone Number..."
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-volt-500 px-6 py-3.5 text-sm font-bold text-ink-950 hover:bg-volt-400 transition-colors shadow-lg shadow-volt-500/20 disabled:opacity-50"
                >
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  SEARCH BOOKING
                </button>
              </form>

              {lookupError && (
                <div className="rounded-xl bg-flame-500/10 border border-flame-500/30 p-4 text-xs sm:text-sm text-flame-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{lookupError}</span>
                </div>
              )}

              {lookupResult && lookupResult.length > 0 && (
                <div className="space-y-4 mt-6">
                  {lookupResult.map((b) => (
                    <div
                      key={b.id}
                      className="p-5 rounded-2xl bg-ink-950/80 border border-ink-800 space-y-3"
                    >
                      {(() => {
                        const badge = getBookingStatusBadge(b);
                        return (
                          <div className="flex justify-between items-center border-b border-ink-800 pb-2">
                            <span className="font-mono text-sm font-bold text-volt-400">{b.booking_id}</span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.badgeClass}`}>
                              <span>{badge.icon}</span> {badge.label}
                            </span>
                          </div>
                        );
                      })()}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-ink-400 block">Name:</span>
                          <span className="text-white font-semibold">{b.full_name}</span>
                        </div>
                        <div>
                          <span className="text-ink-400 block">Mobile:</span>
                          <span className="text-white font-semibold">{b.mobile_number}</span>
                        </div>
                        <div>
                          <span className="text-ink-400 block">Date & Time:</span>
                          <span className="text-white font-semibold">{b.visit_date} at {b.preferred_time}</span>
                        </div>
                        <div>
                          <span className="text-ink-400 block">Package:</span>
                          <span className="text-white font-semibold">{b.category} {b.duration !== 'N/A' && `(${b.duration})`}</span>
                        </div>
                        {b.special_request && (
                          <div className="col-span-2 text-ink-400">
                            <span className="block text-ink-500">Note:</span>
                            <span className="text-ink-300">{b.special_request}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* CUSTOMER INFORMATION BOOKING FORM */
          <div className="max-w-3xl mx-auto">
            <div className="rounded-3xl bg-ink-900 border border-ink-800 p-6 sm:p-10 shadow-2xl">
              <div className="border-b border-ink-800 pb-6 mb-8">
                <h3 className="font-display font-black text-2xl sm:text-3xl text-white flex items-center gap-3">
                  <span>📝</span> CUSTOMER INFORMATION FORM
                </h3>
                <p className="text-ink-400 text-sm mt-1">
                  Enter your details below to submit your booking directly to our system.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-6 rounded-xl bg-flame-500/10 border border-flame-500/30 p-4 flex items-center gap-2 text-flame-400 text-sm">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
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

                {/* Mobile & WhatsApp Numbers */}
                <div className="grid sm:grid-cols-2 gap-5">
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
                </div>

                {/* Email Address */}
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

                {/* Date of Visit & Preferred Time */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>
                      Date of Visit <span className="text-flame-400">*</span>
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

                {/* Number of Adults & Number of Children */}
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>
                      Number of Adults <span className="text-flame-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={form.adults}
                      onChange={(e) => update('adults', e.target.value)}
                      className={inputClass}
                      placeholder="e.g. 2"
                    />
                    {errors.adults && (
                      <p className={errClass}>
                        <AlertCircle className="h-3 w-3" /> {errors.adults}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>
                      Number of Children
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={form.children}
                      onChange={(e) => update('children', e.target.value)}
                      className={inputClass}
                      placeholder="e.g. 1"
                    />
                  </div>
                </div>

                {/* Selected Package / Category & Duration */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>
                      Selected Package <span className="text-flame-400">*</span>
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
                      <option value="30 Minutes">30 Minutes</option>
                      <option value="1 Hour">1 Hour</option>
                      <option value="2 Hours">2 Hours (Best Value)</option>
                      <option value="3 Hours">3 Hours</option>
                    </select>
                    {errors.duration && (
                      <p className={errClass}>
                        <AlertCircle className="h-3 w-3" /> {errors.duration}
                      </p>
                    )}
                  </div>
                </div>

                {/* RFID Card Option */}
                <div>
                  <label className={labelClass}>RFID Card Option (Optional)</label>
                  <select
                    value={form.rfid_card_type}
                    onChange={(e) => update('rfid_card_type', e.target.value as any)}
                    className={inputClass}
                  >
                    <option value="None">None (Standard Entry)</option>
                    <option value="Basic RFID Card (₹100)">Basic RFID Card (₹100)</option>
                    <option value="Premium RFID Card (₹500)">Premium VIP RFID Card (₹500)</option>
                  </select>
                </div>

                {/* Special Request */}
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

                {/* Safety Rules Agreement */}
                <label className="flex items-start gap-3 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={form.agreed_to_terms}
                    onChange={(e) => update('agreed_to_terms', e.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-ink-600 bg-ink-900 text-volt-500 focus:ring-volt-500"
                  />
                  <span className="text-xs sm:text-sm text-ink-300">
                    I agree to follow the park's safety rules and terms. Participants must be below {SITE.weightLimit}.
                  </span>
                </label>
                {errors.agreed_to_terms && (
                  <p className={errClass}>
                    <AlertCircle className="h-3 w-3" /> {errors.agreed_to_terms}
                  </p>
                )}

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
                      SUBMIT DETAILS
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
