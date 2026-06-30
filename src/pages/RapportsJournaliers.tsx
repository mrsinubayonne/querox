import React, { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, DollarSign, ShoppingBag, Users, CheckCircle2, Eye, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import PageWithSidebar from '@/components/PageWithSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useOutlets } from '@/hooks/useOutlets';
import { useDailyReports } from '@/hooks/useDailyReports';
import { useBusinessPeriods } from '@/hooks/useBusinessPeriods';
import { useDetailedReports } from '@/hooks/useDetailedReports';
import { useAutoStartPeriod } from '@/hooks/useAutoStartPeriod';
import { DailyReportStats } from '@/components/reports/DailyReportStats';
import { DailyReportTable } from '@/components/reports/DailyReportTable';
import { DetailedTransactionsTable } from '@/components/reports/DetailedTransactionsTable';
import { DateRange } from 'react-day-picker';
import { format, subDays, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FloorPlanReportCard } from '@/components/reports/FloorPlanReportCard';
import { ReportSnapshotCard } from '@/components/reports/ReportSnapshotCard';

const RapportsJournaliers: React.FC = () => {
  const { user } = useAuth();
  const { outlets, selectedOutletId } = useOutlets();
  const [viewMode, setViewMode] = useState<'periods' | 'calendar'>('calendar');
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | undefined>();
  const [showInlinePreview, setShowInlinePreview] = useState(false);
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date()
  });
  const [timeRange, setTimeRange] = useState<{ start: string; end: string }>({
    start: '00:00',
    end: '23:59'
  });

  const { currentPeriod, periods, loading: periodsLoading, closePeriod, startNewPeriod } = useBusinessPeriods({
    outletId: selectedOutletId || undefined,
  });

  // Hook pour démarrer automatiquement une période lors d'une transaction payée
  useAutoStartPeriod(selectedOutletId || undefined);

  const { transactions, loading: detailedLoading, downloadReport: downloadDetailedReport } = useDetailedReports({
    outletId: selectedOutletId || undefined,
    periodId: selectedPeriodId || currentPeriod?.id,
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

  const handleClosePeriod = async () => {
    await closePeriod();
  };

  // Calculate current period stats (live)
  const currentPeriodStats = currentPeriod ? {
    date: format(new Date(currentPeriod.started_at), 'dd/MM/yyyy HH:mm'),
    outlet_id: currentPeriod.outlet_id || '',
    outlet_name: outlets?.find(o => o.id === currentPeriod.outlet_id)?.name || 'Tous les points de vente',
    total_orders: 0,
    total_revenue: 0,
    total_invoices: 0,
    paid_invoices: 0,
    unpaid_invoices: 0,
    total_customers: 0,
    average_order_value: 0,
  } : null;

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

        {/* View Mode Toggle + Aperçu direct */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={viewMode === 'periods' ? 'default' : 'outline'}
            onClick={() => setViewMode('periods')}
          >
            Par périodes d'activité
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            onClick={() => setViewMode('calendar')}
          >
            Par dates calendaires
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowInlinePreview(true)}
            className="border-2 border-primary/40"
          >
            <Eye className="h-4 w-4 mr-2" />
            Aperçu direct
          </Button>
        </div>

        {/* Current Period Alert */}
        {viewMode === 'periods' && currentPeriod && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">Période en cours</p>
                <p className="text-sm text-blue-700">
                  Démarrée le {format(new Date(currentPeriod.started_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                </p>
              </div>
              <Button
                onClick={handleClosePeriod}
                disabled={periodsLoading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Boucler la journée
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* No Current Period Alert */}
        {viewMode === 'periods' && !currentPeriod && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="flex items-center justify-between">
              <p className="text-sm font-medium text-green-900">Aucune période active. Démarrez une nouvelle période pour commencer à enregistrer l'activité.</p>
              <Button 
                onClick={startNewPeriod} 
                disabled={periodsLoading}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Démarrer une période
              </Button>
            </AlertDescription>
          </Alert>
        )}


        {/* Filters - Only show for calendar mode */}
        {viewMode === 'calendar' && (
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
        )}

        {/* Stats Cards */}
        <div id="report-snapshot-area" className="space-y-6 bg-white">
        {viewMode === 'calendar' ? (
          <>
            <DailyReportStats reports={reports} loading={loading} />
            <DailyReportTable reports={reports} loading={loading} reportType={reportType} />
            {/* Toutes les factures payées de la journée en cours — visibles jusqu'à la clôture de la caissière */}
            {currentPeriod && (
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle>Factures payées — journée en cours</CardTitle>
                  <CardDescription>
                    Toutes les factures marquées payées restent dans l'aperçu jusqu'à la clôture de la journée par la caissière.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DetailedTransactionsTable
                    transactions={transactions}
                    loading={detailedLoading}
                  />
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <>
            {/* Detailed Transactions Table - Show for active period or selected closed period */}
            {(currentPeriod || selectedPeriodId) && (
              <DetailedTransactionsTable 
                transactions={transactions} 
                loading={detailedLoading} 
              />
            )}

            {/* Closed Periods Table */}
            <Card>
              <CardHeader>
                <CardTitle>Historique des périodes bouclées</CardTitle>
                <CardDescription>
                  Liste de toutes les journées bouclées
                </CardDescription>
              </CardHeader>
              <CardContent>
                {periodsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : periods.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Aucune période bouclée pour le moment</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {periods.map((period) => (
                      <Card 
                        key={period.id} 
                        className={`border-l-4 cursor-pointer transition-all ${
                          selectedPeriodId === period.id 
                            ? 'border-l-blue-500 bg-blue-50' 
                            : 'border-l-green-500 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedPeriodId(period.id)}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                {format(new Date(period.started_at), 'dd MMMM yyyy', { locale: fr })}
                              </CardTitle>
                              <CardDescription>
                                {format(new Date(period.started_at), 'HH:mm', { locale: fr })} -{' '}
                                {period.ended_at && format(new Date(period.ended_at), 'HH:mm', { locale: fr })}
                                {' • '}
                                {outlets?.find(o => o.id === period.outlet_id)?.name || 'Tous les points de vente'}
                              </CardDescription>
                            </div>
                            {selectedPeriodId === period.id && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadDetailedReport('pdf');
                                }}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                PDF
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Commandes</p>
                              <p className="text-2xl font-bold">{period.total_orders}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
                              <p className="text-2xl font-bold text-green-600">
                                {Number(period.total_revenue).toLocaleString()} CFA
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Factures payées</p>
                              <p className="text-2xl font-bold text-green-600">{period.paid_invoices}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Factures impayées</p>
                              <p className="text-2xl font-bold text-orange-600">{period.unpaid_invoices}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
        </div>
      </div>
    </PageWithSidebar>
  );
};

export default RapportsJournaliers;
