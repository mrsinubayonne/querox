
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";
import PageWithSidebar from "@/components/PageWithSidebar";
import ModernStatCard from "@/components/ModernStatCard";
import StatisticsReports from "@/components/statistics/StatisticsReports";
import { useOrders } from "@/hooks/useOrders";
import { useCustomers } from "@/hooks/useCustomers";
import { useTransactions } from "@/hooks/useTransactions";
import { useInvoices } from "@/hooks/useInvoices";
import SubscriptionPopup from "@/components/SubscriptionPopup";

const Statistiques: React.FC = () => {
  const { orders, loading: ordersLoading } = useOrders();
  const { customers, loading: customersLoading } = useCustomers();
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { invoices, loading: invoicesLoading } = useInvoices();

  const statsData = useMemo(() => {
    // Calcul du chiffre d'affaires total à partir des transactions et factures payées
    const totalRevenueFromTransactions = transactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalRevenueFromInvoices = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total_amount, 0);
    
    const totalRevenue = totalRevenueFromTransactions + totalRevenueFromInvoices;
    const ordersCount = orders.length;
    const customersCount = customers.length;
    
    // Calcul de la croissance (30 derniers jours vs 30 jours précédents)
    const now = new Date();
    const last30DaysTransactions = transactions.filter(t => {
      if (t.type !== 'income' || t.status !== 'completed') return false;
      const transactionDate = new Date(t.date);
      const daysDiff = Math.floor((now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 30;
    });
    
    const previous30DaysTransactions = transactions.filter(t => {
      if (t.type !== 'income' || t.status !== 'completed') return false;
      const transactionDate = new Date(t.date);
      const daysDiff = Math.floor((now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff > 30 && daysDiff <= 60;
    });

    const last30DaysInvoices = invoices.filter(inv => {
      if (inv.status !== 'paid' || !inv.paid_date) return false;
      const paidDate = new Date(inv.paid_date);
      const daysDiff = Math.floor((now.getTime() - paidDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 30;
    });
    
    const previous30DaysInvoices = invoices.filter(inv => {
      if (inv.status !== 'paid' || !inv.paid_date) return false;
      const paidDate = new Date(inv.paid_date);
      const daysDiff = Math.floor((now.getTime() - paidDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff > 30 && daysDiff <= 60;
    });

    const last30Revenue = last30DaysTransactions.reduce((sum, t) => sum + t.amount, 0) +
                         last30DaysInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
    const prev30Revenue = previous30DaysTransactions.reduce((sum, t) => sum + t.amount, 0) +
                         previous30DaysInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
    const growth = prev30Revenue > 0 ? ((last30Revenue - prev30Revenue) / prev30Revenue) * 100 : 0;

    return [
      {
        title: "Chiffre d'affaires",
        value: `${totalRevenue.toLocaleString('fr-FR')} FCFA`,
        icon: <DollarSign size={20} />,
        color: "green" as const,
      },
      {
        title: "Commandes",
        value: ordersCount.toString(),
        icon: <BarChart3 size={20} />,
        color: "blue" as const,
      },
      {
        title: "Clients",
        value: customersCount.toString(),
        icon: <Users size={20} />,
        color: "purple" as const,
      },
      {
        title: "Croissance (30j)",
        value: growth !== 0 ? `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%` : "-",
        icon: <TrendingUp size={20} />,
        color: "orange" as const,
      },
    ];
  }, [orders, customers, transactions, invoices]);

  const hasData = orders.length > 0 || customers.length > 0;
  const loading = ordersLoading || customersLoading || transactionsLoading || invoicesLoading;

  if (loading) {
    return (
      <PageWithSidebar>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Chargement des statistiques...</p>
          </div>
        </div>
      </PageWithSidebar>
    );
  }

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

        {hasData ? (
          <StatisticsReports orders={orders} customers={customers} />
        ) : (
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
        )}
      </div>
      <SubscriptionPopup />
    </PageWithSidebar>
  );
};

export default Statistiques;
