import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Zap } from 'lucide-react';

const TechnicalPerformancePanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Performances Techniques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Monitoring des performances et uptime API en cours de développement.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechnicalPerformancePanel;
