import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOutletContext } from '@/contexts/OutletContext';

export interface SalaryPayment {
  id: string;
  user_id: string;
  outlet_id: string;
  employee_id: string;
  payslip_number: string;
  period_start: string;
  period_end: string;
  base_amount: number;
  bonus_amount: number;
  advance_amount: number;
  deductions_amount: number;
  net_amount: number;
  payment_method: string;
  status: 'pending' | 'paid';
  paid_date: string | null;
  notes: string | null;
  transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useSalaryPayments = () => {
  const { user } = useAuth();
  const { selectedOutletId } = useOutletContext();
  const [payments, setPayments] = useState<SalaryPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    if (!user || !selectedOutletId) {
      setPayments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('salary_payments' as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('outlet_id', selectedOutletId)
      .order('created_at', { ascending: false })
      .limit(10000);
    if (error) {
      console.error(error);
      toast.error('Erreur', { description: 'Impossible de charger les fiches de paie' });
    } else {
      setPayments((data || []) as unknown as SalaryPayment[]);
    }
    setLoading(false);
  }, [user, selectedOutletId]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const generatePayslipNumber = async (): Promise<string> => {
    const { data, error } = await supabase.rpc('generate_payslip_number' as any);
    if (error || !data) {
      return `PAY-${Date.now().toString().slice(-6)}`;
    }
    return data as unknown as string;
  };

  const createPayment = async (input: Omit<SalaryPayment, 'id' | 'user_id' | 'outlet_id' | 'payslip_number' | 'transaction_id' | 'created_at' | 'updated_at'>) => {
    if (!user || !selectedOutletId) {
      toast.error('Erreur', { description: 'Aucun point de vente sélectionné' });
      return false;
    }
    const payslip_number = await generatePayslipNumber();
    const { error } = await supabase.from('salary_payments' as any).insert({
      ...input,
      payslip_number,
      user_id: user.id,
      outlet_id: selectedOutletId,
    } as any);
    if (error) {
      toast.error('Erreur', { description: error.message });
      return false;
    }
    toast.success('Fiche de paie créée', {
      description: input.status === 'paid' ? 'Transaction comptable générée automatiquement' : 'En attente de paiement',
    });
    fetchPayments();
    return true;
  };

  const markAsPaid = async (id: string, payment_method?: string) => {
    const updates: Partial<SalaryPayment> = {
      status: 'paid',
      paid_date: new Date().toISOString().split('T')[0],
    };
    if (payment_method) updates.payment_method = payment_method;
    const { error } = await supabase.from('salary_payments' as any).update(updates as any).eq('id', id);
    if (error) {
      toast.error('Erreur', { description: error.message });
      return false;
    }
    toast.success('Salaire marqué comme payé', { description: 'Transaction ajoutée à la comptabilité' });
    fetchPayments();
    return true;
  };

  const deletePayment = async (id: string) => {
    const { error } = await supabase.from('salary_payments' as any).delete().eq('id', id);
    if (error) {
      toast.error('Erreur', { description: error.message });
      return false;
    }
    toast.success('Fiche supprimée');
    fetchPayments();
    return true;
  };

  return { payments, loading, fetchPayments, createPayment, markAsPaid, deletePayment };
};
