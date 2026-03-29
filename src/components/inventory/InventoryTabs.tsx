
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, AlertTriangle, ShoppingCart, BarChart3, CalendarDays } from "lucide-react";
import InventoryStocksTab from './InventoryStocksTab';
import InventoryMovementsTab from './InventoryMovementsTab';
import InventoryLossesTab from './InventoryLossesTab';
import InventorySuppliersTab from './InventorySuppliersTab';
import InventoryAnalyticsTab from './InventoryAnalyticsTab';
import InventoryConsumptionTab from './InventoryConsumptionTab';

interface InventoryTabsProps {
  onEditItem: (item: any) => void;
  onDeleteItem: (id: string) => void;
  onAdjustItem: (item: any) => void;
}

const InventoryTabs: React.FC<InventoryTabsProps> = ({ onEditItem, onDeleteItem, onAdjustItem }) => {
  return (
    <Tabs defaultValue="stocks" className="space-y-4">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="stocks">Stocks</TabsTrigger>
        <TabsTrigger value="consumption">
          <CalendarDays className="h-4 w-4 mr-1" />
          Consommation
        </TabsTrigger>
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

      <TabsContent value="consumption">
        <InventoryConsumptionTab />
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
