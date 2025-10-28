import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AccessCodes {
  id: string;
  user_id: string;
  accounting_code: string;
  management_code: string;
  last_modified_at: string;
}

export const useAccessCodes = () => {
  const [codes, setCodes] = useState<AccessCodes | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCodes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_access_codes')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        // Créer les codes par défaut
        const { data: newCodes, error: insertError } = await supabase
          .from('user_access_codes')
          .insert([{ user_id: user.id }])
          .select()
          .single();

        if (insertError) throw insertError;
        setCodes(newCodes);
      } else {
        setCodes(data);
      }
    } catch (error: any) {
      console.error('Error fetching access codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCodes = async (accountingCode: string, managementCode: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_access_codes')
        .update({
          accounting_code: accountingCode,
          management_code: managementCode,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Codes mis à jour",
        description: "Vos codes d'accès ont été modifiés avec succès",
      });

      await fetchCodes();
      return true;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les codes",
        variant: "destructive",
      });
      return false;
    }
  };

  const verifyCode = (code: string, type: 'accounting' | 'management'): boolean => {
    if (!codes) return false;
    return type === 'accounting' 
      ? codes.accounting_code === code 
      : codes.management_code === code;
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  return { codes, loading, updateCodes, verifyCode, refetch: fetchCodes };
};
