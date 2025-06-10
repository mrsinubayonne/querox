
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: string;
    label: string;
    isPositive?: boolean;
  };
  tooltip?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, tooltip }) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground font-medium">{title}</span>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="ml-1">
                      <HelpCircle size={14} className="text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <span className="text-primary">{icon}</span>
        </div>
        
        <h3 className="text-2xl font-bold">{value}</h3>
        
        {change && (
          <div 
            className={`text-xs mt-2 ${
              change.isPositive ? 'text-success' : 'text-danger'
            }`}
          >
            <span>{change.isPositive ? '+' : ''}{change.value}</span>
            <span className="text-muted-foreground ml-1">{change.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
