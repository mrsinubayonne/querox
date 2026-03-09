
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

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
  const gradients = {
    blue: 'from-primary to-primary-glow',
    green: 'from-success to-emerald-400',
    purple: 'from-violet-500 to-purple-400',
    orange: 'from-warning to-amber-400',
  };

  const trendConfig = {
    up: { icon: ArrowUpRight, color: 'text-success bg-success/10' },
    down: { icon: ArrowDownRight, color: 'text-destructive bg-destructive/10' },
    neutral: { icon: Minus, color: 'text-muted-foreground bg-muted' },
  };

  const TrendIcon = trendConfig[trend].icon;

  return (
    <Card className="group relative overflow-hidden border-0 shadow-elegant hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
      {/* Top gradient bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradients[color]} opacity-80`} />
      
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradients[color]} text-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300`}>
            {icon}
          </div>
          {change && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${trendConfig[trend].color}`}>
              <TrendIcon className="h-3 w-3" />
              {change.isPositive ? '+' : ''}{change.value}
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            {value}
          </h3>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            {title}
          </p>
          {change && (
            <p className="text-xs text-muted-foreground/70">
              {change.label}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernStatCard;
