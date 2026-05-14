import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { getData, getPendingMutations } from '@/lib/offlineStorage';
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
  const { user, isTeamMember, teamMemberSession } = useAuth();
  const { isOffline } = useNetworkStatus();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const effectiveUserId = isTeamMember && teamMemberSession ? teamMemberSession.ownerId : user?.id;

  const shouldUseOfflineCache = isOffline || (typeof window !== 'undefined' && localStorage.getItem('querox_force_offline_mode') === '1');

  const dedupeById = <T extends { id?: string }>(list: T[]): T[] => {
    return Array.from(
      new Map(list.map((item, index) => [item.id || `idx-${index}`, item])).values()
    );
  };

  // Dedup invoices by invoice_number (server-truth) to avoid double-counting
  // when the same invoice appears with both a local UUID and a server UUID
  const dedupeInvoices = <T extends { id?: string; invoice_number?: string; outlet_id?: string }>(list: T[]): T[] => {
    const map = new Map<string, T>();
    for (const inv of list) {
      const key = inv.invoice_number
        ? `num:${inv.invoice_number}:${inv.outlet_id || ''}`
        : `id:${inv.id || Math.random()}`;
      if (!map.has(key)) map.set(key, inv);
    }
    return Array.from(map.values());
  };

  useEffect(() => {
    if (effectiveUserId && dateRange?.from && dateRange?.to) {
      fetchReports();
    }
  }, [effectiveUserId, outletId, dateRange, reportType, timeRange, shouldUseOfflineCache]);

  const fetchReports = async () => {
    if (!effectiveUserId || !dateRange?.from || !dateRange?.to) return;

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

      if (shouldUseOfflineCache) {
        // --- MODE HORS-LIGNE : lecture d'UN SEUL cache (pas de fusion) ---
        // Si outlet sélectionné: cache scopé uniquement. Sinon: cache global.
        const selectedOutlet = outletId || localStorage.getItem('selectedOutletId') || undefined;
        const cachedOrders = selectedOutlet
          ? await getData<any[]>('orders', effectiveUserId, selectedOutlet)
          : await getData<any[]>('orders', effectiveUserId);
        const cachedInvoices = selectedOutlet
          ? await getData<any[]>('invoices', effectiveUserId, selectedOutlet)
          : await getData<any[]>('invoices', effectiveUserId);
        const cachedOutlets = await getData<any[]>('outlets', effectiveUserId);

        // Outlets map
        ((cachedOutlets?.data as any[]) || []).forEach((o: any) => outletNameById.set(o.id, o.name));

        const rawOrders = ((cachedOrders?.data as any[]) || []);
        const rawInvoices = ((cachedInvoices?.data as any[]) || []);

        // Filtrer par date et outlet (filet de sécurité supplémentaire)
        orders = dedupeById(rawOrders.filter((o: any) => {
          const d = o.created_at;
          if (!d) return false;
          if (d < startISO || d > endISO) return false;
          if (outletId && o.outlet_id !== outletId) return false;
          return true;
        }));

        invoices = dedupeInvoices(rawInvoices.filter((inv: any) => {
          const d = inv.created_at;
          if (!d) return false;
          if (d < startISO || d > endISO) return false;
          if (outletId && inv.outlet_id !== outletId) return false;
          return true;
        }));

        console.log('[Offline] Rapports depuis cache — commandes:', orders.length, '| factures:', invoices.length);
      } else {
        // --- MODE EN LIGNE : serveur = source de vérité, fusion locale UNIQUEMENT si mutations en attente ---
        let scopedOutletId = outletId;
        if (!scopedOutletId) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('selected_outlet_id')
            .eq('id', effectiveUserId)
            .maybeSingle();
          scopedOutletId = profile?.selected_outlet_id || undefined;
        }

        let outletsQuery = supabase.from('outlets').select('id, name').eq('user_id', effectiveUserId);
        if (scopedOutletId) outletsQuery = outletsQuery.eq('id', scopedOutletId);
        const { data: outletsData, error: outletsError } = await outletsQuery;
        if (outletsError) throw outletsError;
        (outletsData || []).forEach((o: any) => outletNameById.set(o.id, o.name));

        // IMPORTANT: Supabase default limit is 1000 rows — use explicit high limit
        let ordersQuery = supabase
          .from('orders')
          .select('id, total_amount, created_at, outlet_id, customer_name, status')
          .eq('user_id', effectiveUserId)
          .gte('created_at', startISO)
          .lte('created_at', endISO)
          .limit(10000);
        if (scopedOutletId) ordersQuery = ordersQuery.eq('outlet_id', scopedOutletId);
        const { data: ordersData, error: ordersError } = await ordersQuery;
        if (ordersError) throw ordersError;

        let invoicesQuery = supabase
          .from('invoices')
          .select('id, total_amount, status, created_at, outlet_id, invoice_number')
          .eq('user_id', effectiveUserId)
          .gte('created_at', startISO)
          .lte('created_at', endISO)
          .limit(10000);
        if (scopedOutletId) invoicesQuery = invoicesQuery.eq('outlet_id', scopedOutletId);
        const { data: invoicesData, error: invoicesError } = await invoicesQuery;
        if (invoicesError) throw invoicesError;

        let mergedOrders = ordersData || [];
        let mergedInvoices = invoicesData || [];

        // Fusion conditionnelle : seulement si des mutations locales sont en attente
        try {
          const allPending = await getPendingMutations();
          const pendingOrders = allPending.filter((m: any) =>
            m.table === 'orders' &&
            m.userId === effectiveUserId &&
            (!scopedOutletId || m.outletId === scopedOutletId)
          );
          const pendingInvoices = allPending.filter((m: any) =>
            m.table === 'invoices' &&
            m.userId === effectiveUserId &&
            (!scopedOutletId || m.outletId === scopedOutletId)
          );

          if (pendingOrders.length > 0) {
            const cachedOrders = scopedOutletId
              ? await getData<any[]>('orders', effectiveUserId, scopedOutletId)
              : await getData<any[]>('orders', effectiveUserId);
            const localOnly = ((cachedOrders?.data as any[]) || []).filter((o: any) => {
              if (!o?.created_at) return false;
              const d = o.created_at;
              if (d < startISO || d > endISO) return false;
              if (scopedOutletId && o.outlet_id !== scopedOutletId) return false;
              // ne garder que ceux qui ont une mutation pending (pas encore sur serveur)
              return pendingOrders.some((m: any) => (m.data?.id || m.recordId) === o.id);
            });
            mergedOrders = [...mergedOrders, ...localOnly];
            console.log('[Reports] Fusion online: +' , localOnly.length, 'commandes locales en attente');
          }

          if (pendingInvoices.length > 0) {
            const cachedInvoices = scopedOutletId
              ? await getData<any[]>('invoices', effectiveUserId, scopedOutletId)
              : await getData<any[]>('invoices', effectiveUserId);
            const localOnly = ((cachedInvoices?.data as any[]) || []).filter((inv: any) => {
              if (!inv?.created_at) return false;
              const d = inv.created_at;
              if (d < startISO || d > endISO) return false;
              if (scopedOutletId && inv.outlet_id !== scopedOutletId) return false;
              return pendingInvoices.some((m: any) => (m.data?.id || m.recordId) === inv.id);
            });
            mergedInvoices = [...mergedInvoices, ...localOnly];
            console.log('[Reports] Fusion online: +', localOnly.length, 'factures locales en attente');
          }
        } catch (mergeErr) {
          console.warn('[Reports] Pending merge skipped:', mergeErr);
        }

        orders = dedupeById(mergedOrders);
        invoices = dedupeInvoices(mergedInvoices);
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

        const formatFCFA = (value: number) => {
          const rounded = Math.round(Number(value) || 0);
          return `${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`;
        };

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(`Rapport ${reportType}`, 14, 20);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
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

        const startTableY = isOffline ? (timeRange ? 54 : 48) : (timeRange ? 48 : 44);

        // --- SUMMARY TABLE (same as before) ---
        const tableData = reports.map((report) => [
          report.date,
          report.time || '-',
          report.outlet_name,
          report.total_orders.toString(),
          formatFCFA(report.total_revenue),
          report.total_invoices.toString(),
          report.paid_invoices.toString(),
          report.unpaid_invoices.toString(),
          formatFCFA(report.average_order_value),
        ]);

        const totalOrders = reports.reduce((sum, r) => sum + r.total_orders, 0);
        const totalRevenue = reports.reduce((sum, r) => sum + r.total_revenue, 0);
        const totalInvoices = reports.reduce((sum, r) => sum + r.total_invoices, 0);
        const totalPaid = reports.reduce((sum, r) => sum + r.paid_invoices, 0);
        const totalUnpaid = reports.reduce((sum, r) => sum + r.unpaid_invoices, 0);
        const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

        tableData.push([
          'TOTAL', '', '',
          totalOrders.toString(),
          formatFCFA(totalRevenue),
          totalInvoices.toString(),
          totalPaid.toString(),
          totalUnpaid.toString(),
          formatFCFA(avgOrder),
        ]);

        autoTable(doc, {
          head: [['Date', 'Heure', 'PDV', 'Commandes', 'CA', 'Factures', 'Payées', 'Impayées', 'Panier moyen']],
          body: tableData,
          startY: startTableY,
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246] },
          styles: { fontSize: 8 },
          columnStyles: { 4: { halign: 'right' }, 8: { halign: 'right' } },
        });

        let finalY = (doc as any).lastAutoTable.finalY || 50;

        // --- TOTAL ---
        finalY += 8;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL ${periodText.split(': ')[1]}: ${formatFCFA(totalRevenue)}`, 14, finalY);
        finalY += 10;

        // --- DETAILED TRANSACTIONS TABLE (matching period report format) ---
        if (!isOffline) {
          try {
            const startISO = startOfDay(dateRange!.from!).toISOString();
            const endISO = endOfDay(dateRange!.to!).toISOString();
            const scopedOutletId = outletId || localStorage.getItem('selectedOutletId') || undefined;

            let invoicesQuery = supabase
              .from('invoices')
              .select('id, invoice_number, customer_name, total_amount, status, created_at, outlet_id')
              .eq('user_id', user!.id)
              .eq('status', 'paid')
              .gte('created_at', startISO)
              .lte('created_at', endISO)
              .order('created_at', { ascending: false })
              .limit(10000);
            if (scopedOutletId) invoicesQuery = invoicesQuery.eq('outlet_id', scopedOutletId);
            const { data: paidInvoices } = await invoicesQuery;

            if (paidInvoices && paidInvoices.length > 0) {
              if (finalY > 230) { doc.addPage(); finalY = 20; }
              doc.setFontSize(14);
              doc.setFont('helvetica', 'bold');
              doc.text('Détail des transactions', 14, finalY);
              finalY += 4;

              const detailData = paidInvoices.map((inv: any) => {
                const d = new Date(inv.created_at);
                return [
                  format(d, 'dd/MM/yyyy'),
                  format(d, 'HH:mm'),
                  inv.invoice_number || '-',
                  inv.customer_name || 'Client',
                  formatFCFA(inv.total_amount),
                  'Payée',
                ];
              });

              autoTable(doc, {
                head: [['Date', 'Heure', 'Référence', 'Client', 'Montant', 'Statut']],
                body: detailData,
                startY: finalY,
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246] },
                styles: { fontSize: 8 },
                columnStyles: { 4: { halign: 'right' } },
              });
              finalY = (doc as any).lastAutoTable.finalY + 8;
            }
          } catch (detailErr) {
            console.warn('Could not fetch detailed transactions for PDF:', detailErr);
          }
        }

        // --- ORDERS LIST + TOP DISHES ---
        if (!isOffline) {
          try {
            const startISO = startOfDay(dateRange!.from!).toISOString();
            const endISO = endOfDay(dateRange!.to!).toISOString();
            const scopedOutletId = outletId || localStorage.getItem('selectedOutletId') || undefined;

            let ordersQuery = supabase
              .from('orders')
              .select('id, customer_name, total_amount, status, created_at, items, table_number, order_type')
              .eq('user_id', user!.id)
              .gte('created_at', startISO)
              .lte('created_at', endISO)
              .order('created_at', { ascending: false })
              .limit(10000);
            if (scopedOutletId) ordersQuery = ordersQuery.eq('outlet_id', scopedOutletId);
            const { data: ordersData } = await ordersQuery;

            if (ordersData && ordersData.length > 0) {
              if (finalY > 220) { doc.addPage(); finalY = 20; }
              doc.setFontSize(14);
              doc.setFont('helvetica', 'bold');
              doc.text(`Commandes passées (${ordersData.length})`, 14, finalY);
              finalY += 4;

              const ordersBody = ordersData.map((o: any) => {
                const d = new Date(o.created_at);
                const itemsCount = Array.isArray(o.items)
                  ? o.items.reduce((s: number, it: any) => s + (Number(it.quantity) || 0), 0)
                  : 0;
                return [
                  format(d, 'dd/MM/yyyy HH:mm'),
                  o.customer_name || 'Client',
                  o.table_number || o.order_type || '-',
                  itemsCount.toString(),
                  formatFCFA(o.total_amount),
                  o.status || '-',
                ];
              });

              autoTable(doc, {
                head: [['Date', 'Client', 'Table/Type', 'Articles', 'Montant', 'Statut']],
                body: ordersBody,
                startY: finalY,
                theme: 'grid',
                headStyles: { fillColor: [99, 102, 241] },
                styles: { fontSize: 8 },
                columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' } },
              });
              finalY = (doc as any).lastAutoTable.finalY + 8;

              // Top dishes aggregate
              const dishMap = new Map<string, { name: string; qty: number; revenue: number }>();
              ordersData.forEach((o: any) => {
                if (Array.isArray(o.items)) {
                  o.items.forEach((it: any) => {
                    const key = (it.name || it.id || 'inconnu').toString();
                    const qty = Number(it.quantity) || 0;
                    const price = Number(it.price) || 0;
                    const ex = dishMap.get(key);
                    if (ex) { ex.qty += qty; ex.revenue += qty * price; }
                    else dishMap.set(key, { name: key, qty, revenue: qty * price });
                  });
                }
              });
              const topDishes = Array.from(dishMap.values()).sort((a, b) => b.qty - a.qty);

              if (topDishes.length > 0) {
                if (finalY > 230) { doc.addPage(); finalY = 20; }
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('Plats les plus commandés', 14, finalY);
                finalY += 4;
                autoTable(doc, {
                  head: [['#', 'Plat', 'Quantité', 'CA estimé']],
                  body: topDishes.map((d, i) => [
                    (i + 1).toString(),
                    d.name,
                    d.qty.toString(),
                    formatFCFA(d.revenue),
                  ]),
                  startY: finalY,
                  theme: 'grid',
                  headStyles: { fillColor: [234, 88, 12] },
                  styles: { fontSize: 8 },
                  columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' } },
                });
                finalY = (doc as any).lastAutoTable.finalY + 8;
              }
            }
          } catch (ordersErr) {
            console.warn('Could not fetch orders for PDF:', ordersErr);
          }
        }

        // --- CONSUMPTION DATA ---
        if (!isOffline) {
          try {
            const startISO = startOfDay(dateRange!.from!).toISOString();
            const endISO = endOfDay(dateRange!.to!).toISOString();
            const scopedOutletId = outletId || localStorage.getItem('selectedOutletId') || undefined;

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

            if (scopedOutletId) {
              movQuery = movQuery.eq('inventory_items.outlet_id', scopedOutletId);
            }

            const { data: movements } = await movQuery;

            if (movements && movements.length > 0) {
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

              finalY += 4;
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
          } catch (consumptionErr) {
            console.warn('Could not fetch consumption for PDF:', consumptionErr);
          }
        }

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
