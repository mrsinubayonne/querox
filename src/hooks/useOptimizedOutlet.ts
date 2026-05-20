import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getSelectedOutletIdFromStorage, sanitizeStorageId } from '@/lib/offlineIdentity';
import { useOutletContext } from '@/contexts/OutletContext';

interface OutletCache {
  outletId: string | null;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'outlet_cache';

export const useOptimizedOutlet = () => {
  const { user, isTeamMember, teamMemberSession } = useAuth();
  const { selectedOutletId, setSelectedOutletId: setContextOutletId } = useOutletContext();
  const [outletId, setOutletId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getOutlet = async () => {
      if (!user) {
        setOutletId(null);
        setLoading(false);
        return;
      }

      if (selectedOutletId) {
        setOutletId(selectedOutletId);
        setLoading(false);
        return;
      }

      try {
        if (isTeamMember && teamMemberSession) {
          const teamOutletId = sanitizeStorageId(
            teamMemberSession.outletId || teamMemberSession.outletIds?.[0]
          );

          if (teamOutletId) {
            setContextOutletId(teamOutletId);
            localStorage.setItem(CACHE_KEY, JSON.stringify({ outletId: teamOutletId, timestamp: Date.now() }));
            setOutletId(teamOutletId);
            setLoading(false);
            return;
          }
        }

        const localOutletId = getSelectedOutletIdFromStorage();
        if (localOutletId) {
          setOutletId(localOutletId);
          setLoading(false);
          return;
        }

        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const parsedCache: OutletCache = JSON.parse(cached);
            const cachedOutletId = sanitizeStorageId(parsedCache.outletId);

            if (Date.now() - parsedCache.timestamp < CACHE_DURATION && cachedOutletId) {
              setContextOutletId(cachedOutletId);
              setOutletId(cachedOutletId);
              setLoading(false);
              return;
            }
          } catch {
            localStorage.removeItem(CACHE_KEY);
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
        } else {
          const { data } = await supabase
            .from('user_profiles')
            .select('selected_outlet_id')
            .eq('user_id', user.id)
            .maybeSingle();
          outlet = data?.selected_outlet_id ?? null;
        }

        const sanitizedOutlet = sanitizeStorageId(outlet);
        const cacheData: OutletCache = {
          outletId: sanitizedOutlet ?? null,
          timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        if (sanitizedOutlet) {
          setContextOutletId(sanitizedOutlet);
        }

        setOutletId(sanitizedOutlet ?? null);
      } catch (error) {
        console.warn('[useOptimizedOutlet] Error fetching outlet:', error);
        setOutletId(getSelectedOutletIdFromStorage() ?? null);
      } finally {
        setLoading(false);
      }
    };

    getOutlet();
  }, [user, isTeamMember, teamMemberSession, selectedOutletId, setContextOutletId]);

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
  };

  return { outletId, loading, clearCache };
};
