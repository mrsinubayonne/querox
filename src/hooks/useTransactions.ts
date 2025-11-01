
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  description?: string;
  created_at: string;
  user_id: string;
  outlet_id?: string;
  outlet_name?: string;
}

export const useTransactions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch transactions for the selected outlet only
      // Get selected outlet
      const { data: profile } = await supabase
        .from('profiles')
        .select('selected_outlet_id')
        .eq('id', user.id)
        .maybeSingle();

      const outletId = profile?.selected_outlet_id;

      if (!outletId) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          outlets (
            name
          )
        `)
        .eq('user_id', user.id)
        .eq('outlet_id', outletId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les transactions",
          variant: "destructive",
        });
        setTransactions([]);
      } else {
        const transformedTransactions: Transaction[] = (data || []).map(transaction => ({
          id: transaction.id,
          title: transaction.title,
          amount: Number(transaction.amount),
          type: transaction.type as 'income' | 'expense',
          category: transaction.category,
          date: transaction.date,
          status: transaction.status as 'pending' | 'completed' | 'cancelled',
          description: transaction.description,
          created_at: transaction.created_at,
          user_id: transaction.user_id,
          outlet_id: transaction.outlet_id,
          outlet_name: transaction.outlets?.name || 'Non défini',
        }));
        setTransactions(transformedTransactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createTransaction = useCallback(async (transactionData: Omit<Transaction, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return false;

    try {
      // Get selected outlet
      const { data: profile } = await supabase
        .from('profiles')
        .select('selected_outlet_id')
        .eq('id', user.id)
        .maybeSingle();
      
      const outletId = profile?.selected_outlet_id;
      if (!outletId) {
        toast({
          title: "Erreur",
          description: "Aucun point de vente sélectionné",
          variant: "destructive"
        });
        return false;
      }
      
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transactionData,
          user_id: user.id,
          outlet_id: outletId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding transaction:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter la transaction",
          variant: "destructive",
        });
        return false;
      } else {
        const newTransaction: Transaction = {
          id: data.id,
          title: data.title,
          amount: Number(data.amount),
          type: data.type as 'income' | 'expense',
          category: data.category,
          date: data.date,
          status: data.status as 'pending' | 'completed' | 'cancelled',
          description: data.description,
          created_at: data.created_at,
          user_id: data.user_id,
        };
        setTransactions(prev => [newTransaction, ...prev]);
        toast({
          title: "Succès",
          description: "Transaction ajoutée avec succès",
        });
        return true;
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      return false;
    }
  }, [user, toast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    createTransaction,
    addTransaction: createTransaction, // Keep both names for backward compatibility
    refetch: fetchTransactions,
  };
};

export type { Transaction };
