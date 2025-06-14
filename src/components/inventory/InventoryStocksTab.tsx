
import React from 'react';
import { Package } from "lucide-react";
import InventorySearchFilter from './InventorySearchFilter';
import InventoryItemCard from './InventoryItemCard';

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minQuantity: number;
  price: number;
  supplier: string;
  status: string;
}

interface InventoryStocksTabProps {
  filteredItems: InventoryItem[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterCategory: string;
  onFilter: () => void;
  onEditItem: (itemId: number) => void;
  onDeleteItem: (itemId: number) => void;
}

const InventoryStocksTab: React.FC<InventoryStocksTabProps> = ({
  filteredItems,
  searchTerm,
  onSearchChange,
  filterCategory,
  onFilter,
  onEditItem,
  onDeleteItem
}) => {
  return (
    <div className="space-y-6">
      <InventorySearchFilter
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        filterCategory={filterCategory}
        onFilter={onFilter}
      />

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Package size={20} />
          <h2 className="text-lg font-semibold">Articles en stock ({filteredItems.length})</h2>
        </div>

        <div className="space-y-3">
          {filteredItems.map((item) => (
            <InventoryItemCard
              key={item.id}
              item={item}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun article trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryStocksTab;
