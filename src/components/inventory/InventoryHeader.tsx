
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";

interface InventoryHeaderProps {
  onExport: () => void;
  onAddItem: () => void;
}

const InventoryHeader: React.FC<InventoryHeaderProps> = ({ onExport, onAddItem }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold text-gray-900">Inventaire</h1>
      <div className="flex gap-3">
        <Button variant="outline" className="flex items-center gap-2" onClick={onExport}>
          <Download size={16} />
          Exporter
        </Button>
        <Button 
          onClick={onAddItem}
          className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
        >
          <Plus size={16} />
          Ajouter article
        </Button>
      </div>
    </div>
  );
};

export default InventoryHeader;
