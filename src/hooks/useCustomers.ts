
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCustomers = useCallback(async () => {
    if (!user) {
      setCustomers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }

      setCustomers(data || []);
    } catch (error: any) {
      console.error('Customers fetch error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients",
        variant: "destructive"
      });
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createCustomer = useCallback(async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer un client",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({ 
          ...customerData, 
          user_id: user.id,
          total_visits: customerData.total_visits || 0,
          total_spent: customerData.total_spent || 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating customer:', error);
        throw error;
      }

      setCustomers(prev => [...prev, data]);
      toast({
        title: "Succès",
        description: "Client créé avec succès"
      });

      return data;
    } catch (error: any) {
      console.error('Customer creation error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le client",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  const updateCustomer = useCallback(async (id: string, updates: Partial<Customer>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCustomers(prev => prev.map(customer => customer.id === id ? data : customer));
      return data;
    } catch (error: any) {
      console.error('Update error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le client",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  const deleteCustomer = useCallback(async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCustomers(prev => prev.filter(customer => customer.id !== id));
      toast({
        title: "Succès",
        description: "Client supprimé avec succès"
      });
      return true;
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le client",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    loading,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
  };
};
