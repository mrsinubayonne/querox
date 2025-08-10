import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Commandes from './pages/Commandes';
import Menus from './pages/Menus';
import Inventaire from './pages/Inventaire';
import Clients from './pages/Clients';
import QRCodes from './pages/QRCodes';
import SiteWeb from './pages/SiteWeb';
import Marketing from './pages/Marketing';
import Comptabilite from './pages/Comptabilite';
import Statistiques from './pages/Statistiques';
import Parametres from './pages/Parametres';
import Abonnement from './pages/Abonnement';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient } from 'react-query';
import { RestaurantProvider } from './contexts/RestaurantContext';
import Services from './pages/Services';

function App() {
  return (
    <QueryClient>
      <AuthProvider>
        <RestaurantProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Toaster />
              <Routes>
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/commandes" element={<ProtectedRoute><Commandes /></ProtectedRoute>} />
                <Route path="/menus" element={<ProtectedRoute><Menus /></ProtectedRoute>} />
                <Route path="/inventaire" element={<ProtectedRoute><Inventaire /></ProtectedRoute>} />
                <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
                <Route path="/qr-codes" element={<ProtectedRoute><QRCodes /></ProtectedRoute>} />
                <Route path="/site-web" element={<ProtectedRoute><SiteWeb /></ProtectedRoute>} />
                <Route path="/marketing" element={<ProtectedRoute><Marketing /></ProtectedRoute>} />
                <Route 
                  path="/services" 
                  element={
                    <ProtectedRoute>
                      <Services />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/comptabilite" element={<ProtectedRoute><Comptabilite /></ProtectedRoute>} />
                <Route path="/statistiques" element={<ProtectedRoute><Statistiques /></ProtectedRoute>} />
                <Route path="/parametres" element={<ProtectedRoute><Parametres /></ProtectedRoute>} />
                <Route path="/abonnement" element={<ProtectedRoute><Abonnement /></ProtectedRoute>} />
              </Routes>
            </div>
          </Router>
        </RestaurantProvider>
      </AuthProvider>
    </QueryClient>
  );
}

export default App;
