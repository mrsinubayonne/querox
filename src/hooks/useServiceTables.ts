/**
 * useServiceTables — module "Service" (indépendant de /tables)
 *
 * Règles strictes :
 *  - La base de données est l'UNIQUE source de vérité (aucun cache local,
 *    aucun store zustand, aucune file offline).
 *  - Seules les sessions du JOUR courant et du point de vente actif sont lues :
 *    les vieilles tables ne peuvent plus "revenir".
 *  - Le montant affiché est toujours recalculé depuis les commandes.
 *  - Encaisser = une seule écriture qui libère la table, puis la facture.
 */
import { useCallback, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOutletContext } from '@/contexts/OutletContext';

export interface ServiceSession {
  id: string;
  user_id: string;
  outlet_id: string | null;
  table_number: string;
  custom_table_name: string | null;
  status: 'active' | 'closed' | 'paid';
  started_at: string;
  closed_at: string | null;
  number_of_guests: number | null;
  total_amount: number;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceOrderLine {
  id: string;
  name: string;
  price: number;
  quantity: number;
  selected_options?: unknown[];
}

const SESSION_COLUMNS =
  'id,user_id,outlet_id,table_number,custom_table_name,status,started_at,closed_at,number_of_guests,total_amount,payment_method,created_at,updated_at';

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

export const normalizeTableNo = (value: string | number | null | undefined): string => {
  const raw = String(value ?? '').trim();
  const match = raw.match(/\d+/);
  if (!match) return raw;
  const n = Number.parseInt(match[0], 10);
  if (!Number.isFinite(n) || n <= 0) return raw;
  return String(n).padStart(2, '0');
};

export const useServiceTables = () => {
  const { selectedOutletId } = useOutletContext();
  const { user, isTeamMember, teamMemberSession } = useAuth();
  const queryClient = useQueryClient();

  const userId = (isTeamMember ? teamMemberSession?.ownerId : user?.id) || '';
  const outletId =
    selectedOutletId ||
    (typeof window !== 'undefined' ? localStorage.getItem('selectedOutletId') : null) ||
    '';

  const queryKey = useMemo(() => ['service-tables', userId, outletId] as const, [userId, outletId]);

  const fetchSessions = useCallback(async (): Promise<ServiceSession[]> => {
    if (!userId || !outletId) return [];

    const { data, error } = await supabase
      .from('table_sessions')
      .select(SESSION_COLUMNS)
      .eq('user_id', userId)
      .eq('outlet_id', outletId)
      .in('status', ['active', 'closed'])
      .gte('started_at', startOfToday())
      .order('started_at', { ascending: false })
      .limit(300);

    if (error) throw error;

    const list = ((data as unknown as ServiceSession[]) || []).map((s) => ({
      ...s,
      total_amount: Number(s.total_amount || 0),
    }));
    if (list.length === 0) return [];

    const { data: orderRows } = await supabase
      .from('orders')
      .select('session_id,total_amount')
      .in('session_id', list.map((s) => s.id))
      .limit(2000);

    const totals = new Map<string, number>();
    for (const row of (orderRows as { session_id: string | null; total_amount: number | null }[]) || []) {
      if (!row.session_id) continue;
      totals.set(row.session_id, (totals.get(row.session_id) || 0) + Number(row.total_amount || 0));
    }

    return list.map((s) => (totals.has(s.id) ? { ...s, total_amount: totals.get(s.id) as number } : s));
  }, [userId, outletId]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey,
    queryFn: fetchSessions,
    enabled: !!userId && !!outletId,
    staleTime: 3_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const sessions = useMemo(() => data || [], [data]);

  /** Une table = une seule session visible (la plus récente). */
  const sessionByTable = useMemo(() => {
    const map = new Map<string, ServiceSession>();
    for (const s of sessions) {
      const key = normalizeTableNo(s.table_number);
      const current = map.get(key);
      if (!current || Date.parse(s.started_at) > Date.parse(current.started_at)) {
        map.set(key, s);
      }
    }
    return map;
  }, [sessions]);

  useEffect(() => {
    if (!userId || !outletId) return;
    const invalidate = () => queryClient.invalidateQueries({ queryKey });
    const channel = supabase
      .channel(`service-${outletId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'table_sessions', filter: `outlet_id=eq.${outletId}` },
        invalidate,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, outletId, queryClient, queryKey]);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    await refetch();
  }, [queryClient, queryKey, refetch]);

  const assertReady = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      throw new Error('Vous êtes hors ligne. Reconnectez-vous pour enregistrer.');
    }
    if (!userId) throw new Error('Non authentifié.');
    if (!outletId) throw new Error('Aucun point de vente sélectionné.');
  }, [userId, outletId]);

  const sumOrders = useCallback(async (sessionId: string) => {
    const { data: rows } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('session_id', sessionId)
      .limit(2000);
    return ((rows as { total_amount: number | null }[]) || []).reduce(
      (sum, o) => sum + Number(o.total_amount || 0),
      0,
    );
  }, []);

  const insertOrder = useCallback(
    async (sessionId: string, tableNumber: string, items: ServiceOrderLine[], total: number) => {
      const { error } = await supabase.from('orders').insert([
        {
          user_id: userId,
          outlet_id: outletId,
          session_id: sessionId,
          table_number: tableNumber,
          order_type: 'sur_place',
          customer_name: `Table ${tableNumber}`,
          items: items as unknown as never,
          total_amount: total,
          status: 'pending',
        },
      ]);
      if (error) throw error;
    },
    [userId, outletId],
  );

  /** Ouvre une table avec sa première commande (opération unique). */
  const openTable = useMutation({
    mutationFn: async ({
      tableNumber,
      numberOfGuests,
      items,
      totalAmount,
    }: {
      tableNumber: string;
      numberOfGuests?: number;
      items: ServiceOrderLine[];
      totalAmount: number;
    }) => {
      assertReady();
      if (!items.length) throw new Error('Le ticket est vide.');

      const { data: session, error } = await supabase
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
        .select('id')
        .single();
      if (error) throw error;

      try {
        await insertOrder(session.id, tableNumber, items, totalAmount);
      } catch (e) {
        await supabase.from('table_sessions').delete().eq('id', session.id);
        throw e;
      }
      return tableNumber;
    },
    onSuccess: async (tableNumber) => {
      await refresh();
      toast.success('Commande enregistrée', { description: `Table ${tableNumber} ouverte.` });
    },
    onError: (e: Error) => toast.error('Commande non enregistrée', { description: e.message }),
  });

  /** Ajoute une commande à une table déjà ouverte. */
  const addOrder = useMutation({
    mutationFn: async ({
      sessionId,
      tableNumber,
      items,
      totalAmount,
    }: {
      sessionId: string;
      tableNumber: string;
      items: ServiceOrderLine[];
      totalAmount: number;
    }) => {
      assertReady();
      if (!items.length) throw new Error('Le ticket est vide.');
      await insertOrder(sessionId, tableNumber, items, totalAmount);
      const total = await sumOrders(sessionId);
      await supabase
        .from('table_sessions')
        .update({ total_amount: total, updated_at: new Date().toISOString() })
        .eq('id', sessionId);
    },
    onSuccess: async () => {
      await refresh();
      toast.success('Commande ajoutée');
    },
    onError: (e: Error) => toast.error('Commande non enregistrée', { description: e.message }),
  });

  /**
   * Encaissement : libère la table en une écriture, puis enregistre la facture.
   * Si la facture échoue, la table reste libérée et l'utilisateur est prévenu.
   */
  const payAndClose = useMutation({
    mutationFn: async ({
      sessionId,
      paymentMethod = 'Espèces',
    }: {
      sessionId: string;
      paymentMethod?: string;
    }) => {
      assertReady();
      const nowIso = new Date().toISOString();
      const total = await sumOrders(sessionId);

      const { data: updated, error } = await supabase
        .from('table_sessions')
        .update({
          status: 'paid',
          payment_method: paymentMethod,
          closed_at: nowIso,
          total_amount: total,
          updated_at: nowIso,
        })
        .eq('id', sessionId)
        .select('id,table_number')
        .maybeSingle();
      if (error) throw error;
      if (!updated) throw new Error('Session introuvable. Actualisez puis réessayez.');

      let invoiceWarning: string | null = null;
      try {
        const { data: existing } = await supabase
          .from('invoices')
          .select('id')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (existing && existing.length > 0) {
          const { error: upErr } = await supabase
            .from('invoices')
            .update({
              status: 'paid',
              paid_date: nowIso.slice(0, 10),
              payment_method: paymentMethod,
              total_amount: total,
              updated_at: nowIso,
            })
            .eq('id', existing[0].id);
          if (upErr) throw upErr;
        } else {
          const { data: orderRows } = await supabase
            .from('orders')
            .select('items')
            .eq('session_id', sessionId)
            .limit(2000);
          const items = ((orderRows as { items: unknown }[]) || []).flatMap((o) =>
            Array.isArray(o.items) ? (o.items as unknown[]) : [],
          );
          const { error: insErr } = await supabase.from('invoices').insert([
            {
              user_id: userId,
              outlet_id: outletId,
              session_id: sessionId,
              total_amount: total,
              status: 'paid',
              paid_date: nowIso.slice(0, 10),
              payment_method: paymentMethod,
              customer_name: `Table ${updated.table_number}`,
              items: items as unknown as never,
            },
          ]);
          if (insErr) throw insErr;
        }
      } catch (e) {
        invoiceWarning = e instanceof Error ? e.message : 'Facture non enregistrée';
      }

      return { tableNumber: updated.table_number as string, total, invoiceWarning };
    },
    onSuccess: async ({ tableNumber, invoiceWarning }) => {
      await refresh();
      if (invoiceWarning) {
        toast.warning('Table libérée, facture à vérifier', { description: invoiceWarning });
      } else {
        toast.success('Paiement enregistré', { description: `Table ${tableNumber} libérée.` });
      }
    },
    onError: (e: Error) => toast.error('Paiement non enregistré', { description: e.message }),
  });

  return {
    sessions,
    sessionByTable,
    loading: isLoading,
    refreshing: isFetching,
    ready: !!userId && !!outletId,
    refresh,
    openTable: openTable.mutateAsync,
    addOrder: addOrder.mutateAsync,
    payAndClose: payAndClose.mutateAsync,
    isMutating: openTable.isPending || addOrder.isPending || payAndClose.isPending,
    payingSessionId: payAndClose.isPending ? payAndClose.variables?.sessionId ?? null : null,
  };
};
