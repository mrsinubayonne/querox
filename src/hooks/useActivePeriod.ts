import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to get the active business period for a given outlet
 * Returns the period ID that should be used for all transactions
 * Persists across reconnections via localStorage
 */
export const useActivePeriod = (outletId?: string) => {
  const { user } = useAuth();
  const [activePeriodId, setActivePeriodId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !outletId) return;

    const checkActivePeriod = async () => {
      try {
        // Try to get from localStorage first
        const storedPeriodId = localStorage.getItem(`active_period_${user.id}_${outletId}`);
        
        if (storedPeriodId) {
          // Verify that this period is still active in the database AND belongs to current user/outlet
          const { data, error } = await supabase
            .from('business_periods')
            .select('id')
            .eq('id', storedPeriodId)
            .eq('user_id', user.id)
            .eq('outlet_id', outletId)
            .is('ended_at', null)
            .maybeSingle();

          if (!error && data) {
            setActivePeriodId(data.id);
            return;
          } else {
            // Period is closed or doesn't exist, clear localStorage
            localStorage.removeItem(`active_period_${user.id}_${outletId}`);
          }
        }

        // Fetch active period from database
        const { data: activePeriod, error } = await supabase
          .from('business_periods')
          .select('id')
          .eq('user_id', user.id)
          .eq('outlet_id', outletId)
          .is('ended_at', null)
          .order('started_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching active period:', error);
          return;
        }

        if (activePeriod) {
          setActivePeriodId(activePeriod.id);
          localStorage.setItem(`active_period_${user.id}_${outletId}`, activePeriod.id);
        }
      } catch (error) {
        console.error('Error checking active period:', error);
      }
    };

    checkActivePeriod();

    // Listen for period changes in real-time
    const channel = supabase
      .channel(`active-period-changes-${user.id}-${outletId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'business_periods',
          filter: `user_id=eq.${user.id},outlet_id=eq.${outletId}`,
        },
        (payload: any) => {
          if (payload.new?.ended_at === null && payload.new?.outlet_id === outletId) {
            // New period started for this outlet
            setActivePeriodId(payload.new.id);
            localStorage.setItem(`active_period_${user.id}_${outletId}`, payload.new.id);
          } else if (payload.new?.ended_at !== null && payload.new?.id === activePeriodId) {
            // Current period was closed
            setActivePeriodId(null);
            localStorage.removeItem(`active_period_${user.id}_${outletId}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, outletId, activePeriodId]);

  return { activePeriodId };
};
