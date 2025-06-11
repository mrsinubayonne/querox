
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

interface InventorySearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterCategory: string;
  onFilter: () => void;
}

const InventorySearchFilter: React.FC<InventorySearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  filterCategory,
  onFilter
}) => {
  return (
    <div className="flex gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <Input
          placeholder="Rechercher un article..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button variant="outline" className="flex items-center gap-2" onClick={onFilter}>
        <Filter size={16} />
        Filtrer ({filterCategory})
      </Button>
    </div>
  );
};

export default InventorySearchFilter;
