import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useOptimizedOutlet } from "@/hooks/useOptimizedOutlet";

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

export function useTableSessions() {
  const [sessions, setSessions] = useState<TableSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const { outletId, loading: outletLoading } = useOptimizedOutlet();

  const fetchSessions = useCallback(async () => {
    if (!user || outletLoading) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      let query = supabase
        .from("table_sessions" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })
        .limit(50) as any; // Limiter à 50 sessions pour la performance

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
  }, [user, outletId, outletLoading, toast]);

  const createSession = useCallback(
    async (tableNumber: string, numberOfGuests?: number, notes?: string, debtorId?: string) => {
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté.",
          variant: "destructive",
        });
        return null;
      }

      try {
        const { data, error } = await supabase
          .from("table_sessions" as any)
          .insert([
            {
              user_id: user.id,
              outlet_id: outletId,
              table_number: tableNumber,
              number_of_guests: numberOfGuests,
              notes: notes,
              debtor_id: debtorId,
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
    [user, outletId, toast, fetchSessions]
  );

  const closeSession = useCallback(
    async (sessionId: string) => {
      try {
        // Récupérer la session complète pour vérifier le débiteur et les montants
        const { data: session, error: fetchError } = await supabase
          .from("table_sessions" as any)
          .select("id, user_id, outlet_id, debtor_id, table_number, total_amount")
          .eq("id", sessionId)
          .maybeSingle();

        if (fetchError) throw fetchError;
        if (!session) {
          throw new Error("Session introuvable");
        }

        const hasDebtor = (session as any)?.debtor_id !== null;

        // Si c'est un débiteur, on garde le statut "paid" pour enregistrer un crédit
        const { error: updateError } = await supabase
          .from("table_sessions" as any)
          .update({
            status: hasDebtor ? "paid" : "closed",
            closed_at: new Date().toISOString(),
          })
          .eq("id", sessionId);

        if (updateError) throw updateError;

        // Vérifier si une facture existe déjà pour cette session
        const { data: existingInvoice, error: existingError } = await supabase
          .from("invoices" as any)
          .select("id")
          .eq("session_id", sessionId)
          .maybeSingle();

        if (existingError && existingError.code !== "PGRST116") throw existingError;

        // Si aucune facture, la générer automatiquement
        if (!existingInvoice) {
          // Récupérer les commandes de la session pour construire les lignes de facture
          const { data: orders, error: ordersError } = await supabase
            .from("orders" as any)
            .select("items, customer_name, customer_email, customer_phone, created_at")
            .eq("session_id", sessionId)
            .order("created_at", { ascending: true });

          if (ordersError) throw ordersError;

          const ordersList = (orders ?? []) as any[];

          const allItems: any[] = [];
          ordersList.forEach((order: any) => {
            const orderItems = Array.isArray(order.items)
              ? order.items
              : order.items
              ? (order.items as any[])
              : [];
            allItems.push(...orderItems);
          });

          const firstOrder: any | null = ordersList.length > 0 ? (ordersList[0] as any) : null;

          // Générer un numéro de facture séquentiel
          const { data: invoiceNumber, error: invoiceNumberError } = await supabase.rpc(
            "generate_invoice_number"
          );

          if (invoiceNumberError) throw invoiceNumberError;
          if (!invoiceNumber) throw new Error("Impossible de générer un numéro de facture");

          // Paramètres spécifiques si la session est liée à un débiteur
          let dueDate: string | null = null;
          let paymentTermsDays: number | null = null;
          let businessCustomerId: string | null = null;
          let invoiceType = "b2c";
          let billingAddress: string | null = null;
          let siret: string | null = null;

          if (hasDebtor && (session as any).debtor_id) {
            invoiceType = "b2b";
            businessCustomerId = (session as any).debtor_id as string;

            const { data: debtor, error: debtorError } = await supabase
              .from("business_customers" as any)
              .select("payment_terms_days, address, siret")
              .eq("id", businessCustomerId)
              .maybeSingle();

            if (debtorError && debtorError.code !== "PGRST116") throw debtorError;

            paymentTermsDays = (debtor as any)?.payment_terms_days ?? 30;
            const now = new Date();
            now.setDate(now.getDate() + paymentTermsDays);
            dueDate = now.toISOString().split("T")[0];
            billingAddress = (debtor as any)?.address ?? null;
            siret = (debtor as any)?.siret ?? null;
          }

          const { error: insertError } = await supabase
            .from("invoices" as any)
            .insert([
              {
                user_id: (session as any).user_id,
                outlet_id: (session as any).outlet_id,
                session_id: sessionId,
                business_customer_id: businessCustomerId,
                invoice_number: invoiceNumber,
                invoice_type: invoiceType,
                total_amount: (session as any).total_amount ?? 0,
                status: "unpaid",
                due_date: dueDate,
                payment_terms_days: paymentTermsDays,
                notes: `Facture générée automatiquement pour la table ${(session as any).table_number}`,
                billing_address: billingAddress,
                siret,
                customer_name: firstOrder?.customer_name ?? "Client",
                customer_email: firstOrder?.customer_email ?? null,
                customer_phone: firstOrder?.customer_phone ?? null,
                items: allItems,
              },
            ]);

          if (insertError) throw insertError;
        }

        toast({
          title: hasDebtor ? "Session fermée - Crédit accordé" : "Session fermée",
          description: hasDebtor
            ? "La dette du client a été enregistrée. Aucun paiement immédiat requis."
            : "La facture a été générée automatiquement.",
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
    [toast, fetchSessions]
  );

  const markSessionAsPaid = useCallback(
    async (sessionId: string) => {
      try {
        // Update session status to paid
        const { error: sessionError } = await supabase
          .from("table_sessions" as any)
          .update({ status: "paid" })
          .eq("id", sessionId);

        if (sessionError) throw sessionError;

        // Update associated invoice to paid
        const { error: invoiceError } = await supabase
          .from("invoices")
          .update({ 
            status: "paid",
            paid_date: new Date().toISOString()
          })
          .eq("session_id", sessionId);

        // Don't throw on invoice error - invoice might not exist yet
        if (invoiceError) {
          console.warn("Invoice update error (may not exist):", invoiceError);
        }

        toast({
          title: "Paiement enregistré",
          description: "La session et la facture ont été marquées comme payées.",
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
    [user, outletId]
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
