
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

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
    <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm hover:scale-[1.02]">
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardContent className="relative p-6">
        <div className="flex items-start justify-between mb-6">
          <div className={`p-3.5 rounded-2xl ${colorClasses[color]} transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
            {icon}
          </div>
          {change && (
            <Badge 
              variant="outline" 
              className={`${trendColors[trend]} border-0 font-semibold px-3 py-1 shadow-sm`}
            >
              {change.isPositive && <ArrowUpRight className="h-3 w-3 inline mr-1" />}
              {!change.isPositive && change.value.includes('-') && <ArrowDownRight className="h-3 w-3 inline mr-1" />}
              {change.isPositive ? '+' : ''}{change.value}
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            {value}
          </h3>
          <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wide">
            {title}
          </p>
          {change && (
            <p className="text-xs text-muted-foreground/80 font-medium">
              {change.label}
            </p>
          )}
        </div>

        {/* Decorative Corner Element */}
        <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
      </CardContent>
    </Card>
  );
};

export default ModernStatCard;
