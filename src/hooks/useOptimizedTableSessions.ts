import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedOutlet } from '@/hooks/useOptimizedOutlet';
import { useEffect, useCallback, useMemo } from 'react';
import { useOfflineData } from './useOfflineData';
import { queueMutation, generateLocalId, storeData, getData, removePendingMutationsByFilter } from '@/lib/offlineStorage';
import { getSelectedOutletIdFromStorage, resolveOfflineUserId } from '@/lib/offlineIdentity';
import { ensurePeriodExistsOffline } from './useAutoStartPeriod';
import { useNetworkStatus } from './useNetworkStatus';
import type { Invoice } from '@/hooks/useInvoices';
import type { Order } from '@/hooks/useOptimizedOrders';
import { useTableStore } from '@/store/tableStore';
import { useInvoiceStore } from '@/store/invoiceStore';
import { toast } from 'sonner';
import { localStore } from '@/lib/localStore';
import { useOutletContext } from '@/contexts/OutletContext';

export interface TableSession {
  id: string;
  user_id: string;
  outlet_id: string | null;
  debtor_id: string | null;
  table_number: string;
  custom_table_name?: string | null;
  status: "active" | "closed" | "paid";
  started_at: string;
  closed_at: string | null;
  number_of_guests: number | null;
  total_amount: number;
  notes: string | null;
  payment_method?: string | null;
  created_at: string;
  updated_at: string;
}

// Generate offline invoice number
function generateOfflineInvoiceNumber(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `OFF-${timestamp}-${random}`;
}

// Module-level set to track session IDs that have been paid locally.
// PERSISTÉ dans localStorage pour survivre aux redémarrages de PC et fenêtres
// offline longues (clé: querox_paid_session_ids_v1).
const PAID_SESSIONS_STORAGE_KEY = 'querox_paid_session_ids_v1';
const PAID_RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

const localPaidSessionIds = new Set<string>();
const localPaidTimestamps = new Map<string, number>();

function loadPaidSessionsFromStorage() {
  if (typeof window === 'undefined') return;
  const parsed = localStore.raw.get<Record<string, number> | null>(PAID_SESSIONS_STORAGE_KEY, null);
  if (!parsed) return;
  try {
    const now = Date.now();
    for (const [id, tsRaw] of Object.entries(parsed)) {
      const ts = Number(tsRaw);
      if (Number.isFinite(ts) && now - ts < PAID_RETENTION_MS) {
        localPaidSessionIds.add(id);
        localPaidTimestamps.set(id, ts);
      }
    }
  } catch (e) {
    console.warn('[paid-sessions] Échec lecture localStorage:', e);
  }
}

function persistPaidSessionsToStorage() {
  if (typeof window === 'undefined') return;
  const obj: Record<string, number> = {};
  for (const [id, ts] of localPaidTimestamps.entries()) obj[id] = ts;
  localStore.raw.set(PAID_SESSIONS_STORAGE_KEY, obj);
}

// Initialiser au chargement du module
loadPaidSessionsFromStorage();

function markSessionPaidLocally(sessionId: string) {
  localPaidSessionIds.add(sessionId);
  localPaidTimestamps.set(sessionId, Date.now());
  persistPaidSessionsToStorage();
}

function cleanOldPaidMarkers() {
  const now = Date.now();
  let mutated = false;
  for (const [id, ts] of localPaidTimestamps.entries()) {
    if (now - ts > PAID_RETENTION_MS) {
      localPaidSessionIds.delete(id);
      localPaidTimestamps.delete(id);
      mutated = true;
    }
  }
  if (mutated) persistPaidSessionsToStorage();
}

