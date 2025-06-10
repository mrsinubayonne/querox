
import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface SalesData {
  name: string;
  value: number;
}

interface SalesChartProps {
  data: SalesData[];
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  const formatYAxis = (value: number): string => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return value.toString();
  };

  const formatTooltipValue = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value) + " CFA";
  };

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="50%" stopColor="#6366f1" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYAxis}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="#e2e8f0" 
            opacity={0.6}
          />
          <Tooltip
            formatter={(value: number) => [formatTooltipValue(value), "Ventes"]}
            labelFormatter={(label) => `${label} 2024`}
            contentStyle={{ 
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderColor: "#e2e8f0",
              borderRadius: "12px",
              fontSize: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(8px)"
            }}
            cursor={{
              stroke: "#6366f1",
              strokeWidth: 1,
              strokeDasharray: "4 4"
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="url(#strokeGradient)"
            fillOpacity={1}
            fill="url(#salesGradient)"
            strokeWidth={3}
            dot={{ 
              fill: "#6366f1", 
              strokeWidth: 3, 
              stroke: "#ffffff",
              r: 5
            }}
            activeDot={{ 
              r: 6, 
              stroke: "#6366f1",
              strokeWidth: 3,
              fill: "#ffffff"
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
