
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";
import PageWithSidebar from "@/components/PageWithSidebar";
import ModernStatCard from "@/components/ModernStatCard";
import StatisticsReports from "@/components/statistics/StatisticsReports";
import { useOrders } from "@/hooks/useOrders";
import { useCustomers } from "@/hooks/useCustomers";
import { useInvoices } from "@/hooks/useInvoices";

const Statistiques: React.FC = () => {
  const { orders, loading: ordersLoading } = useOrders();
  const { customers, loading: customersLoading } = useCustomers();
  const { invoices, loading: invoicesLoading } = useInvoices();

  const statsData = useMemo(() => {
    // CA calculé EXCLUSIVEMENT à partir des factures payées (cohérent avec
    // la mémoire projet : "Revenue is calculated ONLY from paid invoices").
    // Les transactions de type 'income' sont créées automatiquement par le
    // trigger SQL `create_transaction_from_paid_invoice` -> les additionner
    // produit un DOUBLE COMPTAGE. On dédoublonne par invoice_number pour
    // éviter aussi les factures en double.
    const dedupePaidInvoices = (list: typeof invoices) => {
      const map = new Map<string, typeof invoices[number]>();
      for (const inv of list) {
        if (inv.status !== 'paid') continue;
        const existing = map.get(inv.invoice_number);
        const t = (inv as any).updated_at || (inv as any).paid_date || (inv as any).created_at;
        const eT = existing ? ((existing as any).updated_at || (existing as any).paid_date || (existing as any).created_at) : null;
        if (!existing || (t && eT && new Date(t) > new Date(eT))) {
          map.set(inv.invoice_number, inv);
        }
      }
      return Array.from(map.values());
    };

    const allPaid = dedupePaidInvoices(invoices);
    const totalRevenue = Math.round(
      allPaid.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0)
    );

    const ordersCount = orders.length;
    const customersCount = customers.length;

    // Croissance (30 jours vs 30 jours précédents) — basée sur paid_date
    const now = new Date();
    const inWindow = (daysFromNow: number, max: number, min = 0) => daysFromNow > min && daysFromNow <= max;

    const last30Paid = allPaid.filter(inv => {
      if (!inv.paid_date) return false;
      const d = Math.floor((now.getTime() - new Date(inv.paid_date).getTime()) / 86400000);
      return inWindow(d, 30);
    });
    const prev30Paid = allPaid.filter(inv => {
      if (!inv.paid_date) return false;
      const d = Math.floor((now.getTime() - new Date(inv.paid_date).getTime()) / 86400000);
      return inWindow(d, 60, 30);
    });

    const last30Revenue = last30Paid.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
    const prev30Revenue = prev30Paid.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
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
  }, [orders, customers, invoices]);

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
    </PageWithSidebar>
  );
};

export default Statistiques;
