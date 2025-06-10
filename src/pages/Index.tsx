
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import SalesChart from '../components/SalesChart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, Calendar, Users, ShoppingCart, Bell } from 'lucide-react';

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
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-border px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-xl font-bold">Tableau de bord</h1>
          
          <div className="flex items-center gap-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-8 w-[250px]"
              />
            </div>
            
            <Button size="icon" variant="ghost" className="relative">
              <Bell />
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
            </Button>
          </div>
        </header>
        
        <main className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard 
              title="Chiffre d'affaires" 
              value="9 482 000 CFA"
              icon={<TrendingUp />}
              change={{
                value: "14,2%",
                label: "depuis le mois dernier",
                isPositive: true
              }}
              tooltip="Chiffre d'affaires total ce mois-ci"
            />
            
            <StatCard 
              title="Réservations" 
              value="48"
              icon={<Calendar />}
              change={{
                value: "8,3%",
                label: "depuis la semaine dernière",
                isPositive: true
              }}
            />
            
            <StatCard 
              title="Clients fidèles" 
              value="234"
              icon={<Users />}
              change={{
                value: "23,1%",
                label: "depuis l'an dernier",
                isPositive: true
              }}
            />
            
            <StatCard 
              title="Produits en stock" 
              value="189"
              icon={<ShoppingCart />}
              change={{
                value: "8 produits en alerte stock",
                isPositive: false
              }}
            />
          </div>
          
          <SalesChart data={salesData} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
