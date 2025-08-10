import React, { useState } from 'react';
import {
  BarChart3,
  ShoppingCart,
  Menu,
  Package,
  Users,
  QrCode,
  Globe,
  Megaphone,
  Calculator,
  TrendingUp,
  Settings,
  CreditCard,
  LayoutDashboard,
  Headphones
} from 'lucide-react';
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ModernSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const ModernSidebar: React.FC<ModernSidebarProps> = ({ collapsed, setCollapsed }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const menuItems = [
    { name: 'Tableau de bord', icon: BarChart3, path: '/dashboard' },
    { name: 'Commandes', icon: ShoppingCart, path: '/commandes' },
    { name: 'Menus', icon: Menu, path: '/menus' },
    { name: 'Inventaire', icon: Package, path: '/inventaire' },
    { name: 'Clients', icon: Users, path: '/clients' },
    { name: 'QR Codes', icon: QrCode, path: '/qr-codes' },
    { name: 'Site Web', icon: Globe, path: '/site-web' },
    { name: 'Marketing', icon: Megaphone, path: '/marketing' },
    { name: 'Services', icon: Headphones, path: '/services' },
    { name: 'Comptabilité', icon: Calculator, path: '/comptabilite' },
    { name: 'Statistiques', icon: TrendingUp, path: '/statistiques' },
    { name: 'Paramètres', icon: Settings, path: '/parametres' },
    { name: 'Abonnement', icon: CreditCard, path: '/abonnement' },
  ];

  return (
    <>
      {isMobile ? (
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" onClick={toggleMenu}>
              Menu
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:w-64">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Navigation
              </SheetDescription>
            </SheetHeader>
            <div className="py-4">
              {menuItems.map((item) => (
                <Link
                  to={item.path}
                  key={item.name}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-secondary",
                    location.pathname === item.path ? "bg-secondary text-foreground" : "text-muted-foreground"
                  )}
                  onClick={closeMenu}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
              <Separator className="my-2" />
              <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
                Déconnexion
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <div
          className={`flex flex-col bg-gray-50 border-r border-gray-200/60 transition-all duration-300 ease-in-out ${collapsed ? 'w-20' : 'w-64'
            }`}
        >
          <div className="flex items-center justify-center h-16 shrink-0">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <LayoutDashboard className="w-6 h-6 text-blue-600" />
              {!collapsed && <span className="font-bold text-lg">QUEROX</span>}
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  to={item.path}
                  key={item.name}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-secondary ${location.pathname === item.path ? 'bg-secondary text-foreground' : 'text-muted-foreground'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              ))}
            </nav>
          </div>

          <div className="p-4">
            {!collapsed && (
              <Button variant="ghost" onClick={handleLogout} className="w-full">
                Déconnexion
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ModernSidebar;
