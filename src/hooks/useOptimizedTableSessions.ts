import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOptimizedOutlet } from '@/hooks/useOptimizedOutlet';
import { useEffect, useCallback } from 'react';
import { useOfflineData } from './useOfflineData';
import { queueMutation, generateLocalId, storeData, getData } from '@/lib/offlineStorage';
import { useNetworkStatus } from './useNetworkStatus';

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

  const { data: sessions, isLoading, refetch, isOffline: dataOffline } = useOfflineData<TableSession>({
    table: 'table_sessions',
    queryKey: ['table-sessions'],
    buildQuery: async (userId, outletId) => {
      let query = supabase
        .from('table_sessions' as any)
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(50) as any;

      if (outletId) {
        query = query.eq('outlet_id', outletId);
      }

      const { data, error } = await query;
      return { data: (data as TableSession[]) || [], error };
    },
    enabled: !!user && !outletLoading,
  });

  // Helper to update local cache for immediate UI feedback
  const updateLocalCache = useCallback(async (updatedSession: Partial<TableSession> & { id: string }) => {
    const currentSessions = sessions || [];
    const updatedSessions = currentSessions.map(s => 
      s.id === updatedSession.id ? { ...s, ...updatedSession } : s
    );
    queryClient.setQueryData(['table-sessions'], updatedSessions);
    
    // Also store in IndexedDB
    if (user) {
      await storeData('table_sessions', updatedSessions, user.id, outletId || undefined);
    }
  }, [sessions, queryClient, user, outletId]);

  // Helper to add to local cache
  const addToLocalCache = useCallback(async (newSession: TableSession) => {
    const currentSessions = sessions || [];
    const updatedSessions = [newSession, ...currentSessions];
    queryClient.setQueryData(['table-sessions'], updatedSessions);
    
    if (user) {
      await storeData('table_sessions', updatedSessions, user.id, outletId || undefined);
    }
  }, [sessions, queryClient, user, outletId]);

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
        outlet_id: outletId,
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
          outletId: outletId || undefined,
          maxRetries: 3,
          conflictResolution: 'client-wins',
        });
        
        // Add to local cache immediately
        await addToLocalCache(sessionData as TableSession);
        
        return sessionData as TableSession;
      }

      const { data, error } = await supabase
        .from('table_sessions' as any)
        .insert([{
          user_id: user?.id,
          outlet_id: outletId,
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
      const newStatus = hasDebtor ? 'paid' : 'closed';

      if (isOffline) {
        await queueMutation({
          table: 'table_sessions',
          operation: 'update',
          data: { id: sessionId, status: newStatus, closed_at: new Date().toISOString() },
          localId: generateLocalId(),
          userId: user?.id || '',
          outletId: outletId || undefined,
          maxRetries: 3,
          conflictResolution: 'client-wins',
        });

        // Create offline invoice
        const invoiceNumber = generateOfflineInvoiceNumber();
        const invoiceId = generateLocalId();
        await queueMutation({
          table: 'invoices',
          operation: 'insert',
          data: {
            id: invoiceId,
            user_id: user?.id,
            outlet_id: outletId,
            session_id: sessionId,
            invoice_number: invoiceNumber,
            total_amount: session?.total_amount || 0,
            status: hasDebtor ? 'unpaid' : 'paid',
            invoice_type: hasDebtor ? 'b2b' : 'b2c',
            business_customer_id: session?.debtor_id || null,
            customer_name: `Table ${session?.table_number}`,
            items: [],
            created_at: new Date().toISOString(),
          },
          localId: invoiceId,
          userId: user?.id || '',
          outletId: outletId || undefined,
          maxRetries: 3,
          conflictResolution: 'client-wins',
        });

        // Update local cache
        await updateLocalCache({ id: sessionId, status: newStatus as any, closed_at: new Date().toISOString() });

        return { hasDebtor, invoiceNumber };
      }

      const { data: sessionData } = await supabase
        .from('table_sessions' as any)
        .select('debtor_id')
        .eq('id', sessionId)
        .maybeSingle();

      const hasDebtorDb = (sessionData as any)?.debtor_id !== null;

      const { error } = await supabase
        .from('table_sessions' as any)
        .update({
          status: hasDebtorDb ? 'paid' : 'closed',
          closed_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (error) throw error;
      return { hasDebtor: hasDebtorDb };
    },
    onSuccess: ({ hasDebtor }) => {
      queryClient.invalidateQueries({ queryKey: ['table-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
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
          outletId: outletId || undefined,
          maxRetries: 3,
          conflictResolution: 'client-wins',
        });

        // Also mark invoice as paid if not debtor
        if (!isDebtorSession) {
          await queueMutation({
            table: 'invoices',
            operation: 'update',
            data: { 
              session_id: sessionId, 
              status: 'paid', 
              paid_date: new Date().toISOString(),
              payment_method: paymentMethod || 'Espèces'
            },
            localId: generateLocalId(),
            userId: user?.id || '',
            outletId: outletId || undefined,
            maxRetries: 3,
            conflictResolution: 'client-wins',
          });

          // Create transaction
          await queueMutation({
            table: 'transactions',
            operation: 'insert',
            data: {
              id: generateLocalId(),
              user_id: user?.id,
              outlet_id: outletId,
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
            outletId: outletId || undefined,
            maxRetries: 3,
            conflictResolution: 'client-wins',
          });
        }

        await updateLocalCache({ id: sessionId, status: 'paid', payment_method: paymentMethod });
        return { isDebtorSession };
      }

      // Online flow
      const { data: sessionData } = await supabase
        .from('table_sessions' as any)
        .select('debtor_id')
        .eq('id', sessionId)
        .maybeSingle();

      const isDebtorDb = (sessionData as any)?.debtor_id !== null;

      const { error: sessionError } = await supabase
        .from('table_sessions' as any)
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
          outletId: outletId || undefined,
          maxRetries: 3,
          conflictResolution: 'client-wins',
        });

        // Delete invoice (will be recreated on close)
        await queueMutation({
          table: 'invoices',
          operation: 'delete',
          data: { session_id: sessionId },
          localId: generateLocalId(),
          userId: user?.id || '',
          outletId: outletId || undefined,
          maxRetries: 3,
          conflictResolution: 'client-wins',
        });

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
        .from('table_sessions' as any)
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

  useEffect(() => {
    if (!user || dataOffline) return;

    const channel = supabase
      .channel('table-sessions-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'table_sessions',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['table-sessions'] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient, dataOffline]);

  return {
    sessions: sessions || [],
    loading: isLoading || outletLoading,
    isOffline: dataOffline,
    createSession: createSessionMutation.mutate,
    closeSession: closeSessionMutation.mutate,
    markSessionAsPaid: (sessionId: string, paymentMethod?: string) => 
      markSessionAsPaidMutation.mutate({ sessionId, paymentMethod }),
    reopenSession: reopenSessionMutation.mutate,
    getActiveSessionForTable,
    refetch,
  };
};
