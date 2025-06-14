
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatData {
  title: string;
  value: string;
  currency: string;
  change: string;
  isPositive: boolean;
  icon: string;
}

interface StatsCardProps {
  stat: StatData;
  onClick: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({ stat, onClick }) => {
  return (
    <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600 font-medium">{stat.title}</span>
          </div>
          <span className="text-lg">💰</span>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-bold text-gray-900">{stat.value}</span>
            {stat.currency && <span className="text-sm font-semibold text-gray-700">{stat.currency}</span>}
          </div>
          
          <div className={`text-xs ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <span>{stat.change}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
