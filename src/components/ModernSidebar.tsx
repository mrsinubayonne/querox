
import React, { useMemo, useCallback } from 'react';
import { Home, ShoppingBag, Menu, Package, Users, QrCode, Globe, TrendingUp, BarChart3, Settings, CreditCard, ChevronLeft, ChevronRight, LogOut, Headphones, Phone, UserCheck, Palette, Share2, Facebook, Shield, Crown, UserCog, LifeBuoy, Calendar, Calculator, FileText, Building2, Check, Plus, Utensils, UserPlus, Award, User, FlaskConical } from 'lucide-react';
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

const NAV_ITEMS = [
  { icon: Home, label: 'Dashboard', path: '/dashboard', permission: 'dashboard' },
  { icon: ShoppingBag, label: 'Commandes', path: '/commandes', permission: 'orders' },
  { icon: Utensils, label: 'Tables', path: '/tables', permission: 'orders' },
  { icon: FileText, label: 'Factures', path: '/factures', permission: 'invoices' },
  { icon: Menu, label: 'Menus', path: '/menus', permission: 'menus' },
  { icon: Package, label: 'Inventaire', path: '/inventaire', permission: 'inventory' },
  { icon: Calendar, label: 'Réservations', path: '/reservations', permission: 'reservations' },
  { icon: Calculator, label: 'Comptabilité', path: '/comptabilite', permission: 'accounting' },
  { icon: BarChart3, label: 'Statistiques', path: '/statistiques', permission: 'statistics' },
  { icon: FileText, label: 'Rapports', path: '/rapports', permission: 'statistics' },
  { icon: LifeBuoy, label: 'Support', path: '/support', permission: 'support' },
] as const;

const MARKETING_ITEMS = [
  { icon: TrendingUp, label: 'Aperçu Marketing', path: '/marketing' },
  { icon: Palette, label: 'Conception Graphique', path: '/conception-graphique' },
  { icon: Share2, label: 'Réseaux Sociaux', path: '/reseaux-sociaux' },
  { icon: Facebook, label: 'Publicité Facebook', path: '/publicite-facebook' },
] as const;

const ADMIN_ITEMS = [
  { icon: Crown, label: 'Tableau de Bord', path: '/admin/dashboard' },
  { icon: Building2, label: 'Gestion Restaurants', path: '/admin/restaurants' },
  { icon: BarChart3, label: 'Activité Temps Réel', path: '/admin/real-time' },
  { icon: Calculator, label: 'Comptabilité', path: '/admin/comptabilite' },
  { icon: Shield, label: 'Alertes Globales', path: '/admin/alerts' },
  { icon: Settings, label: 'Contrôle Global', path: '/admin/global-control' },
  { icon: CreditCard, label: 'Abonnements', path: '/admin/subscriptions' },
  { icon: UserCog, label: 'Gestion des Rôles', path: '/admin/roles' },
  { icon: Shield, label: "Codes d'Accès", path: '/admin/access-codes' },
  { icon: Settings, label: 'Paramètres Système', path: '/admin/system-settings' },
  { icon: FlaskConical, label: 'Diagnostics', path: '/admin/diagnostics' },
] as const;

const TOUR_MAP: Record<string, string> = {
  Dashboard: 'dashboard',
  Menus: 'menus',
  Commandes: 'orders',
  Inventaire: 'inventory',
  Factures: 'invoices',
  Équipe: 'team',
  Comptabilité: 'accounting',
  Paramètres: 'settings',
};

