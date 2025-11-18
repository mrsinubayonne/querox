import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Bell, Info, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  count: number;
}

export const AdminAlertsTab: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const alertsList: Alert[] = [];

      // Vérifier les stocks bas
      const { data: allItems } = await supabase
        .from('inventory_items')
        .select('current_stock, min_stock');
      
      const lowStock = allItems?.filter(item => 
        (item.current_stock || 0) <= (item.min_stock || 0)
      );

      if (lowStock && lowStock.length > 0) {
        alertsList.push({
          id: 'low-stock',
          type: 'warning',
          title: 'Stock Bas',
          message: `${lowStock.length} article(s) nécessitent un réapprovisionnement`,
          count: lowStock.length
        });
      }

      // Vérifier les factures en retard
      const { data: overdueInvoices } = await supabase
        .from('invoices')
        .select('id')
        .eq('status', 'unpaid')
        .lt('due_date', new Date().toISOString());

      if (overdueInvoices && overdueInvoices.length > 0) {
        alertsList.push({
          id: 'overdue-invoices',
          type: 'critical',
          title: 'Factures En Retard',
          message: `${overdueInvoices.length} facture(s) impayée(s) en retard`,
          count: overdueInvoices.length
        });
      }

      // Vérifier les commandes en attente
      const { data: pendingOrders } = await supabase
        .from('orders')
        .select('id')
        .eq('status', 'pending');

      if (pendingOrders && pendingOrders.length > 0) {
        alertsList.push({
          id: 'pending-orders',
          type: 'info',
          title: 'Commandes En Attente',
          message: `${pendingOrders.length} commande(s) en attente de traitement`,
          count: pendingOrders.length
        });
      }

      // Vérifier les abonnements qui expirent bientôt
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { data: expiringSubscriptions } = await supabase
        .from('subscribers')
        .select('id')
        .eq('subscribed', true)
        .lt('subscription_end', thirtyDaysFromNow.toISOString());

      if (expiringSubscriptions && expiringSubscriptions.length > 0) {
        alertsList.push({
          id: 'expiring-subscriptions',
          type: 'warning',
          title: 'Abonnements Expirant',
          message: `${expiringSubscriptions.length} abonnement(s) expirent dans 30 jours`,
          count: expiringSubscriptions.length
        });
      }

      setAlerts(alertsList);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des alertes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'info': return <Info className="w-5 h-5 text-blue-600" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'warning': return 'border-l-amber-500 bg-amber-50';
      case 'info': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  if (loading) {
    return <div className="space-y-4">
      {[1, 2, 3].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-32" /></Card>)}
    </div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Alertes & Notifications
          </CardTitle>
          <CardDescription>
            {alerts.length === 0 ? 'Aucune alerte active' : `${alerts.length} alerte(s) active(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-lg font-medium text-green-600">Tout va bien !</p>
              <p className="text-sm text-muted-foreground mt-2">Aucune alerte à signaler</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map(alert => (
                <Card key={alert.id} className={`border-l-4 ${getAlertColor(alert.type)}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        alert.type === 'critical' ? 'bg-red-600 text-white' :
                        alert.type === 'warning' ? 'bg-amber-600 text-white' :
                        'bg-blue-600 text-white'
                      }`}>
                        {alert.count}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
