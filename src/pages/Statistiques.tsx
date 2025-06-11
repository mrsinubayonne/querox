import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import ModernStatCard from '../components/ModernStatCard';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
  Calendar,
  Download,
  Filter,
  Eye,
  BarChart2,
  ChefHat,
  Coffee,
  TrendingDown
} from "lucide-react";

const Statistiques: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("7days");

  // Données de ventes par jour
  const salesData = [
    { name: 'Lun', ventes: 45000, commandes: 28 },
    { name: 'Mar', ventes: 52000, commandes: 35 },
    { name: 'Mer', ventes: 38000, commandes: 22 },
    { name: 'Jeu', ventes: 61000, commandes: 42 },
    { name: 'Ven', ventes: 75000, commandes: 48 },
    { name: 'Sam', ventes: 89000, commandes: 65 },
    { name: 'Dim', ventes: 67000, commandes: 38 }
  ];

  // Données des plats populaires
  const popularDishes = [
    { name: 'Riz Jollof', value: 35, color: '#3b82f6' },
    { name: 'Poulet Yassa', value: 28, color: '#10b981' },
    { name: 'Thiéboudienne', value: 22, color: '#f59e0b' },
    { name: 'Mafé', value: 15, color: '#ef4444' }
  ];

  // Données mensuelles pour la tendance
  const monthlyData = [
    { month: 'Jan', revenus: 820000, clients: 245 },
    { month: 'Fév', revenus: 945000, clients: 289 },
    { month: 'Mar', revenus: 1180000, clients: 356 },
    { month: 'Avr', revenus: 1050000, clients: 312 },
    { month: 'Mai', revenus: 1290000, clients: 398 },
    { month: 'Juin', revenus: 1450000, clients: 445 }
  ];

  // Données des plats les plus vendus
  const topSellingDishes = [
    { name: 'Riz Jollof', quantite: 145, revenus: 435000 },
    { name: 'Poulet Yassa', quantite: 128, revenus: 512000 },
    { name: 'Thiéboudienne', quantite: 96, revenus: 384000 },
    { name: 'Mafé', quantite: 87, revenus: 348000 },
    { name: 'Ceebu Jen', quantite: 72, revenus: 288000 }
  ];

  // Données des plats les moins vendus
  const leastSellingDishes = [
    { name: 'Soupe Kandia', quantite: 8, revenus: 24000 },
    { name: 'Ndolé', quantite: 12, revenus: 48000 },
    { name: 'Attieké Poisson', quantite: 15, revenus: 75000 },
    { name: 'Curry Végétarien', quantite: 18, revenus: 54000 },
    { name: 'Salade Africaine', quantite: 22, revenus: 66000 }
  ];

  // Données des boissons les plus vendues
  const topSellingDrinks = [
    { name: 'Bissap', quantite: 89, revenus: 133500 },
    { name: 'Gingembre', quantite: 76, revenus: 114000 },
    { name: 'Bouye', quantite: 64, revenus: 128000 },
    { name: 'Jus de Tamarin', quantite: 52, revenus: 78000 },
    { name: 'Café Touba', quantite: 45, revenus: 67500 }
  ];

  // Données des boissons les moins vendues
  const leastSellingDrinks = [
    { name: 'Thé Attaya', quantite: 6, revenus: 12000 },
    { name: 'Jus de Ditakh', quantite: 9, revenus: 18000 },
    { name: 'Kinkeliba', quantite: 11, revenus: 16500 },
    { name: 'Sodabi', quantite: 14, revenus: 42000 },
    { name: 'Jus de Corossol', quantite: 17, revenus: 25500 }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value) + ' CFA';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Statistiques</h1>
              <p className="text-gray-600">Analyse des performances de votre restaurant</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={16} />
                Filtrer
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download size={16} />
                Exporter
              </Button>
            </div>
          </div>

          {/* Période de sélection */}
          <div className="flex gap-2 mb-6">
            {[
              { key: '7days', label: '7 derniers jours' },
              { key: '30days', label: '30 derniers jours' },
              { key: '3months', label: '3 derniers mois' },
              { key: 'year', label: 'Cette année' }
            ].map((period) => (
              <Button
                key={period.key}
                variant={selectedPeriod === period.key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period.key)}
              >
                {period.label}
              </Button>
            ))}
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <ModernStatCard
              title="Revenus totaux"
              value="1,450,000 CFA"
              icon={<DollarSign size={24} />}
              change={{ value: "12%", label: "vs mois dernier", isPositive: true }}
              trend="up"
              color="green"
            />
            <ModernStatCard
              title="Commandes"
              value="445"
              icon={<ShoppingCart size={24} />}
              change={{ value: "8%", label: "vs mois dernier", isPositive: true }}
              trend="up"
              color="blue"
            />
            <ModernStatCard
              title="Clients uniques"
              value="289"
              icon={<Users size={24} />}
              change={{ value: "15%", label: "vs mois dernier", isPositive: true }}
              trend="up"
              color="purple"
            />
            <ModernStatCard
              title="Panier moyen"
              value="3,258 CFA"
              icon={<TrendingUp size={24} />}
              change={{ value: "3%", label: "vs mois dernier", isPositive: false }}
              trend="down"
              color="orange"
            />
          </div>

          {/* Tabs pour différentes vues */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="sales">Ventes</TabsTrigger>
              <TabsTrigger value="customers">Clients</TabsTrigger>
              <TabsTrigger value="products">Produits</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Graphique des ventes hebdomadaires */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart2 size={20} />
                      Ventes cette semaine
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `${value/1000}k`} />
                        <Tooltip formatter={(value: number) => [formatCurrency(value), "Ventes"]} />
                        <Bar dataKey="ventes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Graphique des plats populaires */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye size={20} />
                      Plats les plus populaires
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={popularDishes}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {popularDishes.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Tendance mensuelle */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp size={20} />
                    Évolution des revenus (6 derniers mois)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="revenusGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `${value/1000}k`} />
                      <Tooltip formatter={(value: number) => [formatCurrency(value), "Revenus"]} />
                      <Area
                        type="monotone"
                        dataKey="revenus"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#revenusGradient)"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sales">
              <div className="space-y-6">
                {/* Plats les plus et moins vendus */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ChefHat size={20} className="text-green-600" />
                        Plats les plus vendus
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {topSellingDishes.map((dish, index) => (
                          <div key={dish.name} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </div>
                              <span className="font-medium">{dish.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600">{dish.quantite} vendus</div>
                              <div className="text-sm text-gray-600">{formatCurrency(dish.revenus)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingDown size={20} className="text-red-600" />
                        Plats les moins vendus
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {leastSellingDishes.map((dish, index) => (
                          <div key={dish.name} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </div>
                              <span className="font-medium">{dish.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-red-600">{dish.quantite} vendus</div>
                              <div className="text-sm text-gray-600">{formatCurrency(dish.revenus)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Boissons les plus et moins vendues */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Coffee size={20} className="text-blue-600" />
                        Boissons les plus vendues
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {topSellingDrinks.map((drink, index) => (
                          <div key={drink.name} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </div>
                              <span className="font-medium">{drink.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-blue-600">{drink.quantite} vendus</div>
                              <div className="text-sm text-gray-600">{formatCurrency(drink.revenus)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingDown size={20} className="text-orange-600" />
                        Boissons les moins vendues
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {leastSellingDrinks.map((drink, index) => (
                          <div key={drink.name} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </div>
                              <span className="font-medium">{drink.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-orange-600">{drink.quantite} vendus</div>
                              <div className="text-sm text-gray-600">{formatCurrency(drink.revenus)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="customers">
              <Card className="p-6">
                <div className="text-center text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Analyse de la clientèle</p>
                  <p className="text-sm">Données sur les clients, fidélité et segmentation</p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="products">
              <Card className="p-6">
                <div className="text-center text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Performance des produits</p>
                  <p className="text-sm">Analyse des ventes par produit et catégorie</p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Statistiques;
