
import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Commandes from '@/pages/Commandes';
import Menus from '@/pages/Menus';
import AllMenus from '@/pages/AllMenus';
import Inventaire from '@/pages/Inventaire';
import Clients from '@/pages/Clients';
import QRCodes from '@/pages/QRCodes';
import SiteWebContainer from '@/pages/SiteWebContainer';
import SiteWebBenefits from '@/pages/SiteWebBenefits';
import MarketingHub from '@/pages/MarketingHub';
import ConceptionGraphique from '@/pages/ConceptionGraphique';
import ReseauxSociaux from '@/pages/ReseauxSociaux';
import PubliciteFacebook from '@/pages/PubliciteFacebook';
import Services from '@/pages/Services';
import ServiceAppel from '@/pages/ServiceAppel';
import Consulting from '@/pages/Consulting';
import Statistiques from '@/pages/Statistiques';
import Parametres from '@/pages/Parametres';
import Abonnement from '@/pages/Abonnement';
import Comptabilite from '@/pages/Comptabilite';
import PublicMenu from '@/pages/PublicMenu';
import PaymentSuccess from '@/pages/PaymentSuccess';
import PaymentFailure from '@/pages/PaymentFailure';
import NotFound from '@/pages/NotFound';
import AdminSubscriptions from '@/pages/AdminSubscriptions';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/auth" />;
};

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/commandes" element={<ProtectedRoute><Commandes /></ProtectedRoute>} />
          <Route path="/menus" element={<ProtectedRoute><Menus /></ProtectedRoute>} />
          <Route path="/menus/:menuId" element={<ProtectedRoute><AllMenus /></ProtectedRoute>} />
          <Route path="/inventaire" element={<ProtectedRoute><Inventaire /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
          <Route path="/qr-codes" element={<ProtectedRoute><QRCodes /></ProtectedRoute>} />
          <Route path="/site-web" element={<ProtectedRoute><SiteWebContainer /></ProtectedRoute>} />
          <Route path="/site-web-benefits" element={<ProtectedRoute><SiteWebBenefits /></ProtectedRoute>} />
          <Route path="/marketing" element={<ProtectedRoute><MarketingHub /></ProtectedRoute>} />
          <Route path="/conception-graphique" element={<ProtectedRoute><ConceptionGraphique /></ProtectedRoute>} />
          <Route path="/reseaux-sociaux" element={<ProtectedRoute><ReseauxSociaux /></ProtectedRoute>} />
          <Route path="/publicite-facebook" element={<ProtectedRoute><PubliciteFacebook /></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
          <Route path="/service-appel" element={<ProtectedRoute><ServiceAppel /></ProtectedRoute>} />
          <Route path="/consulting" element={<ProtectedRoute><Consulting /></ProtectedRoute>} />
          <Route path="/statistiques" element={<ProtectedRoute><Statistiques /></ProtectedRoute>} />
          <Route path="/parametres" element={<ProtectedRoute><Parametres /></ProtectedRoute>} />
          <Route path="/abonnement" element={<ProtectedRoute><Abonnement /></ProtectedRoute>} />
          <Route path="/comptabilite" element={<ProtectedRoute><Comptabilite /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin/subscriptions" element={<ProtectedRoute><AdminSubscriptions /></ProtectedRoute>} />
          
          {/* Public Routes */}
          <Route path="/menu/:slug" element={<PublicMenu />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failure" element={<PaymentFailure />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
    </Router>
  );
}

export default App;
