
import React from 'react';
import { Button } from "@/components/ui/button";

export const SecurityTab: React.FC = () => {
  return (
    <div className="space-y-4 p-6 bg-card rounded-lg border border-border">
      <h2 className="text-lg font-medium">Sécurité</h2>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Gérez vos paramètres de sécurité et de confidentialité.
        </p>
        <Button variant="outline">Changer le mot de passe</Button>
      </div>
    </div>
  );
};
