import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificationStore } from '@/store/notificationStore';
import { toast } from 'sonner';

const playOrderSound = () => {
  try {
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
    if (!Ctx) return;
    const ctx = new Ctx();
    const tone = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.45, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + dur);
      osc.start(start);
      osc.stop(start + dur);
    };
    const t0 = ctx.currentTime;
    tone(880, t0, 0.18);
    tone(1175, t0 + 0.18, 0.22);
    tone(1568, t0 + 0.4, 0.25);
  } catch {
    /* noop */
  }
};

/**
 * Subscribes globally to new public-menu orders for the authenticated owner
 * and notifies the user (sound + 3s toast + badge counter).
 * Mounted once at the app root (inside AuthProvider).
 */
export function useGlobalNewOrderNotifier() {
  const { user } = useAuth();
  const location = useLocation();
  const increment = useNotificationStore((s) => s.increment);
  const startupRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`global-public-orders-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const order = payload.new as any;
          // Only public-menu orders
          if (order?.source !== 'public') return;
          // Ignore historical inserts that may arrive on (re)subscribe
          if (order?.created_at) {
            const createdAt = new Date(order.created_at).getTime();
            if (createdAt < startupRef.current - 60_000) return;
          }

          playOrderSound();
          increment();

          const total = Number(order?.total_amount || 0);
          const customer = order?.customer_name || 'Client';
          const typeLabel =
            order?.order_type === 'sur_place'
              ? `Table ${order?.table_number || ''}`.trim()
              : order?.order_type === 'emporter'
              ? 'À emporter'
              : order?.order_type === 'livrer'
              ? 'À livrer'
              : 'Nouvelle commande';

          toast.success('🔔 Nouvelle commande publique', { description: `${customer} — ${typeLabel} — ${total} XAF` });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, increment]);

  // Reset counter when user lands on /commandes
  useEffect(() => {
    if (location.pathname === '/commandes') {
      useNotificationStore.getState().reset();
    }
  }, [location.pathname]);
}
