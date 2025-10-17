import React, { useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import EmptyState from '@/components/EmptyState';
import StaffRequestModal from '@/components/StaffRequestModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';

const Clients: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showStaffRequestModal, setShowStaffRequestModal] = useState(false);
  const { customers, loading } = useCustomers();

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

          {loading ? (
            <div className="text-center py-12">Chargement...</div>
          ) : customers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Aucun client enregistré"
              description="Vos clients apparaîtront ici une fois qu'ils auront passé leurs premières commandes"
              actionLabel="Voir les commandes"
              onAction={() => window.location.href = '/commandes'}
            />
          ) : (
            <div className="grid gap-4">
              {customers.map((customer) => (
                <Card key={customer.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{customer.name}</h3>
                        {customer.email && <p className="text-sm text-muted-foreground">{customer.email}</p>}
                        {customer.phone && <p className="text-sm text-muted-foreground">{customer.phone}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{customer.total_visits} visites</p>
                        <p className="text-sm text-muted-foreground">{customer.total_spent}€ dépensés</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
