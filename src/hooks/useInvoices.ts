import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  const fetchInvoices = useCallback(async () => {
    if (!user) {
      setInvoices([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get selected outlet: prefer selectedProfileId in localStorage, fallback to user profile
      const selectedProfileId = localStorage.getItem('selectedProfileId');
      let outletId: string | null = null;
      if (selectedProfileId) {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('selected_outlet_id')
          .eq('id', selectedProfileId)
          .maybeSingle();
        outletId = userProfile?.selected_outlet_id ?? null;
      } else {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('selected_outlet_id')
          .eq('user_id', user.id)
          .maybeSingle();
        outletId = profile?.selected_outlet_id ?? null;
      }
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
      // Get selected outlet: prefer selectedProfileId in localStorage, fallback to user profile
      const selectedProfileId = localStorage.getItem('selectedProfileId');
      let outletId: string | null = null;
      if (selectedProfileId) {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('selected_outlet_id')
          .eq('id', selectedProfileId)
          .maybeSingle();
        outletId = userProfile?.selected_outlet_id ?? null;
      } else {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('selected_outlet_id')
          .eq('user_id', user.id)
          .maybeSingle();
        outletId = profile?.selected_outlet_id ?? null;
      }
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
