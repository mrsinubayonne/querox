import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeadphonesIcon } from 'lucide-react';

const SupportPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeadphonesIcon className="w-5 h-5 text-primary" />
            Support & Réclamations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Module de support et gestion des réclamations en cours de développement.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportPanel;
