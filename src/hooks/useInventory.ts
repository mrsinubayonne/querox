
import { useState, useEffect } from 'react';
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
  unit_price?: number;
  created_at: string;
  updated_at: string;
}

interface StockMovement {
  id: string;
  item_id: string;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason?: string;
  created_at: string;
}

export const useInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchItems = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger l'inventaire",
        variant: "destructive"
      });
    }
  };

  const fetchMovements = async (itemId?: string) => {
    if (!user) return;
    
    try {
      let query = supabase.from('stock_movements').select('*');
      
      if (itemId) {
        query = query.eq('item_id', itemId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setMovements(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les mouvements",
        variant: "destructive"
      });
    }
  };

  const createItem = async (itemData: Partial<InventoryItem>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([{ ...itemData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setItems(prev => [...prev, data]);
      toast({
        title: "Succès",
        description: "Produit créé avec succès"
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le produit",
        variant: "destructive"
      });
    }
  };

  const updateStock = async (itemId: string, newStock: number, reason?: string) => {
    if (!user) return;

    try {
      // Récupérer le stock actuel
      const { data: currentItem, error: fetchError } = await supabase
        .from('inventory_items')
        .select('current_stock')
        .eq('id', itemId)
        .single();

      if (fetchError) throw fetchError;

      const difference = newStock - currentItem.current_stock;
      const movementType = difference > 0 ? 'in' : difference < 0 ? 'out' : 'adjustment';

      // Mettre à jour le stock
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({ current_stock: newStock })
        .eq('id', itemId);

      if (updateError) throw updateError;

      // Créer le mouvement
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert([{
          item_id: itemId,
          movement_type: movementType,
          quantity: Math.abs(difference),
          reason: reason || `Ajustement de stock`
        }]);

      if (movementError) throw movementError;

      await fetchItems();
      await fetchMovements();
      
      toast({
        title: "Succès",
        description: "Stock mis à jour avec succès"
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le stock",
        variant: "destructive"
      });
    }
  };

  const getLowStockItems = () => {
    return items.filter(item => item.current_stock <= item.min_stock);
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchItems(), fetchMovements()])
        .finally(() => setLoading(false));
    }
  }, [user]);

  return {
    items,
    movements,
    loading,
    fetchItems,
    fetchMovements,
    createItem,
    updateStock,
    getLowStockItems
  };
};
