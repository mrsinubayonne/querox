import { useOutletContext } from '@/contexts/OutletContext';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Calendar, Filter } from 'lucide-react';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ConsumptionItem {
  item_id: string;
  item_name: string;
  category: string;
  unit: string;
  total_quantity: number;
  movement_count: number;
}

const InventoryConsumptionTab: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [consumptionData, setConsumptionData] = useState<ConsumptionItem[]>([]);
  const [filterMode, setFilterMode] = useState<'month' | 'custom'>('month');
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const { selectedOutletId: ctxOutletId } = useOutletContext();
  const outletId = ctxOutletId || undefined;

  // Generate month options (last 12 months)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(new Date(), i);
    return { value: format(d, 'yyyy-MM'), label: format(d, 'MMMM yyyy', { locale: fr }) };
  });

  useEffect(() => {
    if (user) fetchConsumption();
  }, [user, selectedMonth, dateRange, filterMode, outletId]);

  const fetchConsumption = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let startDate: string;
      let endDate: string;

      if (filterMode === 'month') {
        const [year, month] = selectedMonth.split('-').map(Number);
        const start = new Date(year, month - 1, 1);
        const end = endOfMonth(start);
        startDate = start.toISOString();
        endDate = end.toISOString();
      } else {
        if (!dateRange?.from || !dateRange?.to) { setLoading(false); return; }
        startDate = dateRange.from.toISOString();
        endDate = dateRange.to.toISOString();
      }

      // Fetch stock movements of type 'out' or 'sale' (deductions)
      let query = supabase
        .from('stock_movements')
        .select(`
          item_id,
          quantity,
          movement_type,
          created_at,
          inventory_items!inner(name, category, unit, user_id, outlet_id)
        `)
        .eq('inventory_items.user_id', user.id)
        .in('movement_type', ['out', 'sale', 'adjustment_down', 'loss'])
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .limit(5000);

      if (outletId) {
        query = query.eq('inventory_items.outlet_id', outletId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Aggregate by item
      const aggregated = new Map<string, ConsumptionItem>();
      (data || []).forEach((mov: any) => {
        const key = mov.item_id;
        const existing = aggregated.get(key);
        const qty = Math.abs(mov.quantity);
        if (existing) {
          existing.total_quantity += qty;
          existing.movement_count += 1;
        } else {
          aggregated.set(key, {
            item_id: mov.item_id,
            item_name: mov.inventory_items?.name || 'Inconnu',
            category: mov.inventory_items?.category || 'Autre',
            unit: mov.inventory_items?.unit || 'pcs',
            total_quantity: qty,
            movement_count: 1,
          });
        }
      });

      const result = Array.from(aggregated.values()).sort((a, b) => b.total_quantity - a.total_quantity);
      setConsumptionData(result);
    } catch (err) {
      console.error('Error fetching consumption:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = categoryFilter === 'all'
    ? consumptionData
    : consumptionData.filter(d => d.category === categoryFilter);

  const categories = [...new Set(consumptionData.map(d => d.category))];

  const getPeriodLabel = () => {
    if (filterMode === 'month') {
      const opt = monthOptions.find(m => m.value === selectedMonth);
      return opt?.label || selectedMonth;
    }
    if (dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`;
    }
    return '';
  };

  const exportPDF = async () => {
    if (filteredData.length === 0) return;

    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Rapport de Consommation', 14, 20);
    doc.setFontSize(11);
    doc.text(`Période: ${getPeriodLabel()}`, 14, 28);
    doc.text(`Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm')}`, 14, 35);

    const boissons = filteredData.filter(d => d.category === 'Boissons');
    const ingredients = filteredData.filter(d => d.category === 'Ingrédients');
    const autres = filteredData.filter(d => d.category !== 'Boissons' && d.category !== 'Ingrédients');

    let startY = 44;

    const addSection = (title: string, items: ConsumptionItem[]) => {
      if (items.length === 0) return;
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 14, startY);
      startY += 4;

      autoTable(doc, {
        head: [['Article', 'Catégorie', 'Quantité consommée', 'Nb mouvements']],
        body: items.map(d => [
          d.item_name,
          d.category,
          `${d.total_quantity} ${d.unit}`,
          d.movement_count.toString(),
        ]),
        startY,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 9 },
      });
      startY = (doc as any).lastAutoTable.finalY + 10;
    };

    addSection('🍺 Boissons consommées', boissons);
    addSection('🥘 Ingrédients consommés', ingredients);
    addSection('📦 Autres articles', autres);

    // Totals
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total articles différents: ${filteredData.length}`, 14, startY);
    doc.text(`Total mouvements: ${filteredData.reduce((s, d) => s + d.movement_count, 0)}`, 14, startY + 7);

    doc.save(`consommation_${selectedMonth || format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Consommation par période
            </CardTitle>
            <CardDescription>
              Articles consommés (sorties de stock) sur la période sélectionnée
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportPDF} disabled={filteredData.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Exporter PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-sm font-medium mb-1 block">Mode</label>
            <Select value={filterMode} onValueChange={(v: 'month' | 'custom') => setFilterMode(v)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Par mois</SelectItem>
                <SelectItem value="custom">Dates personnalisées</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filterMode === 'month' ? (
            <div>
              <label className="text-sm font-medium mb-1 block">Mois</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium mb-1 block">Période</label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-1 block">Catégorie</label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary badges */}
        {!loading && filteredData.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {filteredData.length} articles consommés
            </Badge>
            <Badge variant="secondary">
              {filteredData.reduce((s, d) => s + d.movement_count, 0)} mouvements
            </Badge>
            {consumptionData.filter(d => d.category === 'Boissons').length > 0 && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                🍺 {consumptionData.filter(d => d.category === 'Boissons').reduce((s, d) => s + d.total_quantity, 0)} boissons
              </Badge>
            )}
            {consumptionData.filter(d => d.category === 'Ingrédients').length > 0 && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                🥘 {consumptionData.filter(d => d.category === 'Ingrédients').reduce((s, d) => s + d.total_quantity, 0)} ingrédients
              </Badge>
            )}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune consommation enregistrée pour cette période</p>
            <p className="text-sm mt-1">Les sorties de stock apparaîtront ici</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-right">Quantité consommée</TableHead>
                  <TableHead className="text-right">Nb mouvements</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map(item => (
                  <TableRow key={item.item_id}>
                    <TableCell className="font-medium">{item.item_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {item.total_quantity} {item.unit}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {item.movement_count}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Total row */}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell colSpan={2}>Total</TableCell>
                  <TableCell className="text-right">
                    {filteredData.reduce((s, d) => s + d.total_quantity, 0)} articles
                  </TableCell>
                  <TableCell className="text-right">
                    {filteredData.reduce((s, d) => s + d.movement_count, 0)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryConsumptionTab;
