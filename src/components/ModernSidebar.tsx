
import React, { useState } from 'react';
import { Home, ShoppingBag, Menu, Package, Users, QrCode, Globe, TrendingUp, BarChart3, Settings, CreditCard, ChevronLeft, ChevronRight, LogOut, Headphones, Phone, UserCheck, Palette, Share2, Facebook, Shield, Crown, UserCog, LifeBuoy, Calendar, Calculator, FileText } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';

interface ModernSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const ModernSidebar: React.FC<ModernSidebarProps> = ({
  collapsed,
  setCollapsed
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { isAdmin } = useSubscription();
  
  const [servicesExpanded, setServicesExpanded] = useState(location.pathname.includes('/service'));
  const [marketingExpanded, setMarketingExpanded] = useState(location.pathname.includes('/marketing') || location.pathname.includes('/conception-graphique') || location.pathname.includes('/reseaux-sociaux') || location.pathname.includes('/publicite-facebook'));
  const [adminExpanded, setAdminExpanded] = useState(location.pathname.includes('/admin'));

  const menuItems = [{
    icon: Home,
    label: 'Dashboard',
    path: '/dashboard'
  }, {
    icon: ShoppingBag,
    label: 'Commandes',
    path: '/commandes'
  }, {
    icon: FileText,
    label: 'Factures',
    path: '/factures'
  }, {
    icon: Menu,
    label: 'Menus',
    path: '/menus'
  }, {
    icon: Package,
    label: 'Inventaire',
    path: '/inventaire'
  }, {
    icon: Users,
    label: 'Clients',
    path: '/clients'
  }, {
    icon: QrCode,
    label: 'QR Codes',
    path: '/qr-codes'
  }, {
    icon: Globe,
    label: 'Site Web',
    path: '/site-web'
  }, {
    icon: Calendar,
    label: 'Réservations',
    path: '/reservations'
  }, {
    icon: Calculator,
    label: 'Comptabilité',
    path: '/comptabilite'
  }, {
    icon: BarChart3,
    label: 'Statistiques',
    path: '/statistiques'
  }, {
    icon: LifeBuoy,
    label: 'Support',
    path: '/support'
  }];

  const marketingItems = [{
    icon: TrendingUp,
    label: 'Aperçu Marketing',
    path: '/marketing'
  }, {
    icon: Palette,
    label: 'Conception Graphique',
    path: '/conception-graphique'
  }, {
    icon: Share2,
    label: 'Réseaux Sociaux',
    path: '/reseaux-sociaux'
  }, {
    icon: Facebook,
    label: 'Publicité Facebook',
    path: '/publicite-facebook'
  }];

  const servicesItems = [{
    icon: Headphones,
    label: 'Aperçu Services',
    path: '/services'
  }, {
    icon: Phone,
    label: 'Service d\'Appel',
    path: '/service-appel'
  }, {
    icon: UserCheck,
    label: 'Consulting',
    path: '/consulting'
  }];

  const adminItems = [{
    icon: Crown,
    label: 'Tableau de Bord',
    path: '/admin/dashboard'
  }, {
    icon: CreditCard,
    label: 'Abonnements',
    path: '/admin/subscriptions'
  }, {
    icon: UserCog,
    label: 'Gestion des Rôles',
    path: '/admin/roles'
  }];

  const bottomMenuItems = [
    {
      icon: Settings,
      label: 'Paramètres',
      path: '/parametres'
    },
    {
      icon: CreditCard,
      label: 'Abonnement',
      path: '/abonnement'
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (path.includes('/service')) {
      setServicesExpanded(true);
    }
    if (path.includes('/marketing') || path.includes('/conception-graphique') || path.includes('/reseaux-sociaux') || path.includes('/publicite-facebook')) {
      setMarketingExpanded(true);
    }
    if (path.includes('/admin')) {
      setAdminExpanded(true);
    }
  };

  const toggleServicesExpanded = () => {
    setServicesExpanded(!servicesExpanded);
  };

  const toggleMarketingExpanded = () => {
    setMarketingExpanded(!marketingExpanded);
  };

  const toggleAdminExpanded = () => {
    setAdminExpanded(!adminExpanded);
  };

  const isActive = (path: string) => location.pathname === path;

  const isServicesSection = location.pathname.includes('/service');
  const isMarketingSection = location.pathname.includes('/marketing') || location.pathname.includes('/conception-graphique') || location.pathname.includes('/reseaux-sociaux') || location.pathname.includes('/publicite-facebook');
  const isAdminSection = location.pathname.includes('/admin');

  return <div className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && <h2 className="text-xl font-bold text-gray-800">Querox</h2>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-2">
        {menuItems.map(item => <button key={item.path} onClick={() => handleNavigation(item.path)} className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${isActive(item.path) ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
            <item.icon size={20} className="flex-shrink-0" />
            {!collapsed && <span className="ml-3">{item.label}</span>}
          </button>)}

        {/* Marketing Section */}
        <div className="pt-2">
          <button onClick={toggleMarketingExpanded} className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${isMarketingSection ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
            <TrendingUp size={20} className="flex-shrink-0" />
            {!collapsed && <>
                <span className="ml-3 flex-1">Marketing</span>
                <ChevronRight size={16} className={`transition-transform ${marketingExpanded ? 'rotate-90' : ''}`} />
              </>}
          </button>

          {/* Marketing Submenu */}
          {marketingExpanded && !collapsed && <div className="ml-6 mt-1 space-y-1">
              {marketingItems.map(item => <button key={item.path} onClick={() => handleNavigation(item.path)} className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors text-sm ${isActive(item.path) ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <item.icon size={16} className="flex-shrink-0" />
                  <span className="ml-3">{item.label}</span>
                </button>)}
            </div>}
        </div>

        {/* Services Section */}
        <div className="pt-2">
          <button onClick={toggleServicesExpanded} className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${isServicesSection ? 'bg-green-100 text-green-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
            <Headphones size={20} className="flex-shrink-0" />
            {!collapsed && <>
                <span className="ml-3 flex-1">Services</span>
                <ChevronRight size={16} className={`transition-transform ${servicesExpanded ? 'rotate-90' : ''}`} />
              </>}
          </button>

          {/* Services Submenu */}
          {servicesExpanded && !collapsed && <div className="ml-6 mt-1 space-y-1">
              {servicesItems.map(item => <button key={item.path} onClick={() => handleNavigation(item.path)} className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors text-sm ${isActive(item.path) ? 'bg-green-100 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <item.icon size={16} className="flex-shrink-0" />
                  <span className="ml-3">{item.label}</span>
                </button>)}
            </div>}
        </div>

        {/* Admin Section - Only visible to admins */}
        {isAdmin && (
          <div className="pt-2">
            <button onClick={toggleAdminExpanded} className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${isAdminSection ? 'bg-red-100 text-red-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
              <Shield size={20} className="flex-shrink-0" />
              {!collapsed && <>
                  <span className="ml-3 flex-1">Administrateur</span>
                  <ChevronRight size={16} className={`transition-transform ${adminExpanded ? 'rotate-90' : ''}`} />
                </>}
            </button>

            {/* Admin Submenu */}
            {adminExpanded && !collapsed && <div className="ml-6 mt-1 space-y-1">
                {adminItems.map(item => <button key={item.path} onClick={() => handleNavigation(item.path)} className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors text-sm ${isActive(item.path) ? 'bg-red-100 text-red-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <item.icon size={16} className="flex-shrink-0" />
                    <span className="ml-3">{item.label}</span>
                  </button>)}
              </div>}
          </div>
        )}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200 px-2 py-4 space-y-2">
        {bottomMenuItems.map(item => (
          <button 
            key={item.path} 
            onClick={() => handleNavigation(item.path)} 
            className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
              isActive(item.path) 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <item.icon size={20} className="flex-shrink-0" />
            {!collapsed && <span className="ml-3">{item.label}</span>}
          </button>
        ))}
      </div>
    </div>;
};

export default ModernSidebar;
