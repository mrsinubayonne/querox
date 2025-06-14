
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InventoryStocksTab from './InventoryStocksTab';
import InventoryMovementsTab from './InventoryMovementsTab';
import InventorySuppliersTab from './InventorySuppliersTab';

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

interface InventoryTabsProps {
  filteredItems: InventoryItem[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterCategory: string;
  onFilter: () => void;
  onEditItem: (itemId: number) => void;
  onDeleteItem: (itemId: number) => void;
}

const InventoryTabs: React.FC<InventoryTabsProps> = ({
  filteredItems,
  searchTerm,
  onSearchChange,
  filterCategory,
  onFilter,
  onEditItem,
  onDeleteItem
}) => {
  return (
    <Tabs defaultValue="stocks" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="stocks">État des stocks</TabsTrigger>
        <TabsTrigger value="movements">Mouvements</TabsTrigger>
        <TabsTrigger value="suppliers">Fournisseurs</TabsTrigger>
      </TabsList>

      <TabsContent value="stocks" className="space-y-6">
        <InventoryStocksTab
          filteredItems={filteredItems}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          filterCategory={filterCategory}
          onFilter={onFilter}
          onEditItem={onEditItem}
          onDeleteItem={onDeleteItem}
        />
      </TabsContent>

      <TabsContent value="movements">
        <InventoryMovementsTab />
      </TabsContent>

      <TabsContent value="suppliers">
        <InventorySuppliersTab />
      </TabsContent>
    </Tabs>
  );
};

export default InventoryTabs;
