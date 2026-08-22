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
    const { data: orderRows } = await supabase
      .from('orders')
      .select('session_id, total_amount')
      .in('session_id', list.map((s) => s.id))
      .limit(10000);

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

      const { data: session, error: sessionErr } = await supabase
        .from('table_sessions')
        .insert([
          {
            user_id: userId,
            outlet_id: outletId,
            table_number: tableNumber,
            number_of_guests: numberOfGuests ?? null,
            status: 'active',
            total_amount: totalAmount,
          },
        ])
        .select()
        .single();
      if (sessionErr) throw sessionErr;

      const { error: orderErr } = await supabase.from('orders').insert([
        {
          user_id: userId,
          outlet_id: outletId,
          session_id: session.id,
          table_number: tableNumber,
          order_type: 'sur_place',
          customer_name: `Table ${tableNumber}`,
          items: items as unknown as never,
          total_amount: totalAmount,
          status: 'pending',
        },
      ]);
      if (orderErr) {
        // Pas de session orpheline vide en cas d'échec de la commande.
        await supabase.from('table_sessions').delete().eq('id', session.id);
        throw orderErr;
      }

      await syncSessionTotal(session.id);
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

      const { error } = await supabase.from('orders').insert([
        {
          user_id: userId,
          outlet_id: outletId,
          session_id: sessionId,
          table_number: tableNumber,
          order_type: 'sur_place',
          customer_name: `Table ${tableNumber}`,
          items: items as unknown as never,
          total_amount: totalAmount,
          status: 'pending',
        },
      ]);
      if (error) throw error;

      return syncSessionTotal(sessionId);
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

      const { data: session, error: readErr } = await supabase
        .from('table_sessions')
        .select('*')
        .eq('id', sessionId)
        .maybeSingle();
      if (readErr) throw readErr;
      if (!session) throw new Error('Session introuvable. Actualisez puis réessayez.');

      const nowIso = new Date().toISOString();
      const paidDate = nowIso.slice(0, 10);
      const method = paymentMethod || 'Espèces';
      const total = await syncSessionTotal(sessionId);
      const isDebtorSession = !!session.debtor_id;

      // La table doit d'abord passer par "closed" pour que le trigger facture
      // s'exécute, puis par "paid".
      if (session.status === 'active') {
        const { error } = await supabase
          .from('table_sessions')
          .update({ status: 'closed', closed_at: nowIso })
          .eq('id', sessionId);
        if (error) throw error;
      }

      if (!isDebtorSession) {
        const { data: invoices } = await supabase
          .from('invoices')
          .select('id')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (invoices && invoices.length > 0) {
          const { error } = await supabase
            .from('invoices')
            .update({
              status: 'paid',
              paid_date: paidDate,
              payment_method: method,
              total_amount: total,
              updated_at: nowIso,
            })
            .eq('id', invoices[0].id);
          if (error) throw error;
        } else {
          // Filet de sécurité si le trigger n'a pas créé de facture.
          const { data: orderRows } = await supabase
            .from('orders')
            .select('items')
            .eq('session_id', sessionId)
            .limit(10000);
          const items = ((orderRows as { items: unknown }[]) || []).flatMap((o) =>
            Array.isArray(o.items) ? (o.items as unknown[]) : []
          );
          const { error } = await supabase.from('invoices').insert([
            {
              user_id: userId,
              outlet_id: outletId,
              session_id: sessionId,
              total_amount: total,
              status: 'paid',
              paid_date: paidDate,
              payment_method: method,
              customer_name: `Table ${session.table_number}`,
              items: items as unknown as never,
            },
          ]);
          if (error) throw error;
        }
      }

      const { error: paidErr } = await supabase
        .from('table_sessions')
        .update({
          status: 'paid',
          payment_method: method,
          closed_at: session.closed_at || nowIso,
          total_amount: total,
          updated_at: nowIso,
        })
        .eq('id', sessionId);
      if (paidErr) throw paidErr;

      return { isDebtorSession };
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
