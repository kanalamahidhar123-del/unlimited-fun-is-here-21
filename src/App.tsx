import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import BrandIntro from '@/components/BrandIntro';
import Hero from '@/components/Hero';
import InfoBar from '@/components/InfoBar';
import About from '@/components/About';
import Games from '@/components/Games';
import Pricing from '@/components/Pricing';
import Offers from '@/components/Offers';
import LatestInfo from '@/components/LatestInfo';
import RfidCards from '@/components/RfidCards';
import Booking from '@/components/Booking';
import Birthday from '@/components/Birthday';
import Safety from '@/components/Safety';
import Gallery from '@/components/Gallery';
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
  | 'pricing'
  | 'offers'
  | 'booking'
  | 'latest-info'
  | 'birthday'
  | 'about'
  | 'contact';

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
          hash === 'pricing' ||
          hash === 'offers' ||
          hash === 'booking' ||
          hash === 'latest-info' ||
          hash === 'birthday' ||
          hash === 'about' ||
          hash === 'contact'
        ) {
          setActiveView(hash as AppView);
        } else if (hash === 'rfid-cards') {
          setActiveView('pricing');
        } else if (hash === 'gallery' || hash === 'safety' || hash === 'faq') {
          setActiveView('about');
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
      return;
    }

    window.location.hash = clean;
    if (
      clean === 'games' ||
      clean === 'pricing' ||
      clean === 'offers' ||
      clean === 'booking' ||
      clean === 'latest-info' ||
      clean === 'birthday' ||
      clean === 'about' ||
      clean === 'contact'
    ) {
      setActiveView(clean as AppView);
    } else if (clean === 'rfid-cards') {
      setActiveView('pricing');
    } else if (clean === 'gallery' || clean === 'safety' || clean === 'faq') {
      setActiveView('about');
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

      {/* Main Multi-View / Page-Based Content */}
      <main className="flex-1 w-full">
        {/* VIEW 1: HOME (Executive Hub) */}
        {activeView === 'home' && (
          <div className="space-y-0 animate-in fade-in duration-300">
            <Hero onNavigate={handleNavigate} />
            <InfoBar />
            <LatestInfo />
            <Games onBookClick={() => handleNavigate('booking')} />
            <Pricing onBookClick={() => handleNavigate('booking')} />
            <About />
            <Safety />
            <FAQ />
            <Contact />
          </div>
        )}

        {/* VIEW 2: GAMES & ACTIVITIES (13 Games) */}
        {activeView === 'games' && (
          <div className="pt-16 animate-in fade-in duration-300">
            <Games onBookClick={() => handleNavigate('booking')} />
            <Safety />
          </div>
        )}

        {/* VIEW 3: PRICES & PACKAGES */}
        {activeView === 'pricing' && (
          <div className="pt-16 animate-in fade-in duration-300">
            <Pricing onBookClick={() => handleNavigate('booking')} />
            <RfidCards />
          </div>
        )}

        {/* VIEW 4: SPECIAL OFFERS */}
        {activeView === 'offers' && (
          <div className="pt-16 animate-in fade-in duration-300">
            <Offers />
            <Birthday />
          </div>
        )}

        {/* VIEW 5: BOOK YOUR SLOT */}
        {activeView === 'booking' && (
          <div className="pt-16 animate-in fade-in duration-300">
            <Booking />
          </div>
        )}

        {/* VIEW 6: KNOW LATEST INFO / ANNOUNCEMENTS */}
        {activeView === 'latest-info' && (
          <div className="pt-16 animate-in fade-in duration-300">
            <LatestInfo />
          </div>
        )}

        {/* VIEW 7: BIRTHDAY & PARTY PACKAGES */}
        {activeView === 'birthday' && (
          <div className="pt-16 animate-in fade-in duration-300">
            <Birthday />
          </div>
        )}

        {/* VIEW 8: LOCATION & ABOUT */}
        {activeView === 'about' && (
          <div className="pt-16 animate-in fade-in duration-300">
            <About />
            <Safety />
            <Gallery />
            <FAQ />
          </div>
        )}

        {/* VIEW 9: CONTACT & SUPPORT */}
        {activeView === 'contact' && (
          <div className="pt-16 animate-in fade-in duration-300">
            <Contact />
            <FAQ />
          </div>
        )}
      </main>

      {/* Global Footer & Floating Support */}
      <Footer />
      <BackToTop />
      <Chatbot />
    </div>
  );
}

export default App;
