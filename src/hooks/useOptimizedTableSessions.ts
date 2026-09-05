/**
 * useOptimizedTableSessions — VERSION LOCAL D'ABORD
 *
 * Principes:
 *  - Chaque clic agit immédiatement sur l'état local (aucune attente réseau).
 *  - Le réseau ne sert qu'à synchroniser: les actions partent dans une file
 *    (`tablesOutbox`) rejouée en arrière-plan, avec ou sans connexion.
 *  - Le serveur reste la référence pour la lecture, mais l'affichage démarre
 *    depuis le cache local (IndexedDB) pour être instantané.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOutletContext } from '@/contexts/OutletContext';
import { useOptimizedOutlet } from '@/hooks/useOptimizedOutlet';
import { useNetworkStatus } from './useNetworkStatus';
import { resolveOfflineUserId, getSelectedOutletIdFromStorage } from '@/lib/offlineIdentity';
import { getSessionTableNumber, normalizeTableNumber } from '@/utils/tableNumbers';
import { getData, storeData, removePendingMutationsByFilter } from '@/lib/offlineStorage';
import {
  enqueue,
  flushOutbox,
  getOutbox,
  newUuid,
  outboxCount,
  subscribeOutbox,
} from '@/lib/tablesOutbox';

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

/** Applique les actions encore en attente sur une liste venue du serveur. */
function applyOutbox(list: TableSession[]): TableSession[] {
  const byId = new Map(list.map((s) => [s.id, { ...s }]));

  for (const { action } of getOutbox()) {
    switch (action.kind) {
      case 'create': {
        if (!byId.has(action.sessionId)) {
          const now = new Date().toISOString();
          byId.set(action.sessionId, {
            id: action.sessionId,
            user_id: action.userId,
            outlet_id: action.outletId,
            debtor_id: null,
            table_number: action.tableNumber,
            status: 'active',
            started_at: now,
            closed_at: null,
            number_of_guests: action.numberOfGuests,
            total_amount: action.totalAmount,
            notes: null,
            created_at: now,
            updated_at: now,
          });
        }
        break;
      }
      case 'add': {
        const existing = byId.get(action.sessionId);
        if (existing) {
          existing.total_amount = Number(existing.total_amount || 0) + Number(action.totalAmount || 0);
        }
        break;
      }
      case 'close': {
        const existing = byId.get(action.sessionId);
        if (existing) {
          existing.status = 'closed';
          existing.closed_at = existing.closed_at || new Date().toISOString();
        }
        break;
      }
      case 'pay': {
        byId.delete(action.sessionId);
        break;
      }
    }
  }

  return Array.from(byId.values());
}

