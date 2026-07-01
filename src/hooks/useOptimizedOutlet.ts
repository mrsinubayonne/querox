import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getSelectedOutletIdFromStorage, sanitizeStorageId } from '@/lib/offlineIdentity';

interface OutletCache {
  outletId: string | null;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'outlet_cache';

export const useOptimizedOutlet = () => {
  const { user, isTeamMember, teamMemberSession } = useAuth();
  const [outletId, setOutletId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const persistOutletId = (id: string | null) => {
    const sanitized = sanitizeStorageId(id ?? undefined) ?? null;

    if (sanitized) {
      localStorage.setItem('selectedOutletId', sanitized);
    } else {
      localStorage.removeItem('selectedOutletId');
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify({ outletId: sanitized, timestamp: Date.now() }));
    setOutletId(sanitized);
  };

  useEffect(() => {
    const getOutlet = async () => {
      if (!user) {
        setOutletId(null);
        setLoading(false);
        return;
      }

      try {
        if (isTeamMember && teamMemberSession) {
          const teamOutletId = sanitizeStorageId(
            teamMemberSession.outletId || teamMemberSession.outletIds?.[0]
          );

          if (teamOutletId) {
            localStorage.setItem('selectedOutletId', teamOutletId);
            localStorage.setItem(CACHE_KEY, JSON.stringify({ outletId: teamOutletId, timestamp: Date.now() }));
            setOutletId(teamOutletId);
            setLoading(false);
            return;
          }
        }

        const selectedProfileId = localStorage.getItem('selectedProfileId');
        let outlet: string | null = null;

        if (selectedProfileId) {
          const { data } = await supabase
            .from('user_profiles')
            .select('selected_outlet_id')
            .eq('id', selectedProfileId)
            .maybeSingle();
          outlet = data?.selected_outlet_id ?? null;
        }

        if (!outlet) {
          const { data } = await supabase
            .from('user_profiles')
            .select('selected_outlet_id')
            .eq('user_id', user.id)
            .maybeSingle();
          outlet = data?.selected_outlet_id ?? null;
        }

        if (!outlet) {
          const { data } = await supabase
            .from('profiles')
            .select('selected_outlet_id')
            .eq('id', user.id)
            .maybeSingle();
          outlet = data?.selected_outlet_id ?? null;
        }

        if (!outlet) {
          const { data } = await supabase
            .from('outlets')
            .select('id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle();
          outlet = data?.id ?? null;
        }

        const sanitizedOutlet = sanitizeStorageId(outlet);
        if (sanitizedOutlet) {
          await Promise.all([
            supabase
              .from('profiles')
              .update({ selected_outlet_id: sanitizedOutlet, updated_at: new Date().toISOString() })
              .eq('id', user.id),
            supabase
              .from('user_profiles')
              .update({ selected_outlet_id: sanitizedOutlet, updated_at: new Date().toISOString() })
              .eq('user_id', user.id)
              .is('selected_outlet_id', null)
          ]);
        }

        persistOutletId(sanitizedOutlet ?? null);
      } catch (error) {
        console.warn('[useOptimizedOutlet] Error fetching outlet:', error);
        setOutletId(getSelectedOutletIdFromStorage() ?? null);
      } finally {
        setLoading(false);
      }
    };

    getOutlet();
  }, [user, isTeamMember, teamMemberSession]);

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
  };

  return { outletId, loading, clearCache };
};
