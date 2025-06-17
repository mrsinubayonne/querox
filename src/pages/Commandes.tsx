
import React from 'react';
import PageWithSidebar from '@/components/PageWithSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { OrdersHeader } from '@/components/orders/OrdersHeader';
import { OrdersList } from '@/components/orders/OrdersList';

const Commandes: React.FC = () => {
  return (
    <SubscriptionGuard feature="la gestion des commandes">
      <PageWithSidebar>
        <div className="space-y-6">
          <OrdersHeader />
          <OrdersList />
        </div>
      </PageWithSidebar>
    </SubscriptionGuard>
  );
};

export default Commandes;
