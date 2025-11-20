import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
  const { toast } = useToast();
  const [settings, setSettings] = useState<InvoiceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOutletId, setSelectedOutletId] = useState<string | null>(null);

  const getSelectedOutletId = async () => {
    if (!user) return null;

    const selectedProfileId = localStorage.getItem('selectedProfileId');
    let outletId: string | null = null;

    if (selectedProfileId) {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('selected_outlet_id')
        .eq('id', selectedProfileId)
        .maybeSingle();
      outletId = userProfile?.selected_outlet_id ?? null;
    } else {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('selected_outlet_id')
        .eq('user_id', user.id)
        .maybeSingle();
      outletId = profile?.selected_outlet_id ?? null;
    }

    setSelectedOutletId(outletId);
    return outletId;
  };

  const fetchSettings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const outletId = await getSelectedOutletId();
      
      if (!outletId) {
        console.log('No outlet selected');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('invoice_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('outlet_id', outletId)
        .maybeSingle();

      if (error) throw error;

      console.log('Invoice settings loaded:', data);
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
    if (!user) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté',
        variant: 'destructive',
      });
      return false;
    }

    const outletId = selectedOutletId || await getSelectedOutletId();
    
    if (!outletId) {
      toast({
        title: 'Erreur',
        description: 'Aucun point de vente sélectionné',
        variant: 'destructive',
      });
      return false;
    }

    try {
      console.log('Updating settings with outlet_id:', outletId);
      
      if (settings?.id) {
        // Update existing settings
        const { data, error } = await supabase
          .from('invoice_settings')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', settings.id)
          .select()
          .single();

        if (error) throw error;
        console.log('Settings updated:', data);
        setSettings(data);
      } else {
        // Create new settings
        const { data, error } = await supabase
          .from('invoice_settings')
          .insert({
            user_id: user.id,
            outlet_id: outletId,
            ...updates,
          })
          .select()
          .single();

        if (error) throw error;
        console.log('Settings created:', data);
        setSettings(data);
      }

      toast({
        title: 'Succès',
        description: 'Paramètres de facturation mis à jour',
      });

      return true;
    } catch (error: any) {
      console.error('Error updating invoice settings:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour les paramètres',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  return {
    settings,
    loading,
    updateSettings,
    refetch: fetchSettings,
  };
};
