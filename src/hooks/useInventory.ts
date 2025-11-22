
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
}

export const useInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchItems = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get selected outlet from localStorage
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
        setItems([]);
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, category, current_stock, min_stock, unit, supplier, supplier_id, unit_price, created_at, updated_at, user_id')
        .eq('user_id', user.id)
        .eq('outlet_id', outletId)
        .order('updated_at', { ascending: false })
        .limit(200);

      if (error) {
        console.error('Error fetching inventory:', error);
        throw error;
      }

      setItems((data || []) as InventoryItem[]);
    } catch (error: any) {
      console.error('Inventory fetch error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'inventaire",
        variant: "destructive"
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createItem = async (itemData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer un produit",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Get selected outlet from localStorage
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
        toast({
          title: "Erreur",
          description: "Aucun point de vente sélectionné",
          variant: "destructive"
        });
        return false;
      }
      
      const { data, error } = await supabase
        .from('inventory_items')
        .insert({ 
          ...itemData, 
          user_id: user.id,
          outlet_id: outletId,
          current_stock: itemData.current_stock || 0,
          min_stock: itemData.min_stock || 0,
          unit: itemData.unit || 'pcs'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating inventory item:', error);
        throw error;
      }

      setItems(prev => [...prev, data]);
      toast({
        title: "Succès",
        description: "Produit créé avec succès"
      });

      return data;
    } catch (error: any) {
      console.error('Inventory creation error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le produit",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setItems(prev => prev.map(item => item.id === id ? data : item));
      return data;
    } catch (error: any) {
      console.error('Update error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le produit",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteItem = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Succès",
        description: "Produit supprimé avec succès"
      });
      return true;
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit",
        variant: "destructive"
      });
      return false;
    }
  };

  const getLowStockItems = () => {
    return items.filter(item => item.current_stock <= item.min_stock);
  };

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    getLowStockItems
  };
};
