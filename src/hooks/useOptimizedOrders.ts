import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getOutletId = async () => {
    const selectedProfileId = localStorage.getItem('selectedProfileId');
    if (selectedProfileId) {
      const { data } = await supabase
        .from('user_profiles')
        .select('selected_outlet_id')
        .eq('id', selectedProfileId)
        .maybeSingle();
      if (data?.selected_outlet_id) return data.selected_outlet_id;
    }
    return localStorage.getItem('selectedOutletId');
  };

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const outletId = await getOutletId();
      if (!outletId) return [];

      const { data, error } = await supabase
        .from('orders')
        .select('id, customer_name, customer_email, customer_phone, items, total_amount, status, notes, delivery_address, delivery_time, created_at, table_number, order_type')
        .eq('user_id', user.id)
        .eq('outlet_id', outletId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      return (data || []).map(order => ({
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
      }));
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${user.id}`
      }, async (payload) => {
        const newOrder = payload.new as any;
        queryClient.setQueryData(['orders', user.id], (old: Order[] = []) => [{
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
        toast({
          title: "🔔 Nouvelle commande !",
          description: `${newOrder.customer_name} - ${Number(newOrder.total_amount).toFixed(2)}€`,
          duration: 5000,
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient, toast]);

  if (error) {
    toast({
      title: "Erreur",
      description: "Impossible de charger les commandes",
      variant: "destructive"
    });
  }

  return {
    orders,
    loading: isLoading,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['orders', user?.id] })
  };
};
