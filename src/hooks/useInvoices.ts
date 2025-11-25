import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOptimizedOutlet } from '@/hooks/useOptimizedOutlet';

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
  items: any[];
}

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { outletId, loading: outletLoading } = useOptimizedOutlet();

  const fetchInvoices = useCallback(async () => {
    if (!user || outletLoading) {
      setInvoices([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      if (!outletId) {
        setInvoices([]);
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .eq('outlet_id', outletId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setInvoices((data || []) as Invoice[]);
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les factures",
        variant: "destructive"
      });
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [user, outletId, outletLoading, toast]);

  const generateInvoiceNumber = async () => {
    // Use database function for sequential numbering
    const { data, error } = await supabase.rpc('generate_invoice_number');
    if (error) {
      console.error('Error generating invoice number:', error);
      // Fallback to timestamp-based if function fails
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

    try {
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
      dueDate.setDate(dueDate.getDate() + 30); // 30 jours pour payer

      const { error } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          outlet_id: outletId,
          order_id: orderId,
          invoice_number: invoiceNumber,
          total_amount: totalAmount,
          status: 'unpaid',
          due_date: dueDate.toISOString().split('T')[0],
          notes
        });

      if (error) throw error;

      toast({
        title: "Facture créée",
        description: `Facture ${invoiceNumber} générée avec succès`,
      });

      await fetchInvoices();
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la facture",
        variant: "destructive"
      });
    }
  }, [user, outletId, toast, fetchInvoices]);

  const updateInvoiceStatus = useCallback(async (invoiceId: string, status: 'paid' | 'unpaid' | 'overdue') => {
    try {
      const updateData: any = { status };
      if (status === 'paid') {
        updateData.paid_date = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: "Le statut de la facture a été mis à jour",
      });

      await fetchInvoices();
    } catch (error: any) {
      console.error('Error updating invoice:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la facture",
        variant: "destructive"
      });
    }
  }, [toast, fetchInvoices]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Subscribe to real-time updates for invoices
  useEffect(() => {
    if (!user) return;

    const channelName = `invoices-changes-${user.id}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchInvoices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    invoices,
    loading,
    createInvoice,
    updateInvoiceStatus,
    refetch: fetchInvoices
  };
};
