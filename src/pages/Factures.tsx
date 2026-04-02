import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWithSidebar from '@/components/PageWithSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { useInvoices, Invoice } from '@/hooks/useInvoices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Check, X, Clock, Plus, Eye, Edit, Trash2, Printer, Settings } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/EmptyState';
import AddInvoiceModal from '@/components/AddInvoiceModal';
import InvoiceDetailsModal from '@/components/invoices/InvoiceDetailsModal';
import EditInvoiceModal from '@/components/invoices/EditInvoiceModal';
import InvoiceFilters from '@/components/invoices/InvoiceFilters';
import InvoicePrintView, { InvoicePrintViewRef } from '@/components/invoices/InvoicePrintView';
import InvoiceFormatSelector from '@/components/invoices/InvoiceFormatSelector';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Factures: React.FC = () => {
  const navigate = useNavigate();
  const { invoices, loading, updateInvoiceStatus, refetch } = useInvoices();
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
  const [printFormat, setPrintFormat] = useState<'a4' | 'restaurant'>('restaurant');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFormatSelector, setShowFormatSelector] = useState(false);
  const [showServerDialog, setShowServerDialog] = useState(false);
  const [servedBy, setServedBy] = useState('');
  const [printReady, setPrintReady] = useState(false);

  const printViewRef = useRef<InvoicePrintViewRef>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-emerald-500">
            <Check className="w-3 h-3 mr-1" /> Payée
          </Badge>
        );
      case 'unpaid':
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" /> En attente
          </Badge>
        );
      case 'overdue':
        return (
          <Badge variant="destructive">
            <X className="w-3 h-3 mr-1" /> En retard
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const handleMarkAsPaid = async (id: string) => {
    await updateInvoiceStatus(id, 'paid');
    refetch();
  };

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsEditModalOpen(true);
  };

  const handlePrint = (invoice: Invoice) => {
    setPrintInvoice(invoice);
    setPrintReady(false);
    setShowFormatSelector(true);
  };

  const handleFormatSelected = (format: 'a4' | 'restaurant') => {
    setPrintFormat(format);
    setShowFormatSelector(false);
    setShowServerDialog(true);
  };

  // Called when InvoicePrintView has loaded its data
  const handlePrintReady = useCallback(() => {
    setPrintReady(true);
  }, []);

  const confirmPrint = () => {
    if (!printReady) {
      // Auto-trigger print as soon as ready instead of blocking
      const checkInterval = setInterval(() => {
        if (printViewRef.current) {
          clearInterval(checkInterval);
          setShowServerDialog(false);
          printViewRef.current.print();
        }
      }, 200);
      // Safety: clear after 5s
      setTimeout(() => clearInterval(checkInterval), 5000);
      return;
    }

    setShowServerDialog(false);
    printViewRef.current?.print();
  };

  const handleDeleteClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedInvoice) return;

    try {
      const { error } = await supabase.from('invoices').delete().eq('id', selectedInvoice.id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Facture supprimée avec succès',
      });

      refetch();
      setIsDeleteDialogOpen(false);
      setSelectedInvoice(null);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la facture',
        variant: 'destructive',
      });
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  const safeInvoices = invoices ?? [];

  const filteredInvoices = useMemo(() => {
    // Deduplicate by invoice_number (keep most recent)
    const seen = new Map<string, Invoice>();
    for (const invoice of safeInvoices) {
      const existing = seen.get(invoice.invoice_number);
      if (!existing || new Date(invoice.created_at) > new Date(existing.created_at)) {
        seen.set(invoice.invoice_number, invoice);
      }
    }
    const uniqueInvoices = Array.from(seen.values());

    return uniqueInvoices.filter((invoice) => {
      const matchesSearch =
        invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (invoice.notes && invoice.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [safeInvoices, searchQuery, statusFilter]);

  return (
    <SubscriptionGuard feature="la gestion des factures">
      <PageWithSidebar>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
                <p className="text-gray-600">Gérez toutes vos factures</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/parametres?tab=invoices')} className="gap-2">
                <Settings className="w-4 h-4" />
                Personnaliser les factures
              </Button>
              <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Créer une facture
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total des factures</CardDescription>
                <CardTitle className="text-3xl">{safeInvoices.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Factures payées</CardDescription>
                <CardTitle className="text-3xl text-emerald-600">
                  {invoices.filter((i) => i.status === 'paid').length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>En attente</CardDescription>
                <CardTitle className="text-3xl text-orange-600">
                  {invoices.filter((i) => i.status === 'unpaid').length}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Filters */}
          <InvoiceFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onReset={handleResetFilters}
          />

          {/* Invoices List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : filteredInvoices.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={invoices.length === 0 ? 'Aucune facture' : 'Aucun résultat'}
              description={
                invoices.length === 0
                  ? 'Les factures seront générées automatiquement pour chaque commande'
                  : 'Aucune facture ne correspond à vos critères de recherche'
              }
            />
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <Card key={invoice.id} className="hover:shadow-md transition-shadow">
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
                              {invoice.total_amount.toLocaleString('fr-FR')} XAF
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
                        {invoice.notes && <p className="mt-3 text-sm text-gray-600 line-clamp-2">{invoice.notes}</p>}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline" onClick={() => handleViewDetails(invoice)} title="Voir les détails">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handlePrint(invoice)} title="Imprimer">
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(invoice)} title="Modifier">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteClick(invoice)} title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <AddInvoiceModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />

        <InvoiceDetailsModal
          invoice={selectedInvoice}
          open={isDetailsModalOpen}
          onOpenChange={setIsDetailsModalOpen}
          onMarkAsPaid={handleMarkAsPaid}
        />

        <EditInvoiceModal
          invoice={selectedInvoice}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onSuccess={refetch}
        />

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer la facture {selectedInvoice?.invoice_number} ? Cette action est
                irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showServerDialog} onOpenChange={setShowServerDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Menu servi par qui?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette information est facultative et sera ajoutée à la facture si vous la renseignez.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <label htmlFor="served-by" className="text-sm font-medium">
                Nom du serveur (facultatif)
              </label>
              <input
                id="served-by"
                placeholder="Ex: Jean Dupont"
                value={servedBy}
                onChange={(e) => setServedBy(e.target.value)}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setServedBy('')}>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={confirmPrint}>Imprimer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <InvoiceFormatSelector
          open={showFormatSelector}
          onOpenChange={setShowFormatSelector}
          onSelectFormat={handleFormatSelected}
        />

        {/* Mount InvoicePrintView as soon as printInvoice is set, so it can load data */}
        {printInvoice && (
          <InvoicePrintView
            ref={printViewRef}
            invoice={printInvoice}
            servedBy={servedBy}
            format={printFormat}
            autoPrint={false}
            onReady={handlePrintReady}
          />
        )}
      </PageWithSidebar>
    </SubscriptionGuard>
  );
};

export default Factures;
