
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Upload, Trash2, RefreshCw, Wrench } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearAllData, clearAllMutations } from "@/lib/offlineStorage";
import { queryClient } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const DataTab: React.FC = () => {
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState("daily");
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);
  const [password, setPassword] = useState('');
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

  const deleteMenusByUser = async (userId: string) => {
    const { data: menus, error: menusError } = await supabase
      .from('menus')
      .select('id')
      .eq('user_id', userId);

    if (menusError) throw menusError;

    if (menus && menus.length > 0) {
      const menuIds = menus.map((m) => m.id);

      const { data: categories, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('id')
        .in('menu_id', menuIds);

      if (categoriesError) throw categoriesError;

      if (categories && categories.length > 0) {
        const categoryIds = categories.map((c) => c.id);

        const { error: itemsError } = await supabase
          .from('menu_items')
          .delete()
          .in('category_id', categoryIds);

        if (itemsError) throw itemsError;

        const { error: categoriesDeleteError } = await supabase
          .from('menu_categories')
          .delete()
          .in('menu_id', menuIds);

        if (categoriesDeleteError) throw categoriesDeleteError;
      }
    }

    const { error: deleteMenusError } = await supabase
      .from('menus')
      .delete()
      .eq('user_id', userId);

    if (deleteMenusError) throw deleteMenusError;
  };

  const deleteSectionData = async (section: string, userId: string) => {
    const deleteByUser = async (tableName: string) => {
      const { error } = await (supabase.from(tableName as any).delete().eq('user_id', userId) as any);
      if (error) throw error;
    };

    if (section === 'all') {
      await deleteMenusByUser(userId);

      const orderedTables = [
        'debtor_payments',
        'invoices',
        'transactions',
        'orders',
        'table_sessions',
        'reservations',
        'business_periods',
        'purchase_orders',
        'inventory_losses',
        'inventory_reorder_rules',
        'inventory_items',
        'business_customers',
        'customers',
        'events',
        'invoice_settings',
      ];

      for (const tableName of orderedTables) {
        await deleteByUser(tableName);
      }
      return;
    }

    if (section === 'menus') {
      await deleteMenusByUser(userId);
      return;
    }

    const tableBySection: Record<string, string> = {
      orders: 'orders',
      table_sessions: 'table_sessions',
      customers: 'customers',
      inventory: 'inventory_items',
      transactions: 'transactions',
      invoices: 'invoices',
      reservations: 'reservations',
      events: 'events',
    };

    const tableName = tableBySection[section];
    if (!tableName) throw new Error('Section inconnue');

    await deleteByUser(tableName);
  };

  const handleClearPendingSyncQueue = async () => {
    try {
      await clearAllMutations();
      await queryClient.invalidateQueries();
      toast({
        title: 'File vidée',
        description: 'Toutes les données en attente de synchronisation ont été supprimées localement.',
      });
    } catch (error) {
      console.error('Clear pending queue error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de vider la file de synchronisation locale.',
        variant: 'destructive',
      });
    }
  };

  const handleRepairApplicationCache = async () => {
    try {
      await Promise.all([clearAllMutations(), clearAllData()]);
      queryClient.clear();

      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('subscription_cache_') || key === 'selectedOutletId' || key === 'selectedProfileId')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));

      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }

      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      }

      toast({
        title: 'Réparation terminée',
        description: "L'application va redémarrer avec un cache propre.",
      });

      setTimeout(() => window.location.reload(), 700);
    } catch (error) {
      console.error('Repair cache error:', error);
      toast({
        title: 'Erreur',
        description: "Impossible de réparer l'application.",
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSection = async () => {
    if (!sectionToDelete || !password) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté",
          variant: "destructive"
        });
        return;
      }

      // Vérifier le mot de passe
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password
      });

      if (authError) {
        toast({
          title: "Erreur",
          description: "Mot de passe incorrect",
          variant: "destructive"
        });
        setPassword('');
        return;
      }

      await deleteSectionData(sectionToDelete, user.id);

      if (sectionToDelete === 'all') {
        await Promise.all([clearAllMutations(), clearAllData()]);
        queryClient.clear();
      }

      toast({
        title: "Suppression réussie",
        description: `Toutes les données de la section ${getSectionLabel(sectionToDelete)} ont été supprimées`
      });

      setSectionToDelete(null);
      setPassword('');
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer les données",
        variant: "destructive"
      });
    }
  };

  const getSectionLabel = (section: string): string => {
    const labels: { [key: string]: string } = {
      orders: 'Commandes',
      customers: 'Clients',
      inventory: 'Inventaire',
      transactions: 'Transactions',
      invoices: 'Factures',
      menus: 'Menus',
      reservations: 'Réservations',
      events: 'Événements'
    };
    return labels[section] || section;
  };

  const sections = [
    { id: 'menus', label: 'Menus' },
    { id: 'orders', label: 'Commandes' },
    { id: 'customers', label: 'Clients' },
    { id: 'inventory', label: 'Inventaire' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'invoices', label: 'Factures' },
    { id: 'reservations', label: 'Réservations' },
    { id: 'events', label: 'Événements' }
  ];

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

        <div className="border-t pt-6 mt-6">
          <h3 className="text-sm font-semibold mb-4 text-destructive">Zone dangereuse</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Supprimez les données par section. Cette action est irréversible.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {sections.map(section => (
              <Button
                key={section.id}
                variant="outline"
                className="flex items-center justify-between gap-2 text-destructive border-destructive/50 hover:bg-destructive/10"
                onClick={() => setSectionToDelete(section.id)}
              >
                <span>{section.label}</span>
                <Trash2 className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </div>
      </div>

      <AlertDialog open={!!sectionToDelete} onOpenChange={() => {
        setSectionToDelete(null);
        setPassword('');
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer toutes les données de la section "{sectionToDelete ? getSectionLabel(sectionToDelete) : ''}" ?
              Cette action est irréversible et supprimera définitivement toutes les données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="Entrez votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPassword('')}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSection}
              disabled={!password}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
