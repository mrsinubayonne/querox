import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface OutletCache {
  outletId: string | null;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'outlet_cache';

export const useOptimizedOutlet = () => {
  const { user } = useAuth();
  const [outletId, setOutletId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getOutlet = async () => {
      if (!user) {
        setOutletId(null);
        setLoading(false);
        return;
      }

      try {
        // Always check localStorage first as primary source of truth
        const localOutletId = localStorage.getItem('selectedOutletId');
        if (localOutletId) {
          setOutletId(localOutletId);
          setLoading(false);
          return;
        }

        // Vérifier le cache
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const parsedCache: OutletCache = JSON.parse(cached);
            if (Date.now() - parsedCache.timestamp < CACHE_DURATION) {
              setOutletId(parsedCache.outletId);
              setLoading(false);
              return;
            }
          } catch (e) {
            // Cache invalide, on continue
          }
        }

        // Obtenir l'outlet depuis la DB
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

        // Mettre en cache
        const cacheData: OutletCache = {
          outletId: outlet,
          timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        if (outlet) {
          localStorage.setItem('selectedOutletId', outlet);
        }

        setOutletId(outlet);
      } catch (error) {
        console.warn('[useOptimizedOutlet] Error fetching outlet:', error);
        // Fallback to localStorage even if DB fails
        const fallback = localStorage.getItem('selectedOutletId');
        setOutletId(fallback);
      } finally {
        setLoading(false);
      }
    };

    getOutlet();
  }, [user]);

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
  };

  return { outletId, loading, clearCache };
};
