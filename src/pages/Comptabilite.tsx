
import React, { useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Plus,
  TrendingUp,
  TrendingDown,
  Menu
} from 'lucide-react';

const Comptabilite = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Données pour les statistiques
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

  // Données pour les transactions récentes
  const transactions = [
    {
      id: 1,
      title: "Ventes du jour",
      date: "2024-06-09",
      amount: "+45 000 CFA",
      isPositive: true,
      status: "confirmé",
      icon: <TrendingUp className="h-4 w-4 text-green-600" />
    },
    {
      id: 2,
      title: "Achat ingrédients", 
      date: "2024-06-08",
      amount: "-12 000 CFA",
      isPositive: false,
      status: "confirmé",
      icon: <TrendingDown className="h-4 w-4 text-red-600" />
    },
    {
      id: 3,
      title: "Commandes en ligne",
      date: "2024-06-08", 
      amount: "+8 500 CFA",
      isPositive: true,
      status: "en attente",
      icon: <TrendingUp className="h-4 w-4 text-green-600" />
    }
  ];

  const tabs = [
    { id: 'transactions', label: 'Transactions récentes', active: true },
    { id: 'rapports', label: 'Rapports mensuels', active: false },
    { id: 'budget', label: 'Budget prévisionnel', active: false }
  ];

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
              <Button variant="outline" className="flex items-center space-x-2 text-xs px-3 py-2">
                <Download size={14} />
                <span>Exporter</span>
              </Button>
              <Button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-xs px-3 py-2">
                <Plus size={14} />
                <span>Nouvelle transaction</span>
              </Button>
            </div>
          </div>

          {/* Cartes statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600 font-medium">{stat.title}</span>
                      {index === 1 && <span className="text-gray-400 text-sm">📊</span>}
                      {index === 2 && <span className="text-gray-400 text-sm">📈</span>}
                      {index === 3 && <span className="text-gray-400 text-sm">📊</span>}
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

          {/* Section Transactions récentes */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Transactions récentes</h2>
            
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <Card key={transaction.id} className="bg-white border-0 shadow-sm">
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
                          {transaction.amount}
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comptabilite;
