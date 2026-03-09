
import React, { useState } from 'react';
import { Home, ShoppingBag, Menu, Package, Users, QrCode, Globe, TrendingUp, BarChart3, Settings, CreditCard, ChevronLeft, ChevronRight, LogOut, Headphones, Phone, UserCheck, Palette, Share2, Facebook, Shield, Crown, UserCog, LifeBuoy, Calendar, Calculator, FileText, Building2, Check, Plus, Utensils, UserPlus, Award, User, Zap } from 'lucide-react';
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
    window.location.reload();
  };

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
    { icon: Crown, label: 'Tableau de Bord', path: '/admin/dashboard' },
    { icon: Building2, label: 'Gestion Restaurants', path: '/admin/restaurants' },
    { icon: BarChart3, label: 'Activité Temps Réel', path: '/admin/real-time' },
    { icon: Calculator, label: 'Comptabilité', path: '/admin/comptabilite' },
    { icon: Shield, label: 'Alertes Globales', path: '/admin/alerts' },
    { icon: Settings, label: 'Contrôle Global', path: '/admin/global-control' },
    { icon: CreditCard, label: 'Abonnements', path: '/admin/subscriptions' },
    { icon: UserCog, label: 'Gestion des Rôles', path: '/admin/roles' },
    { icon: Shield, label: 'Codes d\'Accès', path: '/admin/access-codes' },
    { icon: Settings, label: 'Paramètres Système', path: '/admin/system-settings' },
  ];

  const bottomMenuItems = [
    ...(hasPermission('settings') ? [{ icon: Settings, label: 'Paramètres', path: '/parametres' }] : []),
    { icon: CreditCard, label: 'Abonnement', path: '/abonnement' },
  ];

  const handleNavigation = (path: string, label?: string) => {
    if (label) trackClick(`Navigation: ${label}`, 'navigation');
    navigate(path);
    if (path.includes('/marketing') || path.includes('/conception-graphique') || path.includes('/reseaux-sociaux') || path.includes('/publicite-facebook')) setMarketingExpanded(true);
    if (path.includes('/admin')) setAdminExpanded(true);
  };

  const isActive = (path: string) => location.pathname === path;
  const isPlusSection = ['/clients', '/equipe', '/performance-personnel', '/qr-codes', '/debiteurs', '/site-web', '/plus'].some(p => location.pathname.startsWith(p));
  const isMarketingSection = location.pathname.includes('/marketing') || location.pathname.includes('/conception-graphique') || location.pathname.includes('/reseaux-sociaux') || location.pathname.includes('/publicite-facebook');
  const isAdminSection = location.pathname.includes('/admin');

  return (
    <div
      className={`flex flex-col transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}
      style={{ background: 'var(--gradient-sidebar)' }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 h-16">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-glow">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-sidebar-accent-foreground tracking-tight font-display">
              Querox
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-sidebar-muted hover:text-sidebar-accent-foreground hover:bg-sidebar-accent transition-all"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Outlet Selector */}
      {!isAdmin && outlets.length > 0 && (
        <div className={`px-3 pb-3 ${collapsed ? 'flex justify-center' : ''}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex items-center gap-2 w-full rounded-lg border border-sidebar-border bg-sidebar-accent/50 hover:bg-sidebar-accent transition-colors ${collapsed ? 'w-10 h-10 justify-center p-0' : 'px-3 py-2'}`}>
                <Building2 size={16} className="text-sidebar-muted flex-shrink-0" />
                {!collapsed && (
                  <span className="truncate text-sm text-sidebar-foreground">
                    {selectedOutlet?.name || 'Sélectionner...'}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {outlets.map((outlet) => (
                <DropdownMenuItem key={outlet.id} onClick={() => handleOutletChange(outlet.id)} className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center">
                    <Building2 size={16} className="mr-2" />
                    <span>{outlet.name}</span>
                  </div>
                  {outlet.id === selectedOutletId && <Check size={16} className="text-primary" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate(canAddMoreOutlets() ? '/select-outlet' : '/abonnement')}
                className="flex items-center cursor-pointer text-primary"
              >
                <Plus size={16} className="mr-2" />
                <span>{canAddMoreOutlets() ? 'Ajouter un point de vente' : `Limite (${getOutletLimit()} max)`}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {!isAdmin && (
          <>
            {filteredMenuItems.map(item => {
              const active = isActive(item.path);
              let dataTourAttr = '';
              if (item.label === 'Dashboard') dataTourAttr = 'dashboard';
              else if (item.label === 'Menus') dataTourAttr = 'menus';
              else if (item.label === 'Commandes') dataTourAttr = 'orders';
              else if (item.label === 'Inventaire') dataTourAttr = 'inventory';
              else if (item.label === 'Factures') dataTourAttr = 'invoices';
              else if (item.label === 'Comptabilité') dataTourAttr = 'accounting';
              else if (item.label === 'Paramètres') dataTourAttr = 'settings';

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path, item.label)}
                  data-tour={dataTourAttr}
                  className={`group w-full flex items-center px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                    active
                      ? 'bg-primary/15 text-primary-foreground font-semibold shadow-sm'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${active ? 'bg-primary text-primary-foreground shadow-glow' : 'text-sidebar-muted group-hover:text-sidebar-accent-foreground'}`}>
                    <item.icon size={18} />
                  </div>
                  {!collapsed && <span className="ml-3 text-sm">{item.label}</span>}
                </button>
              );
            })}

            {/* Marketing */}
            <div className="pt-3">
              <button
                onClick={() => setMarketingExpanded(!marketingExpanded)}
                className={`group w-full flex items-center px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                  isMarketingSection
                    ? 'bg-primary/15 text-primary-foreground font-semibold'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${isMarketingSection ? 'bg-primary text-primary-foreground' : 'text-sidebar-muted'}`}>
                  <TrendingUp size={18} />
                </div>
                {!collapsed && <>
                  <span className="ml-3 flex-1 text-sm">Marketing</span>
                  <ChevronRight size={14} className={`transition-transform text-sidebar-muted ${marketingExpanded ? 'rotate-90' : ''}`} />
                </>}
              </button>
              {marketingExpanded && !collapsed && (
                <div className="ml-5 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">
                  {marketingItems.map(item => (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path, item.label)}
                      className={`w-full flex items-center px-3 py-1.5 rounded-lg text-left transition-all text-sm ${
                        isActive(item.path)
                          ? 'text-primary font-medium bg-primary/10'
                          : 'text-sidebar-muted hover:text-sidebar-accent-foreground hover:bg-sidebar-accent'
                      }`}
                    >
                      <item.icon size={14} className="flex-shrink-0" />
                      <span className="ml-2">{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Plus */}
            <div className="pt-1">
              <button
                onClick={() => handleNavigation('/plus', 'Plus')}
                className={`group w-full flex items-center px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                  isPlusSection
                    ? 'bg-primary/15 text-primary-foreground font-semibold'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${isPlusSection ? 'bg-primary text-primary-foreground' : 'text-sidebar-muted'}`}>
                  <Plus size={18} />
                </div>
                {!collapsed && <span className="ml-3 text-sm">Plus</span>}
              </button>
            </div>
          </>
        )}

        {/* Admin Section */}
        {isAdmin && (
          <div>
            <button
              onClick={() => setAdminExpanded(!adminExpanded)}
              className={`group w-full flex items-center px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                isAdminSection ? 'bg-destructive/15 text-destructive font-semibold' : 'text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${isAdminSection ? 'bg-destructive text-destructive-foreground' : 'text-sidebar-muted'}`}>
                <Shield size={18} />
              </div>
              {!collapsed && <>
                <span className="ml-3 flex-1 text-sm">Administrateur</span>
                <ChevronRight size={14} className={`transition-transform text-sidebar-muted ${adminExpanded ? 'rotate-90' : ''}`} />
              </>}
            </button>
            {adminExpanded && !collapsed && (
              <div className="ml-5 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">
                {adminItems.map(item => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center px-3 py-1.5 rounded-lg text-left transition-all text-sm ${
                      isActive(item.path)
                        ? 'text-destructive font-medium bg-destructive/10'
                        : 'text-sidebar-muted hover:text-sidebar-accent-foreground hover:bg-sidebar-accent'
                    }`}
                  >
                    <item.icon size={14} className="flex-shrink-0" />
                    <span className="ml-2">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Bottom */}
      {!isAdmin && (
        <div className="border-t border-sidebar-border px-2 py-3 space-y-0.5">
          {profileSession && !collapsed && (
            <div className="px-3 py-2 mb-2 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <User size={12} className="text-primary" />
                </div>
                <span className="text-xs font-semibold text-sidebar-accent-foreground">{profileSession.profileName}</span>
              </div>
              <p className="text-xs text-sidebar-muted capitalize ml-8">{profileSession.role}</p>
            </div>
          )}

          {bottomMenuItems.map(item => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                data-tour={item.label === 'Paramètres' ? 'settings' : ''}
                className={`group w-full flex items-center px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                  active
                    ? 'bg-primary/15 text-primary-foreground font-semibold'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${active ? 'bg-primary text-primary-foreground' : 'text-sidebar-muted'}`}>
                  <item.icon size={18} />
                </div>
                {!collapsed && <span className="ml-3 text-sm">{item.label}</span>}
              </button>
            );
          })}

          <button
            onClick={() => {
              if (isProfileAuthenticated()) { profileLogout(); navigate('/profile-login'); }
              else { signOut(); navigate('/auth'); }
            }}
            className="group w-full flex items-center px-3 py-2 rounded-lg text-left transition-all duration-200 text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg text-sidebar-muted group-hover:text-destructive">
              <LogOut size={18} />
            </div>
            {!collapsed && <span className="ml-3 text-sm">Déconnexion</span>}
          </button>
        </div>
      )}
      
      {isAdmin && (
        <div className="border-t border-sidebar-border px-2 py-3">
          <button
            onClick={() => { signOut(); navigate('/auth'); }}
            className="group w-full flex items-center px-3 py-2 rounded-lg text-left transition-all duration-200 text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg text-sidebar-muted group-hover:text-destructive">
              <LogOut size={18} />
            </div>
            {!collapsed && <span className="ml-3 text-sm">Déconnexion</span>}
          </button>
        </div>
      )}
    </div>
  );
};

export default ModernSidebar;
