
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface RevenueData {
  month: string;
  revenue: number;
  subscribers: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  period: 'monthly' | 'quarterly' | 'yearly';
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, period }) => {
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    if (period === 'yearly') {
      return date.getFullYear().toString();
    } else if (period === 'quarterly') {
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `Q${quarter} ${date.getFullYear()}`;
    } else {
      return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution du chiffre d'affaires</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                tickFormatter={formatMonth}
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                tickFormatter={formatValue}
                stroke="#64748b"
                fontSize={12}
              />
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <Tooltip 
                formatter={(value: number) => [formatValue(value), "Revenus"]}
                labelFormatter={(label) => formatMonth(label)}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
