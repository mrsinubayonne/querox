import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Shield, 
  Key,
  Settings,
  LogOut,
  TrendingUp,
  DollarSign,
  UserCheck,
  Activity
} from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';

// Import des tabs
import { AdminOverviewTab } from '@/components/admin/tabs/AdminOverviewTab';
import { AdminUsersTab } from '@/components/admin/tabs/AdminUsersTab';
import { AdminSubscriptionsTab } from '@/components/admin/tabs/AdminSubscriptionsTab';
import { AdminRolesTab } from '@/components/admin/tabs/AdminRolesTab';
import { AdminAccessCodesTab } from '@/components/admin/tabs/AdminAccessCodesTab';

const AdminPanel: React.FC = () => {
  const { user, signOut } = useAuth();
  const { isAdmin, loading } = useUserRole();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Chargement du panneau d'administration...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <UnauthorizedAccess userEmail={user?.email} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header moderne */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Panneau Administration
              </h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          
          <Button 
            onClick={signOut}
            variant="outline"
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navigation Tabs */}
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid bg-white p-1 rounded-xl shadow-sm">
            <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Vue d'ensemble</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Utilisateurs</span>
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Abonnements</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <UserCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Rôles</span>
            </TabsTrigger>
            <TabsTrigger value="access" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">Codes d'accès</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="overview" className="space-y-6">
            <AdminOverviewTab />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <AdminUsersTab />
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6">
            <AdminSubscriptionsTab />
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <AdminRolesTab />
          </TabsContent>

          <TabsContent value="access" className="space-y-6">
            <AdminAccessCodesTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
