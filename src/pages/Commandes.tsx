
import React from 'react';
import PageWithSidebar from '@/components/PageWithSidebar';
import { OrdersHeader } from '@/components/orders/OrdersHeader';
import { OrdersList } from '@/components/orders/OrdersList';

const Commandes: React.FC = () => {
  return (
    <PageWithSidebar>
      <div className="space-y-6">
        <OrdersHeader />
        <OrdersList />
      </div>
    </PageWithSidebar>
  );
};

export default Commandes;
