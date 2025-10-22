import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from './useProfile';
import { useToast } from './use-toast';

export interface InvoiceSettings {
  id: string;
  user_id: string;
  outlet_id: string | null;
  invoice_title: string;
  company_name: string | null;
  company_address: string | null;
  company_phone: string | null;
  company_email: string | null;
  tax_id: string | null;
  payment_terms: string;
  footer_note: string | null;
  logo_url: string | null;
  primary_color: string;
  created_at: string;
  updated_at: string;
}

export const useInvoiceSettings = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [settings, setSettings] = useState<InvoiceSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!user || !profile?.selected_outlet_id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('invoice_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('outlet_id', profile.selected_outlet_id)
        .maybeSingle();

      if (error) throw error;

      setSettings(data);
    } catch (error: any) {
      console.error('Error fetching invoice settings:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les paramètres de facturation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<InvoiceSettings>) => {
    if (!user || !profile?.selected_outlet_id) return;

    try {
      if (settings?.id) {
        // Update existing settings
        const { data, error } = await supabase
          .from('invoice_settings')
          .update(updates)
          .eq('id', settings.id)
          .select()
          .single();

        if (error) throw error;
        setSettings(data);
      } else {
        // Create new settings
        const { data, error } = await supabase
          .from('invoice_settings')
          .insert({
            user_id: user.id,
            outlet_id: profile.selected_outlet_id,
            ...updates,
          })
          .select()
          .single();

        if (error) throw error;
        setSettings(data);
      }

      toast({
        title: 'Succès',
        description: 'Paramètres de facturation mis à jour',
      });

      // Force refetch to ensure latest data
      await fetchSettings();
      
      return true;
    } catch (error: any) {
      console.error('Error updating invoice settings:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour les paramètres',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user, profile?.selected_outlet_id]);

  return {
    settings,
    loading,
    updateSettings,
    refetch: fetchSettings,
  };
};
