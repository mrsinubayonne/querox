import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const usePartnerReferrals = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["referrals", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");

      // First get partner id
      const { data: partner, error: partnerError } = await supabase
        .from("partners")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (partnerError) throw partnerError;

      // Then get referrals
      const { data, error } = await supabase
        .from("referrals")
        .select(`
          *,
          customer:profiles!referrals_customer_id_fkey(full_name, email)
        `)
        .eq("partner_id", partner.id)
        .order("referred_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
};
