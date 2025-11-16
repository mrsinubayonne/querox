import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface TableSession {
  id: string;
  user_id: string;
  outlet_id: string | null;
  table_number: string;
  status: "active" | "closed" | "paid";
  started_at: string;
  closed_at: string | null;
  number_of_guests: number | null;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useTableSessions() {
  const [sessions, setSessions] = useState<TableSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchSessions = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get selected outlet: prefer selectedProfileId in localStorage, fallback to user profile
      const selectedProfileId = localStorage.getItem('selectedProfileId');
      let outletId: string | null = null;
      if (selectedProfileId) {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('selected_outlet_id')
          .eq('id', selectedProfileId)
          .maybeSingle();
        outletId = (userProfile as any)?.selected_outlet_id ?? null;
      } else {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('selected_outlet_id')
          .eq('user_id', user.id)
          .maybeSingle();
        outletId = (profile as any)?.selected_outlet_id ?? null;
      }

      let query = supabase
        .from("table_sessions" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false }) as any;

      if (outletId) {
        query = query.eq("outlet_id", outletId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setSessions((data as any) || []);
    } catch (error: any) {
      console.error("Error fetching table sessions:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les sessions de tables.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createSession = useCallback(
    async (tableNumber: string, numberOfGuests?: number, notes?: string) => {
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté.",
          variant: "destructive",
        });
        return null;
      }

      try {
        // Get selected outlet: prefer selectedProfileId in localStorage, fallback to user profile
        const selectedProfileId = localStorage.getItem('selectedProfileId');
        let outletId: string | null = null;
        if (selectedProfileId) {
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('selected_outlet_id')
            .eq('id', selectedProfileId)
            .maybeSingle();
          outletId = (userProfile as any)?.selected_outlet_id ?? null;
        } else {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('selected_outlet_id')
            .eq('user_id', user.id)
            .maybeSingle();
          outletId = (profile as any)?.selected_outlet_id ?? null;
        }

        const { data, error } = await supabase
          .from("table_sessions" as any)
          .insert([
            {
              user_id: user.id,
              outlet_id: outletId,
              table_number: tableNumber,
              number_of_guests: numberOfGuests,
              notes: notes,
              status: "active",
            },
          ])
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Session ouverte",
          description: `Table ${tableNumber} activée avec succès.`,
        });

        await fetchSessions();
        return data;
      } catch (error: any) {
        console.error("Error creating session:", error);
        toast({
          title: "Erreur",
          description: "Impossible de créer la session.",
          variant: "destructive",
        });
        return null;
      }
    },
    [user, toast, fetchSessions]
  );

  const closeSession = useCallback(
    async (sessionId: string) => {
      if (!user) return;

      try {
        // Récupérer la session pour obtenir toutes les infos
        const { data: sessionData, error: sessionError } = await supabase
          .from("table_sessions" as any)
          .select("*")
          .eq("id", sessionId)
          .single();

        if (sessionError || !sessionData) throw sessionError || new Error("Session not found");
        
        const session: any = sessionData;

        // Récupérer toutes les commandes de cette session
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders" as any)
          .select("*")
          .eq("session_id", sessionId);

        if (ordersError) throw ordersError;
        
        const orders: any[] = ordersData || [];

        // Calculer le montant total et préparer les items
        const items = orders.flatMap((order) => order.items || []);
        const totalAmount = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

        // Générer un numéro de facture
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const invoiceNumber = `INV-${year}${month}-${random}`;

        // Obtenir le nom du client depuis la première commande ou utiliser le numéro de table
        const customerName = (orders.length > 0 && orders[0].customer_name) 
          ? orders[0].customer_name 
          : `Table ${session.table_number}`;

        // Créer la facture avec le même outlet_id que la session
        const { error: invoiceError } = await supabase
          .from("invoices" as any)
          .insert({
            user_id: user.id,
            outlet_id: session.outlet_id || null, // Important : utiliser l'outlet_id de la session
            session_id: sessionId,
            invoice_number: invoiceNumber,
            total_amount: totalAmount,
            status: 'unpaid',
            items: items,
            customer_name: customerName,
            created_at: new Date().toISOString(),
          });

        if (invoiceError) throw invoiceError;

        // Fermer la session
        const { error: updateError } = await supabase
          .from("table_sessions" as any)
          .update({
            status: "closed",
            closed_at: new Date().toISOString(),
            total_amount: totalAmount,
          })
          .eq("id", sessionId);

        if (updateError) throw updateError;

        toast({
          title: "Session fermée",
          description: `Facture ${invoiceNumber} générée avec succès.`,
        });

        await fetchSessions();
      } catch (error: any) {
        console.error("Error closing session:", error);
        toast({
          title: "Erreur",
          description: "Impossible de fermer la session.",
          variant: "destructive",
        });
      }
    },
    [user, toast, fetchSessions]
  );

  const markSessionAsPaid = useCallback(
    async (sessionId: string) => {
      try {
        const { error } = await supabase
          .from("table_sessions" as any)
          .update({ status: "paid" })
          .eq("id", sessionId);

        if (error) throw error;

        toast({
          title: "Paiement enregistré",
          description: "La session a été marquée comme payée.",
        });

        await fetchSessions();
      } catch (error: any) {
        console.error("Error marking session as paid:", error);
        toast({
          title: "Erreur",
          description: "Impossible de marquer la session comme payée.",
          variant: "destructive",
        });
      }
    },
    [toast, fetchSessions]
  );

  const getActiveSessionForTable = useCallback(
    async (tableNumber: string): Promise<TableSession | null> => {
      if (!user) return null;

      try {
        const selectedProfileId = localStorage.getItem('selectedProfileId');
        let outletId: string | null = null;

        if (selectedProfileId) {
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('selected_outlet_id')
            .eq('id', selectedProfileId)
            .maybeSingle();
          outletId = (userProfile as any)?.selected_outlet_id ?? null;
        } else {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('selected_outlet_id')
            .eq('user_id', user.id)
            .maybeSingle();
          outletId = (profile as any)?.selected_outlet_id ?? null;
        }

        let query = supabase
          .from('table_sessions' as any)
          .select('*')
          .eq('user_id', user.id)
          .eq('table_number', tableNumber)
          .eq('status', 'active') as any;

        if (outletId) {
          query = query.eq('outlet_id', outletId);
        }

        const { data, error } = await query.maybeSingle();

        if (error && error.code !== "PGRST116") throw error;

        return data as any;
      } catch (error: any) {
        console.error("Error checking active session:", error);
        return null;
      }
    },
    [user]
  );

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("table-sessions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "table_sessions",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchSessions]);

  return {
    sessions,
    loading,
    createSession,
    closeSession,
    markSessionAsPaid,
    getActiveSessionForTable,
    refetch: fetchSessions,
  };
}
