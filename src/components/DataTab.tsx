
import React from 'react';
import { Button } from "@/components/ui/button";

export const DataTab: React.FC = () => {
  return (
    <div className="space-y-4 p-6 bg-card rounded-lg border border-border">
      <h2 className="text-lg font-medium">Gestion des données</h2>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Exportez ou supprimez vos données personnelles.
        </p>
        <div className="flex gap-2">
          <Button variant="outline">Exporter les données</Button>
          <Button variant="destructive">Supprimer le compte</Button>
        </div>
      </div>
    </div>
  );
};
