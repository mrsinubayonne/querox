import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOutletContext } from '@/contexts/OutletContext';

export interface Employee {
  id: string;
  user_id: string;
  outlet_id: string;
  team_member_id: string | null;
  full_name: string;
  position: string | null;
  email: string | null;
  phone: string | null;
  base_salary: number;
  payment_frequency: string;
  hire_date: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useEmployees = () => {
  const { user } = useAuth();
  const { selectedOutletId } = useOutletContext();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = useCallback(async () => {
    if (!user || !selectedOutletId) {
      setEmployees([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('employees' as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('outlet_id', selectedOutletId)
      .order('created_at', { ascending: false })
      .limit(10000);
    if (error) {
      console.error(error);
      toast.error('Erreur', { description: 'Impossible de charger les employés' });
    } else {
      setEmployees((data || []) as unknown as Employee[]);
    }
    setLoading(false);
  }, [user, selectedOutletId]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const createEmployee = async (data: Partial<Employee>) => {
    if (!user || !selectedOutletId) {
      toast.error('Erreur', { description: 'Aucun point de vente sélectionné' });
      return false;
    }
    const { error } = await supabase.from('employees' as any).insert({
      ...data,
      user_id: user.id,
      outlet_id: selectedOutletId,
    } as any);
    if (error) {
      toast.error('Erreur', { description: error.message });
      return false;
    }
    toast.success('Employé créé');
    fetchEmployees();
    return true;
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    const { error } = await supabase.from('employees' as any).update(updates as any).eq('id', id);
    if (error) {
      toast.error('Erreur', { description: error.message });
      return false;
    }
    toast.success('Employé mis à jour');
    fetchEmployees();
    return true;
  };

  const deleteEmployee = async (id: string) => {
    const { error } = await supabase.from('employees' as any).delete().eq('id', id);
    if (error) {
      toast.error('Erreur', { description: error.message });
      return false;
    }
    toast.success('Employé supprimé');
    fetchEmployees();
    return true;
  };

  return { employees, loading, fetchEmployees, createEmployee, updateEmployee, deleteEmployee };
};
