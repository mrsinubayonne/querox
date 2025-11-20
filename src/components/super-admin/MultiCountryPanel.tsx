import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';

const MultiCountryPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Gestion Multi-Pays
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Extension internationale et gestion multi-pays en cours de développement.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiCountryPanel;
