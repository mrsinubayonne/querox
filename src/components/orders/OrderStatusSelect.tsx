
import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: string;
  onStatusChange: () => void;
}

const ORDER_STATUSES = [
  { value: 'pending', label: 'En attente', color: 'text-orange-600' },
  { value: 'confirmed', label: 'Confirmée', color: 'text-blue-600' },
  { value: 'preparing', label: 'En préparation', color: 'text-yellow-600' },
  { value: 'ready', label: 'Prête', color: 'text-green-600' },
  { value: 'delivered', label: 'Livrée', color: 'text-emerald-600' },
  { value: 'cancelled', label: 'Annulée', color: 'text-red-600' },
];

export const OrderStatusSelect: React.FC<OrderStatusSelectProps> = ({
  orderId,
  currentStatus,
  onStatusChange
}) => {
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: string) => {
    try {
      // Update order status
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        throw error;
      }

      // If status changed to "delivered", mark invoice as paid
      // The DB trigger `create_transaction_from_paid_invoice` will automatically
      // create the accounting transaction when the invoice status changes to 'paid'
      if (newStatus === 'delivered') {
        await supabase
          .from('invoices')
          .update({ 
            status: 'paid',
            paid_date: new Date().toISOString().split('T')[0],
            payment_method: 'Espèces',
          })
          .eq('order_id', orderId);
      }

      toast({
        title: "Statut mis à jour",
        description: `Le statut de la commande a été changé vers "${ORDER_STATUSES.find(s => s.value === newStatus)?.label}"${newStatus === 'delivered' ? ' et la transaction a été enregistrée' : ''}`,
      });

      onStatusChange();
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de la commande",
        variant: "destructive"
      });
    }
  };

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ORDER_STATUSES.map((status) => (
          <SelectItem key={status.value} value={status.value}>
            <span className={status.color}>{status.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
