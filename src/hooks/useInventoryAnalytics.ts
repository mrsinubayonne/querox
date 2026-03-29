import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReorderSuggestion {
  item_id: string;
  item_name: string;
  current_stock: number;
  min_stock: number;
  suggested_order_quantity: number;
  supplier_name: string | null;
  unit_price: number | null;
  total_cost: number;
}

export const useInventoryAnalytics = () => {
  const [reorderSuggestions, setReorderSuggestions] = useState<ReorderSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchReorderSuggestions = useCallback(async () => {
    if (!user) {
      setReorderSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      
      let outletId = localStorage.getItem('selectedOutletId');

      if (!outletId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('selected_outlet_id')
          .eq('id', user.id)
          .maybeSingle();
        outletId = profile?.selected_outlet_id || null;
      }

      if (!outletId) {
        setReorderSuggestions([]);
        return;
      }

      // Calculate reorder suggestions client-side instead of relying on RPC
      const { data: items, error } = await supabase
        .from('inventory_items')
        .select('id, name, current_stock, min_stock, reorder_quantity, unit_price, supplier, unit')
        .eq('user_id', user.id)
        .eq('outlet_id', outletId);

      if (error) throw error;

      const suggestions: ReorderSuggestion[] = (items || [])
        .filter(item => (item.current_stock || 0) <= (item.min_stock || 0))
        .map(item => {
          const suggestedQty = (item.reorder_quantity || item.min_stock || 10) - (item.current_stock || 0);
          const qty = Math.max(suggestedQty, 1);
          return {
            item_id: item.id,
            item_name: item.name,
            current_stock: item.current_stock || 0,
            min_stock: item.min_stock || 0,
            suggested_order_quantity: qty,
            supplier_name: item.supplier || null,
            unit_price: item.unit_price || null,
            total_cost: qty * (item.unit_price || 0),
          };
        });

      setReorderSuggestions(suggestions);
    } catch (error: any) {
      console.error('Reorder suggestions fetch error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de calculer les suggestions de réapprovisionnement",
        variant: "destructive"
      });
      setReorderSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchReorderSuggestions();
  }, [fetchReorderSuggestions]);

  return {
    reorderSuggestions,
    loading,
    fetchReorderSuggestions
  };
};
