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
import { Input } from '@/components/ui/input';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';


const Comptabilite = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('transactions');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedOutletFilter, setSelectedOutletFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
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

    const matchesFilters = (transaction: any) => {
      // Filtre moyen de paiement
      if (paymentMethodFilter !== 'all' && transaction.payment_method !== paymentMethodFilter) {
        return false;
      }

      // Filtre dates personnalisées
      const txDate = new Date(transaction.date);
      if (startDate && txDate < new Date(startDate)) return false;
      if (endDate && txDate > new Date(endDate)) return false;

      return true;
    };

    const filteredForStats = filteredByOutlet.filter(matchesFilters);
    
    // Stats du mois actuel - uniquement les transactions filtrées
    const currentMonthStats = filteredForStats.reduce((acc, transaction) => {
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

    // Stats du mois dernier pour comparaison (avec mêmes filtres)
    const lastMonthStats = filteredForStats.reduce((acc, transaction) => {
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
  }, [filteredByOutlet, paymentMethodFilter, startDate, endDate]);

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

    // Filtrer les transactions selon la période
    const now = new Date();
    let filteredByPeriod = filteredByOutlet;

    if (period === 'ce_mois') {
      filteredByPeriod = filteredByOutlet.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      });
    } else if (period === 'mois_dernier') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      filteredByPeriod = filteredByOutlet.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === lastMonth.getMonth() && tDate.getFullYear() === lastMonth.getFullYear();
      });
    } else if (period === '3_mois') {
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      filteredByPeriod = filteredByOutlet.filter(t => new Date(t.date) >= threeMonthsAgo);
    } else if (period === 'cette_annee') {
      filteredByPeriod = filteredByOutlet.filter(t => new Date(t.date).getFullYear() === now.getFullYear());
    }

    if (format === 'excel') {
      const data = filteredByPeriod.map(t => ({
        'Titre': t.title,
        'Date': t.date,
        'Type': t.type === 'income' ? 'Recette' : 'Dépense',
        'Catégorie': t.category,
        'Montant': t.amount,
        'Statut': t.status === 'completed' ? 'Confirmé' : t.status === 'pending' ? 'En attente' : 'Annulé'
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Comptabilité');
      XLSX.writeFile(workbook, `comptabilite-${period}-${new Date().toISOString().split('T')[0]}.xlsx`);
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

  const filteredTransactions = useMemo(() => {
    let filtered = filteredByOutlet;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.date.includes(searchTerm)
      );
    }

    // Filtre par dates
    if (startDate) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(endDate));
    }

    // Filtre par moyen de paiement
    if (paymentMethodFilter && paymentMethodFilter !== 'all') {
      filtered = filtered.filter(t => t.payment_method === paymentMethodFilter);
    }

    return filtered;
  }, [filteredByOutlet, searchTerm, startDate, endDate, paymentMethodFilter]);

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
          <div className="bg-white p-4 rounded-lg border space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
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
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Moyen de paiement</label>
                <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                  <SelectTrigger className="w-full sm:w-64">
                    <SelectValue placeholder="Tous les moyens" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les moyens</SelectItem>
                    <SelectItem value="Espèces">Espèces</SelectItem>
                    <SelectItem value="Virement">Virement</SelectItem>
                    <SelectItem value="Visa/Mastercard">Visa/Mastercard</SelectItem>
                    <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Date de début</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Date de fin</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button 
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setSelectedOutletFilter('all');
                  setPaymentMethodFilter('all');
                }} 
                variant="outline"
              >
                Réinitialiser
              </Button>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleDownloadByOutlet} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exporter totaux par PDV
              </Button>
            </div>
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
                icon: t.type === 'income' ? '💰' : '📤'
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
