import React, { useState, useMemo } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/hooks/useTransactions';
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
  
  const { transactions, loading, createTransaction } = useTransactions();

  const stats = useMemo(() => {
    const monthlyStats = transactions.reduce((acc, transaction) => {
      const transactionDate = new Date(transaction.date);
      const currentDate = new Date();
      
      if (transactionDate.getMonth() === currentDate.getMonth() && 
          transactionDate.getFullYear() === currentDate.getFullYear() &&
          transaction.status === 'completed') {
        
        if (transaction.type === 'income') {
          acc.recettes += transaction.amount;
        } else {
          acc.depenses += transaction.amount;
        }
      }
      
      return acc;
    }, { recettes: 0, depenses: 0 });

    const benefice = monthlyStats.recettes - monthlyStats.depenses;
    const marge = monthlyStats.recettes > 0 ? (benefice / monthlyStats.recettes) * 100 : 0;

    return [
      {
        title: "Recettes du mois",
        value: new Intl.NumberFormat('fr-FR').format(monthlyStats.recettes),
        currency: "FCFA",
        change: "+12% vs mois dernier",
        isPositive: true,
        icon: "💰"
      },
      {
        title: "Dépenses du mois", 
        value: new Intl.NumberFormat('fr-FR').format(monthlyStats.depenses), 
        currency: "FCFA",
        change: "+5% vs mois dernier",
        isPositive: false,
        icon: "📊"
      },
      {
        title: "Bénéfice net",
        value: new Intl.NumberFormat('fr-FR').format(benefice),
        currency: "FCFA",
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

  const handleCreateTransaction = async (transactionData: any) => {
    const success = await createTransaction(transactionData);
    if (success) {
      toast({
        title: "Transaction créée",
        description: `${transactionData.title} a été ajoutée avec succès`,
      });
    }
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
    return `${amount >= 0 ? '+' : '-'}${formatted} FCFA`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex w-full bg-gray-50">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Chargement des données...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <AccountingHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSearch={() => {}}
            onFilter={() => {}}
            onExport={() => setShowExportModal(true)}
            onNewTransaction={() => setShowNewTransactionModal(true)}
          />

          <AccountingStats
            stats={stats}
            onStatClick={(stat) => {
              toast({
                title: stat.title,
                description: `Détails: ${stat.value} ${stat.currency}`,
              });
            }}
          />

          <AccountingTabsContainer
            activeTab={activeTab}
            tabs={tabs}
            transactions={filteredTransactions.map(t => ({
              id: t.id,
              title: t.title,
              date: t.date,
              amount: t.type === 'income' ? t.amount : -t.amount,
              isPositive: t.type === 'income',
              status: t.status === 'completed' ? 'confirmé' : t.status === 'pending' ? 'en attente' : 'annulé',
              icon: null
            }))}
            formatCurrency={formatCurrency}
            onTabChange={setActiveTab}
            onTransactionDetails={(transaction) => {
              toast({
                title: "Détails transaction",
                description: `${transaction.title} - ${formatCurrency(transaction.amount)}`,
              });
            }}
            onGenerateReport={() => {
              toast({
                title: "Rapport généré",
                description: "Rapport mensuel en cours de génération...",
              });
            }}
            onConfigureBudget={() => {
              toast({
                title: "Budget",
                description: "Configuration du budget prévisionnel...",
              });
            }}
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
