import React, { useState, useMemo, useEffect } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/hooks/useTransactions';
import { useInvoices } from '@/hooks/useInvoices';
import { useOutlets } from '@/hooks/useOutlets';
import AccountingHeader from '@/components/accounting/AccountingHeader';
import AccountingStats from '@/components/accounting/AccountingStats';
import AccountingTabsContainer from '@/components/accounting/AccountingTabsContainer';
import AccountingPeriodsTab from '@/components/accounting/AccountingPeriodsTab';
import NewTransactionModal from '@/components/accounting/NewTransactionModal';
import ExportModal from '@/components/accounting/ExportModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';


const Comptabilite = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('transactions');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedOutletFilter, setSelectedOutletFilter] = useState<string>('all');
  const { toast } = useToast();
  
  const { transactions, loading, createTransaction, refetch: refetchTransactions } = useTransactions();
  const { invoices, loading: invoicesLoading, refetch: refetchInvoices } = useInvoices();
  const { outlets } = useOutlets();

  // Rafraîchir les données régulièrement pour voir les factures payées
  useEffect(() => {
    const interval = setInterval(() => {
      refetchInvoices();
      refetchTransactions();
    }, 30000); // Toutes les 30 secondes

    return () => clearInterval(interval);
  }, [refetchInvoices, refetchTransactions]);

  // Filtrer les transactions par outlet
  const filteredByOutlet = useMemo(() => {
    if (selectedOutletFilter === 'all') {
      return transactions;
    }
    return transactions.filter(t => t.outlet_id === selectedOutletFilter);
  }, [transactions, selectedOutletFilter]);

  const stats = useMemo(() => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // Stats du mois actuel - uniquement les transactions filtrées
    const currentMonthStats = filteredByOutlet.reduce((acc, transaction) => {
      const transactionDate = new Date(transaction.date);
      if (transactionDate.getMonth() === now.getMonth() && 
          transactionDate.getFullYear() === now.getFullYear() &&
          transaction.status === 'completed') {
        if (transaction.type === 'income') {
          acc.recettes += transaction.amount;
        } else {
          acc.depenses += transaction.amount;
        }
      }
      return acc;
    }, { recettes: 0, depenses: 0 });

    // Stats du mois dernier pour comparaison
    const lastMonthStats = filteredByOutlet.reduce((acc, transaction) => {
      const transactionDate = new Date(transaction.date);
      if (transactionDate.getMonth() === lastMonth.getMonth() && 
          transactionDate.getFullYear() === lastMonth.getFullYear() &&
          transaction.status === 'completed') {
        if (transaction.type === 'income') {
          acc.recettes += transaction.amount;
        } else {
          acc.depenses += transaction.amount;
        }
      }
      return acc;
    }, { recettes: 0, depenses: 0 });

    // Note: Les recettes des transactions incluent déjà les factures payées converties en transactions
    const totalRecettes = currentMonthStats.recettes;
    const benefice = totalRecettes - currentMonthStats.depenses;
    const marge = totalRecettes > 0 ? (benefice / totalRecettes) * 100 : 0;

    // Calcul des variations réelles
    const recettesChange = lastMonthStats.recettes > 0 
      ? ((totalRecettes - lastMonthStats.recettes) / lastMonthStats.recettes) * 100 
      : 0;
    const depensesChange = lastMonthStats.depenses > 0 
      ? ((currentMonthStats.depenses - lastMonthStats.depenses) / lastMonthStats.depenses) * 100 
      : 0;
    const lastBenefice = lastMonthStats.recettes - lastMonthStats.depenses;
    const beneficeChange = lastBenefice !== 0 
      ? ((benefice - lastBenefice) / Math.abs(lastBenefice)) * 100 
      : 0;
    const lastMarge = lastMonthStats.recettes > 0 
      ? ((lastMonthStats.recettes - lastMonthStats.depenses) / lastMonthStats.recettes) * 100 
      : 0;
    const margeChange = marge - lastMarge;

    return [
      {
        title: "Recettes du mois",
        value: new Intl.NumberFormat('fr-FR').format(totalRecettes),
        currency: "FCFA",
        change: `${recettesChange >= 0 ? '+' : ''}${recettesChange.toFixed(1)}% vs mois dernier`,
        isPositive: recettesChange >= 0,
        icon: "💰"
      },
      {
        title: "Dépenses du mois", 
        value: new Intl.NumberFormat('fr-FR').format(currentMonthStats.depenses), 
        currency: "FCFA",
        change: `${depensesChange >= 0 ? '+' : ''}${depensesChange.toFixed(1)}% vs mois dernier`,
        isPositive: depensesChange < 0,
        icon: "📊"
      },
      {
        title: "Bénéfice net",
        value: new Intl.NumberFormat('fr-FR').format(benefice),
        currency: "FCFA",
        change: `${beneficeChange >= 0 ? '+' : ''}${beneficeChange.toFixed(1)}% vs mois dernier`,
        isPositive: beneficeChange >= 0,
        icon: "📈"
      },
      {
        title: "Marge bénéficiaire",
        value: marge.toFixed(1) + "%",
        currency: "",
        change: `${margeChange >= 0 ? '+' : ''}${margeChange.toFixed(1)}% vs mois dernier`,
        isPositive: margeChange >= 0,
        icon: "📊"
      }
    ];
  }, [filteredByOutlet]);

  const handleDownloadByOutlet = () => {
    const dataByOutlet = outlets.map(outlet => {
      const outletTransactions = transactions.filter(t => t.outlet_id === outlet.id);
      const recettes = outletTransactions
        .filter(t => t.type === 'income' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      const depenses = outletTransactions
        .filter(t => t.type === 'expense' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      const benefice = recettes - depenses;
      
      return {
        'Point de vente': outlet.name,
        'Recettes': recettes.toFixed(2),
        'Dépenses': depenses.toFixed(2),
        'Bénéfice': benefice.toFixed(2),
        'Nombre de transactions': outletTransactions.length
      };
    });

    // Ajouter le total
    const total = {
      'Point de vente': 'TOTAL',
      'Recettes': dataByOutlet.reduce((sum, d) => sum + Number(d.Recettes), 0).toFixed(2),
      'Dépenses': dataByOutlet.reduce((sum, d) => sum + Number(d.Dépenses), 0).toFixed(2),
      'Bénéfice': dataByOutlet.reduce((sum, d) => sum + Number(d.Bénéfice), 0).toFixed(2),
      'Nombre de transactions': dataByOutlet.reduce((sum, d) => sum + d['Nombre de transactions'], 0)
    };

    const worksheet = XLSX.utils.json_to_sheet([...dataByOutlet, total]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Totaux par PDV');
    XLSX.writeFile(workbook, `comptabilite-pdv-${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Exportation réussie",
      description: "Les données par PDV ont été exportées en Excel",
    });
  };

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
      setShowNewTransactionModal(false);
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
    { id: 'periodes', label: 'Rapports par période', active: activeTab === 'periodes' },
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

  if (loading || invoicesLoading) {
    return (
      <div className="min-h-screen flex w-full bg-gray-50">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Chargement des données comptables...</p>
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

          {/* Filtre par PDV et Total */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg border">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Filtrer par point de vente</label>
              <Select value={selectedOutletFilter} onValueChange={setSelectedOutletFilter}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Tous les points de vente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les points de vente</SelectItem>
                  {outlets.map(outlet => (
                    <SelectItem key={outlet.id} value={outlet.id}>
                      {outlet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleDownloadByOutlet} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter totaux par PDV
            </Button>
          </div>

          <AccountingStats
            stats={stats}
            onStatClick={(stat) => {
              toast({
                title: stat.title,
                description: `Détails: ${stat.value} ${stat.currency}`,
              });
            }}
          />

          {activeTab === 'periodes' ? (
            <AccountingPeriodsTab 
              transactions={transactions}
              invoices={invoices}
            />
          ) : (
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
