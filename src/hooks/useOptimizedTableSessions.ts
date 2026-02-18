import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOptimizedOutlet } from '@/hooks/useOptimizedOutlet';
import { useEffect, useCallback } from 'react';
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

export const useOptimizedTableSessions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { outletId, loading: outletLoading } = useOptimizedOutlet();
  const queryClient = useQueryClient();
  const { isOffline } = useNetworkStatus();

  // IMPORTANT: useOfflineData appends [userId, outletId] to queryKey internally.
  // Any setQueryData/getQueryData must use the *same* final key.
  const resolvedUserId = user?.id || '';
  const scopedOutletId = (localStorage.getItem('selectedOutletId') || outletId || undefined) as string | undefined;
  const sessionsQueryKey = ['table-sessions', resolvedUserId, scopedOutletId] as const;
  const invoicesQueryKey = ['invoices', resolvedUserId, scopedOutletId] as const;
  const ordersQueryKey = ['orders', resolvedUserId, scopedOutletId] as const;

  const { data: sessions, isLoading, refetch, isOffline: dataOffline } = useOfflineData<TableSession>({
    table: 'table_sessions',
    queryKey: ['table-sessions'],
    buildQuery: async (userId, outletId) => {
      try {
        let query = supabase
          .from('table_sessions')
          .select('*')
          .eq('user_id', userId)
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
        return { data: (data as unknown as TableSession[]) || [], error: null };
      } catch (e) {
        console.error('Exception fetching table sessions:', e);
        return { data: [], error: e };
      }
    },
    enabled: !!user, // Don't wait for outletLoading — IndexedDB cache loads immediately
  });

  // Helper to update local cache for immediate UI feedback
  const updateLocalCache = useCallback(async (updatedSession: Partial<TableSession> & { id: string }) => {
    const currentSessions = sessions || [];
    const updatedSessions = currentSessions.map(s => 
      s.id === updatedSession.id ? { ...s, ...updatedSession } : s
    );
    queryClient.setQueryData(sessionsQueryKey, updatedSessions);
    
    // Also store in IndexedDB
    if (user) {
      await storeData('table_sessions', updatedSessions, resolvedUserId, scopedOutletId);
    }
  }, [sessions, queryClient, user, resolvedUserId, scopedOutletId, sessionsQueryKey]);

  // Helper to add to local cache
  const addToLocalCache = useCallback(async (newSession: TableSession) => {
    const currentSessions = sessions || [];
    const updatedSessions = [newSession, ...currentSessions];
    queryClient.setQueryData(sessionsQueryKey, updatedSessions);
    
    if (user) {
      await storeData('table_sessions', updatedSessions, resolvedUserId, scopedOutletId);
    }
  }, [sessions, queryClient, user, resolvedUserId, scopedOutletId, sessionsQueryKey]);

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
    mutationFn: async ({ tableNumber, numberOfGuests, notes, debtorId }: {
      tableNumber: string;
      numberOfGuests?: number;
      notes?: string;
      debtorId?: string;
    }) => {
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
          user_id: user?.id,
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
      return data as unknown as TableSession;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['table-sessions'] });
      toast({
        title: isOffline ? "Session créée (hors ligne)" : "Session ouverte",
        description: `Table ${(data as any).table_number} activée`,
      });
    },
  });

  const closeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
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
      } catch (invoiceError) {
        console.error('Error generating invoice on close:', invoiceError);
        // Don't throw - session is closed, invoice generation is best-effort
      }

      return { hasDebtor: hasDebtorDb };
    },
    onSuccess: ({ hasDebtor }) => {
      queryClient.invalidateQueries({ queryKey: ['table-sessions'] });
      // Force a fresh refetch of invoices so the new invoice appears immediately
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.refetchQueries({ queryKey: ['invoices'] });
      toast({
        title: hasDebtor ? "Session fermée - Crédit accordé" : (isOffline ? "Session fermée (hors ligne)" : "Session fermée"),
        description: hasDebtor ? "Dette enregistrée" : "Facture générée",
      });
    },
  });

  const markSessionAsPaidMutation = useMutation({
    mutationFn: async ({ sessionId, paymentMethod }: { sessionId: string; paymentMethod?: string }) => {
      const session = sessions?.find(s => s.id === sessionId);
      const isDebtorSession = session?.debtor_id !== null;

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

        await updateLocalCache({ id: sessionId, status: 'paid', payment_method: paymentMethod });
        return { isDebtorSession };
      }

      // Online flow
      const { data: sessionData } = await supabase
        .from('table_sessions')
        .select('debtor_id')
        .eq('id', sessionId)
        .maybeSingle();

      const isDebtorDb = sessionData?.debtor_id !== null;

      const { error: sessionError } = await supabase
        .from('table_sessions')
        .update({ status: 'paid', payment_method: paymentMethod })
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      if (!isDebtorDb) {
        await supabase
          .from('invoices')
          .update({ 
            status: 'paid',
            paid_date: new Date().toISOString(),
            payment_method: paymentMethod || 'Espèces'
          })
          .eq('session_id', sessionId);
      }

      return { isDebtorSession: isDebtorDb };
    },
    onSuccess: ({ isDebtorSession }) => {
      queryClient.invalidateQueries({ queryKey: ['table-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.refetchQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: isOffline ? "Paiement enregistré (hors ligne)" : "Paiement enregistré",
        description: isDebtorSession 
          ? "Session fermée. Facture impayée jusqu'au paiement du débiteur."
          : "Session et facture marquées comme payées.",
      });
    },
  });

  const reopenSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: isOffline ? "Table réouverte (hors ligne)" : "Table réouverte",
        description: "La facture et transaction ont été annulées.",
      });
    },
  });

  const getActiveSessionForTable = useCallback((tableNumber: string): TableSession | null => {
    if (!sessions) return null;
    return sessions.find(s => s.table_number === tableNumber && s.status === 'active') || null;
  }, [sessions]);

  // Note: realtime subscription is handled by useOfflineData to avoid duplicate channels.

  return {
    sessions: sessions || [],
    loading: isLoading || outletLoading,
    isOffline: dataOffline,
    createSession: createSessionMutation.mutateAsync,
    closeSession: closeSessionMutation.mutateAsync,
    markSessionAsPaid: (sessionId: string, paymentMethod?: string) =>
      markSessionAsPaidMutation.mutateAsync({ sessionId, paymentMethod }),
    reopenSession: reopenSessionMutation.mutateAsync,
    getActiveSessionForTable,
    refetch,
  };
};
