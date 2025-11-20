import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Shield } from 'lucide-react';

const AuditSecurityPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Audit & Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Logs d'audit et monitoring de sécurité en cours de développement.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditSecurityPanel;
