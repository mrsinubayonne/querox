import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FileDown, TrendingUp, TrendingDown } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  status: string;
}

interface Invoice {
  id: string;
  total_amount: number;
  status: string;
  paid_date: string | null;
  created_at: string;
}

interface AccountingPeriodsTabProps {
  transactions: Transaction[];
  invoices: Invoice[];
}

type Period = 'week' | 'month' | 'quarter' | 'year';

const AccountingPeriodsTab: React.FC<AccountingPeriodsTabProps> = ({ transactions, invoices }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');

  const getPeriodDates = (period: Period) => {
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return { startDate, endDate: now };
  };

  const periodStats = useMemo(() => {
    const { startDate, endDate } = getPeriodDates(selectedPeriod);
    
    // Calculer les stats des transactions
    const periodTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= startDate && tDate <= endDate && t.status === 'completed';
    });

    const recettes = periodTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const depenses = periodTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Ajouter les factures payées
    const paidInvoices = invoices.filter(inv => {
      if (inv.status !== 'paid' || !inv.paid_date) return false;
      const paidDate = new Date(inv.paid_date);
      return paidDate >= startDate && paidDate <= endDate;
    });

    const recettesFactures = paidInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
    const totalRecettes = recettes + recettesFactures;
    const benefice = totalRecettes - depenses;
    const marge = totalRecettes > 0 ? (benefice / totalRecettes) * 100 : 0;

    return {
      recettes: totalRecettes,
      depenses,
      benefice,
      marge,
      transactionCount: periodTransactions.length,
      invoiceCount: paidInvoices.length,
      paidInvoices
    };
  }, [selectedPeriod, transactions, invoices]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const getPeriodLabel = () => {
    const labels = {
      week: 'Semaine dernière',
      month: 'Mois dernier',
      quarter: 'Trimestre dernier',
      year: 'Année dernière'
    };
    return labels[selectedPeriod];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Rapports par période</h3>
          <p className="text-sm text-muted-foreground">Analyse financière détaillée avec factures payées</p>
        </div>
        <Select value={selectedPeriod} onValueChange={(value: Period) => setSelectedPeriod(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Hebdomadaire</SelectItem>
            <SelectItem value="month">Mensuel</SelectItem>
            <SelectItem value="quarter">Trimestriel</SelectItem>
            <SelectItem value="year">Annuel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Recettes totales</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {formatCurrency(periodStats.recettes)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {periodStats.transactionCount} transactions + {periodStats.invoiceCount} factures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Dépenses totales</CardDescription>
            <CardTitle className="text-2xl text-red-600">
              {formatCurrency(periodStats.depenses)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {periodStats.transactionCount} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Bénéfice net</CardDescription>
            <CardTitle className={`text-2xl ${periodStats.benefice >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(periodStats.benefice)}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            {periodStats.benefice >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <p className="text-xs text-muted-foreground">
              {periodStats.benefice >= 0 ? 'Positif' : 'Négatif'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Marge bénéficiaire</CardDescription>
            <CardTitle className="text-2xl text-purple-600">
              {periodStats.marge.toFixed(1)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Taux de rentabilité
            </p>
          </CardContent>
        </Card>
      </div>

      {periodStats.paidInvoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Factures payées - {getPeriodLabel()}</CardTitle>
            <CardDescription>
              {periodStats.invoiceCount} facture(s) payée(s) pour un montant total de {formatCurrency(periodStats.paidInvoices.reduce((sum, inv) => sum + inv.total_amount, 0))}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {periodStats.paidInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Facture</p>
                    <p className="text-sm text-muted-foreground">
                      Payée le {new Date(invoice.paid_date!).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{formatCurrency(invoice.total_amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button variant="outline" className="gap-2">
          <FileDown className="h-4 w-4" />
          Télécharger le rapport
        </Button>
      </div>
    </div>
  );
};

export default AccountingPeriodsTab;
