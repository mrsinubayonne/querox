
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ModernStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: string;
    label: string;
    isPositive?: boolean;
  };
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

const ModernStatCard: React.FC<ModernStatCardProps> = ({ 
  title, 
  value, 
  icon, 
  change, 
  trend = 'neutral',
  color = 'blue' 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200'
  };

  const trendColors = {
    up: 'text-green-600 bg-green-50',
    down: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50'
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            {icon}
          </div>
          {change && (
            <Badge 
              variant="outline" 
              className={`${trendColors[trend]} border-0 font-medium`}
            >
              {change.isPositive ? '+' : ''}{change.value}
            </Badge>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          {change && (
            <p className="text-xs text-muted-foreground">{change.label}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernStatCard;
