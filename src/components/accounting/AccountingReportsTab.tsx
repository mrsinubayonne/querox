import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTransactions } from '@/hooks/useTransactions';
import { Download, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AccountingReportsTabProps {
  onGenerateReport: () => void;
}

const AccountingReportsTab: React.FC<AccountingReportsTabProps> = ({ onGenerateReport }) => {
  const { transactions, loading } = useTransactions();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const monthlyReport = useMemo(() => {
    const filtered = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });

    const revenue = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const profit = revenue - expenses;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    const expensesByCategory = filtered
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
        return acc;
      }, {} as Record<string, number>);

    return {
      revenue,
      expenses,
      profit,
      margin,
      transactionCount: filtered.length,
      expensesByCategory
    };
  }, [transactions, selectedMonth, selectedYear]);

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const handleDownloadReport = () => {
    const reportContent = `
RAPPORT COMPTABLE MENSUEL
${months[selectedMonth]} ${selectedYear}

═══════════════════════════════════════════

RÉSUMÉ FINANCIER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Revenus totaux:     ${monthlyReport.revenue.toFixed(2)} €
Dépenses totales:   ${monthlyReport.expenses.toFixed(2)} €
─────────────────────────────────────────────
Profit net:         ${monthlyReport.profit.toFixed(2)} €
Marge:              ${monthlyReport.margin.toFixed(2)}%

Nombre de transactions: ${monthlyReport.transactionCount}

═══════════════════════════════════════════

DÉPENSES PAR CATÉGORIE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${Object.entries(monthlyReport.expensesByCategory)
  .sort(([, a], [, b]) => b - a)
  .map(([category, amount]) => `${category}: ${amount.toFixed(2)} €`)
  .join('\n')}

═══════════════════════════════════════════

Généré le ${new Date().toLocaleDateString('fr-FR')}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-${months[selectedMonth]}-${selectedYear}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Rapport téléchargé",
      description: `Le rapport de ${months[selectedMonth]} ${selectedYear} a été téléchargé`
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Rapports mensuels</h3>
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-gray-500" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 border rounded-md"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border rounded-md"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-gray-600">Revenus</div>
            <div className="text-2xl font-bold text-green-600">
              {monthlyReport.revenue.toFixed(2)} €
            </div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="text-sm text-gray-600">Dépenses</div>
            <div className="text-2xl font-bold text-red-600">
              {monthlyReport.expenses.toFixed(2)} €
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600">Profit net</div>
            <div className={`text-2xl font-bold ${monthlyReport.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {monthlyReport.profit.toFixed(2)} €
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-gray-600">Marge</div>
            <div className="text-2xl font-bold text-purple-600">
              {monthlyReport.margin.toFixed(1)}%
            </div>
          </div>
        </div>

        {Object.keys(monthlyReport.expensesByCategory).length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Dépenses par catégorie</h4>
            <div className="space-y-2">
              {Object.entries(monthlyReport.expensesByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium capitalize">{category}</span>
                    <span className="font-semibold text-red-600">{amount.toFixed(2)} €</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="text-sm text-gray-500 mb-4">
          {monthlyReport.transactionCount} transaction(s) ce mois
        </div>

        <Button onClick={handleDownloadReport} className="w-full">
          <Download size={16} className="mr-2" />
          Télécharger le rapport mensuel
        </Button>
      </Card>
    </div>
  );
};

export default AccountingReportsTab;
