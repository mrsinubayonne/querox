import React, { useState } from 'react';
import PageWithSidebar from '@/components/PageWithSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { useInventory } from '@/hooks/useInventory';
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

const MIN_STOCK_HINT = "(à partir de ce nombre restant, une alerte vous sera envoyée)";

const Inventaire: React.FC = () => {
  const { items, loading: itemsLoading, createItem, updateItem, deleteItem, getLowStockItems } = useInventory();
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [adjustmentItem, setAdjustmentItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const lowStockItems = getLowStockItems();
  const totalValue = items.reduce((sum, item) => sum + (item.current_stock * (item.unit_price || 0)), 0);

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const itemData = {
      name: (formData.get('name') as string)?.trim(),
      category: formData.get('category') as string,
      current_stock: parseInt(formData.get('current_stock') as string) || 0,
      min_stock: parseInt(formData.get('min_stock') as string) || 0,
      unit: (formData.get('unit') as string) || 'pcs',
      unit_price: parseFloat(formData.get('unit_price') as string) || 0,
    };

    setSaving(true);
    try {
      const success = await createItem(itemData as any);
      if (success) {
        setShowAddItem(false);
        form.reset();
      }
    } finally {
      setSaving(false);
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
      name: (formData.get('name') as string)?.trim(),
      category: formData.get('category') as string,
      current_stock: parseInt(formData.get('current_stock') as string) || 0,
      min_stock: parseInt(formData.get('min_stock') as string) || 0,
      unit: (formData.get('unit') as string) || 'pcs',
      unit_price: parseFloat(formData.get('unit_price') as string) || 0,
    };

    setSaving(true);
    try {
      const success = await updateItem(editingItem.id, itemData);
      if (success) setEditingItem(null);
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Rapport d\'Inventaire', 14, 22);
    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);

    doc.setFontSize(12);
    doc.text('Statistiques', 14, 42);
    doc.setFontSize(10);
    doc.text(`Articles totaux: ${items.length}`, 14, 50);
    doc.text(`Stock critique: ${lowStockItems.length}`, 14, 56);
    doc.text(`Valeur totale: ${totalValue.toLocaleString()} CFA`, 14, 62);

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
      head: [['Article', 'Catégorie', 'Stock', 'Min', 'Prix d\'achat unit.', 'Valeur']],
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
          <InventoryHeader
            onAddItem={() => setShowAddItem(true)}
            onExport={handleExportPDF}
          />

          <InventoryStats
            totalItems={items.length}
            lowStockCount={lowStockItems.length}
            totalValue={totalValue}
          />

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
                    <Select name="category" defaultValue="Ingrédients" required>
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
                    <Label htmlFor="min_stock">
                      Stock minimum <span className="text-xs font-normal text-muted-foreground">{MIN_STOCK_HINT}</span>
                    </Label>
                    <Input id="min_stock" name="min_stock" type="number" min="0" defaultValue="0" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unité *</Label>
                    <Select name="unit" defaultValue="pcs" required>
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
                    <Label htmlFor="unit_price">Prix d'achat unitaire (CFA)</Label>
                    <Input id="unit_price" name="unit_price" type="number" min="0" step="0.01" defaultValue="0" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving}>{saving ? 'Ajout…' : 'Ajouter'}</Button>
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
                    <Label htmlFor="edit-min_stock">
                      Stock minimum <span className="text-xs font-normal text-muted-foreground">{MIN_STOCK_HINT}</span>
                    </Label>
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
                    <Label htmlFor="edit-unit_price">Prix d'achat unitaire (CFA)</Label>
                    <Input id="edit-unit_price" name="unit_price" type="number" min="0" step="0.01" defaultValue={editingItem?.unit_price} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Button>
                  <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>Annuler</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

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
