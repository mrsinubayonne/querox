import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface DebtorPayment {
  id: string;
  invoice_id: string;
  debtor_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes?: string;
  user_id: string;
  outlet_id?: string;
  created_at: string;
}

export function useDebtorPayments(outletId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payments, isLoading } = useQuery({
    queryKey: ["debtor-payments", user?.id, outletId],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from("debtor_payments" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("payment_date", { ascending: false });

      if (outletId) {
        query = query.eq("outlet_id", outletId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as DebtorPayment[];
    },
    enabled: !!user?.id,
  });

  const createPayment = useMutation({
    mutationFn: async (payment: Omit<DebtorPayment, "id" | "user_id" | "created_at">) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("debtor_payments" as any)
        .insert([{ ...payment, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debtor-payments"] });
      queryClient.invalidateQueries({ queryKey: ["business-customers"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast({
        title: "Paiement enregistré",
        description: "Le paiement a été enregistré avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get payments for a specific invoice
  const getPaymentsForInvoice = async (invoiceId: string) => {
    const { data, error } = await supabase
      .from("debtor_payments" as any)
      .select("*")
      .eq("invoice_id", invoiceId)
      .order("payment_date", { ascending: true });

    if (error) throw error;
    return data as unknown as DebtorPayment[];
  };

  // Get total paid for an invoice
  const getTotalPaidForInvoice = async (invoiceId: string) => {
    const payments = await getPaymentsForInvoice(invoiceId);
    return payments.reduce((sum, p) => sum + p.amount, 0);
  };

  return {
    payments: payments || [],
    isLoading,
    createPayment: createPayment.mutate,
    createPaymentAsync: createPayment.mutateAsync,
    isCreating: createPayment.isPending,
    getPaymentsForInvoice,
    getTotalPaidForInvoice,
  };
}
