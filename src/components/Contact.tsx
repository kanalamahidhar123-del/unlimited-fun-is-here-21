import { Phone, Mail, Clock, Calendar, MapPin, Instagram, MessageCircle } from 'lucide-react';
import { SITE } from '@/data/site';

const whatsappUrl = `https://wa.me/91${SITE.whatsapp}`;

export default function Contact() {
  return (
    <section id="contact" className="py-20 sm:py-28 bg-ink-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <div>
            <span className="inline-block text-sm font-bold text-volt-500 tracking-widest uppercase mb-3">
              Contact
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white">
              GET IN <span className="text-volt-500">TOUCH</span>
            </h2>
            <p className="mt-4 text-ink-400">
              We are here to help. Reach out to us through any of the options
              below.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-volt-500 flex-shrink-0" />
                <span className="text-ink-200">
                  {SITE.city}, {SITE.region}
                </span>
              </div>
              <a href={`tel:${SITE.phone}`} className="flex items-center gap-3 hover:text-volt-500 transition-colors">
                <Phone className="h-5 w-5 text-volt-500 flex-shrink-0" />
                <span className="text-ink-200">{SITE.phoneDisplay}</span>
              </a>
              <a href={`mailto:${SITE.email}`} className="flex items-center gap-3 hover:text-volt-500 transition-colors">
                <Mail className="h-5 w-5 text-volt-500 flex-shrink-0" />
                <span className="text-ink-200 break-all">{SITE.email}</span>
              </a>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-volt-500 flex-shrink-0" />
                <span className="text-ink-200">{SITE.hours}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-volt-500 flex-shrink-0" />
                <span className="text-ink-200">{SITE.workingDays}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`tel:${SITE.phone}`}
                className="inline-flex items-center gap-2 rounded-full bg-volt-500 px-5 py-2.5 text-sm font-bold text-ink-950 hover:bg-volt-400 transition-all hover:scale-105 active:scale-95"
              >
                <Phone className="h-4 w-4" />
                CALL NOW
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-500 transition-all hover:scale-105 active:scale-95"
              >
                <MessageCircle className="h-4 w-4" />
                WHATSAPP
              </a>
              <a
                href={SITE.maps}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-ink-800 border border-ink-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-ink-700 transition-all hover:scale-105 active:scale-95"
              >
                <MapPin className="h-4 w-4" />
                GET DIRECTIONS
              </a>
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-flame-500 to-flame-600 px-5 py-2.5 text-sm font-bold text-white hover:scale-105 active:scale-95 transition-all"
              >
                <Instagram className="h-4 w-4" />
                INSTAGRAM
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="inline-flex items-center gap-2 rounded-full bg-ink-800 border border-ink-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-ink-700 transition-all hover:scale-105 active:scale-95"
              >
                <Mail className="h-4 w-4" />
                EMAIL US
              </a>
            </div>
          </div>

          {/* Map */}
          <div>
            <h3 className="font-display font-bold text-xl text-white mb-4">
              FIND UNLIMITED FUN
            </h3>
            <div className="rounded-2xl overflow-hidden border border-ink-700 h-80 lg:h-full min-h-[320px]">
              <iframe
                title="Unlimited Fun location map"
                src={SITE.mapsEmbed}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '320px' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href={SITE.maps}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-volt-500 px-5 py-2.5 text-sm font-bold text-ink-950 hover:bg-volt-400 transition-all hover:scale-105 active:scale-95"
            >
              <MapPin className="h-4 w-4" />
              GET DIRECTIONS
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
