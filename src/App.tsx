import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import Index from './pages/Index';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Commandes from './pages/Commandes';
import Menus from './pages/Menus';
import Inventaire from './pages/Inventaire';
import Clients from './pages/Clients';
import QRCodes from './pages/QRCodes';
import SiteWebContainer from './pages/SiteWebContainer';
import MarketingHub from './pages/MarketingHub';
import ConceptionGraphique from './pages/ConceptionGraphique';
import ReseauxSociaux from './pages/ReseauxSociaux';
import PubliciteFacebook from './pages/PubliciteFacebook';
import Services from './pages/Services';
import ServiceAppel from './pages/ServiceAppel';
import Consulting from './pages/Consulting';
import Statistiques from './pages/Statistiques';
import Parametres from './pages/Parametres';
import Abonnement from './pages/Abonnement';
import Comptabilite from './pages/Comptabilite';
import AdminSubscriptions from './pages/AdminSubscriptions';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import PublicMenu from './pages/PublicMenu';
import AllMenus from './pages/AllMenus';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { RestaurantProvider } from './contexts/RestaurantContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RestaurantProvider restaurantUserId="default-user">
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/commandes" 
                element={
                  <ProtectedRoute>
                    <Commandes />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/menus" 
                element={
                  <ProtectedRoute>
                    <Menus />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/inventaire" 
                element={
                  <ProtectedRoute>
                    <Inventaire />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/clients" 
                element={
                  <ProtectedRoute>
                    <Clients />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/qr-codes" 
                element={
                  <ProtectedRoute>
                    <QRCodes />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/site-web" 
                element={
                  <ProtectedRoute>
                    <SiteWebContainer />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/marketing" 
                element={
                  <ProtectedRoute>
                    <MarketingHub />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/conception-graphique" 
                element={
                  <ProtectedRoute>
                    <ConceptionGraphique />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reseaux-sociaux" 
                element={
                  <ProtectedRoute>
                    <ReseauxSociaux />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/publicite-facebook" 
                element={
                  <ProtectedRoute>
                    <PubliciteFacebook />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/services" 
                element={
                  <ProtectedRoute>
                    <Services />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/service-appel" 
                element={
                  <ProtectedRoute>
                    <ServiceAppel />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/consulting" 
                element={
                  <ProtectedRoute>
                    <Consulting />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/statistiques" 
                element={
                  <ProtectedRoute>
                    <Statistiques />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/parametres" 
                element={
                  <ProtectedRoute>
                    <Parametres />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/abonnement" 
                element={
                  <ProtectedRoute>
                    <Abonnement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/comptabilite" 
                element={
                  <ProtectedRoute>
                    <Comptabilite />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/subscriptions" 
                element={
                  <ProtectedRoute>
                    <AdminSubscriptions />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/payment/success" 
                element={
                  <ProtectedRoute>
                    <PaymentSuccess />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/payment/failure" 
                element={
                  <ProtectedRoute>
                    <PaymentFailure />
                  </ProtectedRoute>
                } 
              />
              <Route path="/menus/:menuId" element={<PublicMenu />} />
              <Route path="/all-menus" element={<AllMenus />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </BrowserRouter>
        </AuthProvider>
      </RestaurantProvider>
    </QueryClientProvider>
  );
}

export default App;
