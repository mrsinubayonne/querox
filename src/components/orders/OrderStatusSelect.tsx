
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

      // If status changed to "delivered", create transaction and update invoice
      if (newStatus === 'delivered') {
        // Get order details
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (!orderError && order) {
          // Create transaction in accounting
          await supabase
            .from('transactions')
            .insert({
              user_id: order.user_id,
              title: `Commande livrée - ${order.customer_name}`,
              amount: order.total_amount,
              type: 'income',
              category: 'ventes',
              date: new Date().toISOString().split('T')[0],
              status: 'completed',
              description: `Commande #${orderId.substring(0, 8)} livrée`
            });

          // Update invoice status to paid if exists
          await supabase
            .from('invoices')
            .update({ 
              status: 'paid',
              paid_date: new Date().toISOString().split('T')[0]
            })
            .eq('order_id', orderId);
        }
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
