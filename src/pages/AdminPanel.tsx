import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, Users, CreditCard, Shield, Key, Settings, LogOut,
  TrendingUp, DollarSign, UserCheck, Activity, ShoppingBag, Building2,
  Menu, Package, FileText, BarChart3, AlertTriangle, Download, FileBarChart,
  Server, Calendar, Handshake
} from 'lucide-react';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';

// Import des 19 tabs admin
import { AdminOverviewTab } from '@/components/admin/tabs/AdminOverviewTab';
import { AdminUsersTab } from '@/components/admin/tabs/AdminUsersTab';
import { AdminSubscriptionsTab } from '@/components/admin/tabs/AdminSubscriptionsTab';
import { AdminRolesTab } from '@/components/admin/tabs/AdminRolesTab';
import { AdminAccessCodesTab } from '@/components/admin/tabs/AdminAccessCodesTab';
import { AdminOrdersTab } from '@/components/admin/tabs/AdminOrdersTab';
import { AdminOutletsTab } from '@/components/admin/tabs/AdminOutletsTab';
import { AdminMenusTab } from '@/components/admin/tabs/AdminMenusTab';
import { AdminInventoryTab } from '@/components/admin/tabs/AdminInventoryTab';
import { AdminInvoicesTab } from '@/components/admin/tabs/AdminInvoicesTab';
import { AdminAnalyticsTab } from '@/components/admin/tabs/AdminAnalyticsTab';
import { AdminRevenueTab } from '@/components/admin/tabs/AdminRevenueTab';
import { AdminAuditLogsTab } from '@/components/admin/tabs/AdminAuditLogsTab';
import { AdminAlertsTab } from '@/components/admin/tabs/AdminAlertsTab';
import { AdminExportTab } from '@/components/admin/tabs/AdminExportTab';
import { AdminReportsTab } from '@/components/admin/tabs/AdminReportsTab';
import { AdminSystemTab } from '@/components/admin/tabs/AdminSystemTab';
import { AdminReservationsTab } from '@/components/admin/tabs/AdminReservationsTab';
import { AdminPartnersTab } from '@/components/admin/tabs/AdminPartnersTab';

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
          {/* Navigation Tabs - 19 Fonctionnalités */}
          <div className="bg-white p-2 rounded-xl shadow-sm overflow-x-auto">
            <TabsList className="inline-flex gap-2 flex-wrap">
              <TabsTrigger value="overview"><LayoutDashboard className="w-4 h-4 mr-2" />Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" />Utilisateurs</TabsTrigger>
              <TabsTrigger value="subscriptions"><CreditCard className="w-4 h-4 mr-2" />Abonnements</TabsTrigger>
              <TabsTrigger value="orders"><ShoppingBag className="w-4 h-4 mr-2" />Commandes</TabsTrigger>
              <TabsTrigger value="outlets"><Building2 className="w-4 h-4 mr-2" />Points de Vente</TabsTrigger>
              <TabsTrigger value="menus"><Menu className="w-4 h-4 mr-2" />Menus</TabsTrigger>
              <TabsTrigger value="inventory"><Package className="w-4 h-4 mr-2" />Inventaire</TabsTrigger>
              <TabsTrigger value="invoices"><FileText className="w-4 h-4 mr-2" />Factures</TabsTrigger>
              <TabsTrigger value="reservations"><Calendar className="w-4 h-4 mr-2" />Réservations</TabsTrigger>
              <TabsTrigger value="analytics"><BarChart3 className="w-4 h-4 mr-2" />Analytics</TabsTrigger>
              <TabsTrigger value="revenue"><DollarSign className="w-4 h-4 mr-2" />Revenus</TabsTrigger>
              <TabsTrigger value="reports"><FileBarChart className="w-4 h-4 mr-2" />Rapports</TabsTrigger>
              <TabsTrigger value="partners"><Handshake className="w-4 h-4 mr-2" />Partenaires</TabsTrigger>
              <TabsTrigger value="audit"><Activity className="w-4 h-4 mr-2" />Logs Audit</TabsTrigger>
              <TabsTrigger value="alerts"><AlertTriangle className="w-4 h-4 mr-2" />Alertes</TabsTrigger>
              <TabsTrigger value="export"><Download className="w-4 h-4 mr-2" />Export</TabsTrigger>
              <TabsTrigger value="system"><Server className="w-4 h-4 mr-2" />Système</TabsTrigger>
              <TabsTrigger value="roles"><Shield className="w-4 h-4 mr-2" />Rôles</TabsTrigger>
              <TabsTrigger value="access"><Key className="w-4 h-4 mr-2" />Codes d'Accès</TabsTrigger>
            </TabsList>
          </div>

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
