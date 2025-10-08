import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const usePartnerReferrals = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["referrals", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: partner, error: partnerError } = await supabase
        .from("partners")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (partnerError) return [];

      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("partner_id", partner.id)
        .order("referred_at", { ascending: false });

      if (error) return [];
      return data || [];
    },
    enabled: !!user?.id,
  });
};
