import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useAdminAlerts } from '@/hooks/useAdminAlerts';
import ModernSidebar from '@/components/ModernSidebar';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import { AlertTriangle, XCircle, CheckCircle, Clock, CreditCard, Bell } from 'lucide-react';
import { toast } from 'sonner';

const AdminAlerts: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, loading: authLoading } = useSubscription();
  const { alerts, loading } = useAdminAlerts();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning'>('all');
  const [localAlerts, setLocalAlerts] = useState(alerts);

  React.useEffect(() => {
    setLocalAlerts(alerts);
  }, [alerts]);

  const resolveAlert = async (alertId: string) => {
    setLocalAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, resolved: true } : a
    ));
    toast.success('Alerte résolue');
  };

  const getSeverityConfig = (severity: string) => {
    const configs = {
      critical: { 
        icon: XCircle, 
        color: 'text-red-500', 
        bg: 'bg-red-50 dark:bg-red-900/20', 
        border: 'border-red-200 dark:border-red-800',
        badge: 'destructive' as const
      },
      warning: { 
        icon: AlertTriangle, 
        color: 'text-orange-500', 
        bg: 'bg-orange-50 dark:bg-orange-900/20', 
        border: 'border-orange-200 dark:border-orange-800',
        badge: 'secondary' as const
      },
      info: { 
        icon: Bell, 
        color: 'text-blue-500', 
        bg: 'bg-blue-50 dark:bg-blue-900/20', 
        border: 'border-blue-200 dark:border-blue-800',
        badge: 'outline' as const
      }
    };
    return configs[severity as keyof typeof configs] || configs.info;
  };

  const filteredAlerts = localAlerts.filter(alert => {
    if (filter === 'all') return !alert.resolved;
    return alert.severity === filter && !alert.resolved;
  });

  if (authLoading || loading) {
    return (
      <div className="flex h-screen bg-background">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen bg-background">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <UnauthorizedAccess userEmail={user?.email} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Alertes Globales</h1>
              <p className="text-sm text-muted-foreground">Surveillance des événements critiques</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">Critiques</span>
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-3xl font-bold text-red-700 dark:text-red-300">
                  {localAlerts.filter(a => a.severity === 'critical' && !a.resolved).length}
                </div>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">nécessitent une action immédiate</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Avertissements</span>
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                  {localAlerts.filter(a => a.severity === 'warning' && !a.resolved).length}
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">à surveiller</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Résolues</span>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                  {localAlerts.filter(a => a.resolved).length}
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">problèmes traités</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
            >
              Toutes
            </Button>
            <Button
              variant={filter === 'critical' ? 'default' : 'outline'}
              onClick={() => setFilter('critical')}
              size="sm"
            >
              Critiques
            </Button>
            <Button
              variant={filter === 'warning' ? 'default' : 'outline'}
              onClick={() => setFilter('warning')}
              size="sm"
            >
              Avertissements
            </Button>
          </div>

          {/* Alerts List */}
          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <Card className="border-0 shadow-md">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune alerte active</p>
                </CardContent>
              </Card>
            ) : (
              filteredAlerts.map((alert) => {
                const config = getSeverityConfig(alert.severity);
                const Icon = config.icon;
                
                return (
                  <Alert key={alert.id} className={`${config.bg} ${config.border} border-2`}>
                    <div className="flex items-start gap-4">
                      <Icon className={`h-5 w-5 ${config.color} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <AlertTitle className="flex items-center gap-2">
                              {alert.title}
                              <Badge variant={config.badge} className="text-xs">
                                {alert.severity === 'critical' ? 'CRITIQUE' : 'ATTENTION'}
                              </Badge>
                            </AlertTitle>
                            <AlertDescription className="mt-1">
                              {alert.message}
                            </AlertDescription>
                            {alert.restaurant_name && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Restaurant: <strong>{alert.restaurant_name}</strong>
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {new Date(alert.created_at).toLocaleString('fr-FR')}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Résoudre
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Alert>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAlerts;
