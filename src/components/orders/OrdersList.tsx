
import React from 'react';
import { Order } from '@/hooks/useOrders';
import { OrderCard } from './OrderCard';
import EmptyState from '@/components/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Package } from 'lucide-react';

interface OrdersListProps {
  orders: Order[];
  loading: boolean;
  refetch: () => Promise<void>;
}

export const OrdersList: React.FC<OrdersListProps> = ({ orders, loading, refetch }) => {

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Aucune commande"
        description="Vous n'avez pas encore de commandes. Les nouvelles commandes apparaîtront ici."
      />
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard 
          key={order.id} 
          order={order} 
          onStatusChange={refetch}
        />
      ))}
    </div>
  );
};
