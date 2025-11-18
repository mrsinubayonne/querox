
import React, { useState } from 'react';
import { Home, ShoppingBag, Menu, Package, Users, QrCode, Globe, TrendingUp, BarChart3, Settings, CreditCard, ChevronLeft, ChevronRight, LogOut, Headphones, Phone, UserCheck, Palette, Share2, Facebook, Shield, Crown, UserCog, LifeBuoy, Calendar, Calculator, FileText, Building2, Check, Plus, UserCircle, Utensils, UserPlus, Award, RefreshCw, HelpCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useOutlets } from '@/hooks/useOutlets';
import { useOutletProfile } from '@/hooks/useOutletProfile';
import { useUserProfiles, ProfileTitle } from '@/hooks/useUserProfiles';
import { Button } from '@/components/ui/button';
import { OfflineIndicator } from '@/components/OfflineIndicator';
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
  
  const [servicesExpanded, setServicesExpanded] = useState(location.pathname.includes('/service'));
  const [marketingExpanded, setMarketingExpanded] = useState(location.pathname.includes('/marketing') || location.pathname.includes('/conception-graphique') || location.pathname.includes('/reseaux-sociaux') || location.pathname.includes('/publicite-facebook'));
  const [adminExpanded, setAdminExpanded] = useState(location.pathname.includes('/admin'));

  const selectedOutlet = outlets.find(o => o.id === selectedOutletId);

  const { profiles, selectedProfileId, selectProfile: selectUserProfile, canAddMoreProfiles, getProfileLimit } = useUserProfiles();
  const selectedProfile = profiles.find(p => p.id === selectedProfileId);

  const [isAccessCodeDialogOpen, setIsAccessCodeDialogOpen] = useState(false);
  const [selectedProfileForAccess, setSelectedProfileForAccess] = useState<{ id: string; title: ProfileTitle } | null>(null);
  const [accessCode, setAccessCode] = useState('');

  const ACCESS_CODES: Record<ProfileTitle, string[]> = {
    'Admin': ['QRX-27A79'],
    'Comptable': ['QRX-C8218'],
    'Caissier(e)': ['QRX-B2A15', 'QRX-CAS77'],
    'Serveur': ['QRX-B2A15', 'QRX-CAS77'],
  };
  
  const handleProfileChange = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setSelectedProfileForAccess({ id: profileId, title: profile.title });
      setIsAccessCodeDialogOpen(true);
    }
  };

  const handleAccessCodeSubmit = async () => {
    if (!selectedProfileForAccess) return;

    const validCodes = ACCESS_CODES[selectedProfileForAccess.title];
    if (validCodes.includes(accessCode.toUpperCase())) {
      await selectUserProfile(selectedProfileForAccess.id);
      setIsAccessCodeDialogOpen(false);
      setAccessCode('');
      setSelectedProfileForAccess(null);
      window.location.reload();
    } else {
      toast.error('Code d\'accès incorrect');
    }
  };

  const handleLogoutProfile = () => {
    localStorage.removeItem('selectedProfileId');
    navigate('/select-profile');
  };

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
    icon: Users,
    label: 'Équipe',
    path: '/equipe',
    permission: 'team'
  }, {
    icon: Award,
    label: 'Performance Personnel',
    path: '/performance-personnel',
    permission: 'team'
  }, {
    icon: Users,
    label: 'Mise à disposition du personnel',
    path: '/staff-request',
    permission: 'staff_request'
  }, {
    icon: QrCode,
    label: 'QR Codes',
    path: '/qr-codes',
    permission: 'qrcodes'
  }, {
    icon: Globe,
    label: 'Site Web',
    path: '/site-web',
    permission: 'website'
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

  // Filter menu items based on profile (AFTER menuItems is defined)
  const getFilteredMenuItems = () => {
    if (!selectedProfile) return menuItems;
    
    const title = selectedProfile.title;
    
    if (title === 'Admin') {
      return menuItems; // Admin has access to everything
    } else if (title === 'Caissier(e)') {
      return menuItems.filter(item => 
        ['Commandes', 'Tables', 'Factures', 'Réservations', 'Rapports', 'Support'].includes(item.label)
      );
    } else if (title === 'Comptable') {
      return menuItems.filter(item => 
        ['Inventaire', 'Comptabilité', 'Statistiques', 'Rapports'].includes(item.label)
      );
    } else if (title === 'Serveur') {
      return menuItems.filter(item => 
        ['Commandes', 'Tables', 'Rapports'].includes(item.label)
      );
    }
    
    return menuItems;
  };

  const filteredMenuItems = getFilteredMenuItems();

  const marketingItems = hasPermission('marketing') && selectedProfile?.title === 'Admin' ? [{
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

  const servicesItems = selectedProfile?.title === 'Admin' ? [{
    icon: Headphones,
    label: 'Aperçu Services',
    path: '/services'
  }, {
    icon: UserCheck,
    label: 'Consulting',
    path: '/consulting'
  }] : [];

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
  }, {
    icon: Shield,
    label: 'Codes d\'Accès',
    path: '/admin/access-codes'
  }];

  const bottomMenuItems = [
    ...(hasPermission('settings') && selectedProfile?.title === 'Admin' ? [{
      icon: Settings,
      label: 'Paramètres',
      path: '/parametres'
    }] : []),
    ...(hasPermission('team') && selectedProfile?.title === 'Admin' ? [{
      icon: Users,
      label: 'Équipe',
      path: '/parametres?tab=equipe'
    }] : []),
    ...(selectedProfile?.title === 'Admin' ? [{
      icon: CreditCard,
      label: 'Abonnement',
      path: '/abonnement'
    }] : [])
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
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          {!collapsed && <h2 className="text-xl font-bold text-gray-800">Querox</h2>}
          <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        {!collapsed && <OfflineIndicator />}
      </div>

      {/* Profile Selector */}
      {profiles.length > 0 && (
        <div className={`p-3 border-b border-gray-200 ${collapsed ? 'flex justify-center' : ''}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className={`w-full justify-start ${collapsed ? 'w-10 h-10 p-0' : ''}`}>
                <UserCircle size={18} className={collapsed ? '' : 'mr-2'} />
                {!collapsed && (
                  <span className="truncate text-sm">
                    {selectedProfile?.name || selectedProfile?.title || 'Sélectionner...'}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {profiles.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  onClick={() => handleProfileChange(p.id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center">
                    <UserCircle size={16} className="mr-2" />
                    <span>{p.name || p.title}</span>
                  </div>
                  {p.id === selectedProfileId && (
                    <Check size={16} className="text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (canAddMoreProfiles()) {
                    navigate('/select-profile');
                  } else {
                    navigate('/abonnement');
                  }
                }}
                className="flex items-center cursor-pointer text-primary"
              >
                <Plus size={16} className="mr-2" />
                <span>
                  {canAddMoreProfiles()
                    ? 'Ajouter un profil'
                    : `Limite atteinte (${getProfileLimit()} max)`}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogoutProfile}
                className="flex items-center cursor-pointer text-red-600 hover:text-red-700"
              >
                <LogOut size={16} className="mr-2" />
                <span>Fermer la session</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Outlet Selector */}
      {outlets.length > 0 && (
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
        {filteredMenuItems.map(item => <button key={item.path} onClick={() => handleNavigation(item.path)} className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${isActive(item.path) ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
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
        {/* Profile Info */}
        {profileSession && (
          <div className={`px-3 py-2 mb-2 rounded-lg bg-purple-50 border border-purple-200 ${collapsed ? 'hidden' : ''}`}>
            <div className="flex items-center gap-2 mb-1">
              <UserCircle size={16} className="text-purple-600" />
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
            <span className="ml-3">
              {selectedProfile?.title === 'Admin' ? 'Déconnexion' : 'Fermer la session'}
            </span>
          )}
        </button>
      </div>

      {/* Access Code Dialog */}
      <AlertDialog open={isAccessCodeDialogOpen} onOpenChange={setIsAccessCodeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Code d'accès requis</AlertDialogTitle>
            <AlertDialogDescription>
              Entrez le code d'accès pour ce profil
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="text"
              placeholder="Code d'accès"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAccessCodeSubmit();
                }
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setAccessCode('');
              setSelectedProfileForAccess(null);
            }}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAccessCodeSubmit}>
              Valider
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};

export default ModernSidebar;
