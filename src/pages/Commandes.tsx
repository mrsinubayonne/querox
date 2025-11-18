
import React from 'react';
import PageWithSidebar from '@/components/PageWithSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import SubscriptionPopup from '@/components/SubscriptionPopup';
import { OrdersHeader } from '@/components/orders/OrdersHeader';
import { OrdersList } from '@/components/orders/OrdersList';
import { useOrders } from '@/hooks/useOrders';

const Commandes: React.FC = () => {
  const { orders, loading, refetch } = useOrders();

  return (
    <SubscriptionGuard feature="la gestion des commandes">
      <PageWithSidebar>
        <div className="space-y-6">
          <OrdersHeader onOrderCreated={refetch} />
          <OrdersList orders={orders} loading={loading} refetch={refetch} />
        </div>
      </PageWithSidebar>
      <SubscriptionPopup />
    </SubscriptionGuard>
  );
};

export default Commandes;
