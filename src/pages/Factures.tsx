import React from 'react';
import PageWithSidebar from '@/components/PageWithSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { useInvoices } from '@/hooks/useInvoices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Check, X, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/EmptyState';

const Factures: React.FC = () => {
  const { invoices, loading, updateInvoiceStatus } = useInvoices();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-500"><Check className="w-3 h-3 mr-1" /> Payée</Badge>;
      case 'unpaid':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> En attente</Badge>;
      case 'overdue':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" /> En retard</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <SubscriptionGuard feature="la gestion des factures">
      <PageWithSidebar>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
              <p className="text-gray-600">Gérez toutes vos factures</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total des factures</CardDescription>
                <CardTitle className="text-3xl">{invoices.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Factures payées</CardDescription>
                <CardTitle className="text-3xl text-emerald-600">
                  {invoices.filter(i => i.status === 'paid').length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>En attente</CardDescription>
                <CardTitle className="text-3xl text-orange-600">
                  {invoices.filter(i => i.status === 'unpaid').length}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Invoices List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Aucune facture"
              description="Les factures seront générées automatiquement pour chaque commande"
            />
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <Card key={invoice.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{invoice.invoice_number}</h3>
                          {getStatusBadge(invoice.status)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="font-medium text-gray-900">Montant</p>
                            <p className="text-lg font-bold text-primary">
                              {invoice.total_amount.toLocaleString('fr-FR')} FCFA
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Date de création</p>
                            <p>{formatDate(invoice.created_at)}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Date d'échéance</p>
                            <p>{formatDate(invoice.due_date)}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Date de paiement</p>
                            <p>{formatDate(invoice.paid_date)}</p>
                          </div>
                        </div>
                        {invoice.notes && (
                          <p className="mt-3 text-sm text-gray-600">{invoice.notes}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        {invoice.status === 'unpaid' && (
                          <Button
                            size="sm"
                            onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Marquer comme payée
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </PageWithSidebar>
    </SubscriptionGuard>
  );
};

export default Factures;
