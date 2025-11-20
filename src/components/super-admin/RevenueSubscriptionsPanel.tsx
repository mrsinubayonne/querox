import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, CreditCard } from 'lucide-react';

const RevenueSubscriptionsPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Revenus & Abonnements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Détails des revenus et abonnements en cours de développement.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueSubscriptionsPanel;
