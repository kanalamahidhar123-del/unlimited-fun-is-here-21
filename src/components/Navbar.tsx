import { useEffect, useState } from 'react';
import { Menu, X, Calendar } from 'lucide-react';
import { NAV_LINKS, SITE } from '@/data/site';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleNav = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-ink-950/95 backdrop-blur-md shadow-lg shadow-black/30'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <button
            onClick={() => handleNav('#home')}
            className="font-display font-black text-lg sm:text-xl tracking-tight text-white"
          >
            <span className="text-volt-500">UNLIMITED</span> FUN
          </button>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className="px-3 py-2 text-sm font-semibold text-ink-200 hover:text-white transition-colors"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => handleNav('#booking')}
              className="ml-3 inline-flex items-center gap-2 rounded-full bg-volt-500 px-5 py-2.5 text-sm font-bold text-ink-950 hover:bg-volt-400 transition-all hover:scale-105 active:scale-95"
            >
              <Calendar className="h-4 w-4" />
              BOOK YOUR SLOT
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden text-white p-2"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden fixed inset-0 top-16 bg-ink-950/98 backdrop-blur-md overflow-y-auto">
          <div className="flex flex-col px-6 py-6 gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className="text-left py-3 text-base font-semibold text-ink-200 hover:text-volt-500 transition-colors border-b border-ink-800"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => handleNav('#booking')}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-volt-500 px-5 py-3 text-base font-bold text-ink-950"
            >
              <Calendar className="h-5 w-5" />
              BOOK YOUR SLOT
            </button>
            <div className="mt-6 text-sm text-ink-400">
              <p>{SITE.city}, {SITE.region}</p>
              <p className="mt-1">{SITE.hours} · {SITE.workingDays}</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
