import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useOfflineData } from './useOfflineData';
import { useOfflineInsert, useOfflineUpdate, useOfflineDelete } from './useOfflineMutation';
import { toast } from 'sonner';
import { useOutletContext } from '@/contexts/OutletContext';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email?: string | null;
  customer_phone?: string | null;
  items: OrderItem[];
  total_amount: number;
  status: string;
  notes?: string | null;
  delivery_address?: string | null;
  delivery_time?: string | null;
  created_at: string;
  table_number?: string | null;
  order_type?: string | null;
  user_id?: string;
  outlet_id?: string | null;
}

const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playTone = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.4, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    const now = audioContext.currentTime;
    playTone(587.33, now, 0.15);
    playTone(783.99, now + 0.15, 0.2);
  } catch (error) {
    console.error('Erreur son:', error);
  }
};

export const useOptimizedOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { selectedOutletId } = useOutletContext();
  const outletId = selectedOutletId || undefined;

  const { data: orders, isLoading, refetch, isOffline } = useOfflineData<Order>({
    table: 'orders',
    queryKey: ['orders', outletId ?? 'no-outlet'],
    buildQuery: async (userId, outletId) => {
      if (!outletId) return { data: [], error: null };
      
      const { data, error } = await supabase
        .from('orders')
        .select('id, customer_name, customer_email, customer_phone, items, total_amount, status, notes, delivery_address, delivery_time, created_at, table_number, order_type, user_id, outlet_id')
        .eq('user_id', userId)
        .eq('outlet_id', outletId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) return { data: null, error };

      const transformed = (data || []).map(order => ({
        id: order.id,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        items: Array.isArray(order.items) ? (order.items as unknown as OrderItem[]) : [],
        total_amount: Number(order.total_amount),
        status: order.status,
        notes: order.notes,
        delivery_address: order.delivery_address,
        delivery_time: order.delivery_time,
        created_at: order.created_at,
        table_number: order.table_number,
        order_type: order.order_type,
        user_id: order.user_id,
        outlet_id: order.outlet_id,
      }));

      return { data: transformed, error: null };
    },
    enabled: !!user,
  });

  // Offline mutations
  const insertMutation = useOfflineInsert({
    table: 'orders',
    queryKey: ['orders', outletId ?? 'no-outlet'],
  });

  const updateMutation = useOfflineUpdate({
    table: 'orders',
    queryKey: ['orders', outletId ?? 'no-outlet'],
  });

  const deleteMutation = useOfflineDelete({
    table: 'orders',
    queryKey: ['orders', outletId ?? 'no-outlet'],
  });

  useEffect(() => {
    if (!user || isOffline) return;

    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${user.id}`
      }, async (payload) => {
        const newOrder = payload.new as any;
        queryClient.setQueryData(['orders', user.id, outletId], (old: Order[] = []) => [{
          id: newOrder.id,
          customer_name: newOrder.customer_name,
          customer_email: newOrder.customer_email,
          customer_phone: newOrder.customer_phone,
          items: Array.isArray(newOrder.items) ? newOrder.items : [],
          total_amount: Number(newOrder.total_amount),
          status: newOrder.status,
          notes: newOrder.notes,
          delivery_address: newOrder.delivery_address,
          delivery_time: newOrder.delivery_time,
          created_at: newOrder.created_at,
          table_number: newOrder.table_number,
          order_type: newOrder.order_type,
        }, ...old]);

        playNotificationSound();
        toast.success("🔔 Nouvelle commande !", { description: `${newOrder.customer_name} - ${Number(newOrder.total_amount).toFixed(2)}€` });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient, toast, outletId, isOffline]);

  return {
    orders,
    loading: isLoading,
    isOffline,
    refetch,
    createOrder: insertMutation.mutate,
    updateOrder: updateMutation.mutate,
    deleteOrder: deleteMutation.mutate,
  };
};
