import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/**
 * Hook qui démarre automatiquement une période d'activité lorsqu'une transaction
 * ou facture est payée alors qu'aucune période n'est active
 */
export const useAutoStartPeriod = (outletId?: string) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !outletId) return;

    // Fonction pour vérifier et démarrer une période si nécessaire
    const checkAndStartPeriod = async () => {
      try {
        // Vérifier s'il y a une période active
        const { data: activePeriod } = await supabase
          .from('business_periods')
          .select('id')
          .eq('user_id', user.id)
          .eq('outlet_id', outletId)
          .is('ended_at', null)
          .maybeSingle();

        // Si pas de période active, en créer une
        if (!activePeriod) {
          const { data: newPeriod, error } = await supabase
            .from('business_periods')
            .insert({
              user_id: user.id,
              outlet_id: outletId,
              started_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) throw error;

          if (newPeriod) {
            // Stocker l'ID de la période dans localStorage avec user_id pour éviter les conflits
            localStorage.setItem(`active_period_${user.id}_${outletId}`, newPeriod.id);
            
            toast.success('Période d\'activité démarrée automatiquement', {
              description: 'Une nouvelle période a été créée pour enregistrer cette transaction.',
            });
          }
        }
      } catch (error) {
        console.error('Error auto-starting period:', error);
      }
    };

    // Écouter les nouvelles factures payées
    const invoiceChannel = supabase
      .channel(`auto-start-period-invoices-${user.id}-${outletId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'invoices',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          if (payload.new?.outlet_id === outletId && payload.new?.status === 'paid') {
            console.log('📋 Facture payée détectée - Vérification de la période...');
            await checkAndStartPeriod();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'invoices',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          // Si la facture vient d'être marquée comme payée ET appartient au bon outlet
          if (payload.new?.outlet_id === outletId && payload.new?.status === 'paid' && payload.old?.status !== 'paid') {
            console.log('📋 Facture mise à jour comme payée - Vérification de la période...');
            await checkAndStartPeriod();
          }
        }
      )
      .subscribe();

    // Écouter les nouvelles transactions avec statut completed
    const transactionChannel = supabase
      .channel(`auto-start-period-transactions-${user.id}-${outletId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          if (payload.new?.outlet_id === outletId && payload.new?.status === 'completed') {
            console.log('💰 Transaction complétée détectée - Vérification de la période...');
            await checkAndStartPeriod();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          // Si la transaction vient d'être marquée comme complétée ET appartient au bon outlet
          if (payload.new?.outlet_id === outletId && payload.new?.status === 'completed' && payload.old?.status !== 'completed') {
            console.log('💰 Transaction mise à jour comme complétée - Vérification de la période...');
            await checkAndStartPeriod();
          }
        }
      )
      .subscribe();

    // Écouter les nouvelles commandes
    const orderChannel = supabase
      .channel(`auto-start-period-orders-${user.id}-${outletId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          if (payload.new?.outlet_id === outletId) {
            console.log('🛒 Nouvelle commande détectée - Vérification de la période...');
            await checkAndStartPeriod();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(invoiceChannel);
      supabase.removeChannel(transactionChannel);
      supabase.removeChannel(orderChannel);
    };
  }, [user, outletId]);
};
