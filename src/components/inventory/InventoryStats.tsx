
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface InventoryStatsProps {
  totalItems: number;
  criticalItems: number;
  totalValue: number;
  lowStockItems: number;
}

const InventoryStats: React.FC<InventoryStatsProps> = ({
  totalItems,
  criticalItems,
  totalValue,
  lowStockItems
}) => {
  const stats = [
    {
      title: "Articles totaux",
      value: totalItems.toString(),
      icon: "📦",
      color: "text-blue-600"
    },
    {
      title: "Stock critique",
      value: criticalItems.toString(),
      icon: "⚠️",
      color: "text-red-600"
    },
    {
      title: "Valeur totale",
      value: `${totalValue.toLocaleString()} CFA`,
      icon: "💰",
      color: "text-green-600"
    },
    {
      title: "Stock faible",
      value: lowStockItems.toString(),
      icon: "📊",
      color: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className={`text-lg font-semibold ${stat.color}`}>{stat.value}</p>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InventoryStats;
