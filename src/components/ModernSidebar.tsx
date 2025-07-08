
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Menu, Users, Globe, QrCode, MessageSquare, BarChart2, DollarSign, Package, Settings, ShieldCheck, ChevronLeft, ShoppingBag, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';

interface ModernSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const ModernSidebar: React.FC<ModernSidebarProps> = ({
  collapsed,
  setCollapsed
}) => {
  const { isSubscriptionActive } = useSubscription();
  const navigate = useNavigate();

  const menuItems = [{
    icon: LayoutDashboard,
    label: "Tableau de bord",
    path: "/dashboard",
    color: "text-blue-600",
    requiresSubscription: true
  }, {
    icon: Menu,
    label: "Menus",
    path: "/menus",
    color: "text-green-600",
    requiresSubscription: true
  }, {
    icon: ShoppingBag,
    label: "Commandes",
    path: "/commandes",
    color: "text-emerald-600",
    requiresSubscription: true
  }, {
    icon: Users,
    label: "Clients",
    path: "/clients",
    color: "text-pink-600",
    requiresSubscription: true
  }, {
    icon: Globe,
    label: "Site Web",
    path: "/site-web",
    color: "text-cyan-600",
    requiresSubscription: true
  }, {
    icon: QrCode,
    label: "QR Codes",
    path: "/qr-codes",
    color: "text-indigo-600",
    requiresSubscription: true
  }, {
    icon: MessageSquare,
    label: "Marketing & Social",
    path: "/marketing",
    color: "text-emerald-600",
    requiresSubscription: true
  }, {
    icon: BarChart2,
    label: "Statistiques",
    path: "/statistiques",
    color: "text-violet-600",
    requiresSubscription: true
  }, {
    icon: DollarSign,
    label: "Comptabilité",
    path: "/comptabilite",
    color: "text-yellow-600",
    requiresSubscription: true
  }, {
    icon: Package,
    label: "Inventaire",
    path: "/inventaire",
    color: "text-red-600",
    requiresSubscription: true
  }, {
    icon: Crown,
    label: "Abonnement",
    path: "/abonnement",
    color: "text-purple-600",
    requiresSubscription: false
  }, {
    icon: ShieldCheck,
    label: "Admin Abonnements",
    path: "/admin/subscriptions",
    color: "text-red-600",
    requiresSubscription: false
  }, {
    icon: Settings,
    label: "Paramètres",
    path: "/parametres",
    color: "text-gray-600",
    requiresSubscription: true
  }];

  const handleMenuClick = (item: any, e: React.MouseEvent) => {
    if (item.requiresSubscription && !isSubscriptionActive) {
      e.preventDefault();
      navigate('/abonnement');
    }
  };
  
  return (
    <div
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } transition-all duration-300 ease-in-out flex flex-col bg-white h-screen border-r border-gray-100`}
    >
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Q</span>
              </div>
              <div className="w-20 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">LOGO</span>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 rounded-lg hover:bg-gray-100"
          >
            {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {menuItems.map((item, index) => {
            const isDisabled = item.requiresSubscription && !isSubscriptionActive;
            const isActive = item.path === window.location.pathname;
            
            return (
              <Link
                key={index}
                to={item.path}
                onClick={(e) => handleMenuClick(item, e)}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm'
                    : isDisabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon 
                  size={20} 
                  className={`min-w-5 ${isDisabled ? 'text-gray-300' : item.color}`} 
                />
                {!collapsed && (
                  <span className="ml-3 truncate">
                    {item.label}
                    {isDisabled && <span className="ml-1 text-xs">🔒</span>}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {!isSubscriptionActive && !collapsed && (
        <div className="p-4 border-t border-gray-100">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-2">
              Abonnement requis pour accéder aux fonctionnalités
            </p>
            <Button 
              size="sm" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
              onClick={() => navigate('/abonnement')}
            >
              <Crown className="w-3 h-3 mr-1" />
              S'abonner
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernSidebar;
