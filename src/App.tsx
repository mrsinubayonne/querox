
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { RestaurantProvider } from '@/contexts/RestaurantContext';

// Import des pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Blog from '@/pages/Blog';
import Dashboard from '@/pages/Dashboard';
import Menus from '@/pages/Menus';
import AllMenus from '@/pages/AllMenus';
import Commandes from '@/pages/Commandes';
import Tables from '@/pages/Tables';
import Inventaire from '@/pages/Inventaire';
import QRCodes from '@/pages/QRCodes';
import SiteWeb from '@/pages/SiteWeb';
import SiteWebContainer from '@/pages/SiteWebContainer';
import SiteWebBenefits from '@/pages/SiteWebBenefits';
import Statistiques from '@/pages/Statistiques';
import Parametres from '@/pages/Parametres';
import Abonnement from '@/pages/Abonnement';
import PublicMenu from '@/pages/PublicMenu';
import PublicWebsite from '@/pages/PublicWebsite';
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
import Consulting from '@/pages/Consulting';

// Admin pages
import AdminSubscriptions from '@/pages/AdminSubscriptions';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminRoles from '@/pages/AdminRoles';
import AdminAccessCodes from '@/pages/AdminAccessCodes';

// Partner pages
import PartnerSignup from '@/pages/PartnerSignup';
import PartnerDashboard from '@/pages/PartnerDashboard';

// Support & Reservations pages
import Reservations from '@/pages/Reservations';
import Support from '@/pages/Support';
import Factures from '@/pages/Factures';
import RapportsJournaliers from '@/pages/RapportsJournaliers';
import Equipe from '@/pages/Equipe';
import StaffRequest from '@/pages/StaffRequest';
import SelectOutlet from '@/pages/SelectOutlet';
import SelectProfile from '@/pages/SelectProfile';
import ProfileLogin from '@/pages/ProfileLogin';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { InvoicePaidCelebration } from "@/components/InvoicePaidCelebration";

function App() {
  return (
    <RestaurantProvider restaurantUserId={null}>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Routes publiques */}
              <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/menu/:menuId" element={<PublicMenu />} />
              <Route path="/w/:slug" element={<PublicWebsite />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-failure" element={<PaymentFailure />} />
              <Route path="/partner-signup" element={<PartnerSignup />} />

              {/* Routes protégées */}
              <Route path="/select-profile" element={<ProtectedRoute><SelectProfile /></ProtectedRoute>} />
              <Route path="/select-outlet" element={<ProtectedRoute><SelectOutlet /></ProtectedRoute>} />
              <Route path="/profile-login" element={<ProtectedRoute><ProfileLogin /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/menus" element={<ProtectedRoute><Menus /></ProtectedRoute>} />
              <Route path="/all-menus" element={<ProtectedRoute><AllMenus /></ProtectedRoute>} />
              <Route path="/commandes" element={<ProtectedRoute><Commandes /></ProtectedRoute>} />
              <Route path="/tables" element={<ProtectedRoute><Tables /></ProtectedRoute>} />
              <Route path="/inventaire" element={<ProtectedRoute><Inventaire /></ProtectedRoute>} />
              <Route path="/qr-codes" element={<ProtectedRoute><QRCodes /></ProtectedRoute>} />
              <Route path="/site-web" element={<ProtectedRoute><SiteWeb /></ProtectedRoute>} />
              <Route path="/site-web-container" element={<ProtectedRoute><SiteWebContainer /></ProtectedRoute>} />
              <Route path="/site-web-benefits" element={<ProtectedRoute><SiteWebBenefits /></ProtectedRoute>} />
              <Route path="/statistiques" element={<ProtectedRoute><Statistiques /></ProtectedRoute>} />
              <Route path="/rapports" element={<ProtectedRoute><RapportsJournaliers /></ProtectedRoute>} />
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
              <Route path="/consulting" element={<ProtectedRoute><Consulting /></ProtectedRoute>} />

              {/* Routes Admin */}
              <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/subscriptions" element={<ProtectedRoute><AdminSubscriptions /></ProtectedRoute>} />
              <Route path="/admin/roles" element={<ProtectedRoute><AdminRoles /></ProtectedRoute>} />
              <Route path="/admin/access-codes" element={<ProtectedRoute><AdminAccessCodes /></ProtectedRoute>} />

              {/* Routes Partner */}
              <Route path="/partner-dashboard" element={<ProtectedRoute><PartnerDashboard /></ProtectedRoute>} />

              {/* Routes Support & Reservations */}
              <Route path="/reservations" element={<ProtectedRoute><Reservations /></ProtectedRoute>} />
              <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
              <Route path="/factures" element={<ProtectedRoute><Factures /></ProtectedRoute>} />
          <Route path="/equipe" element={<ProtectedRoute><Equipe /></ProtectedRoute>} />
          <Route path="/staff-request" element={<ProtectedRoute><StaffRequest /></ProtectedRoute>} />

              {/* Redirection par défaut */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
          <Sonner />
          <InvoicePaidCelebration />
        </Router>
      </RestaurantProvider>
  );
}


export default App;