export const useOptimizedTableSessions = () => {
  const { selectedOutletId: ctxSelectedOutletId } = useOutletContext();
  const outletIdKey = ctxSelectedOutletId ?? 'no-outlet';
  const { user, isTeamMember, teamMemberSession } = useAuth();
  const { outletId, loading: outletLoading } = useOptimizedOutlet();
  const queryClient = useQueryClient();
  const { isOffline } = useNetworkStatus();

  // IMPORTANT: useOfflineData appends [userId, outletId] to queryKey internally.
  // Any setQueryData/getQueryData must use the *same* final key.
  // CRITICAL: Must match the userId/outletId that useOfflineData uses internally
  // CRITICAL: Must match the userId/outletId that useOfflineData uses internally
  // useOfflineData uses: isTeamMember ? teamMemberSession?.ownerId : user?.id
  // useOfflineData uses: localStorage.getItem('selectedOutletId') || undefined
  const resolvedUserId = resolveOfflineUserId({
    userId: user?.id,
    isTeamMember,
    ownerId: teamMemberSession?.ownerId,
  }) || '';
  const scopedOutletId = getSelectedOutletIdFromStorage();
  const sessionsQueryKey = ['table-sessions', resolvedUserId, scopedOutletId] as const;
  const invoicesQueryKey = ['invoices', resolvedUserId, scopedOutletId] as const;
  const ordersQueryKey = ['orders', resolvedUserId, scopedOutletId] as const;

  const { data: rawSessions, isLoading, refetch, isOffline: dataOffline } = useOfflineData<TableSession>({
    table: 'table_sessions',
    queryKey: ['table-sessions', outletIdKey],
    buildQuery: async (userId, outletId) => {
      // CRITICAL: table sessions MUST be scoped to an outlet to prevent cross-outlet leaks
      if (!outletId) {
        console.warn('[table-sessions] No outletId — returning empty to prevent cross-outlet leak');
        return { data: [], error: null };
      }
      try {
        const query = supabase
          .from('table_sessions')
          .select('*')
          .eq('user_id', userId)
          .eq('outlet_id', outletId)
          .in('status', ['active', 'closed']) // ONLY fetch non-paid sessions
          .order('started_at', { ascending: false })
          .limit(50);

        const { data, error } = await query;
        if (error) {
          console.error('Error fetching table sessions:', error);
          return { data: [], error };
        }
        // Filter out any sessions we've locally marked as paid
        const filtered = ((data as unknown as TableSession[]) || []).filter(
          s => !localPaidSessionIds.has(s.id)
        );
        return { data: filtered, error: null };
      } catch (e) {
        console.error('Exception fetching table sessions:', e);
        return { data: [], error: e };
      }
    },
    enabled: !!resolvedUserId && !!scopedOutletId,
    // Important for published app: always refresh server truth on mount when online.
    refetchOnMount: isOffline ? false : 'always',
  });

  // Clean old markers and filter out locally-paid sessions
  const sessions = useMemo(() => {
    cleanOldPaidMarkers();
    if (!rawSessions) return rawSessions;
    return rawSessions.filter(s => !localPaidSessionIds.has(s.id));
  }, [rawSessions]);

// Timeout wrapper — prevents mutations from hanging forever on flaky networks
const MUTATION_TIMEOUT_MS = 15_000;
function withTimeout<T>(promise: Promise<T>, ms = MUTATION_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Opération expirée. Veuillez réessayer.')), ms)
    ),
  ]);
}


  const getSessionsSnapshot = useCallback(async (): Promise<TableSession[]> => {
    const fromQuery = (queryClient.getQueryData(sessionsQueryKey) as TableSession[] | undefined) || [];
    const cachedScoped = await getData<TableSession[]>('table_sessions', resolvedUserId, scopedOutletId);

    // STRICT: si un outlet est sélectionné, ne JAMAIS fusionner avec le cache unscoped
    // (évite l'injection de sessions d'autres PDV).
    const merged = scopedOutletId
      ? [
          ...((cachedScoped?.data || []) as TableSession[]),
          ...fromQuery,
        ]
      : (() => {
          // Fallback uniquement si aucun outlet (pas de risque de fuite inter-PDV)
          return [...((cachedScoped?.data || []) as TableSession[]), ...fromQuery];
        })();

    // Déduplication par id ET filtrage strict par outlet
    const deduped = Array.from(new Map(merged.map((s) => [s.id, s])).values());
    if (scopedOutletId) {
      return deduped.filter((s) => s.outlet_id === scopedOutletId);
    }
    return deduped;
  }, [queryClient, sessionsQueryKey, resolvedUserId, scopedOutletId]);

  const updateLocalCache = useCallback(async (updatedSession: Partial<TableSession> & { id: string }) => {
    const baseSessions = await getSessionsSnapshot();
    if (baseSessions.length === 0) {
      console.warn('[Offline] updateLocalCache ignoré: snapshot vide pour table_sessions');
      return;
    }

    const updatedSessions = baseSessions.map((s) =>
      s.id === updatedSession.id ? { ...s, ...updatedSession } : s
    );
    queryClient.setQueryData(sessionsQueryKey, updatedSessions);
    useTableStore.getState().setSessions(updatedSessions);

    if (user) {
      await storeData('table_sessions', updatedSessions, resolvedUserId, scopedOutletId);

      const cachedUnscoped = await getData<TableSession[]>('table_sessions', resolvedUserId);
      const unscopedList = (cachedUnscoped?.data || []) as TableSession[];
      if (unscopedList.length > 0) {
        const updatedUnscoped = unscopedList.map((s) =>
          s.id === updatedSession.id ? { ...s, ...updatedSession } : s
        );
        await storeData('table_sessions', updatedUnscoped, resolvedUserId);
      }
    }
  }, [getSessionsSnapshot, queryClient, user, resolvedUserId, scopedOutletId, sessionsQueryKey]);

  // Remove a session from the local cache entirely (used after payment)
  const removeFromLocalCache = useCallback(async (sessionId: string) => {
    const baseSessions = await getSessionsSnapshot();
    if (baseSessions.length === 0) {
      console.warn('[Offline] removeFromLocalCache ignoré: snapshot vide pour table_sessions');
      return;
    }

    const filtered = baseSessions.filter((s) => s.id !== sessionId);
    queryClient.setQueryData(sessionsQueryKey, filtered);
    useTableStore.getState().removeSession(sessionId);
    if (user) {
      await storeData('table_sessions', filtered, resolvedUserId, scopedOutletId);

      const cachedUnscoped = await getData<TableSession[]>('table_sessions', resolvedUserId);
      const unscopedList = (cachedUnscoped?.data || []) as TableSession[];
      if (unscopedList.length > 0) {
        const unscopedFiltered = unscopedList.filter((s) => s.id !== sessionId);
        await storeData('table_sessions', unscopedFiltered, resolvedUserId);
      }
    }
  }, [getSessionsSnapshot, queryClient, user, resolvedUserId, scopedOutletId, sessionsQueryKey]);

  // Helper to add to local cache
  const addToLocalCache = useCallback(async (newSession: TableSession) => {
    const baseSessions = await getSessionsSnapshot();
    const withoutDuplicate = baseSessions.filter((s) => s.id !== newSession.id);
    const updatedSessions = [newSession, ...withoutDuplicate];
    queryClient.setQueryData(sessionsQueryKey, updatedSessions);
    useTableStore.getState().addSession(newSession);

    if (user) {
      await storeData('table_sessions', updatedSessions, resolvedUserId, scopedOutletId);

      const cachedUnscoped = await getData<TableSession[]>('table_sessions', resolvedUserId);
      const unscopedList = (cachedUnscoped?.data || []) as TableSession[];
      const withoutDuplicateUnscoped = unscopedList.filter((s) => s.id !== newSession.id);
      const updatedUnscoped = [newSession, ...withoutDuplicateUnscoped];
      await storeData('table_sessions', updatedUnscoped, resolvedUserId);
    }
  }, [getSessionsSnapshot, queryClient, user, resolvedUserId, scopedOutletId, sessionsQueryKey]);

  const upsertInvoiceInCache = useCallback(async (invoice: Invoice) => {
    if (!resolvedUserId) return;
    const current = (queryClient.getQueryData(invoicesQueryKey) as Invoice[] | undefined) || [];
    const exists = current.some((i) => i.id === invoice.id);
    const next = exists ? current.map((i) => (i.id === invoice.id ? { ...i, ...invoice } : i)) : [invoice, ...current];
    queryClient.setQueryData(invoicesQueryKey, next);
    useInvoiceStore.getState().upsertInvoice(invoice);
    await storeData('invoices', next, resolvedUserId, scopedOutletId);
  }, [queryClient, invoicesQueryKey, resolvedUserId, scopedOutletId]);

  const updateInvoiceInCache = useCallback(async (invoiceId: string, patch: Partial<Invoice>) => {
    if (!resolvedUserId) return;
    const current = (queryClient.getQueryData(invoicesQueryKey) as Invoice[] | undefined) || [];
    const next = current.map((i) => (i.id === invoiceId ? ({ ...i, ...patch } as Invoice) : i));
    queryClient.setQueryData(invoicesQueryKey, next);
    await storeData('invoices', next, resolvedUserId, scopedOutletId);
  }, [queryClient, invoicesQueryKey, resolvedUserId, scopedOutletId]);

  const removeInvoiceFromCacheById = useCallback(async (invoiceId: string) => {
    if (!resolvedUserId) return;
    const current = (queryClient.getQueryData(invoicesQueryKey) as Invoice[] | undefined) || [];
    const next = current.filter((i) => i.id !== invoiceId);
    queryClient.setQueryData(invoicesQueryKey, next);
    useInvoiceStore.getState().removeInvoice(invoiceId);
    await storeData('invoices', next, resolvedUserId, scopedOutletId);
  }, [queryClient, invoicesQueryKey, resolvedUserId, scopedOutletId]);

  const getOrdersForSession = useCallback(async (sessionId: string): Promise<Order[]> => {
    // Try React Query cache first
    const cachedFromQuery = queryClient.getQueryData(ordersQueryKey) as Order[] | undefined;
    if (cachedFromQuery?.length) {
      return cachedFromQuery.filter((o) => (o as any).session_id === sessionId);
    }

    if (!resolvedUserId && !user?.id) return [];

    // Fallback to IndexedDB (owner-scoped first, then current-user scoped for backward compatibility)
    const ownerCached = await getData<Order[]>('orders', resolvedUserId, scopedOutletId);
    const ownerFallback = !ownerCached?.data && scopedOutletId
      ? await getData<Order[]>('orders', resolvedUserId)
      : ownerCached;

    const effectiveOwnerList = (ownerFallback?.data || ownerCached?.data || []) as Order[];
    if (effectiveOwnerList.length > 0) {
      return effectiveOwnerList.filter((o) => (o as any).session_id === sessionId);
    }

    if (user?.id && user.id !== resolvedUserId) {
      const legacyCached = await getData<Order[]>('orders', user.id, scopedOutletId);
      const legacyFallback = !legacyCached?.data && scopedOutletId
        ? await getData<Order[]>('orders', user.id)
        : legacyCached;
      const legacyList = (legacyFallback?.data || legacyCached?.data || []) as Order[];
      return legacyList.filter((o) => (o as any).session_id === sessionId);
    }

    return [];
  }, [queryClient, ordersQueryKey, resolvedUserId, scopedOutletId, user?.id]);

  const createSessionMutation = useMutation({
    mutationFn: ({ tableNumber, numberOfGuests, notes, debtorId }: {
      tableNumber: string;
      numberOfGuests?: number;
      notes?: string;
      debtorId?: string;
    }) => withTimeout((async () => {
      const localId = generateLocalId();
      const sessionData: Partial<TableSession> = {
        id: localId,
        user_id: resolvedUserId,
        outlet_id: scopedOutletId || null,
        table_number: tableNumber,
        number_of_guests: numberOfGuests || null,
        notes: notes || null,
        debtor_id: debtorId || null,
        status: 'active',
        total_amount: 0,
        started_at: new Date().toISOString(),
        closed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (isOffline) {
        await queueMutation({
          table: 'table_sessions',
          operation: 'insert',
          data: sessionData as Record<string, unknown>,
          localId,
          userId: resolvedUserId,
          outletId: scopedOutletId,
          maxRetries: 3,
          conflictResolution: 'client-wins',
        });
        
        // Add to local cache immediately
        await addToLocalCache(sessionData as TableSession);
        
        return sessionData as TableSession;
      }

      const { data, error } = await supabase
        .from('table_sessions')
        .insert([{
          user_id: resolvedUserId || user?.id,
          outlet_id: scopedOutletId,
          table_number: tableNumber,
          number_of_guests: numberOfGuests,
          notes: notes,
          debtor_id: debtorId,
          status: 'active',
        }])
        .select()
        .single();

      if (error) throw error;

      // Keep UI consistent even when refetch is temporarily suppressed.
      await addToLocalCache(data as unknown as TableSession);
      return data as unknown as TableSession;
    })()),
    onSuccess: (data) => {
      // Force an immediate refetch so the grid updates without manual refresh
      refetch();
      toast.success(isOffline ? "Session créée (hors ligne)" : "Session ouverte", { description: `Table ${(data as any).table_number} activée` });
    },
    onError: (error: Error) => {
      toast.error("Erreur", { description: error.message || "Impossible de créer la session." });
    },
  });

  const closeSessionMutation = useMutation({
    mutationFn: (sessionId: string) => withTimeout((async () => {
      const session = sessions?.find(s => s.id === sessionId);
      const hasDebtor = session?.debtor_id !== null;
      // Closing generates the invoice; payment is a separate action.
      const newStatus: TableSession["status"] = 'closed';

      if (isOffline) {
        await queueMutation({
          table: 'table_sessions',
          operation: 'update',
          data: { id: sessionId, status: newStatus, closed_at: new Date().toISOString() },
          localId: generateLocalId(),
          userId: resolvedUserId,
          outletId: scopedOutletId,
          maxRetries: 3,
          conflictResolution: 'client-wins',
        });

        // Create offline invoice
        const invoiceNumber = generateOfflineInvoiceNumber();
        const invoiceId = generateLocalId();

        // Build items from cached orders (best-effort, so printing works offline)
        const ordersForSession = await getOrdersForSession(sessionId);
        const items: unknown[] = [];
        for (const o of ordersForSession) {
          const list = Array.isArray(o.items) ? o.items : [];
          items.push(...list);
        }

        const invoiceToCache: Invoice = {
          id: invoiceId,
          user_id: resolvedUserId,
          outlet_id: scopedOutletId || null,
          order_id: null,
          session_id: sessionId,
          invoice_number: invoiceNumber,
          total_amount: Number(session?.total_amount || 0),
          status: hasDebtor ? 'unpaid' : 'unpaid',
          due_date: null,
          paid_date: null,
          notes: `Facture (hors ligne) - Table ${session?.table_number || ''}`.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          customer_name: `Table ${session?.table_number || ''}`.trim(),
          customer_email: null,
          customer_phone: null,
          items,
          payment_method: null,
        };

        await queueMutation({
          table: 'invoices',
          operation: 'insert',
          data: {
            id: invoiceId,
            user_id: resolvedUserId,
            outlet_id: scopedOutletId,
            session_id: sessionId,
            invoice_number: invoiceNumber,
            total_amount: session?.total_amount || 0,
            status: hasDebtor ? 'unpaid' : 'unpaid',
            invoice_type: hasDebtor ? 'b2b' : 'b2c',
            business_customer_id: session?.debtor_id || null,
            customer_name: `Table ${session?.table_number}`,
            items,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          localId: invoiceId,
          userId: resolvedUserId,
          outletId: scopedOutletId,
          maxRetries: 3,
          conflictResolution: 'client-wins',
        });

        await upsertInvoiceInCache(invoiceToCache);

        // Ensure a business period exists for offline reports
        await ensurePeriodExistsOffline(resolvedUserId, scopedOutletId);

        // Update local cache
        await updateLocalCache({ id: sessionId, status: newStatus as any, closed_at: new Date().toISOString() });

        return { hasDebtor, invoiceNumber };
      }

      // Fetch session details for invoice generation
      const { data: sessionData } = await supabase
        .from('table_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (!sessionData) throw new Error('Session introuvable');

      const hasDebtorDb = sessionData.debtor_id !== null;

      // Close the session
      const { error } = await supabase
        .from('table_sessions')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (error) throw error;

      // Invoice generation is handled by DB trigger: create_invoice_for_closed_session.
      // We keep frontend close flow focused on session lifecycle to avoid duplicate invoice logic.

      // Immediately update local cache so the table turns yellow instantly
      await updateLocalCache({ id: sessionId, status: 'closed', closed_at: new Date().toISOString() });

      return { hasDebtor: hasDebtorDb };
    })()),
    onSuccess: ({ hasDebtor }) => {
      queryClient.invalidateQueries({ queryKey: ['table-sessions', outletIdKey] });
      queryClient.invalidateQueries({ queryKey: ['invoices', outletIdKey] });
      queryClient.refetchQueries({ queryKey: ['invoices', outletIdKey] });
      toast.success(hasDebtor ? "Session fermée - Crédit accordé" : (isOffline ? "Session fermée (hors ligne)" : "Session fermée"), { description: hasDebtor ? "Dette enregistrée" : "Facture générée" });
    },
    onError: (error: Error) => {
      toast.error("Erreur", { description: error.message || "Impossible de fermer la session." });
    },
  });

  let snapshotSessions: TableSession[] = [];
  let snapshotInvoices: Invoice[] = [];

  const markSessionAsPaidMutation = useMutation({
    mutationFn: ({ sessionId, paymentMethod }: { sessionId: string; paymentMethod?: string }) => withTimeout((async () => {
      // Guard: validate session exists and snapshot cache before any side effects
      {
        const currentSessions = (queryClient.getQueryData(sessionsQueryKey) as TableSession[] | undefined) || [];
        const sessionToValidate = currentSessions.find(s => s.id === sessionId);
        if (!sessionToValidate) {
          throw new Error('Session introuvable. Rafraîchissez la page et réessayez.');
        }
        snapshotSessions = [...currentSessions];
        snapshotInvoices = (queryClient.getQueryData(invoicesQueryKey) as Invoice[] | undefined) ? [...(queryClient.getQueryData(invoicesQueryKey) as Invoice[])] : [];
      }

      // CRITICAL: Use raw cache to avoid stale closure over memoized `sessions`
      const currentSessions = (queryClient.getQueryData(sessionsQueryKey) as TableSession[] | undefined) || [];
      const session = currentSessions.find(s => s.id === sessionId);
      const isDebtorSession = session ? session.debtor_id !== null : false;

      if (isOffline) {
        // ANTI-REJEU: supprimer toute mutation antérieure en attente sur cette session
        // qui voudrait remettre status='closed' ou 'active' (sinon le sync rejoue
        // ces états après le 'paid' et la table revient occupée/en attente).
        await removePendingMutationsByFilter((m) => {
          if (m.table !== 'table_sessions') return false;
          if (m.operation !== 'update') return false;
          const data = m.data as Record<string, unknown>;
          if (data?.id !== sessionId) return false;
          const status = data?.status as string | undefined;
          return status === 'closed' || status === 'active';
        });

        await queueMutation({
          table: 'table_sessions',
          operation: 'update',
          data: { id: sessionId, status: 'paid', payment_method: paymentMethod || 'Espèces' },
          localId: generateLocalId(),
          userId: resolvedUserId,
          outletId: scopedOutletId,
          maxRetries: 3,
          conflictResolution: 'client-wins',
        });

        // Also mark invoice as paid if not debtor
        if (!isDebtorSession) {
          const nowIso = new Date().toISOString();
          const paidDate = nowIso.split('T')[0];

          const queryInvoices = (queryClient.getQueryData(invoicesQueryKey) as Invoice[] | undefined) || [];
          const cachedInvoicesScoped = await getData<Invoice[]>('invoices', resolvedUserId, scopedOutletId);
          const cachedInvoicesFallback = !cachedInvoicesScoped?.data && scopedOutletId
            ? await getData<Invoice[]>('invoices', resolvedUserId)
            : cachedInvoicesScoped;

          const mergedInvoices = [...queryInvoices, ...((cachedInvoicesFallback?.data || []) as Invoice[])];
          const uniqueInvoices = Array.from(new Map(mergedInvoices.map((inv) => [inv.id, inv])).values());

          let invoiceForSession = uniqueInvoices
            .filter((inv) => inv.session_id === sessionId)
            .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))[0];

          if (!invoiceForSession) {
            const ordersForSession = await getOrdersForSession(sessionId);
            const generatedInvoiceId = generateLocalId();
            const generatedInvoiceNumber = generateOfflineInvoiceNumber();
            const generatedItems = ordersForSession.flatMap((order) =>
              Array.isArray((order as any).items) ? (order as any).items : []
            );

            invoiceForSession = {
              id: generatedInvoiceId,
              user_id: resolvedUserId,
              outlet_id: scopedOutletId || null,
              order_id: null,
              session_id: sessionId,
              invoice_number: generatedInvoiceNumber,
              total_amount: Number(session?.total_amount || 0),
              status: 'paid',
              due_date: null,
              paid_date: paidDate as any,
              notes: `Facture générée au paiement (hors ligne) - Table ${session?.table_number || ''}`.trim(),
              created_at: nowIso,
              updated_at: nowIso,
              customer_name: `Table ${session?.table_number || ''}`.trim(),
              customer_email: null,
              customer_phone: null,
              items: generatedItems,
              payment_method: paymentMethod || 'Espèces',
            } as Invoice;

            // Don't queue invoice insert for sync — the DB trigger
            // `create_invoice_for_closed_session` will create the official FAC-xxx
            // invoice when the session status syncs to 'closed'/'paid'.
            // The local invoice is kept in cache only for receipt printing.
          } else {
            await queueMutation({
              table: 'invoices',
              operation: 'update',
              data: {
                id: invoiceForSession.id,
                status: 'paid',
                paid_date: nowIso,
                payment_method: paymentMethod || 'Espèces',
                updated_at: nowIso,
              },
              localId: generateLocalId(),
              userId: resolvedUserId || user?.id || '',
              outletId: scopedOutletId,
              maxRetries: 3,
              conflictResolution: 'client-wins',
            });

            invoiceForSession = {
              ...invoiceForSession,
              status: 'paid',
              paid_date: paidDate as any,
              payment_method: paymentMethod || 'Espèces',
              updated_at: nowIso,
            } as Invoice;
          }

          if (invoiceForSession) {
            await upsertInvoiceInCache(invoiceForSession);

            const finalInvoices = [
              invoiceForSession,
              ...uniqueInvoices.filter((inv) => inv.id !== invoiceForSession!.id),
            ];
            await storeData('invoices', finalInvoices as any, resolvedUserId, scopedOutletId);
          }

          // Transaction creation is handled by the DB trigger
          // `create_transaction_from_paid_invoice` when the invoice is marked paid.
        }

        // Ensure a business period exists for offline reports
        await ensurePeriodExistsOffline(resolvedUserId, scopedOutletId);

        // Remove session from cache entirely — table becomes free immediately
        await removeFromLocalCache(sessionId);
        markSessionPaidLocally(sessionId);
        useTableStore.getState().markPaid(sessionId);
        return { isDebtorSession };
      }

      // CRITICAL: Optimistic update BEFORE DB calls to prevent realtime race condition.
      // If realtime fires during the DB update, the session is already removed from cache
      // and the suppress window prevents any refetch from re-adding it.
      markSessionPaidLocally(sessionId);
      useTableStore.getState().markPaid(sessionId);
      await removeFromLocalCache(sessionId);

      // Online flow — align with Factures flow: pay invoice first so DB trigger frees table
      const paidAtDate = new Date().toISOString().split('T')[0];
      const normalizedPaymentMethod = paymentMethod || 'Espèces';
      let paidInvoiceMeta: { id: string; invoice_number: string; total_amount: number } | null = null;

      // Resolve debtor flag safely: fallback to cached session when DB row is not returned
      const { data: sessionData, error: sessionLookupError } = await supabase
        .from('table_sessions')
        .select('debtor_id')
        .eq('id', sessionId)
        .maybeSingle();

      if (sessionLookupError && (sessionLookupError as any).code !== 'PGRST116') {
        throw sessionLookupError;
      }

      const isDebtorDb = typeof sessionData?.debtor_id !== 'undefined'
        ? sessionData.debtor_id !== null
        : isDebtorSession;

      // 1) Source of truth: mark the linked invoice as paid (same intent as Factures section)
      const { data: invoiceForSession, error: invoiceLookupError } = await supabase
        .from('invoices')
        .select('id, invoice_number, total_amount, status')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (invoiceLookupError && (invoiceLookupError as any).code !== 'PGRST116') {
        throw invoiceLookupError;
      }

      if (!invoiceForSession?.id) {
        // Session has no invoice yet — could be an "active" session paid directly
        // or a race condition. Try to close session directly.
        const { error: directCloseError } = await supabase
          .from('table_sessions')
          .update({ status: 'paid', payment_method: normalizedPaymentMethod })
          .eq('id', sessionId);
        if (directCloseError) throw directCloseError;
        return { isDebtorSession: isDebtorDb };
      }

      if (invoiceForSession.status !== 'paid') {
        const { error: invoicePaymentError } = await supabase
          .from('invoices')
          .update({
            status: 'paid',
            paid_date: paidAtDate,
            payment_method: normalizedPaymentMethod,
          })
          .eq('id', invoiceForSession.id);

        if (invoicePaymentError) throw invoicePaymentError;
      }

      // 2) Safety first: always force the session to paid after invoice payment.
      // This guarantees table release even if the DB trigger is delayed or unavailable.
      const { error: sessionPaidError } = await supabase
        .from('table_sessions')
        .update({ status: 'paid', payment_method: normalizedPaymentMethod })
        .eq('id', sessionId);

      if (sessionPaidError) {
        console.error('[markSessionAsPaid] Session paid update failed:', sessionPaidError);
        const { error: retryError } = await supabase
          .from('table_sessions')
          .update({ status: 'paid', payment_method: normalizedPaymentMethod })
          .eq('id', sessionId)
          .eq('user_id', resolvedUserId);

        if (retryError) throw retryError;
      }

      paidInvoiceMeta = invoiceForSession as { id: string; invoice_number: string; total_amount: number };

      // 3) Transaction creation is now handled by the DB trigger
      // `create_transaction_from_paid_invoice` — no manual insert needed.

      // 4) Ne pas déduire le stock côté client en ligne.
      // La déduction est déjà gérée côté Supabase au paiement de la facture;
      // la refaire ici provoque un retrait en double (1 vente => 2 déductions).

      // Local cache already cleared optimistically at the top of this mutation.

      return { isDebtorSession: isDebtorDb };
    })()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table-sessions', outletIdKey] });
      queryClient.refetchQueries({ queryKey: ['table-sessions', outletIdKey] });
      queryClient.invalidateQueries({ queryKey: ['invoices', outletIdKey] });
      queryClient.invalidateQueries({ queryKey: ['transactions', outletIdKey] });
      queryClient.invalidateQueries({ queryKey: ['inventory', outletIdKey] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements', outletIdKey] });
      toast.success(isOffline ? "Paiement enregistré (hors ligne)" : "Paiement enregistré", { description: "La facture est marquée payée et la table est libérée." });
    },
    onError: (error: Error, variables: { sessionId: string; paymentMethod?: string }) => {
      // ROLLBACK: undo optimistic update
      localPaidSessionIds.delete(variables.sessionId);
      localPaidTimestamps.delete(variables.sessionId);
      persistPaidSessionsToStorage();
      useTableStore.getState().rollbackPaid(variables.sessionId);

      // Restore React Query cache to snapshot
      queryClient.setQueryData(sessionsQueryKey, snapshotSessions);
      queryClient.setQueryData(invoicesQueryKey, snapshotInvoices);

      // Force refetch to get server truth
      void queryClient.refetchQueries({ queryKey: ['table-sessions', outletIdKey] });

      toast.error('Erreur paiement', { description: error.message || 'Impossible de marquer comme payée. La table a été restaurée.' });
    },
  });

  const reopenSessionMutation = useMutation({
    mutationFn: (sessionId: string) => withTimeout((async () => {
      if (isOffline) {
        await queueMutation({
          table: 'table_sessions',
          operation: 'update',
          data: { id: sessionId, status: 'active', closed_at: null },
          localId: generateLocalId(),
          userId: resolvedUserId,
          outletId: scopedOutletId,
          maxRetries: 3,
          conflictResolution: 'client-wins',
        });

        // Delete invoice(s) by ID (syncEngine requires id)
        const invoicesCached = (queryClient.getQueryData(invoicesQueryKey) as Invoice[] | undefined) || [];
        const invoicesForSession = invoicesCached.filter((inv) => inv.session_id === sessionId);
        for (const inv of invoicesForSession) {
          await queueMutation({
            table: 'invoices',
            operation: 'delete',
            data: { id: inv.id },
            localId: generateLocalId(),
            userId: resolvedUserId,
            outletId: scopedOutletId,
            maxRetries: 3,
            conflictResolution: 'client-wins',
          });
          await removeInvoiceFromCacheById(inv.id);
        }

        await updateLocalCache({ id: sessionId, status: 'active', closed_at: null });
        return;
      }

      // Get invoice number for transaction deletion
      const { data: invoice } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('session_id', sessionId)
        .maybeSingle();

      // Delete transaction
      if (invoice?.invoice_number) {
        await supabase
          .from('transactions')
          .delete()
          .eq('title', `Facture ${invoice.invoice_number}`);
      }

      // Delete invoice
      await supabase
        .from('invoices')
        .delete()
        .eq('session_id', sessionId);

      // Reopen session
      const { error } = await supabase
        .from('table_sessions')
        .update({ status: 'active', closed_at: null })
        .eq('id', sessionId);

      if (error) throw error;
    })()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table-sessions', outletIdKey] });
      queryClient.invalidateQueries({ queryKey: ['invoices', outletIdKey] });
      queryClient.invalidateQueries({ queryKey: ['transactions', outletIdKey] });
      toast.success(isOffline ? "Table réouverte (hors ligne)" : "Table réouverte", { description: "La facture et transaction ont été annulées." });
    },
    onError: (error: Error) => {
      toast.error("Erreur", { description: error.message || "Impossible de réouvrir la table." });
    },
  });


  const getActiveSessionForTable = useCallback((tableNumber: string): TableSession | null => {
    if (!sessions) return null;
    return sessions.find(s => s.table_number === tableNumber && s.status === 'active') || null;
  }, [sessions]);

  // Note: realtime subscription is handled by useOfflineData to avoid duplicate channels.

  return {
    sessions: sessions || [],
    loading: isLoading,
    outletLoading,
    isOffline: dataOffline,
    isMutating: createSessionMutation.isPending || closeSessionMutation.isPending || markSessionAsPaidMutation.isPending || reopenSessionMutation.isPending,
    createSession: createSessionMutation.mutateAsync,
    closeSession: closeSessionMutation.mutateAsync,
    markSessionAsPaid: (sessionId: string, paymentMethod?: string) =>
      markSessionAsPaidMutation.mutateAsync({ sessionId, paymentMethod }),
    reopenSession: reopenSessionMutation.mutateAsync,
    getActiveSessionForTable,
    refetch,
  };
};
