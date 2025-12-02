import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Building, Calendar, CreditCard, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRestaurant } from '@/contexts/RestaurantContext';
import { useOutlets } from '@/hooks/useOutlets';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import DebtorPaymentModal from './DebtorPaymentModal';

interface DebtorInvoice {
  id: string;
  invoice_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  due_date: string | null;
  business_customer_id: string;
  debtor_name: string;
  contact_person: string | null;
  total_paid: number;
}

const DebtorsAccountingTab: React.FC = () => {
  const [invoices, setInvoices] = useState<DebtorInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<DebtorInvoice | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { user } = useAuth();
  const { outletId } = useRestaurant();

  const fetchDebtorInvoices = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Get B2B invoices with debtor info
      let query = supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          total_amount,
          status,
          created_at,
          due_date,
          business_customer_id,
          business_customers!invoices_business_customer_id_fkey (
            company_name,
            contact_person
          )
        `)
        .eq('user_id', user.id)
        .eq('invoice_type', 'b2b')
        .not('business_customer_id', 'is', null)
        .order('created_at', { ascending: false });

      if (outletId) {
        query = query.eq('outlet_id', outletId);
      }

      const { data: invoicesData, error: invoicesError } = await query;

      if (invoicesError) throw invoicesError;

      // Get payments for each invoice
      const invoicesWithPayments: DebtorInvoice[] = [];

      for (const inv of invoicesData || []) {
        const { data: payments } = await supabase
          .from('debtor_payments' as any)
          .select('amount')
          .eq('invoice_id', inv.id);

        const totalPaid = (payments || []).reduce((sum: number, p: any) => sum + p.amount, 0);
        const businessCustomer = inv.business_customers as any;

        invoicesWithPayments.push({
          id: inv.id,
          invoice_number: inv.invoice_number,
          total_amount: inv.total_amount,
          status: inv.status,
          created_at: inv.created_at,
          due_date: inv.due_date,
          business_customer_id: inv.business_customer_id!,
          debtor_name: businessCustomer?.company_name || 'Inconnu',
          contact_person: businessCustomer?.contact_person,
          total_paid: totalPaid,
        });
      }

      setInvoices(invoicesWithPayments);
    } catch (error) {
      console.error('Error fetching debtor invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebtorInvoices();
  }, [user?.id, outletId]);

  const stats = useMemo(() => {
    const unpaidInvoices = invoices.filter(i => i.status === 'unpaid');
    const totalDebt = unpaidInvoices.reduce((sum, i) => sum + (i.total_amount - i.total_paid), 0);
    const overdueInvoices = unpaidInvoices.filter(i => i.due_date && new Date(i.due_date) < new Date());
    const overdueAmount = overdueInvoices.reduce((sum, i) => sum + (i.total_amount - i.total_paid), 0);

    return {
      totalDebt,
      unpaidCount: unpaidInvoices.length,
      overdueCount: overdueInvoices.length,
      overdueAmount,
    };
  }, [invoices]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const getStatusBadge = (invoice: DebtorInvoice) => {
    const remaining = invoice.total_amount - invoice.total_paid;
    
    if (invoice.status === 'paid' || remaining <= 0) {
      return <Badge variant="outline" className="bg-green-500/10 text-green-700">Soldé</Badge>;
    }
    
    if (invoice.due_date && new Date(invoice.due_date) < new Date()) {
      return <Badge variant="destructive">En retard</Badge>;
    }
    
    if (invoice.total_paid > 0) {
      return <Badge variant="outline" className="bg-blue-500/10 text-blue-700">Partiel</Badge>;
    }
    
    return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700">En attente</Badge>;
  };

  const handleRegisterPayment = (invoice: DebtorInvoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <CreditCard className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Créances totales</p>
                <p className="text-xl font-bold">{formatCurrency(stats.totalDebt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Factures en cours</p>
                <p className="text-xl font-bold">{stats.unpaidCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En retard</p>
                <p className="text-xl font-bold">{stats.overdueCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Montant en retard</p>
                <p className="text-xl font-bold">{formatCurrency(stats.overdueAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Factures débiteurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucune facture débiteur trouvée
            </p>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-3">
                {invoices.map((invoice) => {
                  const remaining = invoice.total_amount - invoice.total_paid;
                  const isPaid = invoice.status === 'paid' || remaining <= 0;

                  return (
                    <div
                      key={invoice.id}
                      className={`p-4 border rounded-lg ${isPaid ? 'bg-muted/30' : 'bg-background'}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{invoice.debtor_name}</span>
                            {getStatusBadge(invoice)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Facture {invoice.invoice_number}
                            {invoice.contact_person && ` • ${invoice.contact_person}`}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(invoice.created_at), 'dd/MM/yyyy', { locale: fr })}
                            </span>
                            {invoice.due_date && (
                              <span className={`flex items-center gap-1 ${
                                new Date(invoice.due_date) < new Date() && !isPaid 
                                  ? 'text-destructive' 
                                  : 'text-muted-foreground'
                              }`}>
                                Échéance: {format(new Date(invoice.due_date), 'dd/MM/yyyy', { locale: fr })}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <p className="font-medium">{formatCurrency(invoice.total_amount)}</p>
                          {invoice.total_paid > 0 && (
                            <p className="text-sm text-green-600">
                              Payé: {formatCurrency(invoice.total_paid)}
                            </p>
                          )}
                          {!isPaid && (
                            <p className="text-sm text-destructive font-medium">
                              Reste: {formatCurrency(remaining)}
                            </p>
                          )}
                        </div>

                        <div>
                          {!isPaid && (
                            <Button
                              size="sm"
                              onClick={() => handleRegisterPayment(invoice)}
                            >
                              Paiement
                            </Button>
                          )}
                          {isPaid && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {selectedInvoice && (
        <DebtorPaymentModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          invoice={{
            id: selectedInvoice.id,
            invoice_number: selectedInvoice.invoice_number,
            total_amount: selectedInvoice.total_amount,
            business_customer_id: selectedInvoice.business_customer_id,
            debtor_name: selectedInvoice.debtor_name,
          }}
          remainingAmount={selectedInvoice.total_amount - selectedInvoice.total_paid}
          onSuccess={fetchDebtorInvoices}
        />
      )}
    </div>
  );
};

export default DebtorsAccountingTab;
