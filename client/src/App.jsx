import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EnquiryProvider } from './context/EnquiryContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EnquiryDrawer from './components/EnquiryDrawer';
import AiChatAssistant from './components/AiChatAssistant';
import ProtectedRoute from './components/ProtectedRoute';
import AuthModal from './components/AuthModal';

// Pages
import HomePage from './pages/HomePage';
import CataloguePage from './pages/CataloguePage';
import LawnPage from './pages/LawnPage';
import CateringPage from './pages/CateringPage';
import ServicesPage from './pages/ServicesPage';
import ToolsPage from './pages/ToolsPage';
import AiCreativeDirectorPage from './pages/AiCreativeDirectorPage';
import GalleryPage from './pages/GalleryPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import CustomerAuthPage from './pages/CustomerAuthPage';
import CustomerPortalPage from './pages/CustomerPortalPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// Scroll to top automatically on route changes & record customer journey metadata
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    try {
      const journey = JSON.parse(localStorage.getItem('kandhari_client_journey') || '{"pages":[],"clicks":[]}');
      if (!journey.pages.includes(pathname)) {
        journey.pages.push(pathname);
        if (journey.pages.length > 15) journey.pages.shift();
        localStorage.setItem('kandhari_client_journey', JSON.stringify(journey));
      }
    } catch (e) {}
  }, [pathname]);
  return null;
};

function App() {
  return (
    <AuthProvider>
      <EnquiryProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col bg-brand-cream text-neutral-800 font-sans">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/catalogue" element={<CataloguePage />} />
                <Route path="/lawn" element={<LawnPage />} />
                <Route path="/catering" element={<CateringPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/tools" element={<ToolsPage />} />
                <Route path="/tools/creative-director" element={<AiCreativeDirectorPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                
                {/* Customer Account & Portal Routes */}
                <Route path="/account/login" element={<CustomerAuthPage />} />
                <Route 
                  path="/account" 
                  element={
                    <ProtectedRoute role="customer">
                      <CustomerPortalPage />
                    </ProtectedRoute>
                  } 
                />

                {/* Admin Management Routes */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <ProtectedRoute role="admin">
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  } 
                />
                
                <Route path="*" element={<HomePage />} />
              </Routes>
            </main>
            <Footer />
            <EnquiryDrawer />
            <AiChatAssistant />
            <AuthModal />
          </div>
        </Router>
      </EnquiryProvider>
    </AuthProvider>
  );
}

export default App;
