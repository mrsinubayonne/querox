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
    mutationFn: async (payment: Omit<DebtorPayment, "id" | "user_id" | "created_at"> & { debtor_name?: string }) => {
      if (!user?.id) throw new Error("User not authenticated");

      // 1. Create the debtor payment
      const { data, error } = await supabase
        .from("debtor_payments" as any)
        .insert([{ 
          invoice_id: payment.invoice_id,
          debtor_id: payment.debtor_id,
          amount: payment.amount,
          payment_date: payment.payment_date,
          payment_method: payment.payment_method,
          notes: payment.notes,
          outlet_id: payment.outlet_id,
          user_id: user.id 
        }])
        .select()
        .single();

      if (error) throw error;

      // 2. Create accounting transaction for the payment
      const transactionTitle = payment.debtor_name 
        ? `Paiement débiteur - ${payment.debtor_name}`
        : `Paiement débiteur`;

      await supabase
        .from("transactions")
        .insert({
          title: transactionTitle,
          amount: payment.amount,
          type: "income",
          category: "paiement_debiteur",
          date: payment.payment_date,
          status: "completed",
          payment_method: payment.payment_method,
          description: payment.notes || `Paiement sur facture`,
          user_id: user.id,
          outlet_id: payment.outlet_id || null,
        });

      // 3. Check if invoice is fully paid and update status
      const { data: allPayments } = await supabase
        .from("debtor_payments" as any)
        .select("amount")
        .eq("invoice_id", payment.invoice_id);

      const totalPaid = (allPayments || []).reduce((sum: number, p: any) => sum + p.amount, 0);

      // Get invoice total
      const { data: invoice } = await supabase
        .from("invoices")
        .select("total_amount")
        .eq("id", payment.invoice_id)
        .single();

      if (invoice && totalPaid >= invoice.total_amount) {
        await supabase
          .from("invoices")
          .update({ 
            status: "paid",
            paid_date: new Date().toISOString()
          })
          .eq("id", payment.invoice_id);

        // Update debtor's current_debt
        const { data: debtorInvoices } = await supabase
          .from("invoices")
          .select("total_amount")
          .eq("business_customer_id", payment.debtor_id)
          .neq("status", "paid");

        const remainingDebt = (debtorInvoices || []).reduce((sum: number, inv: any) => sum + inv.total_amount, 0);

        await supabase
          .from("business_customers")
          .update({ current_debt: remainingDebt })
          .eq("id", payment.debtor_id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debtor-payments"] });
      queryClient.invalidateQueries({ queryKey: ["business-customers"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast({
        title: "Paiement enregistré",
        description: "Le paiement et la transaction comptable ont été enregistrés",
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
