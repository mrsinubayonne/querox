import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format as formatDate } from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface DetailedTransaction {
  id: string;
  date: string;
  time: string;
  outlet_id: string;
  outlet_name: string;
  type: 'order' | 'invoice';
  reference: string;
  customer_name: string;
  amount: number;
  status: string;
  items: any;
}

interface UseDetailedReportsProps {
  outletId?: string;
  periodId?: string;
}

export const useDetailedReports = ({ outletId, periodId }: UseDetailedReportsProps) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<DetailedTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && periodId) {
      fetchTransactions();
    }
  }, [user, outletId, periodId]);

  // Real-time updates for orders and invoices
  useEffect(() => {
    if (!user || !periodId) return;

    const ordersChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    const invoicesChannel = supabase
      .channel('invoices-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(invoicesChannel);
    };
  }, [user, periodId]);

  const fetchTransactions = async () => {
    if (!user || !periodId) return;

    setLoading(true);
    try {
      // Fetch period details
      const { data: period, error: periodError } = await supabase
        .from('business_periods')
        .select('*')
        .eq('id', periodId)
        .single();

      if (periodError) throw periodError;

      const startISO = period.started_at;
      const endISO = period.ended_at || new Date().toISOString();

      // Fetch outlets map
      const { data: outlets, error: outletsError } = await supabase
        .from('outlets')
        .select('id, name')
        .eq('user_id', user.id);
      if (outletsError) throw outletsError;
      const outletNameById = new Map<string, string>();
      (outlets || []).forEach((o: any) => outletNameById.set(o.id, o.name));

      const allTransactions: DetailedTransaction[] = [];

      // Fetch orders - TOUTES les commandes pour obtenir toutes les ventes
      let ordersQuery = supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startISO)
        .lte('created_at', endISO)
        .order('created_at', { ascending: false });

      // IMPORTANT: Filtrer par outlet_id si spécifié
      if (period.outlet_id) {
        ordersQuery = ordersQuery.eq('outlet_id', period.outlet_id);
      }

      const { data: orders, error: ordersError } = await ordersQuery;
      if (ordersError) throw ordersError;

      (orders || []).forEach((order: any) => {
        const orderDate = new Date(order.created_at);
        allTransactions.push({
          id: order.id,
          date: formatDate(orderDate, 'yyyy-MM-dd'),
          time: formatDate(orderDate, 'HH:mm:ss'),
          outlet_id: order.outlet_id,
          outlet_name: outletNameById.get(order.outlet_id) || 'Non défini',
          type: 'order',
          reference: `CMD-${order.id.slice(0, 8)}`,
          customer_name: order.customer_name || 'Client',
          amount: Number(order.total_amount),
          status: order.status,
          items: order.items,
        });
      });

      // Fetch invoices - TOUTES les factures pour obtenir toutes les ventes
      let invoicesQuery = supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startISO)
        .lte('created_at', endISO)
        .order('created_at', { ascending: false });

      // IMPORTANT: Filtrer par outlet_id si spécifié
      if (period.outlet_id) {
        invoicesQuery = invoicesQuery.eq('outlet_id', period.outlet_id);
      }

      const { data: invoices, error: invoicesError } = await invoicesQuery;
      if (invoicesError) throw invoicesError;

      (invoices || []).forEach((invoice: any) => {
        const invoiceDate = new Date(invoice.created_at);
        allTransactions.push({
          id: invoice.id,
          date: formatDate(invoiceDate, 'yyyy-MM-dd'),
          time: formatDate(invoiceDate, 'HH:mm:ss'),
          outlet_id: invoice.outlet_id,
          outlet_name: outletNameById.get(invoice.outlet_id) || 'Non défini',
          type: 'invoice',
          reference: invoice.invoice_number,
          customer_name: invoice.customer_name || 'Client',
          amount: Number(invoice.total_amount),
          status: invoice.status,
          items: invoice.items,
        });
      });

      // Sort all transactions by date and time
      allTransactions.sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return b.time.localeCompare(a.time);
      });

      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error fetching detailed transactions:', error);
      toast.error('Erreur lors du chargement des transactions détaillées');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (format: 'pdf' | 'excel') => {
    if (transactions.length === 0) {
      toast.error('Aucune donnée à télécharger');
      return;
    }

    try {
      if (format === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(
          transactions.map((t) => ({
            Date: t.date,
            Heure: t.time,
            'Point de vente': t.outlet_name,
            Type: t.type === 'order' ? 'Commande' : 'Facture',
            Référence: t.reference,
            Client: t.customer_name,
            'Montant (CFA)': t.amount,
            Statut: t.status,
          }))
        );

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

        const fileName = `rapport_detaille_${formatDate(new Date(), 'yyyy-MM-dd')}.xlsx`;
        XLSX.writeFile(workbook, fileName);

        toast.success('Rapport Excel téléchargé avec succès');
      } else if (format === 'pdf') {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Rapport Détaillé des Transactions', 14, 20);

        doc.setFontSize(11);
        doc.text(`Généré le ${formatDate(new Date(), 'dd/MM/yyyy à HH:mm')}`, 14, 28);
        
        // Format FCFA avec espace normal comme séparateur de milliers
        const formatFCFA = (value: number) => {
          const rounded = Math.round(Number(value) || 0);
          return `${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`;
        };
        
        // Calculate total amount
        const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
        
        // Get period info if available
        const firstTransaction = transactions[0];
        const lastTransaction = transactions[transactions.length - 1];
        const periodText = firstTransaction && lastTransaction && firstTransaction.date !== lastTransaction.date
          ? `Période: ${firstTransaction.date} au ${lastTransaction.date}`
          : `Date: ${firstTransaction?.date || formatDate(new Date(), 'dd/MM/yyyy')}`;
        
        doc.setFontSize(10);
        doc.text(periodText, 14, 34);

        const tableData = transactions.map((t) => [
          t.date,
          t.time,
          t.outlet_name,
          t.type === 'order' ? 'CMD' : 'FAC',
          t.reference,
          t.customer_name,
          formatFCFA(t.amount),
          t.status,
        ]);

        // Ensure base font is set for table content
        doc.setFont('helvetica', 'normal');

        autoTable(doc, {
          head: [['Date', 'Heure', 'PDV', 'Type', 'Référence', 'Client', 'Montant', 'Statut']],
          body: tableData,
          startY: 40,
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246] },
          styles: { fontSize: 8 },
          columnStyles: { 6: { halign: 'right' } },
        });

        // Add total row
        const finalY = (doc as any).lastAutoTable.finalY || 40;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL ${periodText.split(': ')[1]}: ${formatFCFA(totalAmount)}`, 14, finalY + 10);

        const fileName = `rapport_detaille_${formatDate(new Date(), 'yyyy-MM-dd')}.pdf`;
        doc.save(fileName);

        toast.success('Rapport PDF téléchargé avec succès');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  return {
    transactions,
    loading,
    downloadReport,
    refetch: fetchTransactions,
  };
};
