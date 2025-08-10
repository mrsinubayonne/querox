
import React, { useState } from 'react';
import { 
  Home, 
  ShoppingBag, 
  Menu, 
  Package, 
  Users, 
  QrCode,
  Globe,
  TrendingUp,
  BarChart3,
  Settings,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Headphones,
  Phone,
  UserCheck
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ModernSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const ModernSidebar: React.FC<ModernSidebarProps> = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [servicesExpanded, setServicesExpanded] = useState(location.pathname.includes('/service'));

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: ShoppingBag, label: 'Commandes', path: '/commandes' },
    { icon: Menu, label: 'Menus', path: '/menus' },
    { icon: Package, label: 'Inventaire', path: '/inventaire' },
    { icon: Users, label: 'Clients', path: '/clients' },
    { icon: QrCode, label: 'QR Codes', path: '/qr-codes' },
    { icon: Globe, label: 'Site Web', path: '/site-web' },
    { icon: TrendingUp, label: 'Marketing', path: '/marketing' },
  ];

  const servicesItems = [
    { icon: Headphones, label: 'Aperçu Services', path: '/services' },
    { icon: Phone, label: 'Service d\'Appel', path: '/service-appel' },
    { icon: UserCheck, label: 'Consulting', path: '/consulting' },
  ];

  const bottomMenuItems = [
    { icon: BarChart3, label: 'Statistiques', path: '/statistiques' },
    { icon: Settings, label: 'Paramètres', path: '/parametres' },
    { icon: CreditCard, label: 'Abonnement', path: '/abonnement' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (path.includes('/service')) {
      setServicesExpanded(true);
    }
  };

  const toggleServicesExpanded = () => {
    setServicesExpanded(!servicesExpanded);
  };

  const isActive = (path: string) => location.pathname === path;
  const isServicesSection = location.pathname.includes('/service');

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && (
          <h2 className="text-xl font-bold text-gray-800">Querox</h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-2">
        {menuItems.map((item) => (
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

        {/* Services Section */}
        <div className="pt-2">
          <button
            onClick={toggleServicesExpanded}
            className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
              isServicesSection
                ? 'bg-green-100 text-green-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Headphones size={20} className="flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="ml-3 flex-1">Services</span>
                <ChevronRight 
                  size={16} 
                  className={`transition-transform ${servicesExpanded ? 'rotate-90' : ''}`} 
                />
              </>
            )}
          </button>

          {/* Services Submenu */}
          {(servicesExpanded && !collapsed) && (
            <div className="ml-6 mt-1 space-y-1">
              {servicesItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                    isActive(item.path)
                      ? 'bg-green-100 text-green-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon size={16} className="flex-shrink-0" />
                  <span className="ml-3">{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200 px-2 py-4 space-y-2">
        {bottomMenuItems.map((item) => (
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
        
        <button
          onClick={signOut}
          className="w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors text-red-600 hover:bg-red-50"
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span className="ml-3">Déconnexion</span>}
        </button>
      </div>
    </div>
  );
};

export default ModernSidebar;
