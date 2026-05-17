import { useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useOfflineData } from './useOfflineData';
import { useOfflineInsert, useOfflineUpdate, useOfflineDelete } from './useOfflineMutation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  current_stock: number;
  min_stock: number;
  unit: string;
  supplier?: string;
  supplier_id?: string;
  unit_price?: number;
  expiration_date?: string | null;
  batch_number?: string | null;
  created_at: string;
  updated_at: string;
  user_id?: string;
  outlet_id?: string | null;
}

export const useInventory = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const outletId = localStorage.getItem('selectedOutletId') || undefined;

  const { data: items, isLoading: loading, refetch: fetchItems, isOffline } = useOfflineData<InventoryItem>({
    table: 'inventory_items',
    queryKey: ['inventory'],
    buildQuery: async (userId, outletId) => {
      if (!outletId) return { data: [], error: null };
      
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, category, current_stock, min_stock, unit, supplier, supplier_id, unit_price, created_at, updated_at, user_id, outlet_id')
        .eq('user_id', userId)
        .eq('outlet_id', outletId)
        .order('updated_at', { ascending: false })
        .limit(200);

      return { data: data as InventoryItem[] | null, error };
    },
    enabled: !!user,
  });

  // Offline mutations
  const insertMutation = useOfflineInsert({
    table: 'inventory_items',
    queryKey: ['inventory', user?.id, outletId],
    onSuccess: () => {
      toast.success("Succès", { description: "Produit créé avec succès" });
    },
  });

  const updateMutation = useOfflineUpdate({
    table: 'inventory_items',
    queryKey: ['inventory', user?.id, outletId],
  });

  const deleteMutation = useOfflineDelete({
    table: 'inventory_items',
    queryKey: ['inventory', user?.id, outletId],
    onSuccess: () => {
      toast.success("Succès", { description: "Produit supprimé avec succès" });
    },
  });

  const createItem = useCallback(async (itemData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast.error("Erreur", { description: "Vous devez être connecté pour créer un produit" });
      return false;
    }

    if (!outletId) {
      toast.error("Erreur", { description: "Aucun point de vente sélectionné" });
      return false;
    }

    try {
      await insertMutation.mutateAsync({
        ...itemData,
        user_id: user.id,
        outlet_id: outletId,
        current_stock: itemData.current_stock || 0,
        min_stock: itemData.min_stock || 0,
        unit: itemData.unit || 'pcs'
      } as unknown as Record<string, unknown>);
      return true;
    } catch {
      return false;
    }
  }, [user, outletId, insertMutation, toast]);

  const updateItem = useCallback(async (id: string, updates: Partial<InventoryItem>) => {
    if (!user) return false;

    try {
      await updateMutation.mutateAsync({ id, ...updates } as unknown as Record<string, unknown> & { id: string });
      return true;
    } catch {
      toast.error("Erreur", { description: "Impossible de mettre à jour le produit" });
      return false;
    }
  }, [user, updateMutation, toast]);

  const deleteItem = useCallback(async (id: string) => {
    if (!user) return false;

    try {
      await deleteMutation.mutateAsync(id);
      return true;
    } catch {
      toast.error("Erreur", { description: "Impossible de supprimer le produit" });
      return false;
    }
  }, [user, deleteMutation, toast]);

  const getLowStockItems = useCallback(() => {
    return items.filter(item => item.current_stock <= item.min_stock);
  }, [items]);

  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Clean up previous channel if exists
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (!user?.id || isOffline) return;

    // Subscribe to realtime changes
    channelRef.current = supabase
      .channel(`inventory-changes-${user.id}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory_items',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Inventory updated, refetching...');
          queryClient.invalidateQueries({ queryKey: ['inventory', user.id, outletId] });
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id, outletId, isOffline, queryClient]);

  return {
    items,
    loading,
    isOffline,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    getLowStockItems
  };
};
