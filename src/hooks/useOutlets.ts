// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useSubscription } from './useSubscription';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { getData, storeData } from '@/lib/offlineStorage';
import { useOutletContext } from '@/contexts/OutletContext';

const OUTLET_LIMITS = {
  'starter': 1,
  'premium': 2,
  'pro': 3,
  'entreprise': 3
};

export interface Outlet {
  id: string;
  user_id: string;
  name: string;
  address: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

type CreateOutletData = Pick<Outlet, 'name' | 'address' | 'phone'>;
type UpdateOutletData = Partial<Pick<Outlet, 'name' | 'address' | 'phone'>>;

export const useOutlets = () => {
  const { setSelectedOutletId: setContextOutletId } = useOutletContext();
  const { user, isTeamMember, teamMemberSession } = useAuth();
  const { subscription, refetch: refetchSubscription } = useSubscription();
  const { isOffline } = useNetworkStatus();
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [selectedOutletId, setSelectedOutletId] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for profile changes in localStorage
  useEffect(() => {
    const profileId = localStorage.getItem('selectedProfileId');
    setSelectedProfileId(profileId);
    
    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedProfileId') {
        setSelectedProfileId(e.newValue);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getOutletLimit = () => {
    const tier = subscription?.subscription_tier || 'starter';
    return OUTLET_LIMITS[tier as keyof typeof OUTLET_LIMITS] || 1;
  };

  const canAddMoreOutlets = () => {
    if (isTeamMember) return false;
    const limit = getOutletLimit();
    return outlets.length < limit;
  };

  const loadOutlets = async (): Promise<void> => {
    // Determine which user_id to use
    let userId = user?.id;
    
    // If team member, use owner_id instead
    if (isTeamMember && teamMemberSession) {
      userId = teamMemberSession.ownerId;
    }

    if (!userId) {
      console.log('⚠️ loadOutlets: No user ID available');
      setLoading(false);
      return;
    }

    // Offline: load outlets from cache to avoid blocking route guards
    if (isOffline) {
      try {
        console.log('📴 Offline: loading outlets from cache');
        const cached = await getData<Outlet[]>('outlets', userId);
        setOutlets(cached?.data || []);

        // Ensure we still have a selected outlet for ProtectedRoute fallback
        const localSelected = localStorage.getItem('selectedOutletId');
        if (localSelected) {
          setSelectedOutletId(localSelected);
        }
      } catch (error) {
        console.warn('⚠️ Offline: failed to read outlets cache', error);
        setOutlets([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      console.log('🔄 Loading outlets for user:', userId);

      let query = supabase
        .from('outlets')
        .select('*')
        .eq('user_id', userId);

      if (isTeamMember && teamMemberSession) {
        const assignedOutletIds = (teamMemberSession.outletIds || [])
          .filter(Boolean);
        const fallbackOutletId = teamMemberSession.outletId || localStorage.getItem('selectedOutletId');
        const scopedOutletIds = assignedOutletIds.length ? assignedOutletIds : (fallbackOutletId ? [fallbackOutletId] : []);

        if (scopedOutletIds.length === 0) {
          console.warn('⚠️ Team member has no assigned outlet; refusing outlet creation flow');
          setOutlets([]);
          setSelectedOutletId(null);
          setLoading(false);
          return;
        }

        query = query.in('id', scopedOutletIds);
      }

      const { data, error } = await query.order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching outlets:', error);
        // Ne pas montrer d'erreur pour les erreurs RLS bénignes
        if (error.code === 'PGRST116' || error.code === '42501') {
          console.log('ℹ️ RLS/Permission issue - user may need to re-authenticate');
          setOutlets([]);
          setLoading(false);
          return;
        }
        throw error;
      }
      
      console.log('✅ Outlets loaded:', data?.length || 0);
      setOutlets(data || []);

      // Cache for offline usage (NOT outlet-scoped)
      await storeData('outlets', data || [], userId);
      
      // Auto-select first outlet if only one exists and none is selected
      if (data && data.length === 1 && !selectedOutletId) {
        await selectOutlet(data[0].id, true);
      }
    } catch (error: any) {
      console.error('❌ Error loading outlets:', error);

      // Fallback to cache even if online fetch fails (unstable connection)
      try {
        const cached = await getData<Outlet[]>('outlets', userId);
        if (cached?.data?.length) {
          console.log('↩️ Using cached outlets after fetch error');
          setOutlets(cached.data);
        }
      } catch {
        // ignore
      }

      // Message d'erreur plus explicite
      const msg = error?.message || '';
      if (msg.includes('JWT') || msg.includes('token') || msg.includes('session')) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
      } else {
        toast.error('Erreur lors du chargement des points de vente. Rechargez la page.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedOutlet = async (): Promise<void> => {
    if (isTeamMember && teamMemberSession) {
      const assignedOutletId = teamMemberSession.outletId || teamMemberSession.outletIds?.[0] || null;
      setSelectedOutletId(assignedOutletId ?? null);
      if (assignedOutletId) {
        setContextOutletId(assignedOutletId);
      } else {
        setContextOutletId(null);
      }
      return;
    }

    if (!user?.id) return;

    const fallbackLocal = typeof window !== 'undefined' ? localStorage.getItem('selectedOutletId') : null;

    // Offline: rely on localStorage only
    if (isOffline) {
      setSelectedOutletId(fallbackLocal ?? null);
      return;
    }

    try {
      // Get the selected profile ID from localStorage
      const profileId = localStorage.getItem('selectedProfileId');
      if (!profileId) {
        // No profile selected - use localStorage as source of truth
        setSelectedOutletId(fallbackLocal ?? null);
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('selected_outlet_id')
        .eq('id', profileId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching selected outlet:', error);
        setSelectedOutletId(fallbackLocal ?? null);
        return;
      }
      
      const resolved = (data?.selected_outlet_id as string | null) ?? fallbackLocal ?? null;
      setSelectedOutletId(resolved);
      // Keep localStorage in sync
      if (resolved) {
        localStorage.setItem('selectedOutletId', resolved);
        setContextOutletId(resolved);
      }
    } catch (error) {
      console.error('Error:', error);
      setSelectedOutletId(fallbackLocal ?? null);
    }
  };

  useEffect(() => {
    if (isTeamMember && teamMemberSession) {
      // Pour les membres d'équipe, utiliser l'outlet de leur session
      const outletId = teamMemberSession.outletId || teamMemberSession.outletIds?.[0] || null;
      if (outletId) {
        setSelectedOutletId(outletId);
        setContextOutletId(outletId);
      } else {
        setSelectedOutletId(null);
        setContextOutletId(null);
      }
      // Charger les outlets du propriétaire
      loadOutlets();
    } else if (user?.id) {
      loadOutlets();
      loadSelectedOutlet();
    }
  }, [user?.id, isTeamMember, teamMemberSession, isOffline]);

  // Recharger le outlet sélectionné quand le profil change
  useEffect(() => {
    if (selectedProfileId && user?.id) {
      loadSelectedOutlet();
    }
  }, [selectedProfileId, user?.id]);

  const createOutlet = async (outletData: CreateOutletData): Promise<Outlet | undefined> => {
    if (isTeamMember) {
      toast.error("Action non autorisée: un membre d'équipe ne peut pas créer de point de vente.");
      return undefined;
    }

    if (isOffline) {
      toast.error('Impossible de créer un point de vente hors ligne');
      return undefined;
    }
    // Determine which user_id to use
    let userId = user?.id;
    
    // If team member, use owner_id instead
    if (isTeamMember && teamMemberSession) {
      userId = teamMemberSession.ownerId;
    }

    if (!userId) return undefined;

    if (!canAddMoreOutlets()) {
      const limit = getOutletLimit();
      toast.error(
        `Limite atteinte - Votre plan ${subscription?.subscription_tier || 'starter'} permet jusqu'à ${limit} point(s) de vente. Passez à un plan supérieur pour en ajouter plus.`
      );
      return undefined;
    }

    try {
      const { data, error } = await supabase
        .from('outlets')
        .insert({
          user_id: userId,
          name: outletData.name,
          address: outletData.address,
          phone: outletData.phone
        })
        .select()
        .single();

      if (error) throw error;

      // ✅ Sélection optimiste IMMÉDIATE pour débloquer la création de menu
      setSelectedOutletId(data.id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedOutletId', data.id);
        setContextOutletId(data.id);
        localStorage.removeItem('outlet_cache');
      }
      // Ajout optimiste à la liste avant rechargement
      setOutlets((prev) => {
        if (prev.some((o) => o.id === data.id)) return prev;
        return [...prev, data as Outlet];
      });

      toast.success('Point de vente créé avec succès');

      // Persister la sélection (user_profiles) puis recharger la liste depuis le serveur
      await selectOutlet(data.id, true);
      await loadOutlets();

      return data;
    } catch (error: any) {
      console.error('Error creating outlet:', error);
      const msg = typeof error?.message === 'string' ? error.message : '';
      if (msg.toLowerCase().includes('row-level security') || error?.code === '42501') {
        toast.error("Accès refusé: vérifiez que vous êtes connecté avec le compte propriétaire ou que votre invitation d'équipe est acceptée.");
      } else {
        toast.error(`Erreur lors de la création du point de vente${msg ? `: ${msg}` : ''}`);
      }
      return undefined;
    }
  };

  const updateOutlet = async (id: string, updates: UpdateOutletData): Promise<void> => {
    if (isOffline) {
      toast.error('Impossible de modifier un point de vente hors ligne');
      return;
    }
    try {
      const { error } = await supabase
        .from('outlets')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Point de vente mis à jour');
      await loadOutlets();
    } catch (error) {
      console.error('Error updating outlet:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const deleteOutlet = async (id: string): Promise<void> => {
    if (isOffline) {
      toast.error('Impossible de supprimer un point de vente hors ligne');
      throw new Error('Suppression impossible hors ligne');
    }
    let userId = user?.id;
    if (isTeamMember && teamMemberSession) userId = teamMemberSession.ownerId;
    if (!userId) throw new Error('Session utilisateur introuvable');
    try {
      const { error } = await supabase
        .from('outlets')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      setOutlets((prev) => prev.filter((outlet) => outlet.id !== id));
      if (selectedOutletId === id) {
        setSelectedOutletId(null);
        localStorage.removeItem('selectedOutletId');
        localStorage.removeItem('outlet_cache');
      }
      const cached = await getData<Outlet[]>('outlets', userId);
      if (cached?.data) await storeData('outlets', cached.data.filter((outlet) => outlet.id !== id), userId);
      toast.success('Point de vente supprimé');
      await loadOutlets();
    } catch (error: any) {
      console.error('Error deleting outlet:', error);
      const msg = error?.code === '23503'
        ? 'Ce point de vente contient encore des données liées. Réessayez maintenant.'
        : error?.message || 'Erreur lors de la suppression';
      toast.error(msg);
      throw error;
    }
  };

  const selectOutlet = async (outletId: string, silent = false): Promise<void> => {
    if (isTeamMember && teamMemberSession) {
      const allowedOutletIds = (teamMemberSession.outletIds || []).filter(Boolean);
      const isAllowed = allowedOutletIds.length > 0
        ? allowedOutletIds.includes(outletId)
        : teamMemberSession.outletId === outletId;

      if (!isAllowed) {
        toast.error("Accès refusé: ce point de vente n'est pas assigné à ce membre équipe.");
        return;
      }

      setSelectedOutletId(outletId);
      localStorage.setItem('selectedOutletId', outletId);
      setContextOutletId(outletId);
      localStorage.removeItem('outlet_cache');
      if (!silent) {
        toast.success('Point de vente sélectionné');
      }
      return;
    }

    if (!user?.id) return;

    // Offline: keep it local only
    if (isOffline) {
      setSelectedOutletId(outletId);
      localStorage.setItem('selectedOutletId', outletId);
      setContextOutletId(outletId);
      localStorage.removeItem('outlet_cache');
      if (!silent) {
        toast.success('Point de vente sélectionné (hors ligne)');
      }
      return;
    }

    try {
      // Get the selected profile ID from localStorage
      const selectedProfileId = localStorage.getItem('selectedProfileId');
      if (!selectedProfileId) {
        // Si pas de profil sélectionné, juste stocker l'outlet ID localement
        setSelectedOutletId(outletId);
        localStorage.setItem('selectedOutletId', outletId);
        setContextOutletId(outletId);
        localStorage.removeItem('outlet_cache');
        if (!silent) {
          toast.success('Point de vente sélectionné');
        }
        // Refetch subscription après changement de PDV
        console.log('🔄 Refetch abonnement après sélection PDV:', outletId);
        await refetchSubscription();
        return;
      }

      // Update the selected_outlet_id on the user_profile
      const { error } = await supabase
        .from('user_profiles')
        .update({ selected_outlet_id: outletId })
        .eq('id', selectedProfileId);

      if (error) throw error;
      
      setSelectedOutletId(outletId);
      localStorage.setItem('selectedOutletId', outletId);
      setContextOutletId(outletId);
      // Invalidate optimized outlet cache
      localStorage.removeItem('outlet_cache');
      if (!silent) {
        toast.success('Point de vente sélectionné');
      }
      
      // Refetch subscription après changement de PDV
      console.log('🔄 Refetch abonnement après sélection PDV:', outletId);
      await refetchSubscription();
    } catch (error) {
      console.error('Error selecting outlet:', error);
      if (!silent) {
        toast.error('Erreur lors de la sélection');
      }
    }
  };

  return {
    outlets,
    selectedOutletId,
    loading,
    createOutlet,
    updateOutlet,
    deleteOutlet,
    selectOutlet,
    refetch: loadOutlets,
    canAddMoreOutlets,
    getOutletLimit
  };
};
