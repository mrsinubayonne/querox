import React, { useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AccountingHeader from '@/components/accounting/AccountingHeader';
import StatsCard from '@/components/accounting/StatsCard';
import NavigationTabs from '@/components/accounting/NavigationTabs';
import TransactionCard from '@/components/accounting/TransactionCard';
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

  const stats = [
    {
      title: "Recettes du mois",
      value: "185 000",
      currency: "CFA",
      change: "+12% vs mois dernier",
      isPositive: true,
      icon: "💰"
    },
    {
      title: "Dépenses du mois", 
      value: "115 000", 
      currency: "CFA",
      change: "+5% vs mois dernier",
      isPositive: false,
      icon: "📊"
    },
    {
      title: "Bénéfice net",
      value: "70 000",
      currency: "CFA",
      change: "+18% vs mois dernier",
      isPositive: true,
      icon: "📈"
    },
    {
      title: "Marge bénéficiaire",
      value: "37.8%",
      currency: "",
      change: "+2.1% vs mois dernier",
      isPositive: true,
      icon: "📊"
    }
  ];

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

    // Simuler l'exportation selon le format
    if (format === 'excel') {
      // Créer un fichier Excel simulé
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
      // Simuler l'ouverture de Google Sheets
      window.open('https://sheets.google.com/create', '_blank');
    } else if (format === 'pdf') {
      // Simuler la génération PDF
      window.print();
    }
    
    toast({
      title: "Exportation réussie",
      description: `Données exportées en ${formatMap[format as keyof typeof formatMap]} pour ${periodMap[period as keyof typeof periodMap]}`,
    });
  };

  const handleNewTransaction = () => {
    setShowNewTransactionModal(true);
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
            onNewTransaction={handleNewTransaction}
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {stats.map((stat, index) => (
              <StatsCard
                key={index}
                stat={stat}
                onClick={() => toast({
                  title: stat.title,
                  description: `Détails: ${stat.value} ${stat.currency}`,
                })}
              />
            ))}
          </div>

          <NavigationTabs tabs={tabs} onTabChange={handleTabChange} />

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Transactions récentes ({filteredTransactions.length})</h2>
              
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    formatCurrency={formatCurrency}
                    onViewDetails={() => toast({
                      title: "Détails transaction",
                      description: `${transaction.title} - ${formatCurrency(transaction.amount)}`,
                    })}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rapports' && (
            <Card className="p-6">
              <div className="text-center text-gray-500">
                <h3 className="text-lg font-semibold mb-2">Rapports mensuels</h3>
                <p className="text-sm mb-4">Générez et consultez vos rapports comptables mensuels</p>
                <Button 
                  onClick={() => toast({
                    title: "Rapport généré",
                    description: "Rapport mensuel en cours de génération...",
                  })}
                >
                  Générer rapport mensuel
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'budget' && (
            <Card className="p-6">
              <div className="text-center text-gray-500">
                <h3 className="text-lg font-semibold mb-2">Budget prévisionnel</h3>
                <p className="text-sm mb-4">Planifiez et suivez votre budget prévisionnel</p>
                <Button 
                  onClick={() => toast({
                    title: "Budget",
                    description: "Configuration du budget prévisionnel...",
                  })}
                >
                  Configurer le budget
                </Button>
              </div>
            </Card>
          )}

          {filteredTransactions.length === 0 && activeTab === 'transactions' && (
            <div className="text-center py-8 text-gray-500">
              <p>Aucune transaction trouvée</p>
            </div>
          )}
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
