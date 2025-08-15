
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface ChurnRateData {
  period_start: string;
  period_end: string;
  active_start: number;
  churned: number;
  churn_rate: number;
}

interface ChurnRateCardProps {
  data: ChurnRateData[];
  period: 'monthly' | 'quarterly' | 'yearly';
}

const ChurnRateCard: React.FC<ChurnRateCardProps> = ({ data, period }) => {
  const currentPeriod = data[0];
  const previousPeriod = data[1];
  
  if (!currentPeriod) return null;

  const trend = previousPeriod 
    ? currentPeriod.churn_rate - previousPeriod.churn_rate 
    : 0;

  const isImproving = trend < 0;

  const formatPeriod = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Taux d'attrition (Churn Rate)</span>
          {isImproving ? (
            <TrendingDown className="w-5 h-5 text-green-600" />
          ) : (
            <TrendingUp className="w-5 h-5 text-red-600" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-3xl font-bold">
              {currentPeriod.churn_rate.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">
              {formatPeriod(currentPeriod.period_start)}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Clients actifs</p>
              <p className="font-semibold">{currentPeriod.active_start}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Clients perdus</p>
              <p className="font-semibold">{currentPeriod.churned}</p>
            </div>
          </div>

          {previousPeriod && (
            <div className={`text-sm ${isImproving ? 'text-green-600' : 'text-red-600'}`}>
              {isImproving ? '↓' : '↑'} 
              {Math.abs(trend).toFixed(1)}% vs période précédente
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChurnRateCard;
