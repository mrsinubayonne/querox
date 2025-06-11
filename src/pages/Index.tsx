
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import ModernStatCard from '../components/ModernStatCard';
import SalesChart from '../components/SalesChart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  TrendingUp, 
  Calendar, 
  Users, 
  ShoppingCart, 
  Bell, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Filter,
  Download
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const salesData = [
    { name: 'Jan', value: 4200 },
    { name: 'Fév', value: 3800 },
    { name: 'Mar', value: 2900 },
    { name: 'Avr', value: 3400 },
    { name: 'Mai', value: 6200 },
    { name: 'Juin', value: 5100 },
    { name: 'Juil', value: 4300 },
  ];

  const recentActivity = [
    { name: 'Commande #2847', time: 'Il y a 2min', amount: '+15 000 CFA', type: 'positive' },
    { name: 'Réservation table 12', time: 'Il y a 5min', amount: 'Confirmée', type: 'neutral' },
    { name: 'Commande #2846', time: 'Il y a 8min', amount: '+23 500 CFA', type: 'positive' },
    { name: 'Annulation #2845', time: 'Il y a 12min', amount: '-8 000 CFA', type: 'negative' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100/50 px-8 py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                Tableau de bord
              </h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Aperçu des performances • {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Rechercher..."
                  className="pl-10 w-80 border-gray-200/50 bg-white/50 backdrop-blur-sm focus:border-blue-300 focus:ring-blue-300/20"
                />
              </div>
              
              <Button variant="outline" size="icon" className="border-gray-200/50 bg-white/50 backdrop-blur-sm hover:bg-white/80">
                <Filter size={16} />
              </Button>
              
              <Button variant="outline" size="icon" className="border-gray-200/50 bg-white/50 backdrop-blur-sm hover:bg-white/80">
                <Download size={16} />
              </Button>
              
              <Button className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg shadow-blue-500/25">
                <Plus size={16} className="mr-2" />
                Nouveau
              </Button>
              
              <Button size="icon" variant="ghost" className="relative hover:bg-gray-100/50">
                <Bell size={20} />
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"></span>
              </Button>
            </div>
          </div>
        </header>
        
        <main className="p-8 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group relative overflow-hidden border-0 shadow-sm bg-white/60 backdrop-blur-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500">
              <CardContent className="p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25">
                      <TrendingUp size={24} />
                    </div>
                    <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
                      <ArrowUpRight size={12} className="mr-1" />
                      +14,2%
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-gray-900">9 482 000</h3>
                    <p className="text-sm font-medium text-gray-600">Chiffre d'affaires (CFA)</p>
                    <p className="text-xs text-gray-500">+890 000 CFA ce mois</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 shadow-sm bg-white/60 backdrop-blur-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-500">
              <CardContent className="p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25">
                      <Calendar size={24} />
                    </div>
                    <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
                      <ArrowUpRight size={12} className="mr-1" />
                      +8,3%
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-gray-900">48</h3>
                    <p className="text-sm font-medium text-gray-600">Réservations</p>
                    <p className="text-xs text-gray-500">Cette semaine</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 shadow-sm bg-white/60 backdrop-blur-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-500">
              <CardContent className="p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-violet-500/5"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25">
                      <Users size={24} />
                    </div>
                    <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
                      <ArrowUpRight size={12} className="mr-1" />
                      +23,1%
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-gray-900">234</h3>
                    <p className="text-sm font-medium text-gray-600">Clients fidèles</p>
                    <p className="text-xs text-gray-500">Cette année</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 shadow-sm bg-white/60 backdrop-blur-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-500">
              <CardContent className="p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25">
                      <ShoppingCart size={24} />
                    </div>
                    <Badge className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50">
                      <ArrowDownRight size={12} className="mr-1" />
                      8 alertes
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-gray-900">189</h3>
                    <p className="text-sm font-medium text-gray-600">Produits en stock</p>
                    <p className="text-xs text-gray-500">Gestion d'inventaire</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sales Chart */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">Ventes mensuelles</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">Évolution du chiffre d'affaires</p>
                    </div>
                    <Button variant="ghost" size="icon" className="hover:bg-gray-100/50">
                      <MoreHorizontal size={16} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <SalesChart data={salesData} />
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900">Activité récente</CardTitle>
                  <Button variant="ghost" size="icon" className="hover:bg-gray-100/50">
                    <MoreHorizontal size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{activity.name}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold text-sm ${
                          activity.type === 'positive' ? 'text-green-600' :
                          activity.type === 'negative' ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {activity.amount}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 border-gray-200/50 bg-white/50 hover:bg-white/80">
                  Voir toute l'activité
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
