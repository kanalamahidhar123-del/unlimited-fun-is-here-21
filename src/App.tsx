import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import InfoBar from '@/components/InfoBar';
import About from '@/components/About';
import Games from '@/components/Games';
import Pricing from '@/components/Pricing';
import Offers from '@/components/Offers';
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

function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Check URL route for private /admin or #admin
  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      const isAdmin =
        path.startsWith('/admin') ||
        hash.startsWith('#admin') ||
        search.includes('admin=true');
      setIsAdminRoute(isAdmin);

      // Check existing admin auth session
      try {
        const raw = sessionStorage.getItem('unlimited_fun_admin_auth');
        if (raw) {
          const auth = JSON.parse(raw);
          if (auth.authenticated && auth.expiresAt > Date.now()) {
            setIsAdminAuthenticated(true);
            return;
          }
        }
      } catch (e) {
        // ignore
      }
      setIsAdminAuthenticated(false);
    };

    checkRoute();
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

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
    <div className="min-h-screen bg-ink-950 font-body text-ink-100 antialiased">
      <Navbar />
      <main>
        <Hero />
        <InfoBar />
        <About />
        <Games />
        <Pricing />
        <Offers />
        <RfidCards />
        <Booking />
        <Birthday />
        <Safety />
        <Gallery />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
      <Chatbot />
    </div>
  );
}

export default App;
