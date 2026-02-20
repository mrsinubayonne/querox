
import React, { useState } from 'react';
import { Home, ShoppingBag, Menu, Package, Users, QrCode, Globe, TrendingUp, BarChart3, Settings, CreditCard, ChevronLeft, ChevronRight, LogOut, Headphones, Phone, UserCheck, Palette, Share2, Facebook, Shield, Crown, UserCog, LifeBuoy, Calendar, Calculator, FileText, Building2, Check, Plus, Utensils, UserPlus, Award, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useOutlets } from '@/hooks/useOutlets';
import { useOutletProfile } from '@/hooks/useOutletProfile';

import { useButtonTracking, TRACKED_BUTTONS } from '@/hooks/useButtonTracking';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

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
  const { outlets, selectedOutletId, selectOutlet, canAddMoreOutlets, getOutletLimit } = useOutlets();
  const { profileSession, hasPermission, isProfileAuthenticated, logout: profileLogout } = useOutletProfile();
  const { trackClick } = useButtonTracking();
  
  const [marketingExpanded, setMarketingExpanded] = useState(location.pathname.includes('/marketing') || location.pathname.includes('/conception-graphique') || location.pathname.includes('/reseaux-sociaux') || location.pathname.includes('/publicite-facebook'));
  const [adminExpanded, setAdminExpanded] = useState(location.pathname.includes('/admin'));

  const selectedOutlet = outlets.find(o => o.id === selectedOutletId);

  const handleOutletChange = async (outletId: string) => {
    await selectOutlet(outletId);
    window.location.reload(); // Recharger la page pour rafraîchir toutes les données
  };

  // Define menuItems FIRST before using it
  const menuItems = [{
    icon: Home,
    label: 'Dashboard',
    path: '/dashboard',
    permission: 'dashboard'
  }, {
    icon: ShoppingBag,
    label: 'Commandes',
    path: '/commandes',
    permission: 'orders'
  }, {
    icon: Utensils,
    label: 'Tables',
    path: '/tables',
    permission: 'orders'
  }, {
    icon: FileText,
    label: 'Factures',
    path: '/factures',
    permission: 'invoices'
  }, {
    icon: Menu,
    label: 'Menus',
    path: '/menus',
    permission: 'menus'
  }, {
    icon: Package,
    label: 'Inventaire',
    path: '/inventaire',
    permission: 'inventory'
  }, {
    icon: Calendar,
    label: 'Réservations',
    path: '/reservations',
    permission: 'reservations'
  }, {
    icon: Calculator,
    label: 'Comptabilité',
    path: '/comptabilite',
    permission: 'accounting'
  }, {
    icon: BarChart3,
    label: 'Statistiques',
    path: '/statistiques',
    permission: 'statistics'
  }, {
    icon: FileText,
    label: 'Rapports',
    path: '/rapports',
    permission: 'statistics'
  }, {
    icon: LifeBuoy,
    label: 'Support',
    path: '/support',
    permission: 'support'
  }].filter(item => hasPermission(item.permission as any));

  const filteredMenuItems = menuItems;

  const marketingItems = hasPermission('marketing') ? [{
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
  }] : [];


  const adminItems = [
    {
      icon: Crown,
      label: 'Tableau de Bord',
      path: '/admin/dashboard'
    },
    {
      icon: Building2,
      label: 'Gestion Restaurants',
      path: '/admin/restaurants'
    },
    {
      icon: BarChart3,
      label: 'Activité Temps Réel',
      path: '/admin/real-time'
    },
    {
      icon: Calculator,
      label: 'Comptabilité',
      path: '/admin/comptabilite'
    },
    {
      icon: Shield,
      label: 'Alertes Globales',
      path: '/admin/alerts'
    },
    {
      icon: Settings,
      label: 'Contrôle Global',
      path: '/admin/global-control'
    },
    {
      icon: CreditCard,
      label: 'Abonnements',
      path: '/admin/subscriptions'
    },
    {
      icon: UserCog,
      label: 'Gestion des Rôles',
      path: '/admin/roles'
    },
    {
      icon: Shield,
      label: 'Codes d\'Accès',
      path: '/admin/access-codes'
    },
    {
      icon: Settings,
      label: 'Paramètres Système',
      path: '/admin/system-settings'
    }
  ];

  const bottomMenuItems = [
    ...(hasPermission('settings') ? [{
      icon: Settings,
      label: 'Paramètres',
      path: '/parametres'
    }] : []),
    {
      icon: CreditCard,
      label: 'Abonnement',
      path: '/abonnement'
    }
  ];

  const handleNavigation = (path: string, label?: string) => {
    // Track navigation click
    if (label) {
      trackClick(`Navigation: ${label}`, 'navigation');
    }
    navigate(path);
    if (path.includes('/marketing') || path.includes('/conception-graphique') || path.includes('/reseaux-sociaux') || path.includes('/publicite-facebook')) {
      setMarketingExpanded(true);
    }
    if (path.includes('/admin')) {
      setAdminExpanded(true);
    }
  };

  const toggleMarketingExpanded = () => {
    setMarketingExpanded(!marketingExpanded);
  };

  const toggleAdminExpanded = () => {
    setAdminExpanded(!adminExpanded);
  };

  const isActive = (path: string) => location.pathname === path;

  const isPlusSection = ['/clients', '/equipe', '/performance-personnel', '/qr-codes', '/debiteurs', '/site-web', '/plus'].some(p => location.pathname.startsWith(p));
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


      {/* Outlet Selector - Hidden for admins */}
      {!isAdmin && outlets.length > 0 && (
        <div className={`p-3 border-b border-gray-200 ${collapsed ? 'flex justify-center' : ''}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className={`w-full justify-start ${collapsed ? 'w-10 h-10 p-0' : ''}`}>
                <Building2 size={18} className={collapsed ? '' : 'mr-2'} />
                {!collapsed && (
                  <span className="truncate text-sm">
                    {selectedOutlet?.name || 'Sélectionner...'}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {outlets.map((outlet) => (
                <DropdownMenuItem
                  key={outlet.id}
                  onClick={() => handleOutletChange(outlet.id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center">
                    <Building2 size={16} className="mr-2" />
                    <span>{outlet.name}</span>
                  </div>
                  {outlet.id === selectedOutletId && (
                    <Check size={16} className="text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (canAddMoreOutlets()) {
                    navigate('/select-outlet');
                  } else {
                    navigate('/abonnement');
                  }
                }}
                className="flex items-center cursor-pointer text-primary"
              >
                <Plus size={16} className="mr-2" />
                <span>
                  {canAddMoreOutlets() 
                    ? 'Ajouter un point de vente' 
                    : `Limite atteinte (${getOutletLimit()} max)`
                  }
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-2">
        {!isAdmin && (
          <>
            {filteredMenuItems.map(item => {
              let dataTourAttr = '';
              if (item.label === 'Dashboard') dataTourAttr = 'dashboard';
              else if (item.label === 'Menus') dataTourAttr = 'menus';
              else if (item.label === 'Commandes') dataTourAttr = 'orders';
              else if (item.label === 'Inventaire') dataTourAttr = 'inventory';
              else if (item.label === 'Factures') dataTourAttr = 'invoices';
              else if (item.label === 'Équipe') dataTourAttr = 'team';
              else if (item.label === 'Comptabilité') dataTourAttr = 'accounting';
              else if (item.label === 'Paramètres') dataTourAttr = 'settings';

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path, item.label)}
                  data-tour={dataTourAttr}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${isActive(item.path) ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  {!collapsed && <span className="ml-3">{item.label}</span>}
                </button>
              );
            })}

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
                  {marketingItems.map(item => <button key={item.path} onClick={() => handleNavigation(item.path, item.label)} className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors text-sm ${isActive(item.path) ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                      <item.icon size={16} className="flex-shrink-0" />
                      <span className="ml-3">{item.label}</span>
                    </button>)}
                </div>}
            </div>

            {/* Plus - Simple navigation button */}
            <div className="pt-2">
              <button
                onClick={() => handleNavigation('/plus', 'Plus')}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${isPlusSection ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Plus size={20} className="flex-shrink-0" />
                {!collapsed && <span className="ml-3">Plus</span>}
              </button>
            </div>
          </>
        )}

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
      {!isAdmin && (
        <div className="border-t border-gray-200 px-2 py-4 space-y-2">
          {/* Profile Info */}
          {profileSession && (
            <div className={`px-3 py-2 mb-2 rounded-lg bg-purple-50 border border-purple-200 ${collapsed ? 'hidden' : ''}`}>
              <div className="flex items-center gap-2 mb-1">
                <User size={16} className="text-purple-600" />
                <span className="text-xs font-semibold text-purple-900">{profileSession.profileName}</span>
              </div>
              <p className="text-xs text-purple-600 capitalize">{profileSession.role}</p>
              <p className="text-xs text-purple-500">{profileSession.outletName}</p>
            </div>
          )}

          {bottomMenuItems.map(item => (
            <button 
              key={item.path} 
              onClick={() => handleNavigation(item.path)}
              data-tour={item.label === 'Paramètres' ? 'settings' : ''}
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

          {/* Logout/Close Session Button */}
          <button
            onClick={() => {
              if (isProfileAuthenticated()) {
                profileLogout();
                navigate('/profile-login');
              } else {
                signOut();
                navigate('/auth');
              }
            }}
            className="w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors text-red-600 hover:bg-red-50"
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!collapsed && (
              <span className="ml-3">Déconnexion</span>
            )}
          </button>
        </div>
      )}
      
      {/* Admin Logout Button */}
      {isAdmin && (
        <div className="border-t border-gray-200 px-2 py-4">
          <button
            onClick={() => {
              signOut();
              navigate('/auth');
            }}
            className="w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors text-red-600 hover:bg-red-50"
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!collapsed && <span className="ml-3">Déconnexion</span>}
          </button>
        </div>
      )}

    </div>;
};

export default ModernSidebar;
