import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOptimizedOutlet } from '@/hooks/useOptimizedOutlet';
import { useEffect, useCallback, useMemo } from 'react';
import { useOfflineData } from './useOfflineData';
import { queueMutation, generateLocalId, storeData, getData } from '@/lib/offlineStorage';
import { useNetworkStatus } from './useNetworkStatus';
import type { Invoice } from '@/hooks/useInvoices';
import type { Order } from '@/hooks/useOptimizedOrders';

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
// After payment, the session is REMOVED from cache; this set prevents
// any realtime/refetch from re-adding it for a grace period.
const localPaidSessionIds = new Set<string>();
const localPaidTimestamps = new Map<string, number>();

// Suppress refetch for 20 seconds after payment to avoid replication-lag issues
let suppressRefetchUntil = 0;

function markSessionPaidLocally(sessionId: string) {
  localPaidSessionIds.add(sessionId);
  localPaidTimestamps.set(sessionId, Date.now());
  suppressRefetchUntil = Date.now() + 20_000;
}

function cleanOldPaidMarkers() {
  const now = Date.now();
  for (const [id, ts] of localPaidTimestamps.entries()) {
    if (now - ts > 300_000) {
      localPaidSessionIds.delete(id);
      localPaidTimestamps.delete(id);
    }
  }
}

