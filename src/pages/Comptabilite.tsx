
import React, { useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Download, 
  Plus,
  TrendingUp,
  TrendingDown,
  Menu,
  Search,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Comptabilite = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('transactions');
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleExport = () => {
    const data = {
      transactions: transactions,
      stats: stats,
      date: new Date().toISOString()
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comptabilite-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export réussi",
      description: "Les données comptables ont été exportées",
    });
  };

  const handleNewTransaction = () => {
    const newTransaction = {
      id: Date.now(),
      title: "Nouvelle transaction",
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      isPositive: true,
      status: "en attente",
      icon: <TrendingUp className="h-4 w-4 text-green-600" />
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    toast({
      title: "Transaction ajoutée",
      description: "Nouvelle transaction créée avec succès",
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
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="p-1.5">
                <Menu size={18} />
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Comptabilité</h1>
            </div>
            <div className="flex space-x-2">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 text-xs"
                />
                <Button variant="outline" size="sm" onClick={handleSearch}>
                  <Search size={14} />
                </Button>
                <Button variant="outline" size="sm" onClick={handleFilter}>
                  <Filter size={14} />
                </Button>
              </div>
              <Button variant="outline" className="flex items-center space-x-2 text-xs px-3 py-2" onClick={handleExport}>
                <Download size={14} />
                <span>Exporter</span>
              </Button>
              <Button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-xs px-3 py-2" onClick={handleNewTransaction}>
                <Plus size={14} />
                <span>Nouvelle transaction</span>
              </Button>
            </div>
          </div>

          {/* Cartes statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => toast({
                      title: stat.title,
                      description: `Détails: ${stat.value} ${stat.currency}`,
                    })}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600 font-medium">{stat.title}</span>
                    </div>
                    <span className="text-lg">💰</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-xl font-bold text-gray-900">{stat.value}</span>
                      {stat.currency && <span className="text-sm font-semibold text-gray-700">{stat.currency}</span>}
                    </div>
                    
                    <div className={`text-xs ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{stat.change}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Onglets de navigation */}
          <div className="flex space-x-6 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  toast({
                    title: "Onglet changé",
                    description: `Affichage: ${tab.label}`,
                  });
                }}
                className={`pb-2 px-1 text-xs font-medium border-b-2 transition-colors ${
                  tab.active 
                    ? 'border-black text-black' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contenu des onglets */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Transactions récentes ({filteredTransactions.length})</h2>
              
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <Card key={transaction.id} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-50 rounded-lg">
                            {transaction.icon}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">{transaction.title}</h3>
                            <p className="text-xs text-gray-500">{transaction.date}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <span className={`text-sm font-semibold ${
                            transaction.isPositive ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(transaction.amount)}
                          </span>
                          <Badge 
                            className={`text-xs ${
                              transaction.status === 'confirmé' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {transaction.status}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => toast({
                              title: "Détails transaction",
                              description: `${transaction.title} - ${formatCurrency(transaction.amount)}`,
                            })}
                          >
                            Détails
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
    </div>
  );
};

export default Comptabilite;
