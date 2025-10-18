import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface Order {
  id: string;
  items: any;
  total_amount: number;
  created_at: string;
  order_type?: string;
}

interface Customer {
  id: string;
  total_visits: number;
  total_spent: number;
}

interface StatisticsReportsProps {
  orders: Order[];
  customers: Customer[];
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

const StatisticsReports: React.FC<StatisticsReportsProps> = ({ orders, customers }) => {
  // Rapport de ventes par jour de la semaine
  const salesByDay = React.useMemo(() => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const salesMap = days.reduce((acc, day) => ({ ...acc, [day]: 0 }), {} as Record<string, number>);
    
    orders.forEach(order => {
      const date = new Date(order.created_at);
      const dayName = days[date.getDay()];
      salesMap[dayName] += order.total_amount;
    });

    return days.map(day => ({
      day,
      ventes: salesMap[day]
    }));
  }, [orders]);

  // Plats les plus populaires (basé sur les items des commandes)
  const popularItems = React.useMemo(() => {
    const itemsCount: Record<string, number> = {};
    
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const name = item.name || 'Inconnu';
          itemsCount[name] = (itemsCount[name] || 0) + (item.quantity || 1);
        });
      }
    });

    return Object.entries(itemsCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [orders]);

  // Heures de pointe
  const peakHours = React.useMemo(() => {
    const hoursMap: Record<number, number> = {};
    
    orders.forEach(order => {
      const date = new Date(order.created_at);
      const hour = date.getHours();
      hoursMap[hour] = (hoursMap[hour] || 0) + 1;
    });

    return Object.entries(hoursMap)
      .map(([hour, count]) => ({
        heure: `${hour}h`,
        commandes: count
      }))
      .sort((a, b) => parseInt(a.heure) - parseInt(b.heure));
  }, [orders]);

  // Types de commande (livraison, sur place, etc.)
  const orderTypes = React.useMemo(() => {
    const typesMap: Record<string, number> = {};
    
    orders.forEach(order => {
      const type = order.order_type || 'Sur place';
      typesMap[type] = (typesMap[type] || 0) + 1;
    });

    return Object.entries(typesMap).map(([name, value]) => ({ name, value }));
  }, [orders]);

  // Top clients
  const topCustomers = React.useMemo(() => {
    return [...customers]
      .sort((a, b) => b.total_spent - a.total_spent)
      .slice(0, 5);
  }, [customers]);

  return (
    <div className="space-y-6">
      {/* Ventes par jour */}
      <Card>
        <CardHeader>
          <CardTitle>Ventes par jour de la semaine</CardTitle>
          <CardDescription>Analyse des ventes sur les 7 derniers jours</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value) => `${value} FCFA`} />
              <Bar dataKey="ventes" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plats populaires */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Plats populaires</CardTitle>
            <CardDescription>Les plats les plus commandés</CardDescription>
          </CardHeader>
          <CardContent>
            {popularItems.length > 0 ? (
              <div className="space-y-3">
                {popularItems.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-600">
                        {index + 1}
                      </div>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{item.count} commandes</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Aucune donnée disponible</p>
            )}
          </CardContent>
        </Card>

        {/* Heures de pointe */}
        <Card>
          <CardHeader>
            <CardTitle>Heures de pointe</CardTitle>
            <CardDescription>Distribution des commandes par heure</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={peakHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="heure" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="commandes" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Types de commande */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des commandes</CardTitle>
            <CardDescription>Par type de service</CardDescription>
          </CardHeader>
          <CardContent>
            {orderTypes.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={orderTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">Aucune donnée disponible</p>
            )}
          </CardContent>
        </Card>

        {/* Top clients */}
        <Card>
          <CardHeader>
            <CardTitle>Meilleurs clients</CardTitle>
            <CardDescription>Top 5 par montant dépensé</CardDescription>
          </CardHeader>
          <CardContent>
            {topCustomers.length > 0 ? (
              <div className="space-y-3">
                {topCustomers.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-semibold text-purple-600">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">{customer.total_visits} visites</div>
                      </div>
                    </div>
                    <span className="font-semibold text-purple-600">
                      {customer.total_spent.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Aucun client enregistré</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatisticsReports;
