import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface OverdueInvoice {
  id: string;
  user_id: string;
  outlet_id?: string;
  order_id?: string;
  session_id?: string;
  business_customer_id?: string;
  invoice_number: string;
  invoice_type: string;
  total_amount: number;
  status: string;
  due_date: string;
  paid_date?: string;
  payment_terms_days?: number;
  siret?: string;
  billing_address?: string;
  notes?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  items: any;
  created_at: string;
  updated_at: string;
  company_name?: string;
  contact_person?: string;
  customer_email_b2b?: string;
  days_overdue: number;
}

export function useOverdueInvoices() {
  const { user } = useAuth();

  const { data: overdueInvoices, isLoading, refetch } = useQuery({
    queryKey: ["overdue-invoices", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase.rpc("get_overdue_invoices");

      if (error) throw error;
      return data as OverdueInvoice[];
    },
    enabled: !!user?.id,
  });

  const totalOverdueAmount = overdueInvoices?.reduce(
    (sum, invoice) => sum + invoice.total_amount,
    0
  ) || 0;

  const overdueCount = overdueInvoices?.length || 0;

  return {
    overdueInvoices: overdueInvoices || [],
    isLoading,
    refetch,
    totalOverdueAmount,
    overdueCount,
  };
}
