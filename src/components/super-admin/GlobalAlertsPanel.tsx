import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const GlobalAlertsPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Alertes Globales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Système d'alertes automatiques en cours de développement.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalAlertsPanel;
