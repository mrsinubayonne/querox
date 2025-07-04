
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, DollarSign, ChartArea, PieChart } from "lucide-react";
import PageWithSidebar from "@/components/PageWithSidebar";
import ModernStatCard from "@/components/ModernStatCard";

const Statistiques: React.FC = () => {
  const statsData = [
    {
      title: "Chiffre d'affaires",
      value: "0 FCFA",
      icon: <DollarSign size={20} />,
      color: "green" as const,
    },
    {
      title: "Commandes",
      value: "0",
      icon: <BarChart3 size={20} />,
      color: "blue" as const,
    },
    {
      title: "Clients",
      value: "0",
      icon: <Users size={20} />,
      color: "purple" as const,
    },
    {
      title: "Croissance",
      value: "-",
      icon: <TrendingUp size={20} />,
      color: "orange" as const,
    },
  ];

  const reportItems = [
    {
      title: "Rapport de ventes",
      description: "Analyse des ventes par période",
      icon: <ChartArea size={20} />,
    },
    {
      title: "Plats populaires",
      description: "Classement des plats les plus vendus",
      icon: <PieChart size={20} />,
    },
    {
      title: "Heures de pointe",
      description: "Analyse des pics d'affluence",
      icon: <BarChart3 size={20} />,
    },
    {
      title: "Fidélité client",
      description: "Analyse du comportement client",
      icon: <Users size={20} />,
    },
  ];

  return (
    <PageWithSidebar>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
          <p className="text-gray-600">Analysez les performances de votre restaurant</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <ModernStatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

        {/* Empty State */}
        <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Aucune donnée statistique</CardTitle>
            <CardDescription className="text-base">
              Commencez à utiliser votre restaurant pour voir vos statistiques
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-3 text-sm text-gray-600">
              <p className="font-medium">Les statistiques apparaîtront automatiquement lorsque vous aurez :</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left max-w-md mx-auto">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Créé vos menus</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Enregistré des commandes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Ajouté des clients</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Configuré les réservations</span>
                </div>
              </div>
            </div>
            <Button variant="outline" disabled className="bg-white/50">
              Générer un rapport
            </Button>
          </CardContent>
        </Card>

        {/* Reports Section */}
        <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Rapports disponibles</CardTitle>
            <CardDescription>
              Ces rapports seront disponibles une fois que vous aurez des données
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportItems.map((item, index) => (
                <div 
                  key={index}
                  className="p-4 border border-gray-200 rounded-xl bg-white/50 opacity-50 transition-all duration-300 hover:opacity-75"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWithSidebar>
  );
};

export default Statistiques;
