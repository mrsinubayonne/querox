import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, TrendingUp } from 'lucide-react';

const PLANS = {
  starter: { name: 'Starter', price: 35000, color: 'text-blue-500' },
  premium: { name: 'Premium', price: 65000, color: 'text-purple-500' },
  pro: { name: 'Entreprise', price: 91000, color: 'text-orange-500' },
};

export const RevenueProjectionCalculator = () => {
  const [subscribers, setSubscribers] = useState({
    starter: 0,
    premium: 0,
    pro: 0,
  });

  const handleChange = (plan: keyof typeof subscribers, value: string) => {
    const numValue = parseInt(value) || 0;
    setSubscribers(prev => ({ ...prev, [plan]: numValue }));
  };

  const monthlyRevenue = 
    subscribers.starter * PLANS.starter.price +
    subscribers.premium * PLANS.premium.price +
    subscribers.pro * PLANS.pro.price;

  const annualRevenue = monthlyRevenue * 12;
  const totalSubscribers = subscribers.starter + subscribers.premium + subscribers.pro;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <CardTitle className="text-foreground">Calculateur de prévisions</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground">
          Estimez vos revenus futurs selon différents scénarios d'abonnements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(PLANS).map(([key, plan]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className="text-foreground">
                {plan.name}
                <span className="text-muted-foreground ml-2">
                  ({plan.price.toLocaleString('fr-FR')} FCFA)
                </span>
              </Label>
              <Input
                id={key}
                type="number"
                min="0"
                value={subscribers[key as keyof typeof subscribers]}
                onChange={(e) => handleChange(key as keyof typeof subscribers, e.target.value)}
                className="bg-background border-border text-foreground"
                placeholder="0"
              />
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-background/50 p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">Total abonnés</p>
              <p className="text-2xl font-bold text-foreground">{totalSubscribers}</p>
            </div>
            <div className="bg-background/50 p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">Revenu mensuel estimé</p>
              <p className="text-2xl font-bold text-primary">
                {monthlyRevenue.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
            <div className="bg-background/50 p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">Revenu annuel estimé</p>
              <p className="text-2xl font-bold text-success flex items-center gap-2">
                {annualRevenue.toLocaleString('fr-FR')} FCFA
                <TrendingUp className="h-4 w-4" />
              </p>
            </div>
          </div>

          {totalSubscribers > 0 && (
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium text-foreground">Répartition des revenus :</p>
              {Object.entries(PLANS).map(([key, plan]) => {
                const count = subscribers[key as keyof typeof subscribers];
                if (count === 0) return null;
                const revenue = count * plan.price;
                const percentage = ((revenue / monthlyRevenue) * 100).toFixed(1);
                return (
                  <div key={key} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      {plan.name} ({count} × {plan.price.toLocaleString('fr-FR')} FCFA)
                    </span>
                    <span className={`font-medium ${plan.color}`}>
                      {revenue.toLocaleString('fr-FR')} FCFA ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
