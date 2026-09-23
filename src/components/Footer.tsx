import React from 'react';
import { Instagram, MessageCircle, Phone, Mail, MapPin, Clock, Shield, Lock } from 'lucide-react';
import { NAV_LINKS, SITE } from '@/data/site';

const whatsappUrl = `https://wa.me/91${SITE.whatsapp}`;

interface FooterProps {
  onNavigate?: (viewId: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const handleNav = (targetId: string) => {
    const cleanId = targetId.replace(/^#/, '');
    if (onNavigate) {
      onNavigate(cleanId);
    } else {
      window.location.hash = cleanId;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-ink-950 border-t border-ink-800 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-12">
          {/* Brand & Socials */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-display font-black text-xl text-white mb-2">
              <span className="text-volt-500">UNLIMITED</span> FUN
            </h3>
            <p className="text-ink-400 text-xs sm:text-sm leading-relaxed max-w-xs mb-4">
              Bhimavaram's Ultimate Indoor Adventure, Trampoline &amp; Soft Play Park.
            </p>
            <div className="flex gap-2.5">
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-ink-900 border border-ink-800 text-ink-300 hover:bg-gradient-to-r hover:from-flame-500 hover:to-flame-600 hover:text-white transition-all active:scale-95 shadow-sm"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-ink-900 border border-ink-800 text-ink-300 hover:bg-green-600 hover:text-white transition-all active:scale-95 shadow-sm"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href={`tel:${SITE.phone}`}
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-ink-900 border border-ink-800 text-ink-300 hover:bg-volt-500 hover:text-ink-950 transition-all active:scale-95 shadow-sm"
                aria-label="Call"
              >
                <Phone className="h-4 w-4" />
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-ink-900 border border-ink-800 text-ink-300 hover:bg-volt-500 hover:text-ink-950 transition-all active:scale-95 shadow-sm"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links Column 1 */}
          <div>
            <h4 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider mb-3 text-volt-400">
              EXPLORE
            </h4>
            <div className="flex flex-col space-y-2 text-xs sm:text-sm">
              <button
                onClick={() => handleNav('home')}
                className="text-left text-ink-400 hover:text-volt-400 transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => handleNav('games')}
                className="text-left text-ink-400 hover:text-volt-400 transition-colors"
              >
                Games &amp; Activities (10+)
              </button>
              <button
                onClick={() => handleNav('gallery')}
                className="text-left text-ink-400 hover:text-volt-400 transition-colors"
              >
                Official Gallery
              </button>
              <button
                onClick={() => handleNav('pricing')}
                className="text-left text-ink-400 hover:text-volt-400 transition-colors"
              >
                Prices &amp; Packages
              </button>
              <button
                onClick={() => handleNav('offers')}
                className="text-left text-ink-400 hover:text-volt-400 transition-colors"
              >
                Special Offers &amp; Deals
              </button>
            </div>
          </div>

          {/* Quick Links Column 2 */}
          <div>
            <h4 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider mb-3 text-volt-400">
              EVENTS &amp; INFO
            </h4>
            <div className="flex flex-col space-y-2 text-xs sm:text-sm">
              <button
                onClick={() => handleNav('groups')}
                className="text-left text-ink-400 hover:text-volt-400 transition-colors"
              >
                Group Bookings (15+ &amp; 30+)
              </button>
              <button
                onClick={() => handleNav('birthday')}
                className="text-left text-ink-400 hover:text-volt-400 transition-colors"
              >
                Birthday Party Packages
              </button>
              <button
                onClick={() => handleNav('about')}
                className="text-left text-ink-400 hover:text-volt-400 transition-colors"
              >
                About Us &amp; Leadership
              </button>
              <button
                onClick={() => handleNav('rules')}
                className="text-left text-ink-400 hover:text-volt-400 transition-colors"
              >
                Rules &amp; Safety (80 KG Max)
              </button>
              <button
                onClick={() => handleNav('faq')}
                className="text-left text-ink-400 hover:text-volt-400 transition-colors"
              >
                Frequently Asked Questions
              </button>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider mb-3 text-volt-400">
              VISIT US
            </h4>
            <ul className="space-y-2 text-xs text-ink-400">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-volt-500 flex-shrink-0" />
                <a href={`tel:${SITE.phone}`} className="hover:text-volt-400 transition-colors">
                  +91 {SITE.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-volt-500 flex-shrink-0" />
                <a href={`mailto:${SITE.email}`} className="hover:text-volt-400 transition-colors break-all">
                  {SITE.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-volt-500 flex-shrink-0" />
                <span>{SITE.city}, {SITE.region}</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-volt-500 flex-shrink-0" />
                <span>{SITE.hours} (Open All 7 Days)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar & Admin Portal */}
        <div className="pt-6 border-t border-ink-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ink-500">
            © 2026 Unlimited Fun. All Rights Reserved.
          </p>

          <button
            onClick={() => handleNav('admin')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ink-900 hover:bg-ink-800 text-[11px] text-ink-400 hover:text-volt-400 border border-ink-800 hover:border-volt-500/30 transition-all font-semibold uppercase tracking-wider active:scale-95"
            title="Secure Management Portal"
          >
            <Lock className="w-3 h-3 text-volt-500" />
            <span>ADMIN PORTAL</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
