import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Invoice } from '@/hooks/useInvoices';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EditInvoiceModalProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditInvoiceModal: React.FC<EditInvoiceModalProps> = ({
  invoice,
  open,
  onOpenChange,
  onSuccess
}) => {
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'paid' | 'unpaid' | 'overdue'>('unpaid');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (invoice) {
      setAmount(invoice.total_amount.toString());
      setStatus(invoice.status);
      setDueDate(invoice.due_date || '');
      setNotes(invoice.notes || '');
    }
  }, [invoice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invoice) return;

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Erreur", { description: "Veuillez entrer un montant valide" });
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {
        total_amount: parseFloat(amount),
        status,
        due_date: dueDate || null,
        notes: notes || null,
        updated_at: new Date().toISOString()
      };

      if (status === 'paid' && !invoice.paid_date) {
        updateData.paid_date = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoice.id);

      if (error) throw error;

      toast.success("Succès", { description: "Facture mise à jour avec succès" });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error("Erreur", { description: "Impossible de mettre à jour la facture" });
    } finally {
      setLoading(false);
    }
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier la facture</DialogTitle>
          <DialogDescription>
            {invoice.invoice_number}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Montant (XAF) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="Ex: 50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unpaid">En attente</SelectItem>
                <SelectItem value="paid">Payée</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Date d'échéance</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Informations supplémentaires..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Mise à jour...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditInvoiceModal;
