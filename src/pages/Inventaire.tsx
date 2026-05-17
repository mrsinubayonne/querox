import React, { useState } from 'react';
import PageWithSidebar from '@/components/PageWithSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { useInventory } from '@/hooks/useInventory';
import { useSuppliers } from '@/hooks/useSuppliers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import InventoryHeader from '@/components/inventory/InventoryHeader';
import InventoryStats from '@/components/inventory/InventoryStats';
import InventoryTabs from '@/components/inventory/InventoryTabs';
import ManualAdjustmentModal from '@/components/inventory/ManualAdjustmentModal';

const Inventaire: React.FC = () => {
  const { items, loading: itemsLoading, createItem, updateItem, deleteItem, getLowStockItems } = useInventory();
  const { suppliers, loading: suppliersLoading } = useSuppliers();
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [adjustmentItem, setAdjustmentItem] = useState<any>(null);

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
      expiration_date: formData.get('expiration_date') as string || undefined,
      batch_number: formData.get('batch_number') as string || undefined,
    };

    const success = await createItem(itemData);
    if (success) {
      setShowAddItem(false);
      e.currentTarget.reset();
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      await deleteItem(id);
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

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Rapport d\'Inventaire', 14, 22);
    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
    
    // Stats
    doc.setFontSize(12);
    doc.text('Statistiques', 14, 42);
    doc.setFontSize(10);
    doc.text(`Articles totaux: ${items.length}`, 14, 50);
    doc.text(`Stock critique: ${lowStockItems.length}`, 14, 56);
    doc.text(`Valeur totale: ${totalValue.toLocaleString()} CFA`, 14, 62);
    
    // Table
    const tableData = items.map(item => [
      item.name,
      item.category,
      `${item.current_stock} ${item.unit}`,
      `${item.min_stock} ${item.unit}`,
      item.unit_price ? `${item.unit_price.toLocaleString()} CFA` : '-',
      item.unit_price ? `${(item.current_stock * item.unit_price).toLocaleString()} CFA` : '-'
    ]);

    (doc as any).autoTable({
      startY: 70,
      head: [['Article', 'Catégorie', 'Stock', 'Min', 'Prix unit.', 'Valeur']],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save(`inventaire_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <SubscriptionGuard feature="la gestion d'inventaire">
      <PageWithSidebar>
        <div className="space-y-6">
          {/* Header */}
          <InventoryHeader 
            onAddItem={() => setShowAddItem(true)}
            onExport={handleExportPDF}
          />

          {/* Stats */}
          <InventoryStats
            totalItems={items.length}
            lowStockCount={lowStockItems.length}
            totalValue={totalValue}
            suppliersCount={suppliers.length}
          />

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
          <InventoryTabs
            onEditItem={setEditingItem}
            onDeleteItem={handleDeleteItem}
            onAdjustItem={setAdjustmentItem}
          />

          {/* Modal d'ajout d'article */}
          <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  <div className="space-y-2">
                    <Label htmlFor="expiration_date">Date de péremption</Label>
                    <Input id="expiration_date" name="expiration_date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="batch_number">Numéro de lot</Label>
                    <Input id="batch_number" name="batch_number" placeholder="Ex: LOT2024-001" />
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

          {/* Edit Item Dialog */}
          <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

          {/* Manual Adjustment Modal */}
          {adjustmentItem && (
            <ManualAdjustmentModal
              isOpen={!!adjustmentItem}
              onClose={() => setAdjustmentItem(null)}
              itemId={adjustmentItem.id}
              itemName={adjustmentItem.name}
              currentStock={adjustmentItem.current_stock}
              unit={adjustmentItem.unit}
            />
          )}
        </div>
      </PageWithSidebar>
    </SubscriptionGuard>
  );
};

export default Inventaire;