export const useOptimizedTableSessions = () => {
  const { user, isTeamMember, teamMemberSession } = useAuth();
  const { toast } = useToast();
  const { outletId, loading: outletLoading } = useOptimizedOutlet();
  const queryClient = useQueryClient();
  const { isOffline } = useNetworkStatus();

  // IMPORTANT: useOfflineData appends [userId, outletId] to queryKey internally.
  // Any setQueryData/getQueryData must use the *same* final key.
  // CRITICAL: Must match the userId/outletId that useOfflineData uses internally
  // CRITICAL: Must match the userId/outletId that useOfflineData uses internally
  // useOfflineData uses: isTeamMember ? teamMemberSession?.ownerId : user?.id
  // useOfflineData uses: localStorage.getItem('selectedOutletId') || undefined
  const resolvedUserId = isTeamMember ? (teamMemberSession?.ownerId || '') : (user?.id || '');
  const scopedOutletId = (localStorage.getItem('selectedOutletId') || undefined) as string | undefined;
  const sessionsQueryKey = ['table-sessions', resolvedUserId, scopedOutletId] as const;
  const invoicesQueryKey = ['invoices', resolvedUserId, scopedOutletId] as const;
  const ordersQueryKey = ['orders', resolvedUserId, scopedOutletId] as const;

  const { data: rawSessions, isLoading, refetch, isOffline: dataOffline } = useOfflineData<TableSession>({
    table: 'table_sessions',
    queryKey: ['table-sessions'],
    buildQuery: async (userId, outletId) => {
      // If we just paid, suppress refetch to avoid replication lag
      if (Date.now() < suppressRefetchUntil) {
        console.log('⏳ Suppressing table_sessions refetch (paid grace period)');
        // Return current cached data unchanged
        const cached = queryClient.getQueryData(sessionsQueryKey) as TableSession[] | undefined;
        if (cached) return { data: cached, error: null };
      }

      try {
        let query = supabase
          .from('table_sessions')
          .select('*')
          .eq('user_id', userId)
          .in('status', ['active', 'closed']) // ONLY fetch non-paid sessions
          .order('started_at', { ascending: false })
          .limit(50);

        if (outletId) {
          query = query.eq('outlet_id', outletId);
        }

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
    enabled: !!user,
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


  const updateLocalCache = useCallback(async (updatedSession: Partial<TableSession> & { id: string }) => {
    // Use rawSessions from the query cache to avoid circular dependency with memoized sessions
    const currentSessions = (queryClient.getQueryData(sessionsQueryKey) as TableSession[] | undefined) || [];
    const updatedSessions = currentSessions.map(s => 
      s.id === updatedSession.id ? { ...s, ...updatedSession } : s
    );
    console.log(`📝 updateLocalCache: setting session ${updatedSession.id} to status=${updatedSession.status}`);
    queryClient.setQueryData(sessionsQueryKey, updatedSessions);
    
    // Also store in IndexedDB
    if (user) {
      await storeData('table_sessions', updatedSessions, resolvedUserId, scopedOutletId);
    }
  }, [queryClient, user, resolvedUserId, scopedOutletId, sessionsQueryKey]);

  // Remove a session from the local cache entirely (used after payment)
  const removeFromLocalCache = useCallback(async (sessionId: string) => {
    const currentSessions = (queryClient.getQueryData(sessionsQueryKey) as TableSession[] | undefined) || [];
    const filtered = currentSessions.filter(s => s.id !== sessionId);
    console.log(`🗑️ removeFromLocalCache: removing session ${sessionId} (${currentSessions.length} → ${filtered.length})`);
    queryClient.setQueryData(sessionsQueryKey, filtered);
    if (user) {
      await storeData('table_sessions', filtered, resolvedUserId, scopedOutletId);
    }
  }, [queryClient, user, resolvedUserId, scopedOutletId, sessionsQueryKey]);

  // Helper to add to local cache
  const addToLocalCache = useCallback(async (newSession: TableSession) => {
    const currentSessions = (queryClient.getQueryData(sessionsQueryKey) as TableSession[] | undefined) || [];
    const withoutDuplicate = currentSessions.filter(s => s.id !== newSession.id);
    const updatedSessions = [newSession, ...withoutDuplicate];
    queryClient.setQueryData(sessionsQueryKey, updatedSessions);
    
    if (user) {
      await storeData('table_sessions', updatedSessions, resolvedUserId, scopedOutletId);
    }
  }, [queryClient, user, resolvedUserId, scopedOutletId, sessionsQueryKey]);

  const upsertInvoiceInCache = useCallback(async (invoice: Invoice) => {
    if (!resolvedUserId) return;
    const current = (queryClient.getQueryData(invoicesQueryKey) as Invoice[] | undefined) || [];
    const exists = current.some((i) => i.id === invoice.id);
    const next = exists ? current.map((i) => (i.id === invoice.id ? { ...i, ...invoice } : i)) : [invoice, ...current];
    queryClient.setQueryData(invoicesQueryKey, next);
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
    await storeData('invoices', next, resolvedUserId, scopedOutletId);
  }, [queryClient, invoicesQueryKey, resolvedUserId, scopedOutletId]);

  const getOrdersForSession = useCallback(async (sessionId: string): Promise<Order[]> => {
    // Try React Query cache first
    const cachedFromQuery = queryClient.getQueryData(ordersQueryKey) as Order[] | undefined;
    if (cachedFromQuery?.length) {
      return cachedFromQuery.filter((o) => (o as any).session_id === sessionId);
    }

    // Fallback to IndexedDB
    if (!resolvedUserId) return [];
    const cached = await getData<Order[]>('orders', resolvedUserId, scopedOutletId);
    const list = (cached?.data || []) as Order[];
    return list.filter((o) => (o as any).session_id === sessionId);
  }, [queryClient, ordersQueryKey, resolvedUserId, scopedOutletId]);

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
        user_id: user?.id || '',
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
          userId: user?.id || '',
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
      queryClient.invalidateQueries({ queryKey: ['table-sessions'] });
      toast({
        title: isOffline ? "Session créée (hors ligne)" : "Session ouverte",
        description: `Table ${(data as any).table_number} activée`,
      });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message || "Impossible de créer la session.", variant: "destructive" });
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
          userId: user?.id || '',
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
            user_id: user?.id,
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
          userId: user?.id || '',
          outletId: scopedOutletId,
          maxRetries: 3,
          conflictResolution: 'client-wins',
        });

        await upsertInvoiceInCache(invoiceToCache);

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

      // Generate invoice inline (no DB trigger exists)
      try {
        // Fetch orders for this session
        const { data: ordersForSession } = await supabase
          .from('orders')
          .select('items, customer_name, customer_email, customer_phone')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });

        const ordersList = (ordersForSession ?? []) as any[];
        const allItems: any[] = [];
        ordersList.forEach((order: any) => {
          const orderItems = Array.isArray(order.items) ? order.items : [];
          allItems.push(...orderItems);
        });
        const firstOrder = ordersList[0] || null;

        // Generate invoice number
        const { data: invoiceNumber, error: invoiceNumError } = await supabase.rpc('generate_invoice_number');
        if (invoiceNumError || !invoiceNumber) throw invoiceNumError || new Error('No invoice number');

        // Handle debtor-specific fields
        let dueDate: string | null = null;
        let paymentTermsDays: number | null = null;
        let businessCustomerId: string | null = null;
        let invoiceType = 'b2c';
        let billingAddress: string | null = null;
        let siret: string | null = null;

        if (hasDebtorDb && sessionData.debtor_id) {
          invoiceType = 'b2b';
          businessCustomerId = sessionData.debtor_id;
          const { data: debtor } = await supabase
            .from('business_customers')
            .select('payment_terms_days, address, siret')
            .eq('id', businessCustomerId)
            .maybeSingle();

          paymentTermsDays = (debtor as any)?.payment_terms_days ?? 30;
          const now = new Date();
          now.setDate(now.getDate() + paymentTermsDays);
          dueDate = now.toISOString().split('T')[0];
          billingAddress = (debtor as any)?.address ?? null;
          siret = (debtor as any)?.siret ?? null;
        }

        // Check if DB trigger already created an invoice for this session
        const { data: existingInvoice } = await supabase
          .from('invoices')
          .select('id')
          .eq('session_id', sessionId)
          .maybeSingle();

        if (!existingInvoice) {
          await supabase
            .from('invoices')
            .insert([{
              user_id: sessionData.user_id,
              outlet_id: sessionData.outlet_id,
              session_id: sessionId,
              business_customer_id: businessCustomerId,
              invoice_number: invoiceNumber,
              invoice_type: invoiceType,
              total_amount: sessionData.total_amount ?? 0,
              status: 'unpaid',
              due_date: dueDate,
              payment_terms_days: paymentTermsDays,
              notes: `Facture - Table ${sessionData.table_number}`,
              billing_address: billingAddress,
              siret,
              customer_name: firstOrder?.customer_name ?? 'Client',
              customer_email: firstOrder?.customer_email ?? null,
              customer_phone: firstOrder?.customer_phone ?? null,
              items: allItems,
            }]);
        }
      } catch (invoiceError) {
        console.error('Error generating invoice on close:', invoiceError);
        // Don't throw - session is closed, invoice generation is best-effort
      }

      // Immediately update local cache so the table turns yellow instantly
      await updateLocalCache({ id: sessionId, status: 'closed', closed_at: new Date().toISOString() });

      return { hasDebtor: hasDebtorDb };
    })()),
    onSuccess: ({ hasDebtor }) => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['table-sessions'] });
      }, 5000);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.refetchQueries({ queryKey: ['invoices'] });
      toast({
        title: hasDebtor ? "Session fermée - Crédit accordé" : (isOffline ? "Session fermée (hors ligne)" : "Session fermée"),
        description: hasDebtor ? "Dette enregistrée" : "Facture générée",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message || "Impossible de fermer la session.", variant: "destructive" });
    },
  });

  const markSessionAsPaidMutation = useMutation({
    mutationFn: ({ sessionId, paymentMethod }: { sessionId: string; paymentMethod?: string }) => withTimeout((async () => {
      // CRITICAL: Use raw cache to avoid stale closure over memoized `sessions`
      const currentSessions = (queryClient.getQueryData(sessionsQueryKey) as TableSession[] | undefined) || [];
      const session = currentSessions.find(s => s.id === sessionId);
      const isDebtorSession = session ? session.debtor_id !== null : false;

      if (isOffline) {
        await queueMutation({
          table: 'table_sessions',
          operation: 'update',
          data: { id: sessionId, status: 'paid', payment_method: paymentMethod || 'Espèces' },
          localId: generateLocalId(),
          userId: user?.id || '',
          outletId: scopedOutletId,
          maxRetries: 3,
          conflictResolution: 'client-wins',
        });

        // Also mark invoice as paid if not debtor
        if (!isDebtorSession) {
          const invoicesCached = (queryClient.getQueryData(invoicesQueryKey) as Invoice[] | undefined) || [];
          const invoiceForSession = invoicesCached.find((inv) => inv.session_id === sessionId);
          if (invoiceForSession) {
            await queueMutation({
              table: 'invoices',
              operation: 'update',
              data: {
                id: invoiceForSession.id,
                status: 'paid',
                paid_date: new Date().toISOString(),
                payment_method: paymentMethod || 'Espèces',
                updated_at: new Date().toISOString(),
              },
              localId: generateLocalId(),
              userId: user?.id || '',
              outletId: scopedOutletId,
              maxRetries: 3,
              conflictResolution: 'client-wins',
            });

            await updateInvoiceInCache(invoiceForSession.id, {
              status: 'paid',
              paid_date: new Date().toISOString().split('T')[0] as any,
              payment_method: paymentMethod || 'Espèces',
              updated_at: new Date().toISOString(),
            } as any);
          }

          // Create transaction
          await queueMutation({
            table: 'transactions',
            operation: 'insert',
            data: {
              id: generateLocalId(),
              user_id: user?.id,
              outlet_id: scopedOutletId,
              title: `Paiement Table ${session?.table_number}`,
              amount: session?.total_amount || 0,
              type: 'income',
              category: 'facture',
              status: 'completed',
              date: new Date().toISOString().split('T')[0],
              payment_method: paymentMethod || 'Espèces',
            },
            localId: generateLocalId(),
            userId: user?.id || '',
            outletId: scopedOutletId,
            maxRetries: 3,
            conflictResolution: 'client-wins',
          });
        }

        // Remove session from cache entirely — table becomes free immediately
        await removeFromLocalCache(sessionId);
        markSessionPaidLocally(sessionId);
        return { isDebtorSession };
      }

      // CRITICAL: Optimistic update BEFORE DB calls to prevent realtime race condition.
      // If realtime fires during the DB update, the session is already removed from cache
      // and the suppress window prevents any refetch from re-adding it.
      markSessionPaidLocally(sessionId);
      await removeFromLocalCache(sessionId);

      // Online flow
      const { data: sessionData } = await supabase
        .from('table_sessions')
        .select('debtor_id')
        .eq('id', sessionId)
        .maybeSingle();

      const isDebtorDb = sessionData?.debtor_id !== null;

      const { error: sessionError, data: updatedRows } = await supabase
        .from('table_sessions')
        .update({ status: 'paid', payment_method: paymentMethod })
        .eq('id', sessionId)
        .select('id');

      if (sessionError) throw sessionError;
      if (!updatedRows || updatedRows.length === 0) {
        console.error('[markSessionAsPaid] RLS blocked update for session', sessionId, '- retrying with user_id match');
        // Fallback: try updating with explicit user_id match
        const { error: retryError } = await supabase
          .from('table_sessions')
          .update({ status: 'paid', payment_method: paymentMethod })
          .eq('id', sessionId)
          .eq('user_id', resolvedUserId);
        if (retryError) console.error('[markSessionAsPaid] Retry also failed:', retryError);
      }

      if (!isDebtorDb) {
        // Update invoice to paid
        const { data: paidInvoice } = await supabase
          .from('invoices')
          .update({ 
            status: 'paid',
            paid_date: new Date().toISOString(),
            payment_method: paymentMethod || 'Espèces'
          })
          .eq('session_id', sessionId)
          .select('invoice_number, total_amount')
          .maybeSingle();

        // CRITICAL: Create accounting transaction (was missing in online flow!)
        if (paidInvoice) {
          const invoiceNum = (paidInvoice as any).invoice_number;
          const invoiceAmount = (paidInvoice as any).total_amount;
          // Check if transaction already exists to avoid duplicates
          const { data: existingTx } = await supabase
            .from('transactions')
            .select('id')
            .eq('title', `Facture ${invoiceNum}`)
            .eq('user_id', resolvedUserId)
            .maybeSingle();

          if (!existingTx) {
            await supabase
              .from('transactions')
              .insert([{
                user_id: resolvedUserId,
                outlet_id: scopedOutletId,
                title: `Facture ${invoiceNum}`,
                amount: invoiceAmount,
                type: 'income',
                category: 'facture',
                status: 'completed',
                date: new Date().toISOString().split('T')[0],
                description: `Paiement de la facture ${invoiceNum}`,
                payment_method: paymentMethod || 'Espèces',
              }]);
          }
        }
      }

      // Local cache already cleared optimistically at the top of this mutation.

      return { isDebtorSession: isDebtorDb };
    })()),
    onSuccess: ({ isDebtorSession }) => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['table-sessions'] });
      }, 30000);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: isOffline ? "Paiement enregistré (hors ligne)" : "Paiement enregistré",
        description: isDebtorSession 
          ? "Session fermée. Facture impayée jusqu'au paiement du débiteur."
          : "Session et facture marquées comme payées.",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur paiement", description: error.message || "Impossible de marquer comme payée.", variant: "destructive" });
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
          userId: user?.id || '',
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
            userId: user?.id || '',
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
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['table-sessions'] });
      }, 5000);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: isOffline ? "Table réouverte (hors ligne)" : "Table réouverte",
        description: "La facture et transaction ont été annulées.",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message || "Impossible de réouvrir la table.", variant: "destructive" });
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => withTimeout((async () => {
      // Delete related invoices first
      await supabase
        .from('invoices')
        .delete()
        .eq('session_id', sessionId);

      // Delete related orders
      await supabase
        .from('orders')
        .delete()
        .eq('session_id', sessionId);

      // Delete the session itself
      const { error } = await supabase
        .from('table_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      // Remove from local cache
      const currentSessions = sessions || [];
      const updatedSessions = currentSessions.filter(s => s.id !== sessionId);
      queryClient.setQueryData(sessionsQueryKey, updatedSessions);
      if (user) {
        await storeData('table_sessions', updatedSessions, resolvedUserId, scopedOutletId);
      }
    })()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: "Table libérée",
        description: "La session a été supprimée avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message || "Impossible de libérer la table.", variant: "destructive" });
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
    isMutating: createSessionMutation.isPending || closeSessionMutation.isPending || markSessionAsPaidMutation.isPending || reopenSessionMutation.isPending || deleteSessionMutation.isPending,
    createSession: createSessionMutation.mutateAsync,
    closeSession: closeSessionMutation.mutateAsync,
    markSessionAsPaid: (sessionId: string, paymentMethod?: string) =>
      markSessionAsPaidMutation.mutateAsync({ sessionId, paymentMethod }),
    reopenSession: reopenSessionMutation.mutateAsync,
    deleteSession: deleteSessionMutation.mutateAsync,
    getActiveSessionForTable,
    refetch,
  };
};
