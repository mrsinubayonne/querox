import React from 'react';
import PageWithSidebar from '@/components/PageWithSidebar';
import AccessCodesManager from '@/components/admin/AccessCodesManager';
import { Shield } from 'lucide-react';

const AdminAccessCodes: React.FC = () => {
  return (
    <PageWithSidebar>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Codes d'accès clients</h1>
            <p className="text-muted-foreground">
              Surveillez les modifications des codes d'accès de vos clients
            </p>
          </div>
        </div>

        <AccessCodesManager />
      </div>
    </PageWithSidebar>
  );
};

export default AdminAccessCodes;
