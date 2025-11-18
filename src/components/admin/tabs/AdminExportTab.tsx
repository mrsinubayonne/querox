import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Users, ShoppingBag, Package, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const AdminExportTab: React.FC = () => {
  const [exporting, setExporting] = useState<string | null>(null);

  const exportData = async (table: 'profiles' | 'orders' | 'invoices' | 'inventory_items' | 'subscribers', filename: string) => {
    setExporting(table);
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*');

      if (error) throw error;

      // Convertir en CSV
      if (data && data.length > 0) {
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => 
          Object.values(row).map(val => 
            typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
          ).join(',')
        );
        const csv = [headers, ...rows].join('\n');

        // Télécharger
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast.success(`Export de ${data.length} enregistrement(s) réussi`);
      } else {
        toast.info('Aucune donnée à exporter');
      }
    } catch (error: any) {
      toast.error(`Erreur lors de l'export: ${error.message}`);
      console.error(error);
    } finally {
      setExporting(null);
    }
  };

  const exports = [
    {
      id: 'users',
      title: 'Utilisateurs',
      description: 'Exporter tous les utilisateurs',
      icon: Users,
      table: 'profiles' as const,
      filename: 'users',
      color: 'text-blue-600'
    },
    {
      id: 'orders',
      title: 'Commandes',
      description: 'Exporter toutes les commandes',
      icon: ShoppingBag,
      table: 'orders' as const,
      filename: 'orders',
      color: 'text-green-600'
    },
    {
      id: 'invoices',
      title: 'Factures',
      description: 'Exporter toutes les factures',
      icon: FileText,
      table: 'invoices' as const,
      filename: 'invoices',
      color: 'text-purple-600'
    },
    {
      id: 'inventory',
      title: 'Inventaire',
      description: 'Exporter l\'inventaire complet',
      icon: Package,
      table: 'inventory_items' as const,
      filename: 'inventory',
      color: 'text-amber-600'
    },
    {
      id: 'subscribers',
      title: 'Abonnés',
      description: 'Exporter tous les abonnés',
      icon: DollarSign,
      table: 'subscribers' as const,
      filename: 'subscribers',
      color: 'text-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Export de Données</CardTitle>
          <CardDescription>
            Télécharger les données de la plateforme au format CSV
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exports.map(exp => (
              <Card key={exp.id} className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center ${exp.color}`}>
                      <exp.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{exp.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{exp.description}</p>
                    </div>
                    <Button
                      onClick={() => exportData(exp.table, exp.filename)}
                      disabled={exporting !== null}
                      className="w-full"
                      variant="outline"
                    >
                      {exporting === exp.table ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                          Export...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Exporter
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Format des exports</h3>
              <p className="text-sm text-muted-foreground">
                Les exports sont générés au format CSV (valeurs séparées par des virgules) compatible avec Excel, Google Sheets et autres tableurs. 
                Les données sensibles sont automatiquement sécurisées selon les politiques RLS de la base de données.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
