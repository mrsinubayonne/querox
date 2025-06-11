
import React, { useState } from 'react';
import { Plus, Search, Filter, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import InventoryTable from '@/components/InventoryTable';
import AddInventoryModal from '@/components/AddInventoryModal';
import ModernSidebar from '@/components/ModernSidebar';

const Inventaire = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [inventoryItems, setInventoryItems] = useState([
    {
      id: 1,
      name: 'Riz Jasmin 25kg',
      category: 'Céréales',
      quantity: 45,
      minQuantity: 20,
      unit: 'sacs',
      price: 15000,
      supplier: 'Fournisseur A',
      lastUpdated: '2024-06-10',
      status: 'En stock'
    },
    {
      id: 2,
      name: 'Huile de palme 20L',
      category: 'Huiles',
      quantity: 12,
      minQuantity: 15,
      unit: 'bidons',
      price: 8500,
      supplier: 'Fournisseur B',
      lastUpdated: '2024-06-09',
      status: 'Stock faible'
    },
    {
      id: 3,
      name: 'Tomates fraîches',
      category: 'Légumes',
      quantity: 0,
      minQuantity: 10,
      unit: 'kg',
      price: 500,
      supplier: 'Marché Local',
      lastUpdated: '2024-06-08',
      status: 'Rupture'
    },
    {
      id: 4,
      name: 'Poisson fumé',
      category: 'Protéines',
      quantity: 28,
      minQuantity: 15,
      unit: 'kg',
      price: 3500,
      supplier: 'Pêcheur Local',
      lastUpdated: '2024-06-10',
      status: 'En stock'
    }
  ]);

  const totalItems = inventoryItems.length;
  const lowStockItems = inventoryItems.filter(item => item.quantity <= item.minQuantity && item.quantity > 0).length;
  const outOfStockItems = inventoryItems.filter(item => item.quantity === 0).length;
  const totalValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAddItem = (newItem: any) => {
    const item = {
      ...newItem,
      id: Date.now(),
      lastUpdated: new Date().toISOString().split('T')[0],
      status: newItem.quantity === 0 ? 'Rupture' : 
              newItem.quantity <= newItem.minQuantity ? 'Stock faible' : 'En stock'
    };
    setInventoryItems(prev => [...prev, item]);
  };

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    setInventoryItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const status = newQuantity === 0 ? 'Rupture' : 
                      newQuantity <= item.minQuantity ? 'Stock faible' : 'En stock';
        return {
          ...item,
          quantity: newQuantity,
          status,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <ModernSidebar />
      <div className="ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestion de l'Inventaire</h1>
              <p className="text-muted-foreground mt-2">Suivez et gérez vos stocks en temps réel</p>
            </div>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
            >
              <Plus size={16} />
              Ajouter un article
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Articles</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalItems}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Stock Faible</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{lowStockItems}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ruptures</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Valeur Totale</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {totalValue.toLocaleString()} CFA
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Rechercher un article ou fournisseur..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes catégories</SelectItem>
                    <SelectItem value="Céréales">Céréales</SelectItem>
                    <SelectItem value="Huiles">Huiles</SelectItem>
                    <SelectItem value="Légumes">Légumes</SelectItem>
                    <SelectItem value="Protéines">Protéines</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous statuts</SelectItem>
                    <SelectItem value="En stock">En stock</SelectItem>
                    <SelectItem value="Stock faible">Stock faible</SelectItem>
                    <SelectItem value="Rupture">Rupture</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Table */}
          <InventoryTable 
            items={filteredItems}
            onUpdateQuantity={handleUpdateQuantity}
          />

          {/* Add Item Modal */}
          <AddInventoryModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAddItem={handleAddItem}
          />
        </div>
      </div>
    </div>
  );
};

export default Inventaire;
