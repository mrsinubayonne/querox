
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Order as BaseOrder } from '@/components/orders/OrderCard';

export type Order = BaseOrder & {
  table_number?: string | null;
  order_type?: string | null;
};

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchOrders = async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      const transformedOrders = (data || []).map(order => ({
        id: order.id,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        items: order.items || [],
        total_amount: Number(order.total_amount),
        status: order.status,
        notes: order.notes,
        delivery_address: order.delivery_address,
        delivery_time: order.delivery_time,
        created_at: order.created_at,
        table_number: order.table_number,
        order_type: order.order_type,
      }));

      setOrders(transformedOrders);
    } catch (error: any) {
      console.error('Orders fetch error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commandes",
        variant: "destructive"
      });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    return fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  return {
    orders,
    loading,
    refetch
  };
};
