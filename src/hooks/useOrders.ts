
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
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

// Fonction pour jouer un son de notification
const playNotificationSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      const transformedOrders: Order[] = (data || []).map(order => ({
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

    // Écouter les nouvelles commandes en temps réel
    if (!user) return;

    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Nouvelle commande reçue:', payload);
          
          const newOrder = payload.new as any;
          const transformedOrder: Order = {
            id: newOrder.id,
            customer_name: newOrder.customer_name,
            customer_email: newOrder.customer_email,
            customer_phone: newOrder.customer_phone,
            items: Array.isArray(newOrder.items) ? (newOrder.items as unknown as OrderItem[]) : [],
            total_amount: Number(newOrder.total_amount),
            status: newOrder.status,
            notes: newOrder.notes,
            delivery_address: newOrder.delivery_address,
            delivery_time: newOrder.delivery_time,
            created_at: newOrder.created_at,
            table_number: newOrder.table_number,
            order_type: newOrder.order_type,
          };

          // Ajouter la nouvelle commande au début de la liste
          setOrders((prevOrders) => [transformedOrder, ...prevOrders]);

          // Jouer le son de notification
          playNotificationSound();

          // Afficher une notification toast
          toast({
            title: "🔔 Nouvelle commande reçue !",
            description: `Commande de ${newOrder.customer_name} - ${Number(newOrder.total_amount).toFixed(2)}€`,
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  return {
    orders,
    loading,
    refetch
  };
};

export type { Order };
