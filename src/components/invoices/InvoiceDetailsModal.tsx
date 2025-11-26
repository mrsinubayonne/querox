import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Check, X, Clock, Building2, Calendar, CreditCard, Printer } from 'lucide-react';
import { Invoice } from '@/hooks/useInvoices';
import InvoicePrintView from './InvoicePrintView';
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
import { usePaidCelebration } from '@/hooks/usePaidCelebration';
import PaymentMethodModal from './PaymentMethodModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InvoiceDetailsModalProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkAsPaid: (id: string) => void;
}

const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({
  invoice,
  open,
  onOpenChange,
  onMarkAsPaid
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [showServerDialog, setShowServerDialog] = useState(false);
  const [servedBy, setServedBy] = useState('');
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const { celebrate, CelebrationMessage } = usePaidCelebration();

  const handleMarkAsPaid = async (paymentMethod: string) => {
    if (!invoice) return;
    
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: 'paid',
          paid_date: new Date().toISOString(),
          payment_method: paymentMethod
        })
        .eq('id', invoice.id);

      if (error) throw error;

      celebrate();
      onMarkAsPaid(invoice.id);
      onOpenChange(false);
      
      toast.success('Facture marquée comme payée');
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  if (!invoice) return null;

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
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handlePrint = () => {
    setShowServerDialog(true);
  };

  const confirmPrint = () => {
    setShowServerDialog(false);
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setIsPrinting(false);
        setServedBy('');
      }, 100);
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Détails de la facture</DialogTitle>
            {getStatusBadge(invoice.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* En-tête facture */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold">QUEROX</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Système de gestion restaurant
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-normal text-black mb-1">
                    {invoice.invoice_number}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Créée le {formatDate(invoice.created_at)}
                  </p>
                </div>
              </div>

              {/* Informations montant */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                <p className="text-sm text-muted-foreground mb-1">Montant total</p>
                <p className="text-4xl font-bold text-black" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: '900' }}>
                  {invoice.total_amount.toLocaleString('fr-FR')} FCFA
                </p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date d'échéance</p>
                    <p className="text-base font-semibold">{formatDate(invoice.due_date)}</p>
                  </div>
                </div>

                {invoice.paid_date && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Date de paiement</p>
                      <p className="text-base font-semibold">{formatDate(invoice.paid_date)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            {invoice.status === 'unpaid' && (
              <Button
                onClick={() => setShowPaymentMethod(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Marquer comme payée
              </Button>
            )}
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimer
            </Button>
          </div>
        </div>

        {isPrinting && <InvoicePrintView invoice={invoice} servedBy={servedBy} />}
      </DialogContent>

      <AlertDialog open={showServerDialog} onOpenChange={setShowServerDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Menu servi par qui?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette information est facultative et sera ajoutée à la facture si vous la renseignez.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="served-by">Nom du serveur (facultatif)</Label>
            <Input
              id="served-by"
              placeholder="Ex: Jean Dupont"
              value={servedBy}
              onChange={(e) => setServedBy(e.target.value)}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setServedBy('')}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPrint}>
              Imprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PaymentMethodModal
        open={showPaymentMethod}
        onOpenChange={setShowPaymentMethod}
        onConfirm={handleMarkAsPaid}
      />

      <CelebrationMessage />
    </Dialog>
  );
};

export default InvoiceDetailsModal;
