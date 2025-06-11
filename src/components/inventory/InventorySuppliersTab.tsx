
import React from 'react';
import { Card } from "@/components/ui/card";
import { Package } from "lucide-react";

const InventorySuppliersTab: React.FC = () => {
  return (
    <Card className="p-6">
      <div className="text-center text-gray-500">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Gestion des fournisseurs</p>
        <p className="text-sm">Cette section sera disponible prochainement</p>
      </div>
    </Card>
  );
};

export default InventorySuppliersTab;
