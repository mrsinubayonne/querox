import React, { useState, useMemo } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import AddInventoryModal from '../components/AddInventoryModal';
import InventoryHeader from '../components/inventory/InventoryHeader';
import CriticalStockAlert from '../components/inventory/CriticalStockAlert';
import InventoryStats from '../components/inventory/InventoryStats';
import InventoryTabs from '../components/inventory/InventoryTabs';
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

  const stats = useMemo(() => {
    const criticalItems = inventoryItems.filter(item => item.status === "Critique").length;
    const totalValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const lowStockItems = inventoryItems.filter(item => item.quantity <= item.minQuantity).length;
    
    return {
      totalItems: inventoryItems.length,
      criticalItems,
      totalValue,
      lowStockItems
    };
  }, [inventoryItems]);

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

          <InventoryStats
            totalItems={stats.totalItems}
            criticalItems={stats.criticalItems}
            totalValue={stats.totalValue}
            lowStockItems={stats.lowStockItems}
          />

          <InventoryTabs
            filteredItems={filteredItems}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterCategory={filterCategory}
            onFilter={handleFilter}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
          />
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
