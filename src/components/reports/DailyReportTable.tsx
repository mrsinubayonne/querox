import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DailyReport } from '@/hooks/useDailyReports';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DailyReportTableProps {
  reports: DailyReport[];
  loading: boolean;
  reportType: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export const DailyReportTable: React.FC<DailyReportTableProps> = ({ 
  reports, 
  loading, 
  reportType 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    switch (reportType) {
      case 'daily':
        return format(date, 'dd MMMM yyyy', { locale: fr });
      case 'weekly':
        return `Semaine du ${format(date, 'dd MMM yyyy', { locale: fr })}`;
      case 'monthly':
        return format(date, 'MMMM yyyy', { locale: fr });
      case 'yearly':
        return format(date, 'yyyy');
      default:
        return dateString;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Détails des rapports</CardTitle>
          <CardDescription>Aucune donnée disponible pour la période sélectionnée</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Sélectionnez une période pour afficher les rapports</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Détails des rapports</CardTitle>
        <CardDescription>
          Vue détaillée de l'activité par point de vente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Point de vente</TableHead>
                <TableHead className="text-right">Commandes</TableHead>
                <TableHead className="text-right">CA</TableHead>
                <TableHead className="text-right">Factures</TableHead>
                <TableHead className="text-right">Payées</TableHead>
                <TableHead className="text-right">Impayées</TableHead>
                <TableHead className="text-right">Panier moyen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report, index) => (
                <TableRow key={`${report.date}-${report.outlet_id}-${index}`}>
                  <TableCell className="font-medium">
                    {formatDate(report.date)}
                  </TableCell>
                  <TableCell>{report.outlet_name}</TableCell>
                  <TableCell className="text-right">{report.total_orders}</TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    {report.total_revenue.toFixed(2)} €
                  </TableCell>
                  <TableCell className="text-right">{report.total_invoices}</TableCell>
                  <TableCell className="text-right text-green-600">
                    {report.paid_invoices}
                  </TableCell>
                  <TableCell className="text-right text-orange-600">
                    {report.unpaid_invoices}
                  </TableCell>
                  <TableCell className="text-right">
                    {report.average_order_value.toFixed(2)} €
                  </TableCell>
                </TableRow>
              ))}
              {/* Total Row */}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell className="text-right">
                  {reports.reduce((sum, r) => sum + r.total_orders, 0)}
                </TableCell>
                <TableCell className="text-right text-green-600">
                  {reports.reduce((sum, r) => sum + r.total_revenue, 0).toFixed(2)} €
                </TableCell>
                <TableCell className="text-right">
                  {reports.reduce((sum, r) => sum + r.total_invoices, 0)}
                </TableCell>
                <TableCell className="text-right text-green-600">
                  {reports.reduce((sum, r) => sum + r.paid_invoices, 0)}
                </TableCell>
                <TableCell className="text-right text-orange-600">
                  {reports.reduce((sum, r) => sum + r.unpaid_invoices, 0)}
                </TableCell>
                <TableCell className="text-right">
                  {(reports.reduce((sum, r) => sum + r.total_revenue, 0) / 
                    reports.reduce((sum, r) => sum + r.total_orders, 0) || 0).toFixed(2)} €
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
