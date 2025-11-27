import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOptimizedOutlet } from '@/hooks/useOptimizedOutlet';
import { useEffect } from 'react';

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
  created_at: string;
  updated_at: string;
}

export const useOptimizedTableSessions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { outletId, loading: outletLoading } = useOptimizedOutlet();
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['table-sessions', user?.id, outletId],
    queryFn: async () => {
      if (!user || outletLoading) return [];

      let query = supabase
        .from('table_sessions' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(50) as any;

      if (outletId) {
        query = query.eq('outlet_id', outletId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as any) || [];
    },
    enabled: !!user && !outletLoading,
  });

  const createSessionMutation = useMutation({
    mutationFn: async ({ tableNumber, numberOfGuests, notes, debtorId }: {
      tableNumber: string;
      numberOfGuests?: number;
      notes?: string;
      debtorId?: string;
    }) => {
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
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['table-sessions'] });
      toast({
        title: "Session ouverte",
        description: `Table ${(data as any).table_number} activée`,
      });
    },
  });

  const closeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data: session } = await supabase
        .from('table_sessions' as any)
        .select('debtor_id')
        .eq('id', sessionId)
        .maybeSingle();

      const hasDebtor = (session as any)?.debtor_id !== null;

      const { error } = await supabase
        .from('table_sessions' as any)
        .update({
          status: hasDebtor ? 'paid' : 'closed',
          closed_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (error) throw error;
      return { hasDebtor };
    },
    onSuccess: ({ hasDebtor }) => {
      queryClient.invalidateQueries({ queryKey: ['table-sessions'] });
      toast({
        title: hasDebtor ? "Session fermée - Crédit accordé" : "Session fermée",
        description: hasDebtor ? "Dette enregistrée" : "Facture générée",
      });
    },
  });

  useEffect(() => {
    if (!user) return;

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
  }, [user, queryClient]);

  return {
    sessions,
    loading: isLoading || outletLoading,
    createSession: createSessionMutation.mutate,
    closeSession: closeSessionMutation.mutate,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['table-sessions'] }),
  };
};
