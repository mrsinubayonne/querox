
import { useState, useEffect } from 'react';
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
  created_at: string;
  updated_at: string;
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCustomers = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('total_spent', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients",
        variant: "destructive"
      });
    }
  };

  const createCustomer = async (customerData: Partial<Customer>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([{ ...customerData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setCustomers(prev => [...prev, data]);
      toast({
        title: "Succès",
        description: "Client créé avec succès"
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le client",
        variant: "destructive"
      });
    }
  };

  const updateCustomerVisit = async (customerId: string, spentAmount: number) => {
    if (!user) return;

    try {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) return;

      const { error } = await supabase
        .from('customers')
        .update({
          total_visits: customer.total_visits + 1,
          total_spent: customer.total_spent + spentAmount,
          last_visit: new Date().toISOString().split('T')[0]
        })
        .eq('id', customerId);

      if (error) throw error;
      
      await fetchCustomers();
      
      toast({
        title: "Succès",
        description: "Visite client enregistrée"
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la visite",
        variant: "destructive"
      });
    }
  };

  const getTopCustomers = (limit: number = 10) => {
    return customers
      .sort((a, b) => b.total_spent - a.total_spent)
      .slice(0, limit);
  };

  const getRecentCustomers = (days: number = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffString = cutoffDate.toISOString().split('T')[0];

    return customers.filter(customer => 
      customer.last_visit && customer.last_visit >= cutoffString
    );
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchCustomers().finally(() => setLoading(false));
    }
  }, [user]);

  return {
    customers,
    loading,
    fetchCustomers,
    createCustomer,
    updateCustomerVisit,
    getTopCustomers,
    getRecentCustomers
  };
};
