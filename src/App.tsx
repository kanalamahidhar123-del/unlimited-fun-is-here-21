import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import BrandIntro from '@/components/BrandIntro';
import Hero from '@/components/Hero';
import InfoBar from '@/components/InfoBar';
import About from '@/components/About';
import Games from '@/components/Games';
import Gallery from '@/components/Gallery';
import Pricing from '@/components/Pricing';
import Offers from '@/components/Offers';
import GroupBookings from '@/components/GroupBookings';
import LatestInfo from '@/components/LatestInfo';
import RfidCards from '@/components/RfidCards';
import Booking from '@/components/Booking';
import Birthday from '@/components/Birthday';
import Safety from '@/components/Safety';
import FAQ from '@/components/FAQ';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import Chatbot from '@/components/Chatbot';

// Admin Components (Protected)
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminLogin from '@/components/admin/AdminLogin';

export type AppView =
  | 'home'
  | 'games'
  | 'gallery'
  | 'pricing'
  | 'offers'
  | 'groups'
  | 'birthday'
  | 'booking'
  | 'about'
  | 'rules'
  | 'faq'
  | 'contact'
  | 'latest-info';

function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showBrandIntro, setShowBrandIntro] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('unlimited_fun_intro_shown');
    } catch (e) {
      return false;
    }
  });

  const [activeView, setActiveView] = useState<AppView>('home');

  // Handle route / hash parsing
  useEffect(() => {
    const parseRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase().replace(/^#/, '');
      const search = window.location.search.toLowerCase();

      const isAdmin =
        path.startsWith('/admin') ||
        hash === 'admin' ||
        search.includes('admin=true');
      setIsAdminRoute(isAdmin);

      // Check existing admin auth session
      try {
        const raw = sessionStorage.getItem('unlimited_fun_admin_auth');
        if (raw) {
          const auth = JSON.parse(raw);
          if (auth.authenticated && auth.expiresAt > Date.now()) {
            setIsAdminAuthenticated(true);
          } else {
            setIsAdminAuthenticated(false);
          }
        } else {
          setIsAdminAuthenticated(false);
        }
      } catch (e) {
        setIsAdminAuthenticated(false);
      }

      if (!isAdmin) {
        // Map hash to view
        if (
          hash === 'games' ||
          hash === 'gallery' ||
          hash === 'pricing' ||
          hash === 'offers' ||
          hash === 'groups' ||
          hash === 'group-bookings' ||
          hash === 'birthday' ||
          hash === 'booking' ||
          hash === 'about' ||
          hash === 'rules' ||
          hash === 'safety' ||
          hash === 'faq' ||
          hash === 'contact' ||
          hash === 'latest-info'
        ) {
          if (hash === 'group-bookings') setActiveView('groups');
          else if (hash === 'safety') setActiveView('rules');
          else setActiveView(hash as AppView);
        } else if (hash === 'rfid-cards') {
          setActiveView('pricing');
        } else {
          setActiveView('home');
        }
      }
    };

    parseRoute();
    window.addEventListener('popstate', parseRoute);
    window.addEventListener('hashchange', parseRoute);
    return () => {
      window.removeEventListener('popstate', parseRoute);
      window.removeEventListener('hashchange', parseRoute);
    };
  }, []);

  const handleNavigate = (viewId: string) => {
    const clean = viewId.replace(/^#/, '');
    if (clean === 'admin') {
      window.location.hash = 'admin';
      setIsAdminRoute(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    window.location.hash = clean;
    if (
      clean === 'games' ||
      clean === 'gallery' ||
      clean === 'pricing' ||
      clean === 'offers' ||
      clean === 'groups' ||
      clean === 'group-bookings' ||
      clean === 'birthday' ||
      clean === 'booking' ||
      clean === 'about' ||
      clean === 'rules' ||
      clean === 'safety' ||
      clean === 'faq' ||
      clean === 'contact' ||
      clean === 'latest-info'
    ) {
      if (clean === 'group-bookings') setActiveView('groups');
      else if (clean === 'safety') setActiveView('rules');
      else setActiveView(clean as AppView);
    } else if (clean === 'rfid-cards') {
      setActiveView('pricing');
    } else {
      setActiveView('home');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBrandIntroComplete = () => {
    setShowBrandIntro(false);
    try {
      sessionStorage.setItem('unlimited_fun_intro_shown', 'true');
    } catch (e) {
      // ignore
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('unlimited_fun_admin_auth');
    setIsAdminAuthenticated(false);
  };

  // If visiting /admin or #admin
  if (isAdminRoute) {
    if (isAdminAuthenticated) {
      return <AdminDashboard onLogout={handleAdminLogout} />;
    }
    return <AdminLogin onLoginSuccess={() => setIsAdminAuthenticated(true)} />;
  }

  // Customer-Facing Website
  return (
    <div className="min-h-screen bg-ink-950 font-body text-ink-100 antialiased flex flex-col justify-between selection:bg-volt-500 selection:text-ink-950">
      {/* Brand Entrance Animation (Plays once on entry) */}
      {showBrandIntro && (
        <BrandIntro onComplete={handleBrandIntroComplete} />
      )}

      {/* Persistent Global Header & 3-Line Hamburger Menu */}
      <Navbar activeView={activeView} onNavigate={handleNavigate} />

      {/* Main Multi-View / Page-Based Content with Fast Smooth Transitions */}
      <main className="flex-1 w-full">
        {/* VIEW 1: HOME (Concise Hub) */}
        {activeView === 'home' && (
          <div className="space-y-0 animate-in fade-in duration-300">
            <Hero onNavigate={handleNavigate} />
            <InfoBar />
            <LatestInfo />
            <Games onBookClick={() => handleNavigate('booking')} />
            <Gallery
              isPreview={true}
              onViewFullGallery={() => handleNavigate('gallery')}
              onBookClick={() => handleNavigate('booking')}
            />
            <Offers />
            <Pricing onBookClick={() => handleNavigate('booking')} />
            <About />
            <Contact />
          </div>
        )}

        {/* VIEW 2: GAMES & ACTIVITIES (10+ Games) */}
        {activeView === 'games' && (
          <div className="pt-16 animate-in fade-in duration-300">
            <Games onBookClick={() => handleNavigate('booking')} />
          </div>
        )}

        {/* VIEW 3: DEDICATED OFFICIAL GALLERY */}
        {activeView === 'gallery' && (
          <div className="pt-16 animate-in fade-in duration-300">
            <Gallery
              isPreview={false}
              onBookClick={() => handleNavigate('booking')}
            />
          </div>
        )}

        {/* VIEW 4: PRICES & PACKAGES */}
        {activeView === 'pricing' && (
          <div className="pt-16 animate-in fade-in duration-300">
            <Pricing onBookClick={() => handleNavigate('booking')} />
            <RfidCards />
          </div>
        )}

        {/* VIEW 5: SPECIAL OFFERS */}
        {activeView === 'offers' && (
          <div className="pt-16 animate-in fade-in duration-300">
            <Offers />
          </div>
        )}

        {/* VIEW 6: GROUP BOOKINGS (15+ and 30+ Private Slot) */}
        {activeView === 'groups' && (
          <div className="pt-16 animate-in fade-in duration-300">
            <GroupBookings onBookClick={() => handleNavigate('booking')} />
          </div>
        )}

        {/* VIEW 7: BIRTHDAY PARTIES */}
        {activeView === 'birthday' && (
          <div className="pt-16 animate-in fade-in duration-300">
            <Birthday />
          </div>
        )}

        {/* VIEW 8: BOOK YOUR SLOT (Existing 300 Capacity Booking Engine) */}
        {activeView === 'booking' && (
          <div className="pt-16 animate-in fade-in duration-300">
            <Booking />
          </div>
        )}

        {/* VIEW 9: ABOUT US & FOUNDER */}
        {activeView === 'about' && (
          <div className="pt-16 animate-in fade-in duration-300">
            <About />
          </div>
        )}

        {/* VIEW 10: RULES & SAFETY (80 KG Max Weight) */}
        {activeView === 'rules' && (
          <div className="pt-16 animate-in fade-in duration-300">
            <Safety />
          </div>
        )}

        {/* VIEW 11: FAQ */}
        {activeView === 'faq' && (
          <div className="pt-16 animate-in fade-in duration-300">
            <FAQ />
          </div>
        )}

        {/* VIEW 12: CONTACT & LOCATION */}
        {activeView === 'contact' && (
          <div className="pt-16 animate-in fade-in duration-300">
            <Contact />
          </div>
        )}

        {/* VIEW 13: KNOW LATEST INFO / ANNOUNCEMENTS */}
        {activeView === 'latest-info' && (
          <div className="pt-16 animate-in fade-in duration-300">
            <LatestInfo />
          </div>
        )}
      </main>

      {/* Global Footer & Floating Support */}
      <Footer onNavigate={handleNavigate} />
      <BackToTop />
      <Chatbot />
    </div>
  );
}

export default App;
