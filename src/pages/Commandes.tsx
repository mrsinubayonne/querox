
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PageWithSidebar from '@/components/PageWithSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { OrdersHeader } from '@/components/orders/OrdersHeader';
import { OrdersList } from '@/components/orders/OrdersList';
import { EditOrderModal } from '@/components/orders/EditOrderModal';
import { useOrders } from '@/hooks/useOrders';

const Commandes: React.FC = () => {
  const { orders, loading, refetch } = useOrders();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [editOrderId, setEditOrderId] = useState<string | null>(null);

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      setEditOrderId(editId);
    }
  }, [searchParams]);

  const handleCloseEditModal = () => {
    setEditOrderId(null);
    // Supprimer le paramètre edit de l'URL
    searchParams.delete('edit');
    setSearchParams(searchParams);
  };

  const handleEditSuccess = () => {
    refetch();
  };

  return (
    <SubscriptionGuard feature="la gestion des commandes">
      <PageWithSidebar>
        <div className="space-y-6">
          <OrdersHeader onOrderCreated={refetch} ordersCount={orders?.length ?? 0} />
          <OrdersList orders={orders} loading={loading} refetch={refetch} />
        </div>
        <EditOrderModal
          isOpen={!!editOrderId}
          onClose={handleCloseEditModal}
          onSuccess={handleEditSuccess}
          orderId={editOrderId}
        />
      </PageWithSidebar>
    </SubscriptionGuard>
  );
};

export default Commandes;
