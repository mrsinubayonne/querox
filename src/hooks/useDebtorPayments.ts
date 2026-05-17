import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from 'sonner';

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

      // 1. Create the debtor payment FIRST and capture its id
      const { data: paymentRow, error: paymentError } = await supabase
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

      if (paymentError) throw paymentError;
      const paymentId = (paymentRow as any)?.id;

      // 2. Create accounting transaction for THIS payment.
      // Idempotence: tag the description with the payment id so we can detect
      // re-submissions and avoid creating duplicate transactions if the user
      // double-clicks or if a sync replay happens.
      const transactionTitle = payment.debtor_name
        ? `Paiement débiteur - ${payment.debtor_name}`
        : `Paiement débiteur`;
      const idempotencyTag = paymentId ? `[debtor_payment:${paymentId}]` : '';
      const description = `${payment.notes || `Paiement sur facture`} ${idempotencyTag}`.trim();

      // Check if a transaction already exists for this payment id (idempotency)
      let alreadyExists = false;
      if (paymentId) {
        const { data: existingTx } = await supabase
          .from("transactions")
          .select("id")
          .eq("user_id", user.id)
          .ilike("description", `%[debtor_payment:${paymentId}]%`)
          .limit(1)
          .maybeSingle();
        alreadyExists = !!existingTx;
      }

      if (!alreadyExists) {
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
            description,
            user_id: user.id,
            outlet_id: payment.outlet_id || null,
          });
      }

      // 3. Check if invoice is fully paid and update status
      const { data: allPayments } = await supabase
        .from("debtor_payments" as any)
        .select("amount")
        .eq("invoice_id", payment.invoice_id)
        .limit(10000);

      const totalPaid = (allPayments || []).reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

      // Get invoice total
      const { data: invoice } = await supabase
        .from("invoices")
        .select("total_amount, status")
        .eq("id", payment.invoice_id)
        .maybeSingle();

      if (invoice && invoice.status !== 'paid' && totalPaid >= Number(invoice.total_amount || 0)) {
        await supabase
          .from("invoices")
          .update({
            status: "paid",
            paid_date: new Date().toISOString().split('T')[0],
            payment_method: payment.payment_method,
          })
          .eq("id", payment.invoice_id);

        // Recompute debtor's current_debt from remaining unpaid invoices
        const { data: debtorInvoices } = await supabase
          .from("invoices")
          .select("total_amount")
          .eq("business_customer_id", payment.debtor_id)
          .neq("status", "paid")
          .limit(10000);

        const remainingDebt = (debtorInvoices || []).reduce(
          (sum: number, inv: any) => sum + Number(inv.total_amount || 0),
          0
        );

        await supabase
          .from("business_customers")
          .update({ current_debt: remainingDebt })
          .eq("id", payment.debtor_id);
      }

      return paymentRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debtor-payments"] });
      queryClient.invalidateQueries({ queryKey: ["business-customers"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Paiement enregistré", { description: "Le paiement et la transaction comptable ont été enregistrés" });
    },
    onError: (error: Error) => {
      toast.error("Erreur", { description: error.message });
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
