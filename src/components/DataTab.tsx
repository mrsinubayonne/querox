
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const DataTab: React.FC = () => {
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState("daily");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour exporter les données",
          variant: "destructive"
        });
        return;
      }

      // Récupérer toutes les données de l'utilisateur
      const [orders, customers, inventory, transactions, invoices] = await Promise.all([
        supabase.from('orders').select('*').eq('user_id', user.id),
        supabase.from('customers').select('*').eq('user_id', user.id),
        supabase.from('inventory_items').select('*').eq('user_id', user.id),
        supabase.from('transactions').select('*').eq('user_id', user.id),
        supabase.from('invoices').select('*').eq('user_id', user.id)
      ]);

      const exportData = {
        orders: orders.data || [],
        customers: customers.data || [],
        inventory: inventory.data || [],
        transactions: transactions.data || [],
        invoices: invoices.data || [],
        exported_at: new Date().toISOString()
      };

      // Créer un fichier JSON à télécharger
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `querox-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export réussi",
        description: "Vos données ont été exportées avec succès"
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'exporter les données",
        variant: "destructive"
      });
    }
  };

  const handleImportData = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Valider la structure des données
      if (!data.orders && !data.customers && !data.inventory && !data.transactions && !data.invoices) {
        toast({
          title: "Fichier invalide",
          description: "Le fichier ne contient pas de données valides",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Import en cours",
        description: "Les données sont en cours d'importation..."
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Importer les données (en remplaçant user_id par celui de l'utilisateur actuel)
      if (data.customers?.length > 0) {
        const customers = data.customers.map((c: any) => ({ ...c, user_id: user.id, id: undefined }));
        await supabase.from('customers').insert(customers);
      }

      if (data.inventory?.length > 0) {
        const inventory = data.inventory.map((i: any) => ({ ...i, user_id: user.id, id: undefined }));
        await supabase.from('inventory_items').insert(inventory);
      }

      if (data.transactions?.length > 0) {
        const transactions = data.transactions.map((t: any) => ({ ...t, user_id: user.id, id: undefined }));
        await supabase.from('transactions').insert(transactions);
      }

      toast({
        title: "Import réussi",
        description: "Vos données ont été importées avec succès"
      });
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'importer les données. Vérifiez le format du fichier.",
        variant: "destructive"
      });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleExportData}
          >
            <Download className="h-4 w-4" />
            Exporter les données
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleImportData}
          >
            <Upload className="h-4 w-4" />
            Importer les données
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};
