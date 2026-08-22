/**
 * useOptimizedTableSessions — VERSION SERVEUR D'ABORD (réécriture complète)
 *
 * Principes:
 *  - La base de données est l'unique source de vérité. Aucun cache local "fantôme",
 *    aucun marqueur "payé" en localStorage, aucune file de mutations parallèle.
 *  - Le total d'une session est TOUJOURS recalculé à partir de ses commandes,
 *    ce qui supprime définitivement les tables "Occupée - 0 FCFA".
 *  - Temps réel: un seul canal Supabase (sessions + commandes) invalide la requête.
 *  - Hors ligne: lecture seule (dernier état connu via React Query), écriture bloquée
 *    avec un message clair.
 */
import { useCallback, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOutletContext } from '@/contexts/OutletContext';
import { useOptimizedOutlet } from '@/hooks/useOptimizedOutlet';
import { useNetworkStatus } from './useNetworkStatus';
import { resolveOfflineUserId, getSelectedOutletIdFromStorage } from '@/lib/offlineIdentity';
import { getSessionTableNumber, normalizeTableNumber } from '@/utils/tableNumbers';
import { removePendingMutationsByFilter } from '@/lib/offlineStorage';

export interface TableSession {
  id: string;
  user_id: string;
  outlet_id: string | null;
  debtor_id: string | null;
  table_number: string;
  custom_table_name?: string | null;
  status: 'active' | 'closed' | 'paid';
  started_at: string;
  closed_at: string | null;
  number_of_guests: number | null;
  total_amount: number;
  notes: string | null;
  payment_method?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderLineInput {
  id: string;
  name: string;
  price: number;
  quantity: number;
  selected_options?: unknown[];
}

const OFFLINE_MESSAGE =
  "Vous êtes hors ligne. Reconnectez-vous pour enregistrer cette action.";

/**
 * Purge unique des résidus de l'ancienne architecture local-first:
 * marqueurs "payé" et mutations en attente sur les tables/commandes qui
 * faisaient réapparaître de vieilles tables fantômes.
 */
const LEGACY_PURGE_KEY = 'querox_tables_legacy_purged_v2';
function purgeLegacyTableArtifacts() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(LEGACY_PURGE_KEY)) return;
  localStorage.setItem(LEGACY_PURGE_KEY, '1');
  localStorage.removeItem('querox_paid_session_ids_v1');
  void removePendingMutationsByFilter(
    (m) => m.table === 'table_sessions' || m.table === 'orders'
  ).catch(() => undefined);
}

