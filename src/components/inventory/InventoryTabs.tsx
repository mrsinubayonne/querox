
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, AlertTriangle, ShoppingCart, BarChart3 } from "lucide-react";
import InventoryStocksTab from './InventoryStocksTab';
import InventoryMovementsTab from './InventoryMovementsTab';
import InventoryLossesTab from './InventoryLossesTab';
import InventorySuppliersTab from './InventorySuppliersTab';
import InventoryAnalyticsTab from './InventoryAnalyticsTab';

interface InventoryTabsProps {
  onEditItem: (item: any) => void;
  onDeleteItem: (id: string) => void;
  onAdjustItem: (item: any) => void;
}

const InventoryTabs: React.FC<InventoryTabsProps> = ({ onEditItem, onDeleteItem, onAdjustItem }) => {
  return (
    <Tabs defaultValue="stocks" className="space-y-4">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="stocks">Stocks</TabsTrigger>
        <TabsTrigger value="movements">
          <ClipboardList className="h-4 w-4 mr-1" />
          Mouvements
        </TabsTrigger>
        <TabsTrigger value="losses">
          <AlertTriangle className="h-4 w-4 mr-1" />
          Pertes
        </TabsTrigger>
        <TabsTrigger value="suppliers">
          <ShoppingCart className="h-4 w-4 mr-1" />
          Commandes
        </TabsTrigger>
        <TabsTrigger value="analytics">
          <BarChart3 className="h-4 w-4 mr-1" />
          Analytics
        </TabsTrigger>
      </TabsList>

      <TabsContent value="stocks">
        <InventoryStocksTab
          onEdit={onEditItem}
          onDelete={onDeleteItem}
          onAdjust={onAdjustItem}
        />
      </TabsContent>

      <TabsContent value="movements">
        <InventoryMovementsTab />
      </TabsContent>

      <TabsContent value="losses">
        <InventoryLossesTab />
      </TabsContent>

      <TabsContent value="suppliers">
        <InventorySuppliersTab />
      </TabsContent>

      <TabsContent value="analytics">
        <InventoryAnalyticsTab />
      </TabsContent>
    </Tabs>
  );
};

export default InventoryTabs;
