import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
// useOptimizedOutlet removed - no longer blocking invoice loading
import { useOfflineData } from '@/hooks/useOfflineData';
import { useOfflineInsert, useOfflineUpdate } from '@/hooks/useOfflineMutation';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

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
  payment_method?: string | null;
}

// Generate offline invoice number
function generateOfflineInvoiceNumber(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `OFF-${timestamp}-${random}`;
}

export const useInvoices = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const outletId = localStorage.getItem('selectedOutletId') || undefined;
  const { isOffline } = useNetworkStatus();

  const { data: invoices, isLoading: loading, refetch } = useOfflineData<Invoice>({
    table: 'invoices',
    queryKey: ['invoices'],
    enabled: !!user,
    buildQuery: async (userId, outlet) => {
      let query = supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(200);
      
      // Filtrer par outlet seulement s'il est défini
      if (outlet) {
        query = query.eq('outlet_id', outlet);
      }
      
      const { data, error } = await query;
      return { data: (data || []) as Invoice[], error };
    },
  });

  const insertMutation = useOfflineInsert({
    table: 'invoices',
    queryKey: ['invoices'],
    onSuccess: () => {
      toast({
        title: isOffline ? "Facture créée (hors ligne)" : "Facture créée",
        description: isOffline ? "Sera synchronisée au retour en ligne" : "Facture générée avec succès",
      });
    },
  });

  const updateMutation = useOfflineUpdate({
    table: 'invoices',
    queryKey: ['invoices'],
    onSuccess: () => {
      toast({
        title: isOffline ? "Statut mis à jour (hors ligne)" : "Statut mis à jour",
        description: isOffline ? "Sera synchronisé au retour en ligne" : "Le statut de la facture a été mis à jour",
      });
    },
  });

  const generateInvoiceNumber = async () => {
    // If offline, generate local invoice number
    if (isOffline) {
      return generateOfflineInvoiceNumber();
    }

    const { data, error } = await supabase.rpc('generate_invoice_number');
    if (error) {
      console.error('Error generating invoice number:', error);
      // Fallback to offline format if RPC fails
      return generateOfflineInvoiceNumber();
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
  }, [user, outletId, toast, insertMutation, isOffline]);

  const updateInvoiceStatus = useCallback(async (invoiceId: string, status: 'paid' | 'unpaid' | 'overdue', paymentMethod?: string) => {
    const updateData: Record<string, unknown> = { id: invoiceId, status };
    if (status === 'paid') {
      updateData.paid_date = new Date().toISOString().split('T')[0];
      if (paymentMethod) {
        updateData.payment_method = paymentMethod;
      }
    }
    updateMutation.mutate(updateData as unknown as Record<string, unknown> & { id: string });
  }, [updateMutation]);

  return {
    invoices,
    loading,
    isOffline,
    createInvoice,
    updateInvoiceStatus,
    refetch,
    generateInvoiceNumber,
  };
};

