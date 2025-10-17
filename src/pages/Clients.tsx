import React, { useState, useRef } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import EmptyState from '@/components/EmptyState';
import StaffRequestModal from '@/components/StaffRequestModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

const Clients: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showStaffRequestModal, setShowStaffRequestModal] = useState(false);
  const { createCustomer } = useCustomers();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = event.target?.result;
          let customers: any[] = [];

          if (file.name.endsWith('.csv')) {
            const workbook = XLSX.read(data, { type: 'string' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            customers = XLSX.utils.sheet_to_json(sheet);
          } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            customers = XLSX.utils.sheet_to_json(sheet);
          }

          let successCount = 0;
          for (const customer of customers) {
            const result = await createCustomer({
              name: customer.name || customer.Name || customer.Nom || '',
              email: customer.email || customer.Email || '',
              phone: customer.phone || customer.Phone || customer.Téléphone || '',
              total_visits: Number(customer.total_visits || customer.visits || 0),
              total_spent: Number(customer.total_spent || customer.spent || 0),
              status: customer.status || customer.Status || 'active'
            });
            if (result) successCount++;
          }

          toast({
            title: "Import réussi",
            description: `${successCount} client(s) importé(s)`
          });
        } catch (error) {
          console.error('Error parsing file:', error);
          toast({
            title: "Erreur",
            description: "Format de fichier invalide",
            variant: "destructive"
          });
        }
      };

      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: "Erreur",
        description: "Impossible de lire le fichier",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Clients</h1>
              <p className="text-gray-600">Gérez votre base de données clients</p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button variant="outline" onClick={handleImport}>
                Importer des clients
              </Button>
            </div>
          </div>

          {/* Staff Request Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Recherche de Personnel
              </CardTitle>
              <CardDescription>
                Vous avez besoin de personnel pour votre restaurant ? Nous pouvons vous aider à trouver la personne idéale.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowStaffRequestModal(true)}>
                Faire une demande de personnel
              </Button>
            </CardContent>
          </Card>

          <EmptyState
            icon={Users}
            title="Aucun client enregistré"
            description="Vos clients apparaîtront ici une fois qu'ils auront passé leurs premières commandes"
            actionLabel="Voir les commandes"
            onAction={() => window.location.href = '/commandes'}
          />
        </div>
      </div>

      <StaffRequestModal 
        isOpen={showStaffRequestModal} 
        onClose={() => setShowStaffRequestModal(false)} 
      />
    </div>
  );
};

export default Clients;
