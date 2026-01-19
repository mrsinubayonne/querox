import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useOfflineData } from '@/hooks/useOfflineData';
import { useOfflineInsert, useOfflineUpdate, useOfflineDelete } from '@/hooks/useOfflineMutation';

export interface Supplier {
  id: string;
  user_id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useSuppliers = () => {
  const { user } = useAuth();

  const { data: suppliers, isLoading: loading, refetch: fetchSuppliers } = useOfflineData<Supplier>({
    table: 'suppliers',
    queryKey: ['suppliers'],
    enabled: !!user,
    buildQuery: async (userId) => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, user_id, name, contact_person, email, phone, address, notes, created_at, updated_at')
        .eq('user_id', userId)
        .order('name');
      return { data: (data || []) as Supplier[], error };
    },
  });

  const insertMutation = useOfflineInsert({
    table: 'suppliers',
    queryKey: ['suppliers'],
  });

  const updateMutation = useOfflineUpdate({
    table: 'suppliers',
    queryKey: ['suppliers'],
  });

  const deleteMutation = useOfflineDelete({
    table: 'suppliers',
    queryKey: ['suppliers'],
  });

  const createSupplier = useCallback(async (supplierData: Omit<Supplier, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return false;
    insertMutation.mutate({ ...supplierData, user_id: user.id } as unknown as Record<string, unknown>);
    return true;
  }, [user, insertMutation]);

  const updateSupplier = useCallback(async (id: string, updates: Partial<Supplier>) => {
    if (!user) return false;
    updateMutation.mutate({ id, ...updates } as unknown as Record<string, unknown> & { id: string });
    return true;
  }, [user, updateMutation]);

  const deleteSupplier = useCallback(async (id: string) => {
    if (!user) return false;
    deleteMutation.mutate(id);
    return true;
  }, [user, deleteMutation]);

  return {
    suppliers,
    loading,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier
  };
};
