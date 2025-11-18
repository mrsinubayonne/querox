import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const AdminInvoicesTab: React.FC = () => {
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    unpaid: 0,
    overdue: 0,
    totalPaid: 0,
    totalUnpaid: 0
  });
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoicesData();
  }, []);

  const fetchInvoicesData = async () => {
    try {
      const { data: invoicesList, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const total = invoicesList?.length || 0;
      const paid = invoicesList?.filter(i => i.status === 'paid').length || 0;
      const unpaid = invoicesList?.filter(i => i.status === 'unpaid').length || 0;
      const overdue = invoicesList?.filter(i => 
        i.status === 'unpaid' && i.due_date && new Date(i.due_date) < new Date()
      ).length || 0;
      const totalPaid = invoicesList
        ?.filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0) || 0;
      const totalUnpaid = invoicesList
        ?.filter(i => i.status === 'unpaid')
        .reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0) || 0;

      setStats({ total, paid, unpaid, overdue, totalPaid, totalUnpaid });
      setInvoices(invoicesList?.slice(0, 10) || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des factures');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="space-y-4">
      {[1, 2, 3, 4].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-32" /></Card>)}
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardDescription>Total Factures</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <FileText className="w-4 h-4 mr-2" />
              Toutes périodes
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardDescription>Payées</CardDescription>
            <CardTitle className="text-3xl">{stats.paid}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 mr-2" />
              {stats.totalPaid.toFixed(2)}€
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardDescription>Impayées</CardDescription>
            <CardTitle className="text-3xl">{stats.unpaid}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-2" />
              {stats.totalUnpaid.toFixed(2)}€
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardDescription>En Retard</CardDescription>
            <CardTitle className="text-3xl">{stats.overdue}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <XCircle className="w-4 h-4 mr-2" />
              Action requise
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Factures Récentes</CardTitle>
          <CardDescription>Les 10 dernières factures</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.map(invoice => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <p className="font-medium">{invoice.invoice_number}</p>
                  <p className="text-sm text-muted-foreground">{invoice.customer_name || 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(invoice.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{Number(invoice.total_amount).toFixed(2)}€</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'unpaid' ? 'bg-amber-100 text-amber-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {invoice.status === 'paid' ? 'Payée' : 'Impayée'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
