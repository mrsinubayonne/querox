
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from "./components/ui/toaster";
import ProtectedRoute from './components/ProtectedRoute';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Menus from './pages/Menus';
import SiteWeb from './pages/SiteWeb';
import Parametres from './pages/Parametres';
import Inventaire from './pages/Inventaire';
import Statistiques from './pages/Statistiques';
import Clients from './pages/Clients';
import Comptabilite from './pages/Comptabilite';
import QRCodes from './pages/QRCodes';
import Marketing from './pages/Marketing';
import Social from './pages/Social';
import NotFound from './pages/NotFound';
import AllMenus from './pages/AllMenus';
import PublicMenu from './pages/PublicMenu';
import Commandes from './pages/Commandes';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/menu-public" element={<PublicMenu />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/menus" element={
            <ProtectedRoute>
              <Menus />
            </ProtectedRoute>
          } />
          <Route path="/tous-les-menus" element={
            <ProtectedRoute>
              <AllMenus />
            </ProtectedRoute>
          } />
          <Route path="/marketing" element={
            <ProtectedRoute>
              <Marketing />
            </ProtectedRoute>
          } />
          <Route path="/social" element={
            <ProtectedRoute>
              <Social />
            </ProtectedRoute>
          } />
          <Route path="/site-web" element={
            <ProtectedRoute>
              <SiteWeb />
            </ProtectedRoute>
          } />
          <Route path="/parametres" element={
            <ProtectedRoute>
              <Parametres />
            </ProtectedRoute>
          } />
          <Route path="/inventaire" element={
            <ProtectedRoute>
              <Inventaire />
            </ProtectedRoute>
          } />
          <Route path="/statistiques" element={
            <ProtectedRoute>
              <Statistiques />
            </ProtectedRoute>
          } />
          <Route path="/clients" element={
            <ProtectedRoute>
              <Clients />
            </ProtectedRoute>
          } />
          <Route path="/comptabilite" element={
            <ProtectedRoute>
              <Comptabilite />
            </ProtectedRoute>
          } />
          <Route path="/qr-codes" element={
            <ProtectedRoute>
              <QRCodes />
            </ProtectedRoute>
          } />
          <Route path="/commandes" element={
            <ProtectedRoute>
              <Commandes />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
