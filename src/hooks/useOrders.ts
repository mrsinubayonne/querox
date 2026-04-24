
import { useCallback } from 'react';
import { useOptimizedOrders } from './useOptimizedOrders';

export const useOrders = () => {
  const { orders, loading, refetch } = useOptimizedOrders();

  const refetchOrders = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    orders,
    loading,
    refetch: refetchOrders,
  };
};

export type { Order } from './useOptimizedOrders';
