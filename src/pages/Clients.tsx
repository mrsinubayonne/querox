
import React, { useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import EmptyState from '@/components/EmptyState';
import StaffRequestModal from '@/components/StaffRequestModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus } from 'lucide-react';

const Clients: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showStaffRequestModal, setShowStaffRequestModal] = useState(false);

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
                id="import-clients"
                type="file"
                accept=".json"
                className="hidden"
              />
              <Button variant="outline" onClick={() => document.getElementById('import-clients')?.click()}>
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
