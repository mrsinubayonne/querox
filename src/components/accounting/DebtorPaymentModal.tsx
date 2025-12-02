import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebtorPayments } from '@/hooks/useDebtorPayments';
import { useRestaurant } from '@/contexts/RestaurantContext';
import { useOutlets } from '@/hooks/useOutlets';

interface DebtorPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: {
    id: string;
    invoice_number: string;
    total_amount: number;
    business_customer_id: string;
    debtor_name?: string;
  };
  remainingAmount: number;
  onSuccess?: () => void;
}

const DebtorPaymentModal: React.FC<DebtorPaymentModalProps> = ({
  open,
  onOpenChange,
  invoice,
  remainingAmount,
  onSuccess
}) => {
  const [amount, setAmount] = useState(remainingAmount.toString());
  const [paymentMethod, setPaymentMethod] = useState('Espèces');
  const [notes, setNotes] = useState('');
  const { createPaymentAsync, isCreating } = useDebtorPayments();
  const { outletId } = useRestaurant();

  const paymentMethods = [
    { value: 'Espèces', label: 'Espèces' },
    { value: 'Virement', label: 'Virement' },
    { value: 'Visa/Mastercard', label: 'Visa/Mastercard' },
    { value: 'Mobile Money', label: 'Mobile Money' },
  ];

  const handleSubmit = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    try {
      await createPaymentAsync({
        invoice_id: invoice.id,
        debtor_id: invoice.business_customer_id,
        amount: amountNum,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: paymentMethod,
        notes: notes || undefined,
        outlet_id: outletId || undefined,
      });

      onOpenChange(false);
      setAmount('');
      setNotes('');
      onSuccess?.();
    } catch (error) {
      console.error('Error creating payment:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value) + ' FCFA';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enregistrer un paiement</DialogTitle>
          <DialogDescription>
            Facture {invoice.invoice_number} - {invoice.debtor_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg text-sm">
            <div>
              <span className="text-muted-foreground">Montant total:</span>
              <p className="font-medium">{formatCurrency(invoice.total_amount)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Reste à payer:</span>
              <p className="font-medium text-destructive">{formatCurrency(remainingAmount)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Montant du paiement</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Montant"
              min="0"
              max={remainingAmount}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Moyen de paiement</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes sur ce paiement..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isCreating || parseFloat(amount) <= 0 || parseFloat(amount) > remainingAmount}
          >
            {isCreating ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DebtorPaymentModal;
