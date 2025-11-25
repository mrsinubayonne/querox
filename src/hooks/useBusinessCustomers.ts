import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface BusinessCustomer {
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

export function useBusinessCustomers(outletId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers, isLoading } = useQuery({
    queryKey: ["business-customers", user?.id, outletId],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from("business_customers")
        .select("*")
        .eq("user_id", user.id)
        .order("company_name");

      if (outletId) {
        query = query.eq("outlet_id", outletId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as BusinessCustomer[];
    },
    enabled: !!user?.id,
  });

  const createCustomer = useMutation({
    mutationFn: async (customer: Omit<BusinessCustomer, "id" | "user_id" | "current_debt" | "created_at" | "updated_at">) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("business_customers")
        .insert([{ ...customer, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-customers"] });
      toast({
        title: "Client créé",
        description: "Le client entreprise a été créé avec succès",
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

  const updateCustomer = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BusinessCustomer> & { id: string }) => {
      const { data, error } = await supabase
        .from("business_customers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-customers"] });
      toast({
        title: "Client mis à jour",
        description: "Les informations du client ont été mises à jour",
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

  const deleteCustomer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("business_customers")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-customers"] });
      toast({
        title: "Client supprimé",
        description: "Le client a été supprimé avec succès",
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

  return {
    customers: customers || [],
    isLoading,
    createCustomer: createCustomer.mutate,
    updateCustomer: updateCustomer.mutate,
    deleteCustomer: deleteCustomer.mutate,
    isCreating: createCustomer.isPending,
    isUpdating: updateCustomer.isPending,
    isDeleting: deleteCustomer.isPending,
  };
}