const NavButton = React.memo(({ item, active, collapsed, onClick }: {
  item: { icon: React.ElementType; label: string; path: string };
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    data-tour={TOUR_MAP[item.label] || ''}
    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors duration-150 ${
      active ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-accent'
    }`}
  >
    <item.icon size={20} className="flex-shrink-0" />
    {!collapsed && <span className="ml-3">{item.label}</span>}
  </button>
));
NavButton.displayName = 'NavButton';

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
  
  const [marketingExpanded, setMarketingExpanded] = React.useState(false);
  const [adminExpanded, setAdminExpanded] = React.useState(false);

  const currentPath = location.pathname;
  const selectedOutlet = outlets.find(o => o.id === selectedOutletId);

  // Memoize filtered menu items
  const filteredMenuItems = useMemo(
    () => NAV_ITEMS.filter(item => hasPermission(item.permission as any)),
    [hasPermission]
  );

  const showMarketing = hasPermission('marketing');

  const handleOutletChange = useCallback(async (outletId: string) => {
    await selectOutlet(outletId);
    window.location.reload();
  }, [selectOutlet]);

  const handleNavigation = useCallback((path: string, label?: string) => {
    if (label) trackClick(`Navigation: ${label}`, 'navigation');
    navigate(path);
  }, [navigate, trackClick]);

  const isActive = useCallback((path: string) => currentPath === path, [currentPath]);

  const isMarketingSection = currentPath.includes('/marketing') || currentPath.includes('/conception-graphique') || currentPath.includes('/reseaux-sociaux') || currentPath.includes('/publicite-facebook');
  const isAdminSection = currentPath.includes('/admin');
  const isPlusSection = ['/clients', '/equipe', '/performance-personnel', '/qr-codes', '/debiteurs', '/site-web', '/plus'].some(p => currentPath.startsWith(p));

  const bottomMenuItems = useMemo(() => [
    ...(hasPermission('settings') ? [{ icon: Settings, label: 'Paramètres', path: '/parametres' }] : []),
    { icon: CreditCard, label: 'Abonnement', path: '/abonnement' },
  ], [hasPermission]);

  return (
    <div className={`sidebar-gpu bg-card border-r border-border flex flex-col ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && <h2 className="text-xl font-bold text-foreground">Querox</h2>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-lg hover:bg-accent transition-colors duration-150">
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Outlet Selector */}
      {!isAdmin && outlets.length > 0 && (
        <div className={`p-3 border-b border-border ${collapsed ? 'flex justify-center' : ''}`}>
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
                  {outlet.id === selectedOutletId && <Check size={16} className="text-primary" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate(canAddMoreOutlets() ? '/select-outlet' : '/abonnement')}
                className="flex items-center cursor-pointer text-primary"
              >
                <Plus size={16} className="mr-2" />
                <span>
                  {canAddMoreOutlets() ? 'Ajouter un point de vente' : `Limite atteinte (${getOutletLimit()} max)`}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {!isAdmin && (
          <>
            {filteredMenuItems.map(item => (
              <NavButton
                key={item.path}
                item={item}
                active={isActive(item.path)}
                collapsed={collapsed}
                onClick={() => handleNavigation(item.path, item.label)}
              />
            ))}

            {/* Marketing Section */}
            {showMarketing && (
              <div className="pt-2">
                <button
                  onClick={() => setMarketingExpanded(v => !v)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors duration-150 ${
                    isMarketingSection ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <TrendingUp size={20} className="flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="ml-3 flex-1">Marketing</span>
                      <ChevronRight size={16} className={`transition-transform duration-200 ${marketingExpanded ? 'rotate-90' : ''}`} />
                    </>
                  )}
                </button>
                {marketingExpanded && !collapsed && (
                  <div className="ml-6 mt-1 space-y-1">
                    {MARKETING_ITEMS.map(item => (
                      <NavButton
                        key={item.path}
                        item={item}
                        active={isActive(item.path)}
                        collapsed={false}
                        onClick={() => handleNavigation(item.path, item.label)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Plus */}
            <div className="pt-2">
              <NavButton
                item={{ icon: Plus, label: 'Plus', path: '/plus' }}
                active={isPlusSection}
                collapsed={collapsed}
                onClick={() => handleNavigation('/plus', 'Plus')}
              />
            </div>
          </>
        )}

        {/* Admin Section */}
        {isAdmin && (
          <div className="pt-2">
            <button
              onClick={() => setAdminExpanded(v => !v)}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors duration-150 ${
                isAdminSection ? 'bg-destructive/10 text-destructive font-medium' : 'text-foreground hover:bg-accent'
              }`}
            >
              <Shield size={20} className="flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="ml-3 flex-1">Administrateur</span>
                  <ChevronRight size={16} className={`transition-transform duration-200 ${adminExpanded ? 'rotate-90' : ''}`} />
                </>
              )}
            </button>
            {adminExpanded && !collapsed && (
              <div className="ml-6 mt-1 space-y-1">
                {ADMIN_ITEMS.map(item => (
                  <NavButton
                    key={item.path}
                    item={item}
                    active={isActive(item.path)}
                    collapsed={false}
                    onClick={() => handleNavigation(item.path)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Bottom Navigation */}
      {!isAdmin && (
        <div className="border-t border-border px-2 py-4 space-y-1">
          {profileSession && !collapsed && (
            <div className="px-3 py-2 mb-2 rounded-lg bg-accent border border-border">
              <div className="flex items-center gap-2 mb-1">
                <User size={16} className="text-primary" />
                <span className="text-xs font-semibold text-foreground">{profileSession.profileName}</span>
              </div>
              <p className="text-xs text-muted-foreground capitalize">{profileSession.role}</p>
              <p className="text-xs text-muted-foreground">{profileSession.outletName}</p>
            </div>
          )}

          {bottomMenuItems.map(item => (
            <NavButton
              key={item.path}
              item={item}
              active={isActive(item.path)}
              collapsed={collapsed}
              onClick={() => handleNavigation(item.path)}
            />
          ))}

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
            className="w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors duration-150 text-destructive hover:bg-destructive/10"
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!collapsed && <span className="ml-3">Déconnexion</span>}
          </button>
        </div>
      )}

      {/* Admin Logout */}
      {isAdmin && (
        <div className="border-t border-border px-2 py-4">
          <button
            onClick={() => { signOut(); navigate('/auth'); }}
            className="w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors duration-150 text-destructive hover:bg-destructive/10"
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!collapsed && <span className="ml-3">Déconnexion</span>}
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(ModernSidebar);
