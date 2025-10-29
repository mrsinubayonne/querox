import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

export interface DailyReport {
  date: string;
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
}

export const useDailyReports = ({ outletId, dateRange, reportType }: UseDailyReportsProps) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && dateRange?.from && dateRange?.to) {
      fetchReports();
    }
  }, [user, outletId, dateRange, reportType]);

  const fetchReports = async () => {
    if (!user || !dateRange?.from || !dateRange?.to) return;

    setLoading(true);
    try {
      // Build query for orders
      let ordersQuery = supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          created_at,
          outlet_id,
          customer_name,
          outlets (
            name
          )
        `)
        .eq('user_id', user.id)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      if (outletId) {
        ordersQuery = ordersQuery.eq('outlet_id', outletId);
      }

      const { data: orders, error: ordersError } = await ordersQuery;

      if (ordersError) throw ordersError;

      // Build query for invoices
      let invoicesQuery = supabase
        .from('invoices')
        .select('id, total_amount, status, created_at, outlet_id')
        .eq('user_id', user.id)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      if (outletId) {
        invoicesQuery = invoicesQuery.eq('outlet_id', outletId);
      }

      const { data: invoices, error: invoicesError } = await invoicesQuery;

      if (invoicesError) throw invoicesError;

      // Process data into daily reports
      const reportsMap = new Map<string, DailyReport>();

      orders?.forEach((order: any) => {
        const dateKey = format(new Date(order.created_at), 'yyyy-MM-dd');
        const outletKey = `${dateKey}-${order.outlet_id}`;

        if (!reportsMap.has(outletKey)) {
          reportsMap.set(outletKey, {
            date: dateKey,
            outlet_id: order.outlet_id,
            outlet_name: order.outlets?.name || 'Non défini',
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
        report.total_revenue += Number(order.total_amount);
      });

      invoices?.forEach((invoice: any) => {
        const dateKey = format(new Date(invoice.created_at), 'yyyy-MM-dd');
        const outletKey = `${dateKey}-${invoice.outlet_id}`;

        if (!reportsMap.has(outletKey)) {
          reportsMap.set(outletKey, {
            date: dateKey,
            outlet_id: invoice.outlet_id,
            outlet_name: 'Non défini',
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
        } else {
          report.unpaid_invoices += 1;
        }
      });

      // Calculate averages
      reportsMap.forEach((report) => {
        if (report.total_orders > 0) {
          report.average_order_value = report.total_revenue / report.total_orders;
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
        // Create Excel file
        const worksheet = XLSX.utils.json_to_sheet(
          reports.map((report) => ({
            Date: report.date,
            'Point de vente': report.outlet_name,
            'Commandes': report.total_orders,
            'Chiffre d\'affaires': `${report.total_revenue.toFixed(2)} €`,
            'Factures': report.total_invoices,
            'Factures payées': report.paid_invoices,
            'Factures impayées': report.unpaid_invoices,
            'Panier moyen': `${report.average_order_value.toFixed(2)} €`,
          }))
        );

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Rapports');
        
        const fileName = `rapport_${reportType}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        
        toast.success('Rapport téléchargé avec succès');
      } else if (downloadFormat === 'pdf') {
        // For PDF, we would need a library like jsPDF
        toast.info('La génération PDF est en cours de développement');
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
