
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Menus from './pages/Menus';
import SiteWeb from './pages/SiteWeb';
import Parametres from './pages/Parametres';
import Inventaire from './pages/Inventaire';
import Statistiques from './pages/Statistiques';
import Clients from './pages/Clients';
import Comptabilite from './pages/Comptabilite';
import QRCodes from './pages/QRCodes';
import Reservations from './pages/Reservations';
import Evenements from './pages/Evenements';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/menus" element={<Menus />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/evenements" element={<Evenements />} />
        <Route path="/site-web" element={<SiteWeb />} />
        <Route path="/parametres" element={<Parametres />} />
        <Route path="/inventaire" element={<Inventaire />} />
        <Route path="/statistiques" element={<Statistiques />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/comptabilite" element={<Comptabilite />} />
        <Route path="/qr-codes" element={<QRCodes />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
