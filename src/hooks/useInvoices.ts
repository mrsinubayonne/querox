import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOptimizedOutlet } from '@/hooks/useOptimizedOutlet';
import { useOfflineData } from '@/hooks/useOfflineData';
import { useOfflineInsert, useOfflineUpdate } from '@/hooks/useOfflineMutation';

export interface Invoice {
  id: string;
  user_id: string;
  outlet_id: string | null;
  order_id: string | null;
  session_id: string | null;
  invoice_number: string;
  total_amount: number;
  status: 'paid' | 'unpaid' | 'overdue';
  due_date: string | null;
  paid_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  items: unknown[];
}

export const useInvoices = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { outletId, loading: outletLoading } = useOptimizedOutlet();

  const { data: invoices, isLoading: loading, refetch } = useOfflineData<Invoice>({
    table: 'invoices',
    queryKey: ['invoices'],
    enabled: !!user && !outletLoading && !!outletId,
    buildQuery: async (userId, outlet) => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .eq('outlet_id', outlet || '')
        .order('created_at', { ascending: false })
        .limit(100);
      return { data: (data || []) as Invoice[], error };
    },
  });

  const insertMutation = useOfflineInsert({
    table: 'invoices',
    queryKey: ['invoices'],
    onSuccess: () => {
      toast({
        title: "Facture créée",
        description: "Facture générée avec succès",
      });
    },
  });

  const updateMutation = useOfflineUpdate({
    table: 'invoices',
    queryKey: ['invoices'],
    onSuccess: () => {
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la facture a été mis à jour",
      });
    },
  });

  const generateInvoiceNumber = async () => {
    const { data, error } = await supabase.rpc('generate_invoice_number');
    if (error) {
      console.error('Error generating invoice number:', error);
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const timestamp = Date.now().toString().slice(-4);
      return `INV-${year}${month}-${timestamp}`;
    }
    return data;
  };

  const createInvoice = useCallback(async (orderId: string | null, totalAmount: number, notes?: string) => {
    if (!user) return;

    if (!outletId) {
      toast({
        title: "Erreur",
        description: "Aucun point de vente sélectionné",
        variant: "destructive"
      });
      return;
    }
    
    const invoiceNumber = await generateInvoiceNumber();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    insertMutation.mutate({
      user_id: user.id,
      outlet_id: outletId,
      order_id: orderId,
      invoice_number: invoiceNumber,
      total_amount: totalAmount,
      status: 'unpaid',
      due_date: dueDate.toISOString().split('T')[0],
      notes,
    } as unknown as Record<string, unknown>);
  }, [user, outletId, toast, insertMutation]);

  const updateInvoiceStatus = useCallback(async (invoiceId: string, status: 'paid' | 'unpaid' | 'overdue') => {
    const updateData: Record<string, unknown> = { id: invoiceId, status };
    if (status === 'paid') {
      updateData.paid_date = new Date().toISOString().split('T')[0];
    }
    updateMutation.mutate(updateData as unknown as Record<string, unknown> & { id: string });
  }, [updateMutation]);

  return {
    invoices,
    loading,
    createInvoice,
    updateInvoiceStatus,
    refetch
  };
};
