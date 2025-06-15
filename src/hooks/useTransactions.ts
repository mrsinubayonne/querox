import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTransactions = async () => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }
      
      setTransactions(data || []);
    } catch (error: any) {
      console.error('Transaction fetch error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les transactions",
        variant: "destructive"
      });
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (transactionData: Partial<Transaction>) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer une transaction",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...transactionData, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('Error creating transaction:', error);
        throw error;
      }
      
      setTransactions(prev => [data, ...prev]);
      toast({
        title: "Succès",
        description: "Transaction créée avec succès"
      });
      
      return data;
    } catch (error: any) {
      console.error('Transaction creation error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la transaction",
        variant: "destructive"
      });
      return false;
    }
  };

  const getMonthlyStats = () => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthlyTransactions = transactions.filter(t => 
      t.date.startsWith(currentMonth) && t.status === 'completed'
    );

    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expenses,
      profit: income - expenses,
      transactionCount: monthlyTransactions.length
    };
  };

  const getCategoryStats = () => {
    const categories = transactions.reduce((acc, transaction) => {
      if (transaction.status !== 'completed') return acc;
      
      if (!acc[transaction.category]) {
        acc[transaction.category] = { income: 0, expense: 0 };
      }
      
      if (transaction.type === 'income') {
        acc[transaction.category].income += transaction.amount;
      } else {
        acc[transaction.category].expense += transaction.amount;
      }
      
      return acc;
    }, {} as Record<string, { income: number; expense: number }>);

    return categories;
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  return {
    transactions,
    loading,
    fetchTransactions,
    createTransaction,
    getMonthlyStats,
    getCategoryStats
  };
};
