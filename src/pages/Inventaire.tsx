
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Plus,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Package,
  Edit,
  Trash2
} from "lucide-react";
import { Input } from "@/components/ui/input";
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

  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getStockPercentage = (current: number, min: number) => {
    const max = min * 3; // Assume max is 3 times the minimum
    return Math.min((current / max) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 30) return "bg-red-500";
    if (percentage < 60) return "bg-orange-500";
    return "bg-green-500";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Inventaire</h1>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Download size={16} />
                Exporter
              </Button>
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <Plus size={16} />
                Ajouter article
              </Button>
            </div>
          </div>

          {/* Critical Stock Alert */}
          {criticalItems.length > 0 && (
            <Card className="mb-6 border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="text-orange-600" size={20} />
                  <span className="font-medium text-orange-800">
                    Alertes de stock faible ({criticalItems.length} articles)
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {criticalItems.map(item => (
                    <Badge key={item.id} variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                      {item.name} ({item.quantity} {item.unit})
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs defaultValue="stocks" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="stocks">État des stocks</TabsTrigger>
              <TabsTrigger value="movements">Mouvements</TabsTrigger>
              <TabsTrigger value="suppliers">Fournisseurs</TabsTrigger>
            </TabsList>

            <TabsContent value="stocks" className="space-y-6">
              {/* Search and Filter */}
              <div className="flex gap-4">
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

              {/* Articles Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Package size={20} />
                  <h2 className="text-lg font-semibold">Articles en stock ({filteredItems.length})</h2>
                </div>

                <div className="space-y-3">
                  {filteredItems.map((item) => {
                    const stockPercentage = getStockPercentage(item.quantity, item.minQuantity);
                    return (
                      <Card key={item.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{item.name}</h3>
                                {item.status === "Critique" && (
                                  <Badge className="bg-red-500 text-white text-xs">
                                    Critique
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {item.category}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-4 gap-6 text-sm text-gray-600 mb-2">
                                <div>
                                  <span className="font-medium">Stock actuel</span>
                                  <div className="font-semibold text-gray-900">{item.quantity} {item.unit}</div>
                                </div>
                                <div>
                                  <span className="font-medium">Stock minimum</span>
                                  <div>{item.minQuantity} {item.unit}</div>
                                </div>
                                <div>
                                  <span className="font-medium">Prix unitaire</span>
                                  <div>{item.price} CFA</div>
                                </div>
                                <div>
                                  <span className="font-medium">Fournisseur</span>
                                  <div>{item.supplier}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Niveau de stock</span>
                                <div className="flex-1 max-w-xs">
                                  <Progress value={stockPercentage} className="h-2" />
                                </div>
                                <span className="text-xs text-gray-500">{Math.round(stockPercentage)}%</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <Edit size={14} />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {filteredItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun article trouvé</p>
                  </div>
                )}
              </div>
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
