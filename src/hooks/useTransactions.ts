import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOfflineData } from './useOfflineData';
import { useOfflineInsert } from './useOfflineMutation';
import { toast } from 'sonner';

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
  payment_method?: string;
}

export const useTransactions = () => {
  const { user } = useAuth();
  const outletId = localStorage.getItem('selectedOutletId') || undefined;

  const { data: transactions, isLoading: loading, refetch: fetchTransactions, isOffline } = useOfflineData<Transaction>({
    table: 'transactions',
    queryKey: ['transactions'],
    buildQuery: async (userId) => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          outlets (
            name
          )
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) return { data: null, error };

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
        payment_method: transaction.payment_method || 'Espèces',
      }));

      return { data: transformedTransactions, error: null };
    },
    enabled: !!user,
  });

  const insertMutation = useOfflineInsert({
    table: 'transactions',
    queryKey: ['transactions', user?.id, outletId],
    onSuccess: () => {
      toast.success("Succès", { description: "Transaction ajoutée avec succès" });
    },
  });

  const createTransaction = useCallback(async (transactionData: Omit<Transaction, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return false;

    if (!outletId) {
      toast.error("Erreur", { description: "Aucun point de vente sélectionné" });
      return false;
    }

    try {
      await insertMutation.mutateAsync({
        ...transactionData,
        user_id: user.id,
        outlet_id: outletId,
      } as unknown as Record<string, unknown>);
      return true;
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error("Erreur", { description: "Impossible d'ajouter la transaction" });
      return false;
    }
  }, [user, outletId, insertMutation, toast]);

  return {
    transactions,
    loading,
    isOffline,
    createTransaction,
    addTransaction: createTransaction, // Keep both names for backward compatibility
    refetch: fetchTransactions,
  };
};

export type { Transaction };
