
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import ProtectedRoute from '@/components/ProtectedRoute';
import { RestaurantProvider } from '@/contexts/RestaurantContext';

// Import des pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Menus from '@/pages/Menus';
import AllMenus from '@/pages/AllMenus';
import Commandes from '@/pages/Commandes';
import Inventaire from '@/pages/Inventaire';
import Clients from '@/pages/Clients';
import QRCodes from '@/pages/QRCodes';
import SiteWeb from '@/pages/SiteWeb';
import SiteWebContainer from '@/pages/SiteWebContainer';
import SiteWebBenefits from '@/pages/SiteWebBenefits';
import Statistiques from '@/pages/Statistiques';
import Parametres from '@/pages/Parametres';
import Abonnement from '@/pages/Abonnement';
import PublicMenu from '@/pages/PublicMenu';
import NotFound from '@/pages/NotFound';
import PaymentSuccess from '@/pages/PaymentSuccess';
import PaymentFailure from '@/pages/PaymentFailure';
import Comptabilite from '@/pages/Comptabilite';

// Marketing pages
import MarketingHub from '@/pages/MarketingHub';
import Marketing from '@/pages/Marketing';
import ConceptionGraphique from '@/pages/ConceptionGraphique';
import ReseauxSociaux from '@/pages/ReseauxSociaux';
import PubliciteFacebook from '@/pages/PubliciteFacebook';

// Services pages
import Services from '@/pages/Services';
import ServiceAppel from '@/pages/ServiceAppel';
import Consulting from '@/pages/Consulting';

// Admin pages
import AdminSubscriptions from '@/pages/AdminSubscriptions';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminRoles from '@/pages/AdminRoles';

function App() {
  return (
    <RestaurantProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/menu/:menuId" element={<PublicMenu />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failure" element={<PaymentFailure />} />

            {/* Routes protégées */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/menus" element={<ProtectedRoute><Menus /></ProtectedRoute>} />
            <Route path="/all-menus" element={<ProtectedRoute><AllMenus /></ProtectedRoute>} />
            <Route path="/commandes" element={<ProtectedRoute><Commandes /></ProtectedRoute>} />
            <Route path="/inventaire" element={<ProtectedRoute><Inventaire /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="/qr-codes" element={<ProtectedRoute><QRCodes /></ProtectedRoute>} />
            <Route path="/site-web" element={<ProtectedRoute><SiteWeb /></ProtectedRoute>} />
            <Route path="/site-web-container" element={<ProtectedRoute><SiteWebContainer /></ProtectedRoute>} />
            <Route path="/site-web-benefits" element={<ProtectedRoute><SiteWebBenefits /></ProtectedRoute>} />
            <Route path="/statistiques" element={<ProtectedRoute><Statistiques /></ProtectedRoute>} />
            <Route path="/parametres" element={<ProtectedRoute><Parametres /></ProtectedRoute>} />
            <Route path="/abonnement" element={<ProtectedRoute><Abonnement /></ProtectedRoute>} />
            <Route path="/comptabilite" element={<ProtectedRoute><Comptabilite /></ProtectedRoute>} />

            {/* Routes Marketing */}
            <Route path="/marketing-hub" element={<ProtectedRoute><MarketingHub /></ProtectedRoute>} />
            <Route path="/marketing" element={<ProtectedRoute><Marketing /></ProtectedRoute>} />
            <Route path="/conception-graphique" element={<ProtectedRoute><ConceptionGraphique /></ProtectedRoute>} />
            <Route path="/reseaux-sociaux" element={<ProtectedRoute><ReseauxSociaux /></ProtectedRoute>} />
            <Route path="/publicite-facebook" element={<ProtectedRoute><PubliciteFacebook /></ProtectedRoute>} />

            {/* Routes Services */}
            <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
            <Route path="/service-appel" element={<ProtectedRoute><ServiceAppel /></ProtectedRoute>} />
            <Route path="/consulting" element={<ProtectedRoute><Consulting /></ProtectedRoute>} />

            {/* Routes Admin */}
            <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/subscriptions" element={<ProtectedRoute><AdminSubscriptions /></ProtectedRoute>} />
            <Route path="/admin/roles" element={<ProtectedRoute><AdminRoles /></ProtectedRoute>} />

            {/* Redirection par défaut */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster />
      </Router>
    </RestaurantProvider>
  );
}

export default App;
