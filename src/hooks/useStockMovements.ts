import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useOfflineData } from '@/hooks/useOfflineData';
import { useOfflineInsert } from '@/hooks/useOfflineMutation';

interface StockMovement {
  id: string;
  item_id: string;
  quantity: number;
  movement_type: string;
  reason: string | null;
  before_quantity: number;
  after_quantity: number;
  reason_category: string | null;
  performed_by_user_id: string | null;
  notes: string | null;
  created_at: string;
  inventory_items?: {
    name: string;
    unit: string;
  };
}

export const useStockMovements = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<{
    itemId?: string;
    startDate?: string;
    endDate?: string;
    movementType?: string;
  }>({});

  const { data: movements, isLoading: loading, refetch } = useOfflineData<StockMovement>({
    table: 'stock_movements',
    queryKey: ['stock-movements', JSON.stringify(filters)],
    enabled: !!user,
    buildQuery: async (userId, outlet) => {
      let query = supabase
        .from('stock_movements')
        .select(`
          *,
          inventory_items!inner(name, unit, user_id, outlet_id)
        `)
        .eq('inventory_items.user_id', userId)
        .order('created_at', { ascending: false })
        .limit(500);

      if (outlet) {
        query = query.eq('inventory_items.outlet_id', outlet);
      }

      if (filters.itemId) {
        query = query.eq('item_id', filters.itemId);
      }

      if (filters.movementType) {
        query = query.eq('movement_type', filters.movementType);
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query;
      return { data: (data || []) as StockMovement[], error };
    },
  });

  const insertMutation = useOfflineInsert({
    table: 'stock_movements',
    queryKey: ['stock-movements'],
  });

  const fetchMovements = useCallback((newFilters?: typeof filters) => {
    if (newFilters) {
      setFilters(newFilters);
    }
    refetch();
  }, [refetch]);

  const createMovement = useCallback(async (movementData: {
    item_id: string;
    quantity: number;
    movement_type: string;
    reason?: string;
    before_quantity: number;
    after_quantity: number;
    reason_category?: string;
    notes?: string;
  }) => {
    if (!user) return false;

    insertMutation.mutate({
      ...movementData,
      performed_by_user_id: user.id
    } as unknown as Record<string, unknown>);
    
    return true;
  }, [user, insertMutation]);

  return {
    movements,
    loading,
    fetchMovements,
    createMovement
  };
};
