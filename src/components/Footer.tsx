import { Instagram, MessageCircle, Phone, Mail } from 'lucide-react';
import { NAV_LINKS, SITE } from '@/data/site';

const whatsappUrl = `https://wa.me/91${SITE.whatsapp}`;

export default function Footer() {
  const handleNav = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-ink-950 border-t border-ink-800 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <h3 className="font-display font-black text-xl text-white mb-3">
              <span className="text-volt-500">UNLIMITED</span> FUN
            </h3>
            <p className="text-ink-400 text-sm leading-relaxed max-w-xs">
              Bhimavaram's indoor adventure &amp; fun zone.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-ink-800 text-ink-300 hover:bg-flame-500 hover:text-white transition-all"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-ink-800 text-ink-300 hover:bg-green-600 hover:text-white transition-all"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <a
                href={`tel:${SITE.phone}`}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-ink-800 text-ink-300 hover:bg-volt-500 hover:text-ink-950 transition-all"
                aria-label="Call"
              >
                <Phone className="h-5 w-5" />
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-ink-800 text-ink-300 hover:bg-volt-500 hover:text-ink-950 transition-all"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wide mb-4">
              Quick Links
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNav(link.href)}
                  className="text-left text-sm text-ink-400 hover:text-volt-500 transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wide mb-4">
              Contact
            </h4>
            <ul className="space-y-2 text-sm text-ink-400">
              <li>
                <a href={`tel:${SITE.phone}`} className="hover:text-volt-500 transition-colors">
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.email}`} className="hover:text-volt-500 transition-colors break-all">
                  {SITE.email}
                </a>
              </li>
              <li>{SITE.city}, {SITE.region}</li>
              <li>{SITE.hours} · {SITE.workingDays}</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-ink-800 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-ink-500">
            © 2026 Unlimited Fun. All Rights Reserved.
          </p>
          <a
            href="#admin"
            className="text-xs text-ink-600 hover:text-volt-400 transition-colors uppercase tracking-widest font-semibold flex items-center gap-1.5"
          >
            <span>🔐</span> Admin Portal
          </a>
        </div>
      </div>
    </footer>
  );
}
