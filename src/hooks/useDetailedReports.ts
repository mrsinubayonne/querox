import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { getData } from '@/lib/offlineStorage';
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
  const { isOffline } = useNetworkStatus();
  const [transactions, setTransactions] = useState<DetailedTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && periodId) {
      fetchTransactions();
    }
  }, [user, outletId, periodId, isOffline]);

  // Real-time updates (online only)
  useEffect(() => {
    if (!user || !periodId || isOffline) return;

    const ordersChannel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` }, () => fetchTransactions())
      .subscribe();

    const invoicesChannel = supabase
      .channel('invoices-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices', filter: `user_id=eq.${user.id}` }, () => fetchTransactions())
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(invoicesChannel);
    };
  }, [user, periodId, isOffline]);

  const fetchTransactions = async () => {
    if (!user || !periodId) return;

    setLoading(true);
    try {
      const allTransactions: DetailedTransaction[] = [];
      const outletNameById = new Map<string, string>();

      if (isOffline) {
        // --- MODE HORS-LIGNE : lecture depuis IndexedDB ---
        let cachedPeriods = await getData<any[]>('business_periods', user.id);
        const periods = (cachedPeriods?.data as any[]) || [];
        const period = periods.find((p: any) => p.id === periodId);

        if (!period) {
          console.warn('[Offline] Période non trouvée dans le cache:', periodId);
          setTransactions([]);
          return;
        }

        const startISO = period.started_at;
        const endISO = period.ended_at || new Date().toISOString();
        const scopedOutletId = period.outlet_id || outletId;

        // Outlets map - try with fallback
        const cachedOutlets = await getData<any[]>('outlets', user.id);
        ((cachedOutlets?.data as any[]) || []).forEach((o: any) => outletNameById.set(o.id, o.name));

        // Factures payées dans la période - try outlet-scoped cache first
        const selectedOutlet = scopedOutletId || localStorage.getItem('selectedOutletId') || undefined;
        let cachedInvoices = await getData<any[]>('invoices', user.id, selectedOutlet);
        if (!cachedInvoices?.data) cachedInvoices = await getData<any[]>('invoices', user.id);
        const invoices = ((cachedInvoices?.data as any[]) || []).filter((inv: any) => {
          if (inv.status !== 'paid') return false;
          if (!inv.created_at) return false;
          if (inv.created_at < startISO || inv.created_at > endISO) return false;
          if (scopedOutletId && inv.outlet_id !== scopedOutletId) return false;
          return true;
        });

        console.log('[Offline] Transactions détaillées depuis cache — factures:', invoices.length);

        invoices.forEach((invoice: any) => {
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

      } else {
        // --- MODE EN LIGNE ---
        const { data: period, error: periodError } = await supabase
          .from('business_periods')
          .select('*')
          .eq('id', periodId)
          .single();
        if (periodError) throw periodError;

        const startISO = period.started_at;
        const endISO = period.ended_at || new Date().toISOString();

        const { data: outlets, error: outletsError } = await supabase
          .from('outlets')
          .select('id, name')
          .eq('user_id', user.id);
        if (outletsError) throw outletsError;
        (outlets || []).forEach((o: any) => outletNameById.set(o.id, o.name));

        let invoicesQuery = supabase
          .from('invoices')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'paid')
          .gte('created_at', startISO)
          .lte('created_at', endISO)
          .order('created_at', { ascending: false });

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
      }

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
    const filteredTransactions = transactions.filter(
      (t) => t.type === 'invoice' && t.status === 'paid'
    );

    if (filteredTransactions.length === 0) {
      toast.error('Aucune donnée à télécharger');
      return;
    }

    try {
      if (format === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(
          filteredTransactions.map((t) => ({
            Date: t.date,
            Heure: t.time,
            'Point de vente': t.outlet_name,
            Type: 'Facture',
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
      } else {
        const doc = new jsPDF();

        const formatFCFA = (value: number) => {
          const rounded = Math.round(Number(value) || 0);
          return `${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`;
        };

        doc.setFontSize(18);
        doc.text('Rapport Détaillé des Transactions', 14, 20);
        doc.setFontSize(11);
        doc.text(`Généré le ${formatDate(new Date(), 'dd/MM/yyyy à HH:mm')}`, 14, 28);
        if (isOffline) {
          doc.setFontSize(9);
          doc.text('(Données locales — mode hors ligne)', 14, 34);
        }

        const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
        const firstTransaction = filteredTransactions[0];
        const lastTransaction = filteredTransactions[filteredTransactions.length - 1];
        const periodText = firstTransaction && lastTransaction && firstTransaction.date !== lastTransaction.date
          ? `Période: ${firstTransaction.date} au ${lastTransaction.date}`
          : `Date: ${firstTransaction?.date || formatDate(new Date(), 'dd/MM/yyyy')}`;

        doc.setFontSize(10);
        doc.text(periodText, 14, isOffline ? 40 : 34);

        const tableData = filteredTransactions.map((t) => [
          t.date,
          t.time,
          t.outlet_name,
          'FAC',
          t.reference,
          t.customer_name,
          formatFCFA(t.amount),
          t.status,
        ]);

        doc.setFont('helvetica', 'normal');

        autoTable(doc, {
          head: [['Date', 'Heure', 'PDV', 'Type', 'Référence', 'Client', 'Montant', 'Statut']],
          body: tableData,
          startY: isOffline ? 46 : 40,
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246] },
          styles: { fontSize: 8 },
          columnStyles: { 6: { halign: 'right' } },
        });

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
