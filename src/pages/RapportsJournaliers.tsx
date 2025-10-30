import React, { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, DollarSign, ShoppingBag, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import PageWithSidebar from '@/components/PageWithSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useOutlets } from '@/hooks/useOutlets';
import { useDailyReports } from '@/hooks/useDailyReports';
import { DailyReportStats } from '@/components/reports/DailyReportStats';
import { DailyReportTable } from '@/components/reports/DailyReportTable';
import { DateRange } from 'react-day-picker';
import { format, subDays, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { fr } from 'date-fns/locale';

const RapportsJournaliers: React.FC = () => {
  const { user } = useAuth();
  const { outlets, selectedOutletId } = useOutlets();
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date()
  });
  const [timeRange, setTimeRange] = useState<{ start: string; end: string }>({
    start: '00:00',
    end: '23:59'
  });

  const { reports, loading, downloadReport } = useDailyReports({
    outletId: selectedOutletId || undefined,
    dateRange,
    reportType,
    timeRange
  });

  const handleQuickDate = (type: 'today' | 'yesterday' | 'week' | 'month' | 'year') => {
    const today = new Date();
    switch (type) {
      case 'today':
        setDateRange({ from: today, to: today });
        break;
      case 'yesterday':
        const yesterday = subDays(today, 1);
        setDateRange({ from: yesterday, to: yesterday });
        break;
      case 'week':
        setDateRange({ from: startOfWeek(today, { locale: fr }), to: today });
        break;
      case 'month':
        setDateRange({ from: startOfMonth(today), to: today });
        break;
      case 'year':
        setDateRange({ from: startOfYear(today), to: today });
        break;
    }
  };

  const handleDownload = async (format: 'pdf' | 'excel') => {
    if (!dateRange?.from || !dateRange?.to) {
      return;
    }
    await downloadReport(format);
  };

  return (
    <PageWithSidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              Rapports
            </h1>
            <p className="text-muted-foreground mt-2">
              Consultez et téléchargez vos rapports d'activité
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
            <CardDescription>Sélectionnez la période et le type de rapport</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Report Type */}
              <div>
                <label className="text-sm font-medium mb-2 block">Type de rapport</label>
                <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Journalier</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                    <SelectItem value="monthly">Mensuel</SelectItem>
                    <SelectItem value="yearly">Annuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Picker + Time */}
              <div className="lg:col-span-2">
                <label className="text-sm font-medium mb-2 block">Période</label>
                <div className="space-y-2">
                  <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Heure (optionnel)</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="time"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={timeRange.start}
                        onChange={(e) => setTimeRange(prev => ({ ...prev, start: e.target.value }))}
                      />
                      <span className="text-muted-foreground">à</span>
                      <input
                        type="time"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={timeRange.end}
                        onChange={(e) => setTimeRange(prev => ({ ...prev, end: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium mb-2 block">Télécharger</label>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDownload('pdf')}
                    disabled={loading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDownload('excel')}
                    disabled={loading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Date Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => handleQuickDate('today')}>
                Aujourd'hui
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickDate('yesterday')}>
                Hier
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickDate('week')}>
                Cette semaine
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickDate('month')}>
                Ce mois
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickDate('year')}>
                Cette année
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <DailyReportStats reports={reports} loading={loading} />

        {/* Report Table */}
        <DailyReportTable reports={reports} loading={loading} reportType={reportType} />
      </div>
    </PageWithSidebar>
  );
};

export default RapportsJournaliers;
