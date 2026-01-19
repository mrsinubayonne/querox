import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOfflineData } from "@/hooks/useOfflineData";
import { useOfflineInsert, useOfflineUpdate, useOfflineDelete } from "@/hooks/useOfflineMutation";

export interface Debtor {
  id: string;
  user_id: string;
  outlet_id?: string;
  company_name: string;
  siret?: string;
  address?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  credit_limit: number;
  current_debt: number;
  payment_terms_days: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Alias pour compatibilité
export type BusinessCustomer = Debtor;

export function useDebtors(outletId?: string) {
  const { user } = useAuth();

  const { data: customers, isLoading, refetch } = useOfflineData<Debtor>({
    table: 'business_customers',
    queryKey: ['business-customers', outletId || ''],
    enabled: !!user?.id,
    buildQuery: async (userId, outlet) => {
      let query = supabase
        .from("business_customers")
        .select("*")
        .eq("user_id", userId)
        .order("company_name");

      if (outlet) {
        query = query.or(`outlet_id.eq.${outlet},outlet_id.is.null`);
      }

      const { data, error } = await query;
      return { data: (data || []) as Debtor[], error };
    },
  });

  const insertMutation = useOfflineInsert({
    table: 'business_customers',
    queryKey: ['business-customers'],
  });

  const updateMutation = useOfflineUpdate({
    table: 'business_customers',
    queryKey: ['business-customers'],
  });

  const deleteMutation = useOfflineDelete({
    table: 'business_customers',
    queryKey: ['business-customers'],
  });

  const createCustomer = (
    customer: Omit<Debtor, "id" | "user_id" | "current_debt" | "created_at" | "updated_at">,
    options?: { onSuccess?: (data: unknown) => void; onError?: (error: Error) => void }
  ) => {
    if (!user?.id) return;
    insertMutation.mutate(
      {
        ...customer,
        user_id: user.id,
        outlet_id: outletId,
        current_debt: 0,
      } as unknown as Record<string, unknown>,
      {
        onSuccess: options?.onSuccess,
        onError: options?.onError,
      }
    );
  };

  const updateCustomer = ({ id, ...updates }: Partial<Debtor> & { id: string }) => {
    updateMutation.mutate({ id, ...updates } as unknown as Record<string, unknown> & { id: string });
  };

  const deleteCustomer = (id: string) => {
    deleteMutation.mutate(id);
  };

  return {
    customers,
    isLoading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    isCreating: insertMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    refetch,
  };
}

// Export des deux noms pour compatibilité
export const useBusinessCustomers = useDebtors;