export const useOptimizedTableSessions = () => {
  const { selectedOutletId } = useOutletContext();
  const { user, isTeamMember, teamMemberSession } = useAuth();
  const { loading: outletLoading } = useOptimizedOutlet();
  const { isOffline } = useNetworkStatus();
  const queryClient = useQueryClient();
  const [pendingSyncCount, setPendingSyncCount] = useState(() => outboxCount());

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

  /**
   * Lecture: une seule requête serveur (les totaux sont maintenus côté serveur
   * par les fonctions atomiques), puis application des actions en attente.
   */
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

    void storeData('table_sessions', list, userId, outletId).catch(() => undefined);

    return applyOutbox(list);
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
    gcTime: 60 * 60_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  useEffect(() => {
    purgeLegacyTableArtifacts();
  }, []);

  /** Hydratation immédiate depuis le cache local pour éviter l'écran d'attente. */
  useEffect(() => {
    if (!userId || !outletId) return;
    if (queryClient.getQueryData(queryKey)) return;
    let cancelled = false;
    void getData<TableSession[]>('table_sessions', userId, outletId)
      .then((cached) => {
        if (cancelled) return;
        const cachedList = Array.isArray(cached?.data) ? (cached?.data as TableSession[]) : [];
        if (cachedList.length === 0) return;
        if (queryClient.getQueryData(queryKey)) return;
        queryClient.setQueryData(queryKey, applyOutbox(cachedList));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [userId, outletId, queryClient, queryKey]);

  /** Suivi de la file de synchronisation + rejeu automatique. */
  useEffect(() => {
    const unsubscribe = subscribeOutbox((entries) => setPendingSyncCount(entries.length));
    const attemptFlush = async () => {
      const { sent } = await flushOutbox();
      if (sent > 0) {
        await queryClient.invalidateQueries({ queryKey });
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
      }
    };
    void attemptFlush();
    const interval = window.setInterval(() => void attemptFlush(), 15_000);
    window.addEventListener('online', attemptFlush);
    return () => {
      unsubscribe();
      window.clearInterval(interval);
      window.removeEventListener('online', attemptFlush);
    };
  }, [queryClient, queryKey]);

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

  /** Met à jour immédiatement l'affichage local. */
  const patchLocal = useCallback(
    (updater: (list: TableSession[]) => TableSession[]) => {
      queryClient.setQueryData<TableSession[]>(queryKey, (old) => updater(old || []));
    },
    [queryClient, queryKey]
  );

  const scheduleSync = useCallback(async () => {
    const { sent } = await flushOutbox();
    if (sent > 0) {
      await queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    }
  }, [queryClient, queryKey]);

  const assertContext = useCallback(() => {
    if (!userId) throw new Error('Non authentifié.');
    if (!outletId) throw new Error('Aucun point de vente sélectionné.');
  }, [userId, outletId]);

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
      assertContext();
      const now = new Date().toISOString();
      const session: TableSession = {
        id: newUuid(),
        user_id: userId,
        outlet_id: outletId,
        debtor_id: debtorId ?? null,
        table_number: tableNumber,
        status: 'active',
        started_at: now,
        closed_at: null,
        number_of_guests: numberOfGuests ?? 1,
        total_amount: 0,
        notes: notes ?? null,
        created_at: now,
        updated_at: now,
      };
      patchLocal((list) => [session, ...list]);
      enqueue({
        kind: 'create',
        sessionId: session.id,
        userId,
        outletId,
        tableNumber,
        numberOfGuests: numberOfGuests ?? 1,
        items: [],
        totalAmount: 0,
      });
      void scheduleSync();
      return session;
    },
    onSuccess: (session) =>
      toast.success('Table ouverte', { description: `Table ${session.table_number} activée` }),
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
      assertContext();
      if (!items.length) throw new Error('Le panier est vide.');

      const now = new Date().toISOString();
      const session: TableSession = {
        id: newUuid(),
        user_id: userId,
        outlet_id: outletId,
        debtor_id: null,
        table_number: tableNumber,
        status: 'active',
        started_at: now,
        closed_at: null,
        number_of_guests: numberOfGuests ?? 1,
        total_amount: totalAmount,
        notes: null,
        created_at: now,
        updated_at: now,
      };
      patchLocal((list) => [session, ...list]);
      enqueue({
        kind: 'create',
        sessionId: session.id,
        userId,
        outletId,
        tableNumber,
        numberOfGuests: numberOfGuests ?? 1,
        items,
        totalAmount,
      });
      void scheduleSync();
      return session;
    },
    onSuccess: (session) =>
      toast.success('Commande enregistrée', { description: `Table ${session.table_number} ouverte.` }),
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
      assertContext();
      if (!items.length) throw new Error('Le panier est vide.');

      patchLocal((list) =>
        list.map((s) =>
          s.id === sessionId
            ? { ...s, total_amount: Number(s.total_amount || 0) + Number(totalAmount || 0) }
            : s
        )
      );
      enqueue({ kind: 'add', sessionId, tableNumber, items, totalAmount });
      void scheduleSync();
      return true;
    },
    onSuccess: () => toast.success('Commande ajoutée'),
    onError: (error: Error) => toast.error('Erreur', { description: error.message }),
  });

  /** Ferme la session: le serveur génère la facture lors de la synchronisation. */
  const closeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      assertContext();
      const current = (queryClient.getQueryData<TableSession[]>(queryKey) || []).find(
        (s) => s.id === sessionId
      );
      patchLocal((list) =>
        list.map((s) =>
          s.id === sessionId
            ? { ...s, status: 'closed' as const, closed_at: new Date().toISOString() }
            : s
        )
      );
      enqueue({ kind: 'close', sessionId });
      void scheduleSync();
      return { hasDebtor: !!current?.debtor_id };
    },
    onSuccess: ({ hasDebtor }) =>
      toast.success(hasDebtor ? 'Session fermée - Crédit accordé' : 'Session fermée', {
        description: hasDebtor ? 'Dette enregistrée' : 'Facture générée',
      }),
    onError: (error: Error) => toast.error('Erreur', { description: error.message }),
  });

  /**
   * Encaissement. Fonctionne aussi bien depuis une table "occupée" que depuis
   * une table "en attente", en ligne comme hors ligne.
   */
  const markSessionAsPaidMutation = useMutation({
    mutationFn: async ({
      sessionId,
      paymentMethod,
    }: {
      sessionId: string;
      paymentMethod?: string;
    }) => {
      assertContext();
      const current = (queryClient.getQueryData<TableSession[]>(queryKey) || []).find(
        (s) => s.id === sessionId
      );
      patchLocal((list) => list.filter((s) => s.id !== sessionId));
      enqueue({ kind: 'pay', sessionId, paymentMethod: paymentMethod || 'Espèces' });
      void scheduleSync();
      return { isDebtorSession: !!current?.debtor_id };
    },
    onError: (error: Error) => toast.error('Erreur paiement', { description: error.message }),
    onSuccess: ({ isDebtorSession }) => {
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
      assertContext();
      if (isOffline) {
        throw new Error('La réouverture d’une table nécessite une connexion.');
      }
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
      await queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
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
    loading: isLoading && !sessions,
    outletLoading,
    isOffline,
    pendingSyncCount,
    isMutating: reopenSessionMutation.isPending,
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
