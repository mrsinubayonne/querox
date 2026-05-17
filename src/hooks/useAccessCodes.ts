import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AccessCodesMeta {
  id: string;
  user_id: string;
  last_modified_at: string;
  has_codes: boolean;
}

export const useAccessCodes = () => {
  const [codes, setCodes] = useState<AccessCodesMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchCodes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_access_codes')
        .select('id, user_id, last_modified_at, accounting_code, management_code')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        // Créer des codes par défaut hashés via RPC
        const defaultAcc = '0000';
        const defaultMgmt = '0000';
        const { error: rpcError } = await supabase.rpc('update_user_access_codes', {
          _accounting_code: defaultAcc,
          _management_code: defaultMgmt,
        });
        if (rpcError) throw rpcError;

        const { data: created } = await supabase
          .from('user_access_codes')
          .select('id, user_id, last_modified_at')
          .eq('user_id', user.id)
          .maybeSingle();

        if (created) {
          setCodes({ ...created, has_codes: true });
        }
      } else {
        setCodes({
          id: data.id,
          user_id: data.user_id,
          last_modified_at: data.last_modified_at,
          has_codes: !!(data.accounting_code && data.management_code),
        });
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

      const { error } = await supabase.rpc('update_user_access_codes', {
        _accounting_code: accountingCode,
        _management_code: managementCode,
      });

      if (error) throw error;

      toast.success("Codes mis à jour", { description: "Vos codes d'accès ont été modifiés avec succès" });

      await fetchCodes();
      return true;
    } catch (error: any) {
      toast.error("Erreur", { description: "Impossible de mettre à jour les codes" });
      return false;
    }
  };

  const verifyCode = async (
    code: string,
    type: 'accounting' | 'management'
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('verify_user_access_code', {
        _user_id: user.id,
        _code: code,
        _type: type,
      });

      if (error) throw error;
      return data === true;
    } catch (error) {
      console.error('Error verifying access code:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  return { codes, loading, updateCodes, verifyCode, refetch: fetchCodes };
};
