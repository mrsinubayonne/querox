
import { useOptimizedOrders } from './useOptimizedOrders';

export const useOrders = () => {
  const { orders, loading, refetch } = useOptimizedOrders();

  return {
    orders,
    loading,
    refetch,
  };
};

export type { Order } from './useOptimizedOrders';
