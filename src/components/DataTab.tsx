
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Upload } from "lucide-react";

export const DataTab: React.FC = () => {
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState("daily");

  return (
    <div className="space-y-6 p-6 bg-card rounded-lg border border-border">
      <div>
        <h2 className="text-lg font-semibold">Gestion des données</h2>
        <p className="text-sm text-muted-foreground mt-1">Configurez la sauvegarde et la gestion de vos données</p>
      </div>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Sauvegarde automatique</p>
            <p className="text-xs text-muted-foreground">Sauvegarder automatiquement vos données</p>
          </div>
          <Switch
            checked={autoBackup}
            onCheckedChange={setAutoBackup}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Fréquence de sauvegarde</label>
          <Select value={backupFrequency} onValueChange={setBackupFrequency}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner la fréquence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Quotidienne</SelectItem>
              <SelectItem value="weekly">Hebdomadaire</SelectItem>
              <SelectItem value="monthly">Mensuelle</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exporter les données
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Importer les données
          </Button>
        </div>
      </div>
    </div>
  );
};
