
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import ModernStatCard from '../components/ModernStatCard';
import SalesChart from '../components/SalesChart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, Calendar, Users, ShoppingCart, Bell, Plus } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Données pour le graphique
  const salesData = [
    { name: 'Jan', value: 3800 },
    { name: 'Fév', value: 3200 },
    { name: 'Mar', value: 2200 },
    { name: 'Avr', value: 2800 },
    { name: 'Mai', value: 5900 },
    { name: 'Juin', value: 4800 },
    { name: 'Juil', value: 3400 },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-sm text-gray-500 mt-1">Bienvenue dans votre espace de gestion</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-10 w-80 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg">
              <Plus size={16} className="mr-2" />
              Nouveau
            </Button>
            
            <Button size="icon" variant="ghost" className="relative hover:bg-gray-100">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
          </div>
        </header>
        
        <main className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <ModernStatCard 
              title="Chiffre d'affaires" 
              value="9 482 000 CFA"
              icon={<TrendingUp size={24} />}
              change={{
                value: "14,2%",
                label: "depuis le mois dernier",
                isPositive: true
              }}
              trend="up"
              color="blue"
            />
            
            <ModernStatCard 
              title="Réservations" 
              value="48"
              icon={<Calendar size={24} />}
              change={{
                value: "8,3%",
                label: "depuis la semaine dernière",
                isPositive: true
              }}
              trend="up"
              color="green"
            />
            
            <ModernStatCard 
              title="Clients fidèles" 
              value="234"
              icon={<Users size={24} />}
              change={{
                value: "23,1%",
                label: "depuis l'an dernier",
                isPositive: true
              }}
              trend="up"
              color="purple"
            />
            
            <ModernStatCard 
              title="Produits en stock" 
              value="189"
              icon={<ShoppingCart size={24} />}
              change={{
                value: "8 produits",
                label: "en alerte stock",
                isPositive: false
              }}
              trend="down"
              color="orange"
            />
          </div>
          
          <SalesChart data={salesData} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
