import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InventoryLoss {
  id: string;
  inventory_item_id: string;
  user_id: string;
  outlet_id: string | null;
  quantity: number;
  loss_type: string;
  loss_category: string;
  cost_value: number | null;
  reason: string | null;
  recorded_by_user_id: string | null;
  loss_date: string;
  created_at: string;
  inventory_items?: {
    name: string;
    unit: string;
    unit_price: number | null;
  };
}

export const useInventoryLosses = () => {
  const [losses, setLosses] = useState<InventoryLoss[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const fetchLosses = useCallback(async () => {
    if (!user) {
      setLosses([]);
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
        outletId = ctxOutletId ?? null;
      }

      let query = supabase
        .from('inventory_losses')
        .select('*, inventory_items(name, unit, unit_price)')
        .eq('user_id', user.id)
        .order('loss_date', { ascending: false })
        .limit(200);

      if (outletId) {
        query = query.eq('outlet_id', outletId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setLosses((data || []) as InventoryLoss[]);
    } catch (error: any) {
      console.error('Losses fetch error:', error);
      toast.error("Erreur", { description: "Impossible de charger les pertes" });
      setLosses([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createLoss = async (lossData: Omit<InventoryLoss, 'id' | 'user_id' | 'created_at' | 'recorded_by_user_id'>) => {
    if (!user) return false;

    try {
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
        outletId = ctxOutletId ?? null;
      }

      const { data, error } = await supabase
        .from('inventory_losses')
        .insert({
          ...lossData,
          user_id: user.id,
          outlet_id: outletId,
          recorded_by_user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      await fetchLosses();
      toast.success("Succès", { description: "Perte enregistrée" });
      return data;
    } catch (error: any) {
      console.error('Create loss error:', error);
      toast.error("Erreur", { description: "Impossible d'enregistrer la perte" });
      return false;
    }
  };

  const deleteLoss = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('inventory_losses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchLosses();
      toast.success("Succès", { description: "Perte supprimée" });
      return true;
    } catch (error: any) {
      console.error('Delete loss error:', error);
      toast.error("Erreur", { description: "Impossible de supprimer la perte" });
      return false;
    }
  };

  const getTotalLossCost = useCallback(() => {
    return losses.reduce((sum, loss) => sum + (loss.cost_value || 0), 0);
  }, [losses]);

  const getLossesByCategory = useCallback(() => {
    const byCategory: Record<string, number> = {};
    losses.forEach(loss => {
      byCategory[loss.loss_category] = (byCategory[loss.loss_category] || 0) + (loss.cost_value || 0);
    });
    return byCategory;
  }, [losses]);

  useEffect(() => {
    fetchLosses();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('inventory-losses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory_losses',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          fetchLosses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLosses, user?.id]);

  return {
    losses,
    loading,
    fetchLosses,
    createLoss,
    deleteLoss,
    getTotalLossCost,
    getLossesByCategory
  };
};
