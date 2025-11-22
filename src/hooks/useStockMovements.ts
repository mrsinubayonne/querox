import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMovements = useCallback(async (filters?: {
    itemId?: string;
    startDate?: string;
    endDate?: string;
    movementType?: string;
  }) => {
    if (!user) {
      setMovements([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const selectedProfileId = localStorage.getItem('selectedProfileId');
      let outletId = null;
      
      if (selectedProfileId) {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('selected_outlet_id')
          .eq('id', selectedProfileId)
          .maybeSingle();
        outletId = userProfile?.selected_outlet_id;
      }
      
      if (!outletId) {
        outletId = localStorage.getItem('selectedOutletId');
      }

      let query = supabase
        .from('stock_movements')
        .select(`
          *,
          inventory_items!inner(name, unit, user_id, outlet_id)
        `)
        .eq('inventory_items.user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(500);

      if (outletId) {
        query = query.eq('inventory_items.outlet_id', outletId);
      }

      if (filters?.itemId) {
        query = query.eq('item_id', filters.itemId);
      }

      if (filters?.movementType) {
        query = query.eq('movement_type', filters.movementType);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      setMovements((data || []) as StockMovement[]);
    } catch (error: any) {
      console.error('Stock movements fetch error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique",
        variant: "destructive"
      });
      setMovements([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createMovement = async (movementData: {
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

    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .insert({
          ...movementData,
          performed_by_user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      await fetchMovements();
      return data;
    } catch (error: any) {
      console.error('Create movement error:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le mouvement",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  return {
    movements,
    loading,
    fetchMovements,
    createMovement
  };
};
