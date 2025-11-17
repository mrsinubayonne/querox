
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { dataService } from '@/services/DataService';
import { syncService } from '@/services/SyncService';
import notificationSound from '@/assets/notification-sound.mp3';

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

// Fonction pour jouer un son de notification personnalisé
const playNotificationSound = () => {
  try {
    const audio = new Audio(notificationSound);
    audio.volume = 0.5; // Volume à 50%
    audio.play().catch(error => {
      console.error('Erreur lors de la lecture du son:', error);
    });
    console.log('🔔 Son de notification joué');
  } catch (error) {
    console.error('Erreur lors de la lecture du son:', error);
  }
};

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
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
        setOrders([]);
        setLoading(false);
        return;
      }
      
      // Utiliser le DataService qui gère automatiquement online/offline
      const data = await dataService.getAll<any>('orders', {
        user_id: user.id,
        outlet_id: outletId
      });

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
  }, [user, toast]);

  const refetch = () => {
    return fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
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
        async (payload) => {
          console.log('🆕 Nouvelle commande reçue:', payload);
          
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

          // Envoyer une notification par email
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', user.id)
              .single();

            if (profile?.email) {
              console.log('📧 Envoi de la notification par email...');
              await supabase.functions.invoke('send-order-notification', {
                body: { 
                  order: transformedOrder,
                  restaurantEmail: profile.email
                },
              });
              console.log('✅ Notification email envoyée');
            }
          } catch (emailError) {
            console.error('❌ Échec de l\'envoi de l\'email:', emailError);
          }
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
