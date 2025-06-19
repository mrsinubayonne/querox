
import React, { useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import EmptyState from '@/components/EmptyState';
import { Users } from 'lucide-react';

const Clients: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

          <EmptyState
            icon={Users}
            title="Aucun client enregistré"
            description="Vos clients apparaîtront ici une fois qu'ils auront passé leurs premières commandes"
            actionLabel="Voir les commandes"
            onAction={() => window.location.href = '/commandes'}
          />
        </div>
      </div>
    </div>
  );
};

export default Clients;
