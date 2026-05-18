import { toast } from 'sonner';

import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useOfflineData } from '@/hooks/useOfflineData';
import { useOfflineInsert, useOfflineUpdate, useOfflineDelete } from '@/hooks/useOfflineMutation';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useOutletContext } from '@/contexts/OutletContext';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  total_visits: number;
  total_spent: number;
  last_visit?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export const useCustomers = () => {
  const { user } = useAuth();
  const { isOffline } = useNetworkStatus();
  const { selectedOutletId } = useOutletContext();
  const outletId = selectedOutletId || undefined;

  const { data: customers, isLoading: loading, refetch: fetchCustomers } = useOfflineData<Customer>({
    table: 'customers',
    queryKey: ['customers', outletId ?? 'no-outlet'],
    enabled: !!user,
    buildQuery: async (userId, selectedOutletId) => {
      if (!selectedOutletId) return { data: [], error: null };

      const { data, error } = await supabase
        .from('customers')
        .select('id, name, email, phone, total_visits, total_spent, last_visit, status, created_at, updated_at, user_id, outlet_id')
        .eq('user_id', userId)
        .eq('outlet_id', selectedOutletId)
        .order('name')
        .limit(10000);

      return { data: (data || []) as Customer[], error };
    },
  });

  const insertMutation = useOfflineInsert({
    table: 'customers',
    queryKey: ['customers', outletId ?? 'no-outlet'],
  });

  const updateMutation = useOfflineUpdate({
    table: 'customers',
    queryKey: ['customers', outletId ?? 'no-outlet'],
  });

  const deleteMutation = useOfflineDelete({
    table: 'customers',
    queryKey: ['customers', outletId ?? 'no-outlet'],
  });

  const createCustomer = useCallback(async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast.error("Erreur", { description: "Vous devez être connecté pour créer un client" });
      return false;
    }

    try {
      if (!outletId) {
        toast.error("Erreur", { description: "Aucun point de vente sélectionné" });
        return false;
      }

      const data = await insertMutation.mutateAsync({
          ...customerData, 
          user_id: user.id,
          outlet_id: outletId,
          total_visits: customerData.total_visits || 0,
          total_spent: customerData.total_spent || 0
        } as unknown as Record<string, unknown>) as unknown as Customer;

      toast.success("Succès", { description: isOffline ? "Client enregistré localement" : "Client créé avec succès" });

      return data;
    } catch (error: any) {
      console.error('Customer creation error:', error);
      toast.error("Erreur", { description: "Impossible de créer le client" });
      return false;
    }
  }, [user, toast, outletId, insertMutation, isOffline]);

  const updateCustomer = useCallback(async (id: string, updates: Partial<Customer>) => {
    if (!user) return false;

    try {
      const data = await updateMutation.mutateAsync({ id, ...updates } as unknown as Record<string, unknown> & { id: string }) as unknown as Customer;
      return data;
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error("Erreur", { description: "Impossible de mettre à jour le client" });
      return false;
    }
  }, [user, toast, updateMutation]);

  const deleteCustomer = useCallback(async (id: string) => {
    if (!user) return false;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Succès", { description: isOffline ? "Client supprimé localement" : "Client supprimé avec succès" });
      return true;
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error("Erreur", { description: "Impossible de supprimer le client" });
      return false;
    }
  }, [user, toast, deleteMutation, isOffline]);

  return {
    customers,
    loading,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
  };
};
