
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
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les transactions",
        variant: "destructive"
      });
    }
  };

  const createTransaction = async (transactionData: Partial<Transaction>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...transactionData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setTransactions(prev => [data, ...prev]);
      toast({
        title: "Succès",
        description: "Transaction créée avec succès"
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la transaction",
        variant: "destructive"
      });
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
    if (user) {
      setLoading(true);
      fetchTransactions().finally(() => setLoading(false));
    }
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
