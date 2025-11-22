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

      if (!outletId) {
        setReorderSuggestions([]);
        return;
      }

      const { data, error } = await supabase.rpc('calculate_reorder_suggestions', {
        p_user_id: user.id,
        p_outlet_id: outletId
      });

      if (error) throw error;

      setReorderSuggestions((data || []) as ReorderSuggestion[]);
    } catch (error: any) {
      console.error('Reorder suggestions fetch error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de calculer les suggestions",
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
