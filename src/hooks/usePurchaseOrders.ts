import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useOutletContext } from '@/contexts/OutletContext';

interface PurchaseOrder {
  id: string;
  user_id: string;
  outlet_id: string | null;
  supplier_id: string | null;
  order_number: string;
  status: string;
  order_date: string;
  expected_delivery_date: string | null;
  actual_delivery_date: string | null;
  items: any[];
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  suppliers?: {
    name: string;
    contact_person: string | null;
    phone: string | null;
  };
}

export const usePurchaseOrders = () => {
  const { selectedOutletId: ctxOutletId } = useOutletContext();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const fetchOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
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
        .from('purchase_orders')
        .select('*, suppliers(name, contact_person, phone)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (outletId) {
        query = query.eq('outlet_id', outletId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setOrders((data || []) as PurchaseOrder[]);
    } catch (error: any) {
      console.error('Purchase orders fetch error:', error);
      toast.error("Erreur", { description: "Impossible de charger les commandes" });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createOrder = async (orderData: Omit<PurchaseOrder, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'order_number'>) => {
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

      // Générer le numéro de commande
      const { data: orderNumber } = await supabase.rpc('generate_purchase_order_number');

      const { data, error } = await supabase
        .from('purchase_orders')
        .insert({
          ...orderData,
          user_id: user.id,
          outlet_id: outletId,
          order_number: orderNumber || `PO-${Date.now()}`
        })
        .select()
        .single();

      if (error) throw error;

      await fetchOrders();
      toast.success("Succès", { description: "Commande créée avec succès" });
      return data;
    } catch (error: any) {
      console.error('Create order error:', error);
      toast.error("Erreur", { description: "Impossible de créer la commande" });
      return false;
    }
  };

  const updateOrder = async (id: string, updates: Partial<PurchaseOrder>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchOrders();
      toast.success("Succès", { description: "Commande mise à jour" });
      return data;
    } catch (error: any) {
      console.error('Update order error:', error);
      toast.error("Erreur", { description: "Impossible de mettre à jour la commande" });
      return false;
    }
  };

  const deleteOrder = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchOrders();
      toast.success("Succès", { description: "Commande supprimée" });
      return true;
    } catch (error: any) {
      console.error('Delete order error:', error);
      toast.error("Erreur", { description: "Impossible de supprimer la commande" });
      return false;
    }
  };

  useEffect(() => {
    fetchOrders();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('purchase-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'purchase_orders',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders, user?.id]);

  return {
    orders,
    loading,
    fetchOrders,
    createOrder,
    updateOrder,
    deleteOrder
  };
};
