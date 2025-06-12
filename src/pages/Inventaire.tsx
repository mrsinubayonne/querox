
import React, { useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus, Upload, BarChart3, AlertTriangle } from "lucide-react";
import { useInventory } from '@/hooks/useInventory';
import { useToast } from '@/hooks/use-toast';
import AddInventoryModal from '@/components/AddInventoryModal';

const Inventaire: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const { items, loading, getLowStockItems } = useInventory();
  const { toast } = useToast();

  const lowStockItems = getLowStockItems();

  const handleAddProduct = () => {
    setShowAddModal(true);
  };

  const handleImportExcel = () => {
    toast({
      title: "Import Excel",
      description: "Fonctionnalité d'import en cours de développement",
    });
  };

  const handleViewReports = () => {
    toast({
      title: "Rapports",
      description: "Visualisation des rapports de stock",
    });
  };

  const handleCategoryClick = (category: string) => {
    toast({
      title: "Catégorie sélectionnée",
      description: `Filtrage par: ${category}`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex w-full bg-gray-50">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Chargement de l'inventaire...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventaire</h1>
            <p className="text-gray-600">Gérez les stocks de votre restaurant</p>
          </div>

          {/* Alertes de stock faible */}
          {lowStockItems.length > 0 && (
            <Card className="mb-6 border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="w-5 h-5" />
                  Alertes de stock faible
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-white rounded border">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-orange-600">
                        Stock: {item.current_stock} {item.unit} (Min: {item.min_stock})
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>
                  {items.length === 0 ? "Inventaire vide" : `${items.length} produits en stock`}
                </CardTitle>
                <CardDescription>
                  {items.length === 0 
                    ? "Commencez par ajouter vos premiers produits"
                    : "Gérez vos produits en stock"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full mb-3" onClick={handleAddProduct}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un produit
                </Button>
                <Button variant="outline" className="w-full" onClick={handleImportExcel}>
                  <Upload className="w-4 h-4 mr-2" />
                  Importer depuis Excel
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-secondary" />
                </div>
                <CardTitle>Suivi des stocks</CardTitle>
                <CardDescription>
                  Surveillez vos niveaux de stock en temps réel
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>• Alertes de stock faible: {lowStockItems.length}</p>
                  <p>• Produits totaux: {items.length}</p>
                  <p>• Rapports de consommation disponibles</p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleViewReports}
                  disabled={items.length === 0}
                >
                  Voir les rapports {items.length === 0 && "(aucun produit)"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Types de produits à gérer</CardTitle>
              <CardDescription>
                Organisez votre inventaire par catégories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "Ingrédients", desc: "Viandes, légumes, épices, etc." },
                  { name: "Boissons", desc: "Vins, bières, sodas, etc." },
                  { name: "Matériel", desc: "Vaisselle, ustensiles, etc." },
                  { name: "Produits d'entretien", desc: "Nettoyants, désinfectants, etc." },
                  { name: "Emballages", desc: "Contenants, sacs, etc." },
                  { name: "Autres", desc: "Produits divers" }
                ].map((category) => (
                  <div 
                    key={category.name}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleCategoryClick(category.name)}
                  >
                    <h3 className="font-semibold mb-2">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddInventoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          toast({
            title: "Produit ajouté",
            description: "Le produit a été ajouté à l'inventaire avec succès",
          });
        }}
      />
    </div>
  );
};

export default Inventaire;
