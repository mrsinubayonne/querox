import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Invoice {
  id: string;
  user_id: string;
  order_id: string | null;
  invoice_number: string;
  total_amount: number;
  status: 'paid' | 'unpaid' | 'overdue';
  due_date: string | null;
  paid_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order?: {
    customer_name: string;
    customer_email: string | null;
    customer_phone: string | null;
  };
}

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchInvoices = useCallback(async () => {
    if (!user) {
      setInvoices([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get selected outlet
      const { data: profile } = await supabase
        .from('profiles')
        .select('selected_outlet_id')
        .eq('id', user.id)
        .maybeSingle();
      
      const outletId = profile?.selected_outlet_id;
      if (!outletId) {
        setInvoices([]);
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          id, user_id, order_id, invoice_number, total_amount, status, due_date, paid_date, notes, created_at, updated_at,
          order:orders(customer_name, customer_email, customer_phone)
        `)
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
  }, [user, toast]);

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
  };

  const createInvoice = useCallback(async (orderId: string | null, totalAmount: number, notes?: string) => {
    if (!user) return;

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
        return;
      }
      
      const invoiceNumber = generateInvoiceNumber();
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
  }, [user, toast, fetchInvoices]);

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

  return {
    invoices,
    loading,
    createInvoice,
    updateInvoiceStatus,
    refetch: fetchInvoices
  };
};
