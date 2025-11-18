import React, { useState } from 'react';
import PageWithSidebar from '@/components/PageWithSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { useInventory } from '@/hooks/useInventory';
import { useSuppliers } from '@/hooks/useSuppliers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, AlertTriangle, TrendingDown, TrendingUp, Users, Trash2, Download, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/EmptyState';
import { Progress } from '@/components/ui/progress';

const Inventaire: React.FC = () => {
  const { items, loading: itemsLoading, createItem, updateItem, deleteItem, getLowStockItems } = useInventory();
  const { suppliers, loading: suppliersLoading, createSupplier, deleteSupplier } = useSuppliers();
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const lowStockItems = getLowStockItems();
  const totalValue = items.reduce((sum, item) => sum + (item.current_stock * (item.unit_price || 0)), 0);

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const itemData = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      current_stock: parseInt(formData.get('current_stock') as string) || 0,
      min_stock: parseInt(formData.get('min_stock') as string) || 0,
      unit: formData.get('unit') as string,
      unit_price: parseFloat(formData.get('unit_price') as string) || 0,
      supplier_id: formData.get('supplier_id') as string || undefined,
    };

    const success = await createItem(itemData);
    if (success) {
      setShowAddItem(false);
      e.currentTarget.reset();
    }
  };

  const handleAddSupplier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const supplierData = {
      name: formData.get('name') as string,
      contact_person: formData.get('contact_person') as string || undefined,
      email: formData.get('email') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      address: formData.get('address') as string || undefined,
      notes: formData.get('notes') as string || undefined,
    };

    const success = await createSupplier(supplierData);
    if (success) {
      setShowAddSupplier(false);
      e.currentTarget.reset();
    }
  };

  const handleUpdateStock = async (id: string, change: number, currentStock: number) => {
    const newStock = Math.max(0, currentStock + change);
    await updateItem(id, { current_stock: newStock });
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      await deleteItem(id);
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      await deleteSupplier(id);
    }
  };

  const handleEditItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;
    
    const formData = new FormData(e.currentTarget);
    
    const itemData = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      current_stock: parseInt(formData.get('current_stock') as string) || 0,
      min_stock: parseInt(formData.get('min_stock') as string) || 0,
      unit: formData.get('unit') as string,
      unit_price: parseFloat(formData.get('unit_price') as string) || 0,
      supplier_id: formData.get('supplier_id') as string || undefined,
    };

    const success = await updateItem(editingItem.id, itemData);
    if (success) {
      setEditingItem(null);
    }
  };

  const getStockPercentage = (current: number, min: number) => {
    if (min === 0) return 100;
    return Math.min(100, (current / (min * 2)) * 100);
  };

  const getStockStatus = (current: number, min: number) => {
    if (current === 0) return 'rupture';
    if (current <= min) return 'faible';
    return 'normal';
  };

  return (
    <SubscriptionGuard feature="la gestion d'inventaire">
      <PageWithSidebar>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Inventaire</h1>
              <p className="text-muted-foreground">Gérez les stocks de votre restaurant</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
              <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un article
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Nouvel article</DialogTitle>
                    <DialogDescription>Ajoutez un nouvel article à votre inventaire</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddItem} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom *</Label>
                        <Input id="name" name="name" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Catégorie *</Label>
                        <Select name="category" required>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ingrédients">Ingrédients</SelectItem>
                            <SelectItem value="Boissons">Boissons</SelectItem>
                            <SelectItem value="Matériel">Matériel</SelectItem>
                            <SelectItem value="Produits d'entretien">Produits d'entretien</SelectItem>
                            <SelectItem value="Emballages">Emballages</SelectItem>
                            <SelectItem value="Autres">Autres</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="current_stock">Stock actuel *</Label>
                        <Input id="current_stock" name="current_stock" type="number" min="0" defaultValue="0" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="min_stock">Stock minimum *</Label>
                        <Input id="min_stock" name="min_stock" type="number" min="0" defaultValue="0" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unité *</Label>
                        <Select name="unit" required>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="l">l</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                            <SelectItem value="pcs">pcs</SelectItem>
                            <SelectItem value="units">unités</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit_price">Prix unitaire (CFA)</Label>
                        <Input id="unit_price" name="unit_price" type="number" min="0" step="0.01" defaultValue="0" />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="supplier_id">Fournisseur</Label>
                        <Select name="supplier_id">
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un fournisseur" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers.map(s => (
                              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Ajouter</Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddItem(false)}>Annuler</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Articles totaux</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{items.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Stock critique</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{lowStockItems.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Valeur totale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalValue.toLocaleString()} CFA</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Fournisseurs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{suppliers.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="text-orange-600" size={20} />
                  <span className="font-medium text-orange-800">
                    Alertes de stock faible ({lowStockItems.length} articles)
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lowStockItems.map(item => (
                    <Badge key={item.id} variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                      {item.name} ({item.current_stock} {item.unit})
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs defaultValue="stocks" className="space-y-4">
            <TabsList>
              <TabsTrigger value="stocks">État des stocks</TabsTrigger>
              <TabsTrigger value="suppliers">Fournisseurs</TabsTrigger>
            </TabsList>

            <TabsContent value="stocks" className="space-y-4">
              {itemsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="Aucun article"
                  description="Ajoutez votre premier article pour commencer"
                />
              ) : (
                <div className="space-y-3">
                  {items.map((item) => {
                    const status = getStockStatus(item.current_stock, item.min_stock);
                    const percentage = getStockPercentage(item.current_stock, item.min_stock);
                    
                    return (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <Package className="h-5 w-5 text-muted-foreground" />
                                  <span className="font-semibold">{item.name}</span>
                                </div>
                                <Badge variant="outline">{item.category}</Badge>
                                {status === 'rupture' && <Badge variant="destructive">Rupture</Badge>}
                                {status === 'faible' && <Badge className="bg-orange-500">Stock faible</Badge>}
                              </div>
                              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <span>Stock: <strong>{item.current_stock} {item.unit}</strong></span>
                                <span>Min: {item.min_stock} {item.unit}</span>
                                {item.unit_price && <span>Prix: {item.unit_price} CFA/{item.unit}</span>}
                                {item.supplier && suppliers.find(s => s.id === item.supplier_id) && (
                                  <span>Fournisseur: {suppliers.find(s => s.id === item.supplier_id)?.name}</span>
                                )}
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button size="sm" variant="outline" onClick={() => handleUpdateStock(item.id, -1, item.current_stock)}>
                                <TrendingDown className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleUpdateStock(item.id, 1, item.current_stock)}>
                                <TrendingUp className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingItem(item)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteItem(item.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="suppliers" className="space-y-4">
              <div className="flex justify-end">
                <Dialog open={showAddSupplier} onOpenChange={setShowAddSupplier}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter un fournisseur
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Nouveau fournisseur</DialogTitle>
                      <DialogDescription>Ajoutez un nouveau fournisseur</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddSupplier} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sup-name">Nom *</Label>
                          <Input id="sup-name" name="name" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact_person">Contact</Label>
                          <Input id="contact_person" name="contact_person" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sup-email">Email</Label>
                          <Input id="sup-email" name="email" type="email" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sup-phone">Téléphone</Label>
                          <Input id="sup-phone" name="phone" />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="address">Adresse</Label>
                          <Input id="address" name="address" />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="sup-notes">Notes</Label>
                          <Textarea id="sup-notes" name="notes" rows={3} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit">Ajouter</Button>
                        <Button type="button" variant="outline" onClick={() => setShowAddSupplier(false)}>Annuler</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {suppliersLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : suppliers.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Aucun fournisseur"
                  description="Ajoutez votre premier fournisseur pour commencer"
                />
              ) : (
                <div className="space-y-3">
                  {suppliers.map((supplier) => (
                    <Card key={supplier.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Users className="h-5 w-5 text-muted-foreground" />
                              <span className="font-semibold">{supplier.name}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {supplier.contact_person && <span>Contact: {supplier.contact_person}</span>}
                              {supplier.phone && <span>Tél: {supplier.phone}</span>}
                              {supplier.email && <span>Email: {supplier.email}</span>}
                            </div>
                            {supplier.address && (
                              <p className="text-sm text-muted-foreground">{supplier.address}</p>
                            )}
                            {supplier.notes && (
                              <p className="text-sm text-muted-foreground italic">{supplier.notes}</p>
                            )}
                          </div>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteSupplier(supplier.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Edit Item Dialog */}
          <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Modifier l'article</DialogTitle>
                <DialogDescription>Modifiez les informations de l'article</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditItem} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nom *</Label>
                    <Input id="edit-name" name="name" defaultValue={editingItem?.name} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Catégorie *</Label>
                    <Select name="category" defaultValue={editingItem?.category} required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ingrédients">Ingrédients</SelectItem>
                        <SelectItem value="Boissons">Boissons</SelectItem>
                        <SelectItem value="Matériel">Matériel</SelectItem>
                        <SelectItem value="Produits d'entretien">Produits d'entretien</SelectItem>
                        <SelectItem value="Emballages">Emballages</SelectItem>
                        <SelectItem value="Autres">Autres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-current_stock">Stock actuel *</Label>
                    <Input id="edit-current_stock" name="current_stock" type="number" min="0" defaultValue={editingItem?.current_stock} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-min_stock">Stock minimum *</Label>
                    <Input id="edit-min_stock" name="min_stock" type="number" min="0" defaultValue={editingItem?.min_stock} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-unit">Unité *</Label>
                    <Select name="unit" defaultValue={editingItem?.unit} required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="l">l</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="pcs">pcs</SelectItem>
                        <SelectItem value="units">unités</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-unit_price">Prix unitaire (CFA)</Label>
                    <Input id="edit-unit_price" name="unit_price" type="number" min="0" step="0.01" defaultValue={editingItem?.unit_price} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="edit-supplier_id">Fournisseur</Label>
                    <Select name="supplier_id" defaultValue={editingItem?.supplier_id}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un fournisseur" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Enregistrer</Button>
                  <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>Annuler</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </PageWithSidebar>
    </SubscriptionGuard>
  );
};

export default Inventaire;
