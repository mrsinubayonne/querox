import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { getData } from '@/lib/offlineStorage';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';
import { format, endOfDay, startOfDay, setHours, setMinutes } from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface DailyReport {
  date: string;
  time?: string;
  outlet_id: string;
  outlet_name: string;
  total_orders: number;
  total_revenue: number;
  total_invoices: number;
  paid_invoices: number;
  unpaid_invoices: number;
  total_customers: number;
  average_order_value: number;
}

interface UseDailyReportsProps {
  outletId?: string;
  dateRange?: DateRange;
  reportType: 'daily' | 'weekly' | 'monthly' | 'yearly';
  timeRange?: { start: string; end: string };
}

export const useDailyReports = ({ outletId, dateRange, reportType, timeRange }: UseDailyReportsProps) => {
  const { user } = useAuth();
  const { isOffline } = useNetworkStatus();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(false);

  const dedupeById = <T extends { id?: string }>(list: T[]): T[] => {
    return Array.from(
      new Map(list.map((item, index) => [item.id || `idx-${index}`, item])).values()
    );
  };

  useEffect(() => {
    if (user && dateRange?.from && dateRange?.to) {
      fetchReports();
    }
  }, [user, outletId, dateRange, reportType, timeRange, isOffline]);

  const fetchReports = async () => {
    if (!user || !dateRange?.from || !dateRange?.to) return;

    setLoading(true);
    try {
      let start = startOfDay(dateRange.from);
      let end = endOfDay(dateRange.to);

      if (timeRange) {
        const [startHour, startMinute] = timeRange.start.split(':').map(Number);
        const [endHour, endMinute] = timeRange.end.split(':').map(Number);
        start = setMinutes(setHours(start, startHour), startMinute);
        end = setMinutes(setHours(end, endHour), endMinute);
      }

      const startISO = start.toISOString();
      const endISO = end.toISOString();

      let orders: any[] = [];
      let invoices: any[] = [];
      const outletNameById = new Map<string, string>();

      if (isOffline) {
        // --- MODE HORS-LIGNE : lecture depuis IndexedDB ---
        // Try with outletId first, then without (fallback)
        const selectedOutlet = outletId || localStorage.getItem('selectedOutletId') || undefined;
        const scopedOrders = await getData<any[]>('orders', user.id, selectedOutlet);
        const unscopedOrders = await getData<any[]>('orders', user.id);
        const scopedInvoices = await getData<any[]>('invoices', user.id, selectedOutlet);
        const unscopedInvoices = await getData<any[]>('invoices', user.id);
        const cachedOutlets = await getData<any[]>('outlets', user.id);

        // Outlets map
        ((cachedOutlets?.data as any[]) || []).forEach((o: any) => outletNameById.set(o.id, o.name));

        const mergedOrders = dedupeById([
          ...(((scopedOrders?.data as any[]) || [])),
          ...(((unscopedOrders?.data as any[]) || [])),
        ]);

        const mergedInvoices = dedupeById([
          ...(((scopedInvoices?.data as any[]) || [])),
          ...(((unscopedInvoices?.data as any[]) || [])),
        ]);

        // Filtrer par date et outlet
        orders = mergedOrders.filter((o: any) => {
          const d = o.created_at;
          if (!d) return false;
          if (d < startISO || d > endISO) return false;
          if (outletId && o.outlet_id !== outletId) return false;
          return true;
        });

        invoices = mergedInvoices.filter((inv: any) => {
          const d = inv.created_at;
          if (!d) return false;
          if (d < startISO || d > endISO) return false;
          if (outletId && inv.outlet_id !== outletId) return false;
          return true;
        });

        console.log('[Offline] Rapports depuis cache — commandes:', orders.length, '| factures:', invoices.length);
      } else {
        // --- MODE EN LIGNE ---
        let scopedOutletId = outletId;
        if (!scopedOutletId) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('selected_outlet_id')
            .eq('id', user.id)
            .maybeSingle();
          scopedOutletId = profile?.selected_outlet_id || undefined;
        }

        let outletsQuery = supabase.from('outlets').select('id, name').eq('user_id', user.id);
        if (scopedOutletId) outletsQuery = outletsQuery.eq('id', scopedOutletId);
        const { data: outletsData, error: outletsError } = await outletsQuery;
        if (outletsError) throw outletsError;
        (outletsData || []).forEach((o: any) => outletNameById.set(o.id, o.name));

        // IMPORTANT: Supabase default limit is 1000 rows — use explicit high limit
        let ordersQuery = supabase
          .from('orders')
          .select('id, total_amount, created_at, outlet_id, customer_name')
          .eq('user_id', user.id)
          .gte('created_at', startISO)
          .lte('created_at', endISO)
          .limit(10000);
        if (scopedOutletId) ordersQuery = ordersQuery.eq('outlet_id', scopedOutletId);
        const { data: ordersData, error: ordersError } = await ordersQuery;
        if (ordersError) throw ordersError;
        orders = dedupeById(ordersData || []);

        let invoicesQuery = supabase
          .from('invoices')
          .select('id, total_amount, status, created_at, outlet_id')
          .eq('user_id', user.id)
          .gte('created_at', startISO)
          .lte('created_at', endISO)
          .limit(10000);
        if (scopedOutletId) invoicesQuery = invoicesQuery.eq('outlet_id', scopedOutletId);
        const { data: invoicesData, error: invoicesError } = await invoicesQuery;
        if (invoicesError) throw invoicesError;
        invoices = dedupeById(invoicesData || []);
      }

      // Build reports map
      const reportsMap = new Map<string, DailyReport>();

      orders.forEach((order: any) => {
        // Exclure les commandes annulées du comptage
        if (order.status === 'cancelled' || order.status === 'rejected') return;

        const orderDate = new Date(order.created_at);
        const dateKey = format(orderDate, 'yyyy-MM-dd');
        const outletKey = `${dateKey}-${order.outlet_id}`;

        if (!reportsMap.has(outletKey)) {
          reportsMap.set(outletKey, {
            date: dateKey,
            time: timeRange ? `${timeRange.start}-${timeRange.end}` : undefined,
            outlet_id: order.outlet_id,
            outlet_name: outletNameById.get(order.outlet_id) || 'Non défini',
            total_orders: 0,
            total_revenue: 0,
            total_invoices: 0,
            paid_invoices: 0,
            unpaid_invoices: 0,
            total_customers: 0,
            average_order_value: 0,
          });
        }

        const report = reportsMap.get(outletKey)!;
        report.total_orders += 1;
      });

      // Le CA est basé sur les factures payées (source de vérité comptable)
      invoices.forEach((invoice: any) => {
        const invoiceDate = new Date(invoice.created_at);
        const dateKey = format(invoiceDate, 'yyyy-MM-dd');
        const outletKey = `${dateKey}-${invoice.outlet_id}`;

        if (!reportsMap.has(outletKey)) {
          reportsMap.set(outletKey, {
            date: dateKey,
            time: timeRange ? `${timeRange.start}-${timeRange.end}` : undefined,
            outlet_id: invoice.outlet_id,
            outlet_name: outletNameById.get(invoice.outlet_id) || 'Non défini',
            total_orders: 0,
            total_revenue: 0,
            total_invoices: 0,
            paid_invoices: 0,
            unpaid_invoices: 0,
            total_customers: 0,
            average_order_value: 0,
          });
        }

        const report = reportsMap.get(outletKey)!;
        report.total_invoices += 1;
        if (invoice.status === 'paid') {
          report.paid_invoices += 1;
          // CA = somme des factures payées uniquement
          report.total_revenue += Math.round(Number(invoice.total_amount));
        } else {
          report.unpaid_invoices += 1;
        }
      });

      reportsMap.forEach((report) => {
        if (report.total_orders > 0) {
          report.average_order_value = Math.round(report.total_revenue / report.total_orders);
        }
      });

      const reportsArray = Array.from(reportsMap.values()).sort((a, b) =>
        b.date.localeCompare(a.date)
      );

      setReports(reportsArray);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Erreur lors du chargement des rapports');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (downloadFormat: 'pdf' | 'excel') => {
    if (reports.length === 0) {
      toast.error('Aucune donnée à télécharger');
      return;
    }

    try {
      if (downloadFormat === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(
          reports.map((report) => ({
            Date: report.date,
            Heure: report.time || '-',
            'Point de vente': report.outlet_name,
            'Commandes': report.total_orders,
            'CA (CFA)': Number(report.total_revenue.toFixed(2)),
            'Factures': report.total_invoices,
            'Payées': report.paid_invoices,
            'Impayées': report.unpaid_invoices,
            'Panier moyen (CFA)': Number(report.average_order_value.toFixed(2)),
          }))
        );

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Rapports');
        const fileName = `rapport_${reportType}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        toast.success('Rapport Excel téléchargé avec succès');
      } else {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text(`Rapport ${reportType}`, 14, 20);
        doc.setFontSize(11);
        doc.text(`Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm')}`, 14, 28);

        const periodText = `Période: ${dateRange?.from ? format(dateRange.from, 'dd/MM/yyyy') : ''} - ${dateRange?.to ? format(dateRange.to, 'dd/MM/yyyy') : ''}`;
        doc.text(periodText, 14, 36);
        if (timeRange) {
          doc.text(`Heures: ${timeRange.start} - ${timeRange.end}`, 14, 42);
        }
        if (isOffline) {
          doc.setFontSize(9);
          doc.text('(Données locales — mode hors ligne)', 14, timeRange ? 48 : 42);
        }

        const tableData = reports.map((report) => [
          report.date,
          report.time || '-',
          report.outlet_name,
          report.total_orders.toString(),
          `${report.total_revenue.toLocaleString()} CFA`,
          report.total_invoices.toString(),
          report.paid_invoices.toString(),
          report.unpaid_invoices.toString(),
          `${report.average_order_value.toLocaleString()} CFA`,
        ]);

        const totalOrders = reports.reduce((sum, r) => sum + r.total_orders, 0);
        const totalRevenue = reports.reduce((sum, r) => sum + r.total_revenue, 0);
        const totalInvoices = reports.reduce((sum, r) => sum + r.total_invoices, 0);
        const totalPaid = reports.reduce((sum, r) => sum + r.paid_invoices, 0);
        const totalUnpaid = reports.reduce((sum, r) => sum + r.unpaid_invoices, 0);
        const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

        tableData.push([
          'Total', '', '',
          totalOrders.toString(),
          `${totalRevenue.toLocaleString()} CFA`,
          totalInvoices.toString(),
          totalPaid.toString(),
          totalUnpaid.toString(),
          `${avgOrder.toLocaleString()} CFA`,
        ]);

        autoTable(doc, {
          head: [['Date', 'Heure', 'Point de vente', 'Commandes', 'CA', 'Factures', 'Payées', 'Impayées', 'Panier moyen']],
          body: tableData,
          startY: isOffline ? (timeRange ? 54 : 48) : (timeRange ? 48 : 44),
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246] },
          styles: { fontSize: 8 },
        });

        const fileName = `rapport_${reportType}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
        doc.save(fileName);
        toast.success('Rapport PDF téléchargé avec succès');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  return {
    reports,
    loading,
    downloadReport,
    refetch: fetchReports,
  };
};
