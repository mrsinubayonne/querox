
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { RestaurantProvider } from '@/contexts/RestaurantContext';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { InvoicePaidCelebration } from "@/components/InvoicePaidCelebration";
import { KeyboardShortcutsProvider } from "@/components/KeyboardShortcutsProvider";
import { useGlobalNewOrderNotifier } from "@/hooks/useGlobalNewOrderNotifier";
import { useMenuPrefetch } from "@/hooks/useMenuPrefetch";
import GlobalAnnouncementModal from "@/components/GlobalAnnouncementModal";
import GlobalAnnouncementBanner from "@/components/GlobalAnnouncementBanner";
import MaintenanceNotice from "@/components/MaintenanceNotice";

const GlobalOrderNotifier = () => {
  useGlobalNewOrderNotifier();
  useMenuPrefetch();
  return null;
};

// Lightweight page loading spinner
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
);

// Lazy-loaded pages — splits bundle into on-demand chunks
const Index = lazy(() => import('@/pages/Index'));
const Auth = lazy(() => import('@/pages/Auth'));
const Blog = lazy(() => import('@/pages/Blog'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Menus = lazy(() => import('@/pages/Menus'));
const AllMenus = lazy(() => import('@/pages/AllMenus'));
const Commandes = lazy(() => import('@/pages/Commandes'));
const Tables = lazy(() => import('@/pages/Tables'));
const Inventaire = lazy(() => import('@/pages/Inventaire'));
const QRCodes = lazy(() => import('@/pages/QRCodes'));
const SiteWeb = lazy(() => import('@/pages/SiteWeb'));
const SiteWebContainer = lazy(() => import('@/pages/SiteWebContainer'));
const SiteWebBenefits = lazy(() => import('@/pages/SiteWebBenefits'));
const Statistiques = lazy(() => import('@/pages/Statistiques'));
const Parametres = lazy(() => import('@/pages/Parametres'));
const Abonnement = lazy(() => import('@/pages/Abonnement'));
const PublicMenu = lazy(() => import('@/pages/PublicMenu'));
const PublicMenuBySlug = lazy(() => import('@/pages/PublicMenuBySlug'));
const PublicWebsite = lazy(() => import('@/pages/PublicWebsite'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const PaymentSuccess = lazy(() => import('@/pages/PaymentSuccess'));
const PaymentFailure = lazy(() => import('@/pages/PaymentFailure'));
const Comptabilite = lazy(() => import('@/pages/Comptabilite'));
const Salaires = lazy(() => import('@/pages/Salaires'));
const MarketingHub = lazy(() => import('@/pages/MarketingHub'));
const Marketing = lazy(() => import('@/pages/Marketing'));
const ConceptionGraphique = lazy(() => import('@/pages/ConceptionGraphique'));
const ReseauxSociaux = lazy(() => import('@/pages/ReseauxSociaux'));
const PubliciteFacebook = lazy(() => import('@/pages/PubliciteFacebook'));
const Services = lazy(() => import('@/pages/Services'));
const Consulting = lazy(() => import('@/pages/Consulting'));
const Plus = lazy(() => import('@/pages/Plus'));
const AdminSubscriptions = lazy(() => import('@/pages/AdminSubscriptions'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const AdminRoles = lazy(() => import('@/pages/AdminRoles'));
const AdminAccessCodes = lazy(() => import('@/pages/AdminAccessCodes'));
const AdminRestaurants = lazy(() => import('@/pages/AdminRestaurants'));
const AdminRevenues = lazy(() => import('@/pages/AdminRevenues'));
const AdminRealTime = lazy(() => import('@/pages/AdminRealTime'));
const AdminAlerts = lazy(() => import('@/pages/AdminAlerts'));
const AdminSupport = lazy(() => import('@/pages/AdminSupport'));
const AdminGlobalControl = lazy(() => import('@/pages/AdminGlobalControl'));
const AdminSystemSettings = lazy(() => import('@/pages/AdminSystemSettings'));
const AdminComptabilite = lazy(() => import('@/pages/AdminComptabilite'));
const AdminDiagnostics = lazy(() => import('@/pages/AdminDiagnostics'));
const AdminAnnouncements = lazy(() => import('@/pages/AdminAnnouncements'));
const AdminReports = lazy(() => import('@/pages/AdminReports'));
const PartnerSignup = lazy(() => import('@/pages/PartnerSignup'));
const PartnerDashboard = lazy(() => import('@/pages/PartnerDashboard'));
const Reservations = lazy(() => import('@/pages/Reservations'));
const Support = lazy(() => import('@/pages/Support'));
const Factures = lazy(() => import('@/pages/Factures'));
const RapportsJournaliers = lazy(() => import('@/pages/RapportsJournaliers'));
const Equipe = lazy(() => import('@/pages/Equipe'));
const ProfileManagement = lazy(() => import('@/pages/ProfileManagement').then(m => ({ default: m.ProfileManagement })));

const StaffRequest = lazy(() => import('@/pages/StaffRequest'));
const Clients = lazy(() => import('@/pages/Clients'));
const Debiteurs = lazy(() => import('@/pages/Debiteurs'));
const PerformancePersonnel = lazy(() => import('@/pages/PerformancePersonnel'));
const SelectOutlet = lazy(() => import('@/pages/SelectOutlet'));
const TeamMemberAuth = lazy(() => import('@/pages/TeamMemberAuth'));
const TeamJoin = lazy(() => import('@/pages/TeamJoin'));
const TeamMemberSetup = lazy(() => import('@/pages/TeamMemberSetup'));
const CGUCGV = lazy(() => import('@/pages/CGUCGV'));

function App() {
  return (
    <RestaurantProvider restaurantUserId={null} outletId={null}>
      <Router>
         <GlobalOrderNotifier />
         <div className="min-h-screen bg-background">
           <MaintenanceNotice />
           <GlobalAnnouncementBanner />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Routes publiques */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/cgu-cgv" element={<CGUCGV />} />
              <Route path="/menu/:menuId" element={<PublicMenu />} />
              <Route path="/w/:slug" element={<PublicWebsite />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-failure" element={<PaymentFailure />} />
              <Route path="/partner-signup" element={<PartnerSignup />} />
              <Route path="/team-login" element={<TeamMemberAuth />} />
              <Route path="/team-join" element={<TeamJoin />} />
              <Route path="/team-setup" element={<TeamMemberSetup />} />

              {/* Routes protégées */}
              <Route path="/select-outlet" element={<ProtectedRoute><SelectOutlet /></ProtectedRoute>} />
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
              <Route path="/salaires" element={<ProtectedRoute><Salaires /></ProtectedRoute>} />

              {/* Routes Marketing */}
              <Route path="/marketing-hub" element={<ProtectedRoute><MarketingHub /></ProtectedRoute>} />
              <Route path="/marketing" element={<ProtectedRoute><Marketing /></ProtectedRoute>} />
              <Route path="/conception-graphique" element={<ProtectedRoute><ConceptionGraphique /></ProtectedRoute>} />
              <Route path="/reseaux-sociaux" element={<ProtectedRoute><ReseauxSociaux /></ProtectedRoute>} />
              <Route path="/publicite-facebook" element={<ProtectedRoute><PubliciteFacebook /></ProtectedRoute>} />

              {/* Routes Services */}
              <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
              <Route path="/consulting" element={<ProtectedRoute><Consulting /></ProtectedRoute>} />
              <Route path="/plus" element={<ProtectedRoute><Plus /></ProtectedRoute>} />

              {/* Routes Admin */}
              <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/restaurants" element={<ProtectedRoute><AdminRestaurants /></ProtectedRoute>} />
              <Route path="/admin/revenues" element={<ProtectedRoute><AdminRevenues /></ProtectedRoute>} />
              <Route path="/admin/real-time" element={<ProtectedRoute><AdminRealTime /></ProtectedRoute>} />
              <Route path="/admin/comptabilite" element={<ProtectedRoute><AdminComptabilite /></ProtectedRoute>} />
              <Route path="/admin/alerts" element={<ProtectedRoute><AdminAlerts /></ProtectedRoute>} />
              <Route path="/admin/support" element={<ProtectedRoute><AdminSupport /></ProtectedRoute>} />
              <Route path="/admin/global-control" element={<ProtectedRoute><AdminGlobalControl /></ProtectedRoute>} />
              <Route path="/admin/system-settings" element={<ProtectedRoute><AdminSystemSettings /></ProtectedRoute>} />
              <Route path="/admin/subscriptions" element={<ProtectedRoute><AdminSubscriptions /></ProtectedRoute>} />
              <Route path="/admin/roles" element={<ProtectedRoute><AdminRoles /></ProtectedRoute>} />
              <Route path="/admin/access-codes" element={<ProtectedRoute><AdminAccessCodes /></ProtectedRoute>} />
              <Route path="/admin/diagnostics" element={<ProtectedRoute><AdminDiagnostics /></ProtectedRoute>} />
              <Route path="/admin/announcements" element={<ProtectedRoute><AdminAnnouncements /></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />

              {/* Routes Partner */}
              <Route path="/partner-dashboard" element={<ProtectedRoute><PartnerDashboard /></ProtectedRoute>} />

              {/* Routes Support & Reservations */}
              <Route path="/reservations" element={<ProtectedRoute><Reservations /></ProtectedRoute>} />
              <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
              <Route path="/factures" element={<ProtectedRoute><Factures /></ProtectedRoute>} />
              <Route path="/equipe" element={<ProtectedRoute><Equipe /></ProtectedRoute>} />
              <Route path="/profils" element={<ProtectedRoute><ProfileManagement /></ProtectedRoute>} />

              <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
              <Route path="/debiteurs" element={<ProtectedRoute><Debiteurs /></ProtectedRoute>} />
              <Route path="/performance-personnel" element={<ProtectedRoute><PerformancePersonnel /></ProtectedRoute>} />
              <Route path="/staff-request" element={<ProtectedRoute><StaffRequest /></ProtectedRoute>} />

              {/* Redirection par défaut */}
              {/* Route publique slug : querox.me/{restaurant}/{pdv} — placée avant le catch-all */}
              <Route path="/:restaurantSlug/:outletSlug" element={<PublicMenuBySlug />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
        <Sonner />
         <InvoicePaidCelebration />
         <GlobalAnnouncementModal />
         <KeyboardShortcutsProvider />
      </Router>
    </RestaurantProvider>
  );
}

export default App;
