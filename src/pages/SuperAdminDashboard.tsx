import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  BarChart3, 
  Users, 
  DollarSign, 
  HeadphonesIcon,
  FileText,
  Globe,
  Activity,
  Settings as SettingsIcon,
  UserCog,
  Menu,
  X,
  TrendingUp,
  Building2,
  Zap,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import BusinessMetricsPanel from '@/components/super-admin/BusinessMetricsPanel';
import LiveActivityPanel from '@/components/super-admin/LiveActivityPanel';
import RestaurantsManagementPanel from '@/components/super-admin/RestaurantsManagementPanel';
import RevenueSubscriptionsPanel from '@/components/super-admin/RevenueSubscriptionsPanel';
import SupportPanel from '@/components/super-admin/SupportPanel';
import AuditSecurityPanel from '@/components/super-admin/AuditSecurityPanel';
import TechnicalPerformancePanel from '@/components/super-admin/TechnicalPerformancePanel';
import GlobalAlertsPanel from '@/components/super-admin/GlobalAlertsPanel';
import MultiCountryPanel from '@/components/super-admin/MultiCountryPanel';

type ActiveSection = 'overview' | 'live' | 'restaurants' | 'revenue' | 'support' | 'audit' | 'technical' | 'alerts' | 'multi-country' | 'impersonate';

const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, loading: authLoading } = useSubscription();
  const [activeMode, setActiveMode] = useState<'super-admin' | 'support' | 'finance' | 'audit' | 'developer'>('super-admin');
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigationItems = [
    { id: 'overview' as const, label: 'Vue d\'ensemble', icon: BarChart3, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { id: 'live' as const, label: 'Activité Live', icon: Activity, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { id: 'restaurants' as const, label: 'Restaurants', icon: Building2, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    { id: 'revenue' as const, label: 'Revenus', icon: DollarSign, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
    { id: 'support' as const, label: 'Support', icon: HeadphonesIcon, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
    { id: 'audit' as const, label: 'Audit & Sécurité', icon: Shield, color: 'text-red-500', bgColor: 'bg-red-500/10' },
    { id: 'technical' as const, label: 'Technique', icon: Zap, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
    { id: 'alerts' as const, label: 'Alertes', icon: AlertTriangle, color: 'text-rose-500', bgColor: 'bg-rose-500/10' },
    { id: 'multi-country' as const, label: 'Multi-Pays', icon: Globe, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
    { id: 'impersonate' as const, label: 'Se connecter', icon: UserCog, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' },
  ];

  const modes = [
    { id: 'super-admin' as const, label: 'Super Admin', icon: Shield, color: 'bg-gradient-to-r from-red-500 to-pink-500' },
    { id: 'support' as const, label: 'Support', icon: HeadphonesIcon, color: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
    { id: 'finance' as const, label: 'Finance', icon: DollarSign, color: 'bg-gradient-to-r from-green-500 to-emerald-500' },
    { id: 'audit' as const, label: 'Audit', icon: FileText, color: 'bg-gradient-to-r from-purple-500 to-violet-500' },
    { id: 'developer' as const, label: 'Développeur', icon: SettingsIcon, color: 'bg-gradient-to-r from-orange-500 to-amber-500' },
  ];

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
            <Shield className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-sm text-slate-400 font-medium">Vérification des droits administrateur...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <UnauthorizedAccess userEmail={user?.email} />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <BusinessMetricsPanel />;
      case 'live':
        return <LiveActivityPanel />;
      case 'restaurants':
        return <RestaurantsManagementPanel />;
      case 'revenue':
        return <RevenueSubscriptionsPanel />;
      case 'support':
        return <SupportPanel />;
      case 'audit':
        return <AuditSecurityPanel />;
      case 'technical':
        return <TechnicalPerformancePanel />;
      case 'alerts':
        return <GlobalAlertsPanel />;
      case 'multi-country':
        return <MultiCountryPanel />;
      case 'impersonate':
        return (
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-white">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <UserCog className="w-6 h-6 text-indigo-400" />
              </div>
              Connexion en tant que restaurant
            </h2>
            <p className="text-slate-400 mb-6">
              Cette fonctionnalité vous permet de vous connecter à un compte restaurant pour le support ou le débogage.
            </p>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-sm text-yellow-400 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Fonctionnalité en cours de développement
              </p>
            </div>
          </div>
        );
      default:
        return <BusinessMetricsPanel />;
    }
  };

  const currentMode = modes.find(m => m.id === activeMode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Top Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50 shadow-2xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo & Title */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    QUEROX Admin
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
                      360°
                    </Badge>
                  </h1>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Center: Mode Selector */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-800/50 rounded-xl p-1.5 backdrop-blur-sm border border-slate-700/50">
              {modes.map((mode) => {
                const Icon = mode.icon;
                const isActive = activeMode === mode.id;
                return (
                  <Button
                    key={mode.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveMode(mode.id)}
                    className={`${
                      isActive 
                        ? `${mode.color} text-white shadow-lg` 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    } transition-all duration-200 rounded-lg`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {mode.label}
                  </Button>
                );
              })}
            </div>

            {/* Right: Status Indicators */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/admin/old-dashboard'}
                className="text-slate-400 hover:text-white border-slate-700 hover:bg-slate-800"
              >
                <SettingsIcon className="w-4 h-4 mr-2" />
                Admin Classique
              </Button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-lg border border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-400">Système en ligne</span>
              </div>
              <div className="px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <span className="text-xs font-medium text-slate-300">API: 99.9%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${
          sidebarOpen ? 'w-72' : 'w-0'
        } transition-all duration-300 ease-in-out overflow-hidden bg-slate-900/50 backdrop-blur-sm border-r border-slate-700/50`}>
          <div className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? `${item.bgColor} ${item.color} shadow-lg border border-current/20`
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-white/10' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="flex-1 text-left font-medium text-sm">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-[1600px] mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
