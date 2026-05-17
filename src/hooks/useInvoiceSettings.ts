import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  const { user } = useAuth();  const [settings, setSettings] = useState<InvoiceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOutletId, setSelectedOutletId] = useState<string | null>(null);

  const getOutletId = (): string | null => {
    const stored = localStorage.getItem('selectedOutletId');
    if (stored && stored !== 'null' && stored !== 'undefined') return stored;
    return null;
  };

  const fetchSettings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const outletId = getOutletId();
      setSelectedOutletId(outletId);
      
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

    const outletId = selectedOutletId || getOutletId();
    
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
      
      // S'assurer que le logo est stocké comme simple chaîne
      const sanitizedUpdates: any = { ...updates };
      if (
        sanitizedUpdates.logo_url &&
        typeof sanitizedUpdates.logo_url === 'object' &&
        (sanitizedUpdates.logo_url as any).value
      ) {
        sanitizedUpdates.logo_url = (sanitizedUpdates.logo_url as any).value;
      }
      
      if (settings?.id) {
        // Update existing settings
        const { data, error } = await supabase
          .from('invoice_settings')
          .update({
            ...sanitizedUpdates,
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
            ...sanitizedUpdates,
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
