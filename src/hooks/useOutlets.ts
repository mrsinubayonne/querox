// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Outlet {
  id: string;
  user_id: string;
  name: string;
  address: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

type CreateOutletData = Pick<Outlet, 'name' | 'address' | 'phone'>;
type UpdateOutletData = Partial<Pick<Outlet, 'name' | 'address' | 'phone'>>;

export const useOutlets = () => {
  const { user } = useAuth();
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [selectedOutletId, setSelectedOutletId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOutlets = async (): Promise<void> => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('outlets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching outlets:', error);
        throw error;
      }
      
      setOutlets(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement des points de vente');
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedOutlet = async (): Promise<void> => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('selected_outlet_id')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching selected outlet:', error);
        return;
      }
      
      setSelectedOutletId(data?.selected_outlet_id || null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadOutlets();
      loadSelectedOutlet();
    }
  }, [user?.id]);

  const createOutlet = async (outletData: CreateOutletData): Promise<Outlet | undefined> => {
    if (!user?.id) return undefined;

    try {
      const { data, error } = await supabase
        .from('outlets')
        .insert({
          user_id: user.id,
          name: outletData.name,
          address: outletData.address,
          phone: outletData.phone
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Point de vente créé avec succès');
      await loadOutlets();
      
      // Sélectionner automatiquement le premier outlet créé si aucun n'est sélectionné
      if (!selectedOutletId) {
        await selectOutlet(data.id);
      }
      
      return data;
    } catch (error) {
      console.error('Error creating outlet:', error);
      toast.error('Erreur lors de la création du point de vente');
      return undefined;
    }
  };

  const updateOutlet = async (id: string, updates: UpdateOutletData): Promise<void> => {
    try {
      const { error } = await supabase
        .from('outlets')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Point de vente mis à jour');
      await loadOutlets();
    } catch (error) {
      console.error('Error updating outlet:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const deleteOutlet = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('outlets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Point de vente supprimé');
      await loadOutlets();
    } catch (error) {
      console.error('Error deleting outlet:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const selectOutlet = async (outletId: string): Promise<void> => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ selected_outlet_id: outletId })
        .eq('id', user.id);

      if (error) throw error;
      
      setSelectedOutletId(outletId);
      localStorage.setItem('selectedOutletId', outletId);
      toast.success('Point de vente sélectionné');
    } catch (error) {
      console.error('Error selecting outlet:', error);
      toast.error('Erreur lors de la sélection');
    }
  };

  return {
    outlets,
    selectedOutletId,
    loading,
    createOutlet,
    updateOutlet,
    deleteOutlet,
    selectOutlet,
    refetch: loadOutlets
  };
};
