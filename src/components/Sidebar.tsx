
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Menu, 
  CalendarDays, 
  Users, 
  Globe, 
  QrCode, 
  Megaphone, 
  Share2,
  BarChart2, 
  DollarSign,
  Package,
  Settings,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: "Tableau de bord", path: "/" },
    { icon: Menu, label: "Menus", path: "/menus" },
    { icon: CalendarDays, label: "Réservations", path: "/reservations" },
    { icon: CalendarDays, label: "Événements", path: "/evenements" },
    { icon: Users, label: "Clients", path: "/clients" },
    { icon: Globe, label: "Site Web", path: "/site-web" },
    { icon: QrCode, label: "QR Codes", path: "/qr-codes" },
    { icon: Megaphone, label: "Marketing", path: "/marketing" },
    { icon: Share2, label: "Social", path: "/social" },
    { icon: BarChart2, label: "Statistiques", path: "/statistiques" },
    { icon: DollarSign, label: "Comptabilité", path: "/comptabilite" },
    { icon: Package, label: "Inventaire", path: "/inventaire" },
    { icon: Settings, label: "Paramètres", path: "/parametres" },
    { icon: ShieldCheck, label: "Admin", path: "/admin" },
  ];

  return (
    <div className={`transition-all duration-300 ease-in-out flex flex-col bg-sidebar h-screen ${collapsed ? 'w-16' : 'w-64'} border-r border-border`}>
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && <div className="text-xl font-bold">QUEROX</div>}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="p-2 rounded-md hover:bg-secondary"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`flex items-center px-4 py-3 text-sm hover:bg-sidebar-accent rounded-md mx-2 ${
              item.path === window.location.pathname ? 'bg-sidebar-accent font-medium' : ''
            }`}
          >
            <item.icon size={20} className="min-w-5" />
            {!collapsed && <span className="ml-3">{item.label}</span>}
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-border flex items-center">
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
          MR
        </div>
        {!collapsed && (
          <div className="ml-3">
            <div className="text-sm font-medium">mrsinulion@gmail.com</div>
            <div className="text-xs text-muted-foreground">Administrateur</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