export const useOptimizedTableSessions = () => {
  const { selectedOutletId } = useOutletContext();
  const { user, isTeamMember, teamMemberSession } = useAuth();
  const { loading: outletLoading } = useOptimizedOutlet();
  const { isOffline } = useNetworkStatus();
  const queryClient = useQueryClient();

  const userId =
    resolveOfflineUserId({
      userId: user?.id,
      isTeamMember,
      ownerId: teamMemberSession?.ownerId,
    }) || '';
  const outletId = selectedOutletId || getSelectedOutletIdFromStorage() || '';

  const queryKey = useMemo(
    () => ['table-sessions', userId, outletId] as const,
    [userId, outletId]
  );

  /** Lecture: sessions non payées + totaux recalculés depuis les commandes. */
  const fetchSessions = useCallback(async (): Promise<TableSession[]> => {
    if (!userId || !outletId) return [];

    const { data, error } = await supabase
      .from('table_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('outlet_id', outletId)
      .in('status', ['active', 'closed'])
      .order('started_at', { ascending: false })
      .limit(200);

    if (error) throw error;

    const list = ((data as unknown as TableSession[]) || []).map((s) => ({
      ...s,
      total_amount: Number(s.total_amount || 0),
    }));
    if (list.length === 0) return [];

    // Totaux réels = somme des commandes de la session.
    const { data: orderRows, error: ordersError } = await supabase
      .from('orders')
      .select('session_id, total_amount')
      .in('session_id', list.map((s) => s.id))
      .limit(10000);

    if (ordersError) throw ordersError;

    const totals = new Map<string, number>();
    for (const row of (orderRows as { session_id: string | null; total_amount: number | null }[]) || []) {
      if (!row.session_id) continue;
      totals.set(row.session_id, (totals.get(row.session_id) || 0) + Number(row.total_amount || 0));
    }

    return list.map((s) =>
      totals.has(s.id) ? { ...s, total_amount: totals.get(s.id) as number } : s
    );
  }, [userId, outletId]);

  const {
    data: sessions,
    isLoading,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: fetchSessions,
    enabled: !!userId && !!outletId,
    staleTime: 5_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  useEffect(() => {
    purgeLegacyTableArtifacts();
  }, []);

  /** Temps réel: un seul canal pour les sessions et les commandes du PDV. */
  useEffect(() => {
    if (!userId || !outletId) return;
    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey });
    };
    const channel = supabase
      .channel(`tables-${outletId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'table_sessions', filter: `outlet_id=eq.${outletId}` },
        invalidate
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `outlet_id=eq.${outletId}` },
        invalidate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, outletId, queryClient, queryKey]);

  const invalidateAll = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    await refetch();
  }, [queryClient, queryKey, refetch]);

  const assertReady = useCallback(() => {
    if (isOffline) throw new Error(OFFLINE_MESSAGE);
    if (!userId) throw new Error('Non authentifié.');
    if (!outletId) throw new Error('Aucun point de vente sélectionné.');
  }, [isOffline, userId, outletId]);

  /** Recalcule et persiste le total d'une session à partir de ses commandes. */
  const syncSessionTotal = useCallback(async (sessionId: string): Promise<number> => {
    const { data } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('session_id', sessionId)
      .limit(10000);
    const total = ((data as { total_amount: number | null }[]) || []).reduce(
      (sum, o) => sum + Number(o.total_amount || 0),
      0
    );
    await supabase
      .from('table_sessions')
      .update({ total_amount: total, updated_at: new Date().toISOString() })
      .eq('id', sessionId);
    return total;
  }, []);

  // ---------------------------------------------------------------- mutations

  const createSessionMutation = useMutation({
    mutationFn: async ({
      tableNumber,
      numberOfGuests,
      notes,
      debtorId,
    }: {
      tableNumber: string;
      numberOfGuests?: number;
      notes?: string;
      debtorId?: string;
    }) => {
      assertReady();
      const { data, error } = await supabase
        .from('table_sessions')
        .insert([
          {
            user_id: userId,
            outlet_id: outletId,
            table_number: tableNumber,
            number_of_guests: numberOfGuests ?? null,
            notes: notes ?? null,
            debtor_id: debtorId ?? null,
            status: 'active',
            total_amount: 0,
          },
        ])
        .select()
        .single();
      if (error) throw error;
      return data as unknown as TableSession;
    },
    onSuccess: async (session) => {
      await invalidateAll();
      toast.success('Table ouverte', { description: `Table ${session.table_number} activée` });
    },
    onError: (error: Error) => toast.error('Erreur', { description: error.message }),
  });

  /** Ouvre une table ET enregistre la première commande (flux POS). */
  const createSessionWithOrderMutation = useMutation({
    mutationFn: async ({
      tableNumber,
      numberOfGuests,
      items,
      totalAmount,
    }: {
      tableNumber: string;
      numberOfGuests?: number;
      items: OrderLineInput[];
      totalAmount: number;
    }) => {
      assertReady();
      if (!items.length) throw new Error('Le panier est vide.');

      // Une seule transaction serveur: aucune table vide ne peut être créée si
      // l'enregistrement de la commande échoue.
      const { data: session, error } = await supabase.rpc(
        'create_table_session_with_order',
        {
          _owner_id: userId,
          _outlet_id: outletId,
          _table_number: tableNumber,
          _number_of_guests: numberOfGuests ?? 1,
          _items: items,
          _total_amount: totalAmount,
        }
      );
      if (error) throw error;
      if (!session) throw new Error("La commande n'a pas été enregistrée.");
      return session as unknown as TableSession;
    },
    onSuccess: async (session) => {
      await invalidateAll();
      toast.success('Commande enregistrée', { description: `Table ${session.table_number} ouverte.` });
    },
    onError: (error: Error) => toast.error('Erreur', { description: error.message }),
  });

  /** Ajoute une commande à une session existante. */
  const addOrderToSessionMutation = useMutation({
    mutationFn: async ({
      sessionId,
      tableNumber,
      items,
      totalAmount,
    }: {
      sessionId: string;
      tableNumber: string;
      items: OrderLineInput[];
      totalAmount: number;
    }) => {
      assertReady();
      if (!items.length) throw new Error('Le panier est vide.');

      // L'ajout et le recalcul du total sont verrouillés dans la même
      // transaction serveur pour éviter les montants à zéro.
      const { data, error } = await supabase.rpc('add_order_to_table_session', {
        _session_id: sessionId,
        _items: items,
        _total_amount: totalAmount,
        _customer_name: `Table ${tableNumber}`,
        _customer_phone: null,
        _customer_email: null,
        _notes: null,
      });
      if (error) throw error;
      if (!data) throw new Error("La commande n'a pas été ajoutée.");
      return data;
    },
    onSuccess: async () => {
      await invalidateAll();
      toast.success('Commande ajoutée');
    },
    onError: (error: Error) => toast.error('Erreur', { description: error.message }),
  });

  /** Ferme la session: le trigger SQL génère la facture. */
  const closeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      assertReady();
      const total = await syncSessionTotal(sessionId);
      const { data, error } = await supabase
        .from('table_sessions')
        .update({ status: 'closed', closed_at: new Date().toISOString() })
        .eq('id', sessionId)
        .select('debtor_id')
        .single();
      if (error) throw error;
      return { hasDebtor: !!data?.debtor_id, total };
    },
    onSuccess: async ({ hasDebtor }) => {
      await invalidateAll();
      toast.success(hasDebtor ? 'Session fermée - Crédit accordé' : 'Session fermée', {
        description: hasDebtor ? 'Dette enregistrée' : 'Facture générée',
      });
    },
    onError: (error: Error) => toast.error('Erreur', { description: error.message }),
  });

  /**
   * Encaissement. Fonctionne aussi bien depuis une table "occupée" (fermeture
   * implicite) que depuis une table "en attente".
   */
  const markSessionAsPaidMutation = useMutation({
    mutationFn: async ({
      sessionId,
      paymentMethod,
    }: {
      sessionId: string;
      paymentMethod?: string;
    }) => {
      assertReady();

      const method = paymentMethod || 'Espèces';
      // Facture, paiement et libération de table sont atomiques côté serveur.
      // Le client ne fabrique jamais lui-même une facture.
      const { data, error } = await supabase.rpc('mark_table_session_paid', {
        _session_id: sessionId,
        _payment_method: method,
      });
      if (error) throw error;

      const result = Array.isArray(data) ? data[0] : data;
      if (!result) throw new Error("Le paiement n'a pas été enregistré.");
      return { isDebtorSession: Boolean(result.is_debtor) };
    },
    // Optimiste: la table disparaît immédiatement de la grille, et revient si erreur.
    onMutate: async ({ sessionId }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TableSession[]>(queryKey);
      queryClient.setQueryData<TableSession[]>(queryKey, (old) =>
        (old || []).filter((s) => s.id !== sessionId)
      );
      return { previous };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
      toast.error('Erreur paiement', { description: error.message });
    },
    onSuccess: async ({ isDebtorSession }) => {
      await invalidateAll();
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      toast.success('Paiement enregistré', {
        description: isDebtorSession
          ? 'Crédit débiteur enregistré, table libérée.'
          : 'Facture payée, table libérée.',
      });
    },
  });

  /** Réouvre une table fermée: annule la facture et la transaction associées. */
  const reopenSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      assertReady();
      const { data: invoice } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (invoice?.invoice_number) {
        await supabase.from('transactions').delete().eq('title', `Facture ${invoice.invoice_number}`);
      }
      await supabase.from('invoices').delete().eq('session_id', sessionId);

      const { error } = await supabase
        .from('table_sessions')
        .update({ status: 'active', closed_at: null })
        .eq('id', sessionId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await invalidateAll();
      toast.success('Table réouverte', { description: 'Facture et transaction annulées.' });
    },
    onError: (error: Error) => toast.error('Erreur', { description: error.message }),
  });

  const getActiveSessionForTable = useCallback(
    (tableNumber: string): TableSession | null => {
      if (!sessions) return null;
      const normalized = normalizeTableNumber(tableNumber);
      return (
        sessions.find(
          (s) => getSessionTableNumber(s) === normalized && s.status === 'active'
        ) || null
      );
    },
    [sessions]
  );

  return {
    sessions: sessions || [],
    loading: isLoading,
    outletLoading,
    isOffline,
    isMutating:
      createSessionMutation.isPending ||
      createSessionWithOrderMutation.isPending ||
      addOrderToSessionMutation.isPending ||
      closeSessionMutation.isPending ||
      markSessionAsPaidMutation.isPending ||
      reopenSessionMutation.isPending,
    createSession: createSessionMutation.mutateAsync,
    createSessionWithOrder: createSessionWithOrderMutation.mutateAsync,
    addOrderToSession: addOrderToSessionMutation.mutateAsync,
    closeSession: closeSessionMutation.mutateAsync,
    markSessionAsPaid: (sessionId: string, paymentMethod?: string) =>
      markSessionAsPaidMutation.mutateAsync({ sessionId, paymentMethod }),
    reopenSession: reopenSessionMutation.mutateAsync,
    getActiveSessionForTable,
    refetch,
  };
};
