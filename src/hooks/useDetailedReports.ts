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
  const { user, isTeamMember, teamMemberSession } = useAuth();
  const { isOffline } = useNetworkStatus();
  const [transactions, setTransactions] = useState<DetailedTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const effectiveUserId = isTeamMember && teamMemberSession ? teamMemberSession.ownerId : user?.id;

  const shouldUseOfflineCache = isOffline || (typeof window !== 'undefined' && localStorage.getItem('querox_force_offline_mode') === '1');

  useEffect(() => {
    if (effectiveUserId && periodId) {
      fetchTransactions();
    }
  }, [effectiveUserId, outletId, periodId, shouldUseOfflineCache]);

  // Real-time updates (online only)
  useEffect(() => {
    if (!effectiveUserId || !periodId || shouldUseOfflineCache) return;

    const ordersChannel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${effectiveUserId}` }, () => fetchTransactions())
      .subscribe();

    const invoicesChannel = supabase
      .channel('invoices-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices', filter: `user_id=eq.${effectiveUserId}` }, () => fetchTransactions())
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(invoicesChannel);
    };
  }, [effectiveUserId, periodId, shouldUseOfflineCache]);

  const fetchTransactions = async () => {
    if (!effectiveUserId || !periodId) return;

    setLoading(true);
    try {
      const allTransactions: DetailedTransaction[] = [];
      const outletNameById = new Map<string, string>();

      if (shouldUseOfflineCache) {
        // --- MODE HORS-LIGNE : lecture depuis IndexedDB ---
        let cachedPeriods = await getData<any[]>('business_periods', effectiveUserId);
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
        const cachedOutlets = await getData<any[]>('outlets', effectiveUserId);
        ((cachedOutlets?.data as any[]) || []).forEach((o: any) => outletNameById.set(o.id, o.name));

        // Factures payées dans la période — UN SEUL cache (pas de fusion)
        const selectedOutlet = scopedOutletId || localStorage.getItem('selectedOutletId') || undefined;
        const cachedInvoices = selectedOutlet
          ? await getData<any[]>('invoices', effectiveUserId, selectedOutlet)
          : await getData<any[]>('invoices', effectiveUserId);

        // Dédup par invoice_number+outlet pour éviter doublons local/serveur
        const rawInvoices = ((cachedInvoices?.data as any[]) || []);
        const dedupedMap = new Map<string, any>();
        for (const inv of rawInvoices) {
          const key = inv.invoice_number
            ? `num:${inv.invoice_number}:${inv.outlet_id || ''}`
            : `id:${inv.id}`;
          if (!dedupedMap.has(key)) dedupedMap.set(key, inv);
        }
        const invoices = Array.from(dedupedMap.values()).filter((inv: any) => {
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
          .eq('user_id', effectiveUserId);
        if (outletsError) throw outletsError;
        (outlets || []).forEach((o: any) => outletNameById.set(o.id, o.name));

        // IMPORTANT: Supabase default limit is 1000 — use explicit high limit
        let invoicesQuery = supabase
          .from('invoices')
          .select('*')
          .eq('user_id', effectiveUserId)
          .eq('status', 'paid')
          .gte('created_at', startISO)
          .lte('created_at', endISO)
          .order('created_at', { ascending: false })
          .limit(10000);

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

        let finalY = (doc as any).lastAutoTable.finalY || 40;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL ${periodText.split(': ')[1]}: ${formatFCFA(totalAmount)}`, 14, finalY + 10);
        finalY += 20;

        // --- Fetch and add consumption data (beverages & ingredients) ---
        try {
          const period = await supabase
            .from('business_periods')
            .select('started_at, ended_at, outlet_id')
            .eq('id', periodId!)
            .single();
          
          if (period.data) {
            const startISO = period.data.started_at;
            const endISO = period.data.ended_at || new Date().toISOString();
            
            let movQuery = supabase
              .from('stock_movements')
              .select(`
                item_id, quantity, movement_type,
                inventory_items!inner(name, category, unit, user_id, outlet_id)
              `)
              .eq('inventory_items.user_id', user!.id)
              .in('movement_type', ['out', 'sale', 'adjustment_down', 'loss'])
              .gte('created_at', startISO)
              .lte('created_at', endISO)
              .limit(5000);

            if (period.data.outlet_id) {
              movQuery = movQuery.eq('inventory_items.outlet_id', period.data.outlet_id);
            }

            const { data: movements } = await movQuery;

            if (movements && movements.length > 0) {
              // Aggregate
              const agg = new Map<string, { name: string; category: string; unit: string; qty: number }>();
              movements.forEach((m: any) => {
                const key = m.item_id;
                const ex = agg.get(key);
                const qty = Math.abs(m.quantity);
                if (ex) { ex.qty += qty; }
                else { agg.set(key, { name: m.inventory_items?.name || '?', category: m.inventory_items?.category || '', unit: m.inventory_items?.unit || 'pcs', qty }); }
              });

              const allItems = Array.from(agg.values()).sort((a, b) => b.qty - a.qty);
              const boissons = allItems.filter(i => i.category === 'Boissons');
              const ingredients = allItems.filter(i => i.category === 'Ingrédients');
              const autres = allItems.filter(i => i.category !== 'Boissons' && i.category !== 'Ingrédients');

              // Check if need new page
              if (finalY > 230) { doc.addPage(); finalY = 20; }

              doc.setFontSize(14);
              doc.setFont('helvetica', 'bold');
              doc.text('Articles consommés durant la période', 14, finalY);
              finalY += 6;

              const addSection = (title: string, items: typeof allItems) => {
                if (items.length === 0) return;
                if (finalY > 250) { doc.addPage(); finalY = 20; }
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.text(title, 14, finalY);
                finalY += 2;
                autoTable(doc, {
                  head: [['Article', 'Quantité']],
                  body: items.map(i => [i.name, `${i.qty} ${i.unit}`]),
                  startY: finalY,
                  theme: 'grid',
                  headStyles: { fillColor: [34, 197, 94] },
                  styles: { fontSize: 8 },
                });
                finalY = (doc as any).lastAutoTable.finalY + 8;
              };

              addSection('Boissons utilisées', boissons);
              addSection('Ingrédients utilisés', ingredients);
              if (autres.length > 0) addSection('Autres articles', autres);
            }
          }
        } catch (consumptionErr) {
          console.warn('Could not fetch consumption data for PDF:', consumptionErr);
        }

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
