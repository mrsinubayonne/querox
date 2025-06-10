
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Menu, 
  CalendarDays, 
  Users, 
  Globe, 
  QrCode, 
  MessageSquare, 
  BarChart2, 
  DollarSign,
  Package,
  Settings,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModernSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const ModernSidebar: React.FC<ModernSidebarProps> = ({ collapsed, setCollapsed }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: "Tableau de bord", path: "/", color: "text-blue-600" },
    { icon: Menu, label: "Menus", path: "/menus", color: "text-green-600" },
    { icon: CalendarDays, label: "Réservations", path: "/reservations", color: "text-purple-600" },
    { icon: CalendarDays, label: "Événements", path: "/evenements", color: "text-orange-600" },
    { icon: Users, label: "Clients", path: "/clients", color: "text-pink-600" },
    { icon: Globe, label: "Site Web", path: "/site-web", color: "text-cyan-600" },
    { icon: QrCode, label: "QR Codes", path: "/qr-codes", color: "text-indigo-600" },
    { icon: MessageSquare, label: "Marketing & Social", path: "/marketing", color: "text-emerald-600" },
    { icon: BarChart2, label: "Statistiques", path: "/statistiques", color: "text-violet-600" },
    { icon: DollarSign, label: "Comptabilité", path: "/comptabilite", color: "text-yellow-600" },
    { icon: Package, label: "Inventaire", path: "/inventaire", color: "text-red-600" },
    { icon: Settings, label: "Paramètres", path: "/parametres", color: "text-gray-600" },
    { icon: ShieldCheck, label: "Admin", path: "/admin", color: "text-slate-600" },
  ];

  const handleToggle = () => {
    console.log('Toggle sidebar - Current state:', collapsed);
    setCollapsed(!collapsed);
  };

  return (
    <div className={`${collapsed ? 'w-16' : 'w-72'} transition-all duration-300 ease-in-out flex flex-col bg-white h-screen border-r border-gray-100 shadow-sm`}>
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Q</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                QUEROX
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className="h-8 w-8 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                item.path === window.location.pathname 
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon 
                size={20} 
                className={`${collapsed ? 'mx-auto' : 'mr-3'} ${
                  item.path === window.location.pathname ? item.color : 'group-hover:' + item.color
                } transition-colors`} 
              />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
            MR
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">mrsinulion@gmail.com</div>
              <div className="text-xs text-gray-500">Administrateur</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernSidebar;
