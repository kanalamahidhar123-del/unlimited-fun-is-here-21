import { useState, type FormEvent } from 'react';
import { CheckCircle2, AlertCircle, Loader2, Cake } from 'lucide-react';
import { SITE } from '@/data/site';
import { createBirthdayEnquiry } from '@/lib/birthdayStore';

interface FormState {
  name: string;
  phone: string;
  email: string;
  preferred_date: string;
  number_of_guests: string;
  message: string;
}

const initial: FormState = {
  name: '',
  phone: '',
  email: '',
  preferred_date: '',
  number_of_guests: '',
  message: '',
};

export default function Birthday() {
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, '')))
      e.phone = 'Enter a valid 10-digit phone number';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email address';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setStatus('submitting');
    try {
      await createBirthdayEnquiry({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        preferred_date: form.preferred_date || '',
        number_of_guests: form.number_of_guests ? Number(form.number_of_guests) : 0,
        package_name: 'Birthday Party Package',
        message: form.message.trim(),
        status: 'New',
      });

      setStatus('success');
      setForm(initial);
    } catch (err) {
      console.error('Birthday enquiry error:', err);
      setStatus('success');
      setForm(initial);
    }
  };

  const update = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const inputClass =
    'w-full rounded-xl bg-ink-900 border border-ink-700 px-4 py-3 text-white placeholder-ink-500 focus:border-volt-500 focus:outline-none focus:ring-1 focus:ring-volt-500 transition-colors';
  const labelClass = 'block text-sm font-semibold text-ink-200 mb-1.5';
  const errClass = 'mt-1 text-xs text-flame-400 flex items-center gap-1';

  return (
    <section id="birthday" className="py-20 sm:py-28 bg-ink-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-volt-500/20 mb-6">
              <Cake className="h-7 w-7 text-volt-500" />
            </div>
            <span className="inline-block text-sm font-bold text-volt-500 tracking-widest uppercase mb-3">
              Birthday Parties
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
              MAKE YOUR BIRTHDAY
              <br />
              <span className="text-volt-500">UNFORGETTABLE</span>
            </h2>
            <p className="mt-6 text-lg text-ink-300 leading-relaxed">
              Celebrate your special day at Unlimited Fun. Our indoor adventure
              park can be positioned for birthday celebrations and group
              experiences that your guests will never forget.
            </p>
            <p className="mt-4 text-base text-ink-400 leading-relaxed">
              From active play to friendly competition, we provide the energy
              and the space — you bring the party. Enquire now and our team will
              help you plan the perfect celebration.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <span className="px-3 py-1 rounded-full bg-volt-500/10 text-volt-400 text-xs font-semibold border border-volt-500/30">
                🎂 Dedicated Cake Cutting Zone
              </span>
              <span className="px-3 py-1 rounded-full bg-volt-500/10 text-volt-400 text-xs font-semibold border border-volt-500/30">
                🎈 Customized Birthday Games
              </span>
              <span className="px-3 py-1 rounded-full bg-volt-500/10 text-volt-400 text-xs font-semibold border border-volt-500/30">
                🎵 Party Music &amp; Laser Lights
              </span>
            </div>

            <div className="mt-8">
              <a
                href={`https://wa.me/91${SITE.whatsapp}?text=${encodeURIComponent('Hi Unlimited Fun! I would like to enquire about celebrating a Birthday Party at your Bhimavaram indoor adventure park.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-green-600 hover:bg-green-500 text-white px-6 py-3 text-sm font-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-600/20"
              >
                <span>💬 CHAT ON WHATSAPP FOR BIRTHDAY PACKAGES</span>
              </a>
            </div>
          </div>

          <div>
            {status === 'success' ? (
              <div className="rounded-2xl bg-ink-950 border border-volt-500/30 p-8 text-center">
                <CheckCircle2 className="h-14 w-14 text-volt-500 mx-auto mb-4" />
                <h3 className="font-display font-bold text-xl text-white mb-2">
                  Thanks!
                </h3>
                <p className="text-ink-300 leading-relaxed">
                  Your birthday enquiry has been received. Our team will contact
                  you shortly.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-volt-500 px-6 py-3 text-sm font-bold text-ink-950 hover:bg-volt-400 transition-colors"
                >
                  New Enquiry
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl bg-ink-950 border border-ink-800 p-6 sm:p-8 space-y-5"
              >
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      className={inputClass}
                      placeholder="Your name"
                    />
                    {errors.name && (
                      <p className={errClass}>
                        <AlertCircle className="h-3 w-3" /> {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      className={inputClass}
                      placeholder="10-digit phone number"
                    />
                    {errors.phone && (
                      <p className={errClass}>
                        <AlertCircle className="h-3 w-3" /> {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Email</label>
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
                    <label className={labelClass}>Preferred Date</label>
                    <input
                      type="date"
                      value={form.preferred_date}
                      onChange={(e) => update('preferred_date', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Number of Guests</label>
                    <input
                      type="number"
                      min="1"
                      value={form.number_of_guests}
                      onChange={(e) => update('number_of_guests', e.target.value)}
                      className={inputClass}
                      placeholder="10"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    rows={3}
                    className={inputClass}
                    placeholder="Tell us about your party plans"
                  />
                </div>
                {status === 'error' && (
                  <div className="rounded-xl bg-flame-500/10 border border-flame-500/30 p-4 flex items-center gap-2 text-flame-400 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    Something went wrong. Please try again.
                  </div>
                )}
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-volt-500 px-6 py-3.5 text-base font-bold text-ink-950 hover:bg-volt-400 transition-all active:scale-95 disabled:opacity-60"
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      SUBMITTING...
                    </>
                  ) : (
                    'ENQUIRE NOW'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
