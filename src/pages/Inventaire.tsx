
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  AlertTriangle,
  TrendingUp,
  Package,
  DollarSign
} from "lucide-react";
import { Input } from "@/components/ui/input";
import InventoryTable from '../components/InventoryTable';
import AddInventoryModal from '../components/AddInventoryModal';
import { useToast } from '@/hooks/use-toast';

const Inventaire: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  const [inventoryItems, setInventoryItems] = useState([
    {
      id: 1,
      name: "Riz Brisé Premium",
      category: "Céréales",
      quantity: 150,
      unit: "kg",
      minQuantity: 50,
      price: 850,
      supplier: "Fournisseur A",
      lastUpdated: "2024-01-15",
      status: "En stock"
    },
    {
      id: 2,
      name: "Poisson Frais",
      category: "Protéines",
      quantity: 25,
      unit: "kg",
      minQuantity: 30,
      price: 2500,
      supplier: "Marché Central",
      lastUpdated: "2024-01-14",
      status: "Stock faible"
    },
    {
      id: 3,
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
      id: 4,
      name: "Oignons",
      category: "Légumes",
      quantity: 5,
      unit: "kg",
      minQuantity: 15,
      price: 400,
      supplier: "Marché Local",
      lastUpdated: "2024-01-12",
      status: "Rupture"
    }
  ]);

  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = (newItem: any) => {
    const item = {
      ...newItem,
      id: Date.now(),
      lastUpdated: new Date().toISOString().split('T')[0],
      status: newItem.quantity <= newItem.minQuantity 
        ? newItem.quantity === 0 ? "Rupture" : "Stock faible"
        : "En stock"
    };
    setInventoryItems(prev => [...prev, item]);
    toast({
      title: "Article ajouté",
      description: `${newItem.name} a été ajouté à l'inventaire.`,
    });
  };

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    setInventoryItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const status = newQuantity <= item.minQuantity 
          ? newQuantity === 0 ? "Rupture" : "Stock faible"
          : "En stock";
        return {
          ...item,
          quantity: newQuantity,
          status,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    }));
    
    toast({
      title: "Quantité mise à jour",
      description: "La quantité en stock a été modifiée.",
    });
  };

  // Calculate statistics
  const totalItems = inventoryItems.length;
  const lowStockItems = inventoryItems.filter(item => 
    item.quantity <= item.minQuantity && item.quantity > 0
  ).length;
  const outOfStockItems = inventoryItems.filter(item => item.quantity === 0).length;
  const totalValue = inventoryItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventaire</h1>
              <p className="text-gray-600 mt-1">Gérez vos stocks et approvisionnements</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Download size={16} />
                Exporter
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Upload size={16} />
                Importer
              </Button>
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={16} />
                Ajouter un article
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalItems}</div>
                <p className="text-xs text-muted-foreground">
                  +2 depuis le mois dernier
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock Faible</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
                <p className="text-xs text-muted-foreground">
                  Articles à réapprovisionner
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rupture de Stock</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
                <p className="text-xs text-muted-foreground">
                  Articles indisponibles
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valeur Totale</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalValue.toLocaleString()} CFA</div>
                <p className="text-xs text-muted-foreground">
                  +12% depuis le mois dernier
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter size={16} />
              Filtrer
            </Button>
          </div>

          {/* Inventory Table */}
          <InventoryTable items={filteredItems} onUpdateQuantity={handleUpdateQuantity} />
        </div>
      </div>

      {/* Add Item Modal */}
      <AddInventoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddItem={handleAddItem}
      />
    </div>
  );
};

export default Inventaire;
