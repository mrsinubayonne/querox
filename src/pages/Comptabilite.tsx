import React, { useState, useMemo } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AccountingHeader from '@/components/accounting/AccountingHeader';
import AccountingStats from '@/components/accounting/AccountingStats';
import AccountingTabsContainer from '@/components/accounting/AccountingTabsContainer';
import NewTransactionModal from '@/components/accounting/NewTransactionModal';
import ExportModal from '@/components/accounting/ExportModal';

const Comptabilite = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('transactions');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const { toast } = useToast();

  const [transactions, setTransactions] = useState([
    {
      id: 1,
      title: "Ventes du jour",
      date: "2024-06-09",
      amount: 45000,
      isPositive: true,
      status: "confirmé",
      icon: <TrendingUp className="h-4 w-4 text-green-600" />
    },
    {
      id: 2,
      title: "Achat ingrédients", 
      date: "2024-06-08",
      amount: -12000,
      isPositive: false,
      status: "confirmé",
      icon: <TrendingDown className="h-4 w-4 text-red-600" />
    },
    {
      id: 3,
      title: "Commandes en ligne",
      date: "2024-06-08", 
      amount: 8500,
      isPositive: true,
      status: "en attente",
      icon: <TrendingUp className="h-4 w-4 text-green-600" />
    }
  ]);

  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    const recettes = monthlyTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const depenses = Math.abs(monthlyTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0));
    
    const benefice = recettes - depenses;
    const marge = recettes > 0 ? (benefice / recettes) * 100 : 0;

    return [
      {
        title: "Recettes du mois",
        value: new Intl.NumberFormat('fr-FR').format(recettes),
        currency: "CFA",
        change: "+12% vs mois dernier",
        isPositive: true,
        icon: "💰"
      },
      {
        title: "Dépenses du mois", 
        value: new Intl.NumberFormat('fr-FR').format(depenses), 
        currency: "CFA",
        change: "+5% vs mois dernier",
        isPositive: false,
        icon: "📊"
      },
      {
        title: "Bénéfice net",
        value: new Intl.NumberFormat('fr-FR').format(benefice),
        currency: "CFA",
        change: "+18% vs mois dernier",
        isPositive: benefice >= 0,
        icon: "📈"
      },
      {
        title: "Marge bénéficiaire",
        value: marge.toFixed(1) + "%",
        currency: "",
        change: "+2.1% vs mois dernier",
        isPositive: true,
        icon: "📊"
      }
    ];
  }, [transactions]);

  const handleExport = (format: string, period: string) => {
    const formatMap = {
      excel: 'Excel (.xlsx)',
      sheets: 'Google Sheets',
      pdf: 'PDF'
    };

    const periodMap = {
      ce_mois: 'ce mois',
      mois_dernier: 'le mois dernier',
      '3_mois': 'les 3 derniers mois',
      cette_annee: 'cette année',
      tout: 'toutes les données'
    };

    if (format === 'excel') {
      const data = `Titre,Date,Montant,Statut\n${filteredTransactions.map(t => 
        `"${t.title}","${t.date}","${formatCurrency(t.amount)}","${t.status}"`
      ).join('\n')}`;
      
      const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `comptabilite-${period}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'sheets') {
      window.open('https://sheets.google.com/create', '_blank');
    } else if (format === 'pdf') {
      window.print();
    }
    
    toast({
      title: "Exportation réussie",
      description: `Données exportées en ${formatMap[format as keyof typeof formatMap]} pour ${periodMap[period as keyof typeof periodMap]}`,
    });
  };

  const handleCreateTransaction = (transaction: any) => {
    setTransactions(prev => [transaction, ...prev]);
    toast({
      title: "Transaction créée",
      description: `${transaction.title} a été ajoutée avec succès`,
    });
  };

  const handleSearch = () => {
    toast({
      title: "Recherche",
      description: `Recherche pour: ${searchTerm}`,
    });
  };

  const handleFilter = () => {
    toast({
      title: "Filtres",
      description: "Options de filtrage ouvertes",
    });
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const tabLabels = {
      transactions: 'Transactions récentes',
      rapports: 'Rapports mensuels',
      budget: 'Budget prévisionnel'
    };
    toast({
      title: "Onglet changé",
      description: `Affichage: ${tabLabels[tabId as keyof typeof tabLabels]}`,
    });
  };

  const handleTransactionDetails = (transaction: any) => {
    toast({
      title: "Détails transaction",
      description: `${transaction.title} - ${formatCurrency(transaction.amount)}`,
    });
  };

  const handleGenerateReport = () => {
    toast({
      title: "Rapport généré",
      description: "Rapport mensuel en cours de génération...",
    });
  };

  const handleConfigureBudget = () => {
    toast({
      title: "Budget",
      description: "Configuration du budget prévisionnel...",
    });
  };

  const handleStatClick = (stat: any) => {
    toast({
      title: stat.title,
      description: `Détails: ${stat.value} ${stat.currency}`,
    });
  };

  const tabs = [
    { id: 'transactions', label: 'Transactions récentes', active: activeTab === 'transactions' },
    { id: 'rapports', label: 'Rapports mensuels', active: activeTab === 'rapports' },
    { id: 'budget', label: 'Budget prévisionnel', active: activeTab === 'budget' }
  ];

  const filteredTransactions = transactions.filter(transaction =>
    transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.date.includes(searchTerm)
  );

  const formatCurrency = (amount: number) => {
    const formatted = new Intl.NumberFormat('fr-FR').format(Math.abs(amount));
    return `${amount >= 0 ? '+' : '-'}${formatted} CFA`;
  };

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <AccountingHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSearch={handleSearch}
            onFilter={handleFilter}
            onExport={() => setShowExportModal(true)}
            onNewTransaction={() => setShowNewTransactionModal(true)}
          />

          <AccountingStats
            stats={stats}
            onStatClick={handleStatClick}
          />

          <AccountingTabsContainer
            activeTab={activeTab}
            tabs={tabs}
            transactions={filteredTransactions}
            formatCurrency={formatCurrency}
            onTabChange={handleTabChange}
            onTransactionDetails={handleTransactionDetails}
            onGenerateReport={handleGenerateReport}
            onConfigureBudget={handleConfigureBudget}
          />
        </div>
      </div>

      <NewTransactionModal
        isOpen={showNewTransactionModal}
        onClose={() => setShowNewTransactionModal(false)}
        onSubmit={handleCreateTransaction}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />
    </div>
  );
};

export default Comptabilite;
