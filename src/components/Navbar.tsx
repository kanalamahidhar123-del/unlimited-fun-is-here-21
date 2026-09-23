import { useEffect, useState } from 'react';
import {
  Menu,
  X,
  Calendar,
  Home,
  Gamepad2,
  Image,
  Tag,
  Gift,
  Users,
  PartyPopper,
  Info,
  Shield,
  HelpCircle,
  Phone,
  Sparkles,
  ChevronRight,
  Clock,
  MapPin,
  Megaphone,
} from 'lucide-react';
import { SITE } from '@/data/site';
import { getPublishedAnnouncements } from '@/lib/announcementStore';

interface NavbarProps {
  activeView?: string;
  onNavigate?: (viewId: string) => void;
}

export default function Navbar({ activeView = 'home', onNavigate }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasImportantNews, setHasImportantNews] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when hamburger menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Check for active important announcements for the badge
  const checkAnnouncements = () => {
    try {
      const items = getPublishedAnnouncements();
      const hasImp = items.some((a) => a.is_important);
      setHasImportantNews(hasImp);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    checkAnnouncements();
    window.addEventListener('unlimited_fun_announcements_updated', checkAnnouncements);
    return () => {
      window.removeEventListener('unlimited_fun_announcements_updated', checkAnnouncements);
    };
  }, []);

  const handleNav = (targetId: string) => {
    setMenuOpen(false);
    const cleanId = targetId.replace(/^#/, '');

    if (onNavigate) {
      onNavigate(cleanId);
    } else {
      window.location.hash = cleanId;
      const el = document.getElementById(cleanId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const navItems = [
    { id: 'home', label: 'HOME', icon: Home, highlight: false },
    { id: 'games', label: 'GAMES & ACTIVITIES', icon: Gamepad2, highlight: false },
    { id: 'gallery', label: 'GALLERY', icon: Image, highlight: false },
    { id: 'pricing', label: 'PRICING', icon: Tag, highlight: false },
    { id: 'offers', label: 'OFFERS', icon: Gift, highlight: false },
    { id: 'groups', label: 'GROUP BOOKINGS', icon: Users, highlight: false },
    { id: 'birthday', label: 'BIRTHDAY PARTIES', icon: PartyPopper, highlight: false },
    { id: 'booking', label: 'BOOK YOUR SLOT', icon: Calendar, highlight: true },
    { id: 'about', label: 'ABOUT US', icon: Info, highlight: false },
    { id: 'rules', label: 'RULES & SAFETY', icon: Shield, highlight: false },
    { id: 'faq', label: 'FAQ', icon: HelpCircle, highlight: false },
    { id: 'contact', label: 'CONTACT', icon: Phone, highlight: false },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || activeView !== 'home'
            ? 'bg-ink-950/95 backdrop-blur-md border-b border-ink-800/80 shadow-xl shadow-black/40 py-2.5 sm:py-3'
            : 'bg-gradient-to-b from-ink-950/95 via-ink-950/60 to-transparent py-3.5'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand Logo */}
            <button
              onClick={() => handleNav('home')}
              className="flex items-center gap-2.5 group text-left focus:outline-none"
            >
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-volt-400 to-volt-600 flex items-center justify-center text-ink-950 font-black text-lg sm:text-xl shadow-md shadow-volt-500/20 group-hover:scale-105 transition-transform">
                UF
              </div>
              <div>
                <span className="font-display font-black text-lg sm:text-xl tracking-tight text-white flex items-center gap-1 leading-none">
                  <span className="text-volt-500">UNLIMITED</span> FUN
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono text-ink-400 block tracking-wider uppercase mt-0.5">
                  Bhimavaram Zone
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => handleNav('home')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeView === 'home'
                    ? 'text-volt-400 bg-volt-500/10'
                    : 'text-ink-300 hover:text-white hover:bg-ink-900/60'
                }`}
              >
                HOME
              </button>
              <button
                onClick={() => handleNav('games')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeView === 'games'
                    ? 'text-volt-400 bg-volt-500/10'
                    : 'text-ink-300 hover:text-white hover:bg-ink-900/60'
                }`}
              >
                GAMES
              </button>
              <button
                onClick={() => handleNav('gallery')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeView === 'gallery'
                    ? 'text-volt-400 bg-volt-500/10'
                    : 'text-ink-300 hover:text-white hover:bg-ink-900/60'
                }`}
              >
                GALLERY
              </button>
              <button
                onClick={() => handleNav('pricing')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeView === 'pricing'
                    ? 'text-volt-400 bg-volt-500/10'
                    : 'text-ink-300 hover:text-white hover:bg-ink-900/60'
                }`}
              >
                PRICES
              </button>
              <button
                onClick={() => handleNav('offers')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeView === 'offers'
                    ? 'text-volt-400 bg-volt-500/10'
                    : 'text-ink-300 hover:text-white hover:bg-ink-900/60'
                }`}
              >
                OFFERS
              </button>
              <button
                onClick={() => handleNav('groups')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeView === 'groups'
                    ? 'text-volt-400 bg-volt-500/10'
                    : 'text-ink-300 hover:text-white hover:bg-ink-900/60'
                }`}
              >
                GROUPS
              </button>

              {/* Book Now Primary Button */}
              <button
                onClick={() => handleNav('booking')}
                className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-volt-500 px-4 py-2 text-xs font-black text-ink-950 hover:bg-volt-400 transition-all shadow-md shadow-volt-500/20 active:scale-95"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>BOOK SLOT</span>
              </button>

              {/* Global 3-Line Hamburger Menu Button */}
              <button
                onClick={() => setMenuOpen(true)}
                className="ml-2 p-2 rounded-xl bg-ink-900/90 hover:bg-ink-800 text-white border border-ink-800 transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95"
                aria-label="Open full menu"
                title="Open full menu"
              >
                <Menu className="h-5 w-5 text-volt-400" />
                <span className="text-[11px] uppercase tracking-wider text-ink-200">MENU</span>
              </button>
            </div>

            {/* Mobile Header Actions (Book CTA + Hamburger) */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => handleNav('booking')}
                className="inline-flex items-center gap-1.5 rounded-full bg-volt-500 px-3.5 py-1.5 text-xs font-black text-ink-950 hover:bg-volt-400 transition-colors shadow-sm active:scale-95"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>BOOK</span>
              </button>

              {/* Global 3-Line Mobile Hamburger Menu Trigger */}
              <button
                onClick={() => setMenuOpen(true)}
                className="p-2 rounded-xl bg-ink-900 text-white border border-ink-800 hover:bg-ink-800 focus:outline-none active:scale-95 transition-all"
                aria-label="Open navigation menu"
              >
                <Menu className="h-6 w-6 text-volt-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* GLOBAL SLIDE-OVER NAVIGATION DRAWER */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-200">
          {/* Backdrop Overlay with slight dim and blur */}
          <div
            className="fixed inset-0 bg-ink-950/80 backdrop-blur-md transition-opacity cursor-pointer"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer Content Panel */}
          <div className="relative w-full max-w-sm sm:max-w-md bg-ink-900 border-l border-ink-800 h-full flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-right duration-300 overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-ink-800 flex items-center justify-between bg-ink-950/80 sticky top-0 z-10 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-volt-500 text-ink-950 font-black flex items-center justify-center text-sm shadow">
                  UF
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-white">
                    <span className="text-volt-500">UNLIMITED</span> FUN
                  </h3>
                  <p className="text-[10px] text-ink-400 font-mono">
                    Indoor Adventure Park · Bhimavaram
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-xl bg-ink-900 text-ink-400 hover:text-white hover:bg-ink-800 border border-ink-800 transition-colors"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation List (Staggered items) */}
            <div className="p-4 sm:p-5 space-y-1.5 flex-1 overflow-y-auto">
              <div className="text-[10px] font-bold uppercase tracking-widest text-ink-500 px-3 py-1">
                MAIN NAVIGATION
              </div>

              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    style={{ animationDelay: `${index * 25}ms` }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left font-bold text-xs sm:text-sm transition-all group active:scale-[0.98] ${
                      item.highlight
                        ? 'bg-volt-500 text-ink-950 shadow-lg shadow-volt-500/15 hover:bg-volt-400'
                        : isActive
                        ? 'bg-volt-500/15 text-volt-400 border border-volt-500/30'
                        : 'bg-ink-950/60 hover:bg-ink-800 text-ink-200 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-xl flex items-center justify-center transition-colors ${
                          item.highlight
                            ? 'bg-ink-950 text-volt-400'
                            : isActive
                            ? 'bg-volt-500/20 text-volt-400'
                            : 'bg-ink-900 text-ink-400 group-hover:text-white'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span>{item.label}</span>
                    </div>

                    <ChevronRight
                      className={`h-4 w-4 transition-transform group-hover:translate-x-0.5 ${
                        item.highlight ? 'text-ink-950' : 'text-ink-500'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer Contact Info */}
            <div className="p-4 sm:p-5 border-t border-ink-800 bg-ink-950/90 space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-ink-300">
                <Clock className="h-4 w-4 text-volt-500 flex-shrink-0" />
                <span>{SITE.hours} (Open All 7 Days)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-ink-300">
                <MapPin className="h-4 w-4 text-volt-500 flex-shrink-0" />
                <span>{SITE.city}, {SITE.region}</span>
              </div>
              <a
                href={`https://wa.me/91${SITE.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-ink-950 py-2.5 text-xs font-bold transition-all active:scale-95"
              >
                <span>WhatsApp: +91 {SITE.phoneDisplay}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
