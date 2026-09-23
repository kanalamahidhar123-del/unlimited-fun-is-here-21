import React, { useState, type FormEvent } from 'react';
import {
  Users,
  Building2,
  GraduationCap,
  Sparkles,
  MessageCircle,
  Phone,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Loader2,
  Flame,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { SITE } from '@/data/site';

interface GroupBookingsProps {
  onBookClick?: () => void;
}

export const GroupBookings: React.FC<GroupBookingsProps> = ({ onBookClick }) => {
  const [form, setForm] = useState({
    group_name: '',
    contact_person: '',
    phone: '',
    email: '',
    group_type: 'Friends Group',
    estimated_members: '15',
    preferred_date: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const groupTypes = [
    { label: 'Birthday Parties', icon: Sparkles },
    { label: 'Friends Groups', icon: Users },
    { label: 'School / College Groups', icon: GraduationCap },
    { label: 'Corporate Events', icon: Building2 },
  ];

  const handleWhatsAppEnquiry = (type = 'Group Booking') => {
    const text = encodeURIComponent(
      `Hi Unlimited Fun! I want to enquire about a ${type} (15+ Members) at your Bhimavaram indoor adventure park.`
    );
    window.open(`https://wa.me/91${SITE.whatsapp}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.contact_person.trim() || !form.phone.trim()) {
      setErrorMsg('Please enter your name and phone number.');
      return;
    }
    setErrorMsg('');
    setStatus('submitting');

    try {
      // Save locally
      const existing = JSON.parse(localStorage.getItem('unlimited_fun_group_enquiries') || '[]');
      existing.push({
        id: String(Date.now()),
        ...form,
        created_at: new Date().toISOString(),
      });
      localStorage.setItem('unlimited_fun_group_enquiries', JSON.stringify(existing));

      // Sync to Google Sheet webhook if available
      const sheetUrl = import.meta.env.VITE_GOOGLE_SHEET_URL || SITE.googleSheetUrl;
      if (sheetUrl) {
        try {
          const nowStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
          await fetch(sheetUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
              timestamp: nowStr,
              Timestamp: nowStr,
              name: form.contact_person,
              full_name: form.contact_person,
              "Full Name": form.contact_person,
              phone: form.phone,
              mobile_number: form.phone,
              "Phone Number": form.phone,
              email: form.email || '',
              booking_date: form.preferred_date || '',
              visit_date: form.preferred_date || '',
              guests: form.estimated_members,
              number_of_guests: form.estimated_members,
              category: `Group Booking - ${form.group_type}`,
              package: `Group Booking (${form.estimated_members} Members)`,
              type: 'Group Booking',
              booking_type: 'Group Booking',
              payment_status: 'Not Required',
              booking_status: 'Enquiry Received',
              special_request: `Group: ${form.group_name || 'N/A'} | Type: ${form.group_type} | Note: ${form.message || 'None'}`,
            }),
          });
        } catch (err) {
          // ignore
        }
      }

      setStatus('success');
    } catch (err) {
      setStatus('success');
    }
  };

  return (
    <section id="groups" className="py-16 sm:py-24 bg-ink-950 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-volt-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-flame-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block text-xs font-bold text-volt-500 tracking-widest uppercase mb-3 px-3.5 py-1 rounded-full bg-volt-500/10 border border-volt-500/30">
            GROUP CELEBRATIONS &amp; SESSIONS
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white">
            GROUP BOOKINGS &amp; <span className="text-volt-500">PRIVATE SLOTS</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-ink-300 leading-relaxed">
            Gather your squad, class, or corporate team for an adrenaline-fueled adventure. Special group packages, dedicated safety marshals, and private slot options.
          </p>
        </div>

        {/* Group Types Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {groupTypes.map((gt, i) => {
            const Icon = gt.icon;
            return (
              <div
                key={i}
                className="p-5 rounded-2xl bg-ink-900/90 border border-ink-800 hover:border-volt-500/40 transition-all hover:scale-[1.02] flex flex-col items-center text-center group shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-volt-500/10 group-hover:bg-volt-500/20 text-volt-400 flex items-center justify-center mb-3 transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-volt-400 transition-colors">
                  {gt.label}
                </h3>
              </div>
            );
          })}
        </div>

        {/* 2 Primary Group Tiers */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-14">
          {/* Tier 1: 15+ Members Group Booking */}
          <div className="relative rounded-3xl border border-ink-800 bg-ink-900/90 p-6 sm:p-8 flex flex-col justify-between hover:border-volt-500/40 transition-all shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-volt-500/10 border border-volt-500/30 px-3.5 py-1 text-xs font-bold text-volt-400 mb-4">
                <Users className="w-4 h-4" />
                <span>15+ MEMBERS</span>
              </div>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white mb-2">
                GROUP BOOKING
              </h3>
              <p className="text-xs sm:text-sm text-ink-300 leading-relaxed mb-6">
                Ideal for school trips, college friend groups, sports clubs, and birthday celebrations. Experience all 10+ activities together with priority group check-in.
              </p>

              <ul className="space-y-2.5 text-xs sm:text-sm text-ink-200 mb-8">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-volt-500 flex-shrink-0" />
                  <span>Discounted group entry rates</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-volt-500 flex-shrink-0" />
                  <span>Dedicated safety marshal assistance</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-volt-500 flex-shrink-0" />
                  <span>Coordinated group games &amp; challenges</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleWhatsAppEnquiry('Group Booking (15+ Members)')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-volt-500 hover:bg-volt-400 py-3.5 px-6 text-sm font-black text-ink-950 transition-all shadow-lg shadow-volt-500/20 active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>ENQUIRE FOR GROUP BOOKING</span>
            </button>
          </div>

          {/* Tier 2: 30+ Members Private Slot Booking */}
          <div className="relative rounded-3xl border-2 border-volt-500 bg-gradient-to-b from-volt-500/15 via-ink-900 to-ink-900 p-6 sm:p-8 flex flex-col justify-between shadow-2xl shadow-volt-500/15">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-volt-500/20 border border-volt-500/40 px-3.5 py-1 text-xs font-black text-volt-400 mb-4">
                <Flame className="w-4 h-4" />
                <span>30+ MEMBERS · EXCLUSIVE</span>
              </div>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white mb-2">
                PRIVATE SLOT ARENA TAKEOVER
              </h3>
              <p className="text-xs sm:text-sm text-ink-300 leading-relaxed mb-6">
                Book the entire trampoline arena or dedicated private slot exclusively for your gathering. Zero public crowd, private music, and customized games.
              </p>

              <ul className="space-y-2.5 text-xs sm:text-sm text-ink-200 mb-8">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-volt-400 flex-shrink-0" />
                  <span>Exclusive private slot booking</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-volt-400 flex-shrink-0" />
                  <span>Full access to trampoline courts, climbing wall &amp; foam pit</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-volt-400 flex-shrink-0" />
                  <span>Custom music playlist and announcement control</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleWhatsAppEnquiry('Private Slot Booking (30+ Members)')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-volt-500 hover:bg-volt-400 py-3.5 px-6 text-sm font-black text-ink-950 transition-all shadow-xl shadow-volt-500/30 active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>ENQUIRE FOR PRIVATE SLOT</span>
            </button>
          </div>
        </div>

        {/* Group Inquiry Form */}
        <div className="max-w-2xl mx-auto rounded-3xl bg-ink-900 border border-ink-800 p-6 sm:p-10 shadow-2xl">
          <div className="text-center mb-6 pb-4 border-b border-ink-800">
            <h3 className="font-display font-black text-xl sm:text-2xl text-white">
              Direct Group Booking Inquiry
            </h3>
            <p className="text-xs sm:text-sm text-ink-400 mt-1">
              Submit your group details and our team will get back with a customized package quote.
            </p>
          </div>

          {status === 'success' ? (
            <div className="p-8 text-center bg-ink-950 rounded-2xl border border-volt-500/30">
              <CheckCircle2 className="w-12 h-12 text-volt-400 mx-auto mb-3" />
              <h4 className="text-lg font-black text-white">Group Inquiry Received!</h4>
              <p className="text-xs text-ink-300 mt-1">
                Our event coordinator will contact you at <strong>{form.phone}</strong> shortly.
              </p>
              <button
                onClick={() => {
                  setStatus('idle');
                  setForm({
                    group_name: '',
                    contact_person: '',
                    phone: '',
                    email: '',
                    group_type: 'Friends Group',
                    estimated_members: '15',
                    preferred_date: '',
                    message: '',
                  });
                }}
                className="mt-6 px-6 py-2.5 rounded-full bg-volt-500 text-ink-950 text-xs font-bold"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-flame-500/10 border border-flame-500/30 text-xs text-flame-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-ink-300 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={form.contact_person}
                    onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                    className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-white text-sm focus:border-volt-500 focus:outline-none"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-ink-300 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-white text-sm focus:border-volt-500 focus:outline-none"
                    placeholder="10-digit mobile"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-ink-300 mb-1">Group / Organization Name</label>
                  <input
                    type="text"
                    value={form.group_name}
                    onChange={(e) => setForm({ ...form, group_name: e.target.value })}
                    className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-white text-sm focus:border-volt-500 focus:outline-none"
                    placeholder="College / School / Company"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-ink-300 mb-1">Event Type</label>
                  <select
                    value={form.group_type}
                    onChange={(e) => setForm({ ...form, group_type: e.target.value })}
                    className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-white text-sm focus:border-volt-500 focus:outline-none"
                  >
                    <option value="Birthday Parties">Birthday Parties</option>
                    <option value="Friends Group">Friends Group</option>
                    <option value="School / College Group">School / College Group</option>
                    <option value="Corporate Event">Corporate Event</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-ink-300 mb-1">Estimated Members</label>
                  <input
                    type="number"
                    min="15"
                    value={form.estimated_members}
                    onChange={(e) => setForm({ ...form, estimated_members: e.target.value })}
                    className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-white text-sm focus:border-volt-500 focus:outline-none"
                    placeholder="e.g. 20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-ink-300 mb-1">Preferred Date</label>
                  <input
                    type="date"
                    value={form.preferred_date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
                    className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-white text-sm focus:border-volt-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-ink-300 mb-1">Additional Notes / Special Request</label>
                <textarea
                  rows={2}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-white text-sm focus:border-volt-500 focus:outline-none"
                  placeholder="Tell us about your event timing or specific requests"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-3.5 rounded-full bg-volt-500 hover:bg-volt-400 text-ink-950 font-black text-sm transition-all shadow-lg shadow-volt-500/20 active:scale-95 disabled:opacity-50"
              >
                {status === 'submitting' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'SUBMIT GROUP INQUIRY'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default GroupBookings;
