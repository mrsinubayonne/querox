import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package } from "lucide-react";
import AddInventoryModal from '../components/AddInventoryModal';
import InventoryHeader from '../components/inventory/InventoryHeader';
import CriticalStockAlert from '../components/inventory/CriticalStockAlert';
import InventoryStocksTab from '../components/inventory/InventoryStocksTab';
import { useToast } from '@/hooks/use-toast';

const Inventaire: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("tous");
  const { toast } = useToast();
  
  const [inventoryItems, setInventoryItems] = useState([
    {
      id: 1,
      name: "Riz blanc",
      category: "Céréales",
      quantity: 25,
      unit: "kg",
      minQuantity: 30,
      price: 450,
      supplier: "Fournisseur A",
      lastUpdated: "2024-01-15",
      status: "Critique"
    },
    {
      id: 2,
      name: "Poulet frais",
      category: "Viandes",
      quantity: 12,
      unit: "kg",
      minQuantity: 15,
      price: 2500,
      supplier: "Ferme Diallo",
      lastUpdated: "2024-01-14",
      status: "Critique"
    },
    {
      id: 3,
      name: "Tomates",
      category: "Légumes",
      quantity: 8,
      unit: "kg",
      minQuantity: 10,
      price: 400,
      supplier: "Marché Central",
      lastUpdated: "2024-01-13",
      status: "Critique"
    },
    {
      id: 4,
      name: "Huile de Palme",
      category: "Condiments",
      quantity: 80,
      unit: "L",
      minQuantity: 20,
      price: 1200,
      supplier: "Fournisseur B",
      lastUpdated: "2024-01-13",
      status: "En stock"
    },
    {
      id: 5,
      name: "Oignons",
      category: "Légumes",
      quantity: 45,
      unit: "kg",
      minQuantity: 15,
      price: 300,
      supplier: "Marché Local",
      lastUpdated: "2024-01-12",
      status: "En stock"
    }
  ]);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Nom,Catégorie,Quantité,Unité,Prix,Fournisseur,Statut\n" +
      inventoryItems.map(item => 
        `${item.name},${item.category},${item.quantity},${item.unit},${item.price},${item.supplier},${item.status}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inventaire.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export réussi",
      description: "L'inventaire a été exporté en CSV",
    });
  };

  const handleFilter = () => {
    const categories = ["tous", "Céréales", "Viandes", "Légumes", "Condiments"];
    const currentIndex = categories.indexOf(filterCategory);
    const nextCategory = categories[(currentIndex + 1) % categories.length];
    setFilterCategory(nextCategory);
    
    toast({
      title: "Filtre appliqué",
      description: `Affichage: ${nextCategory}`,
    });
  };

  const handleEditItem = (itemId: number) => {
    const item = inventoryItems.find(i => i.id === itemId);
    toast({
      title: "Modification",
      description: `Modification de ${item?.name}`,
    });
  };

  const handleDeleteItem = (itemId: number) => {
    const item = inventoryItems.find(i => i.id === itemId);
    setInventoryItems(prev => prev.filter(i => i.id !== itemId));
    toast({
      title: "Article supprimé",
      description: `${item?.name} a été supprimé de l'inventaire`,
    });
  };

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "tous" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const criticalItems = inventoryItems.filter(item => item.status === "Critique");

  const handleAddItem = (newItem: any) => {
    const item = {
      ...newItem,
      id: Date.now(),
      lastUpdated: new Date().toISOString().split('T')[0],
      status: newItem.quantity <= newItem.minQuantity ? "Critique" : "En stock"
    };
    setInventoryItems(prev => [...prev, item]);
    toast({
      title: "Article ajouté",
      description: `${newItem.name} a été ajouté à l'inventaire.`,
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <InventoryHeader 
            onExport={handleExport}
            onAddItem={() => setIsAddModalOpen(true)}
          />

          <CriticalStockAlert criticalItems={criticalItems} />

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
                onSearchChange={setSearchTerm}
                filterCategory={filterCategory}
                onFilter={handleFilter}
                onEditItem={handleEditItem}
                onDeleteItem={handleDeleteItem}
              />
            </TabsContent>

            <TabsContent value="movements">
              <Card className="p-6">
                <div className="text-center text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Historique des mouvements de stock</p>
                  <p className="text-sm">Cette section sera disponible prochainement</p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="suppliers">
              <Card className="p-6">
                <div className="text-center text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Gestion des fournisseurs</p>
                  <p className="text-sm">Cette section sera disponible prochainement</p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AddInventoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddItem={handleAddItem}
      />
    </div>
  );
};

export default Inventaire;
