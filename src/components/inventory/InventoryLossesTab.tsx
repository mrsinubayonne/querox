import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useInventoryLosses } from '@/hooks/useInventoryLosses';
import { useInventory } from '@/hooks/useInventory';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertTriangle, Plus, Trash2, TrendingDown } from "lucide-react";

const InventoryLossesTab: React.FC = () => {
  const { losses, loading, createLoss, deleteLoss, getTotalLossCost, getLossesByCategory } = useInventoryLosses();
  const { items } = useInventory();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [lossType, setLossType] = useState('');
  const [lossCategory, setLossCategory] = useState('');
  const [reason, setReason] = useState('');
  const [lossDate, setLossDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddLoss = async () => {
    if (!selectedItemId || !quantity || !lossType || !lossCategory) return;

    const selectedItem = items.find(item => item.id === selectedItemId);
    const costValue = selectedItem?.unit_price ? parseFloat(quantity) * selectedItem.unit_price : 0;

    await createLoss({
      inventory_item_id: selectedItemId,
      outlet_id: null,
      quantity: parseFloat(quantity),
      loss_type: lossType,
      loss_category: lossCategory,
      cost_value: costValue,
      reason: reason || null,
      loss_date: lossDate
    });

    setIsAddModalOpen(false);
    setSelectedItemId('');
    setQuantity('');
    setLossType('');
    setLossCategory('');
    setReason('');
    setLossDate(new Date().toISOString().split('T')[0]);
  };

  const totalLossCost = getTotalLossCost();
  const lossesByCategory = getLossesByCategory();

  const getLossCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'peremption': 'bg-orange-100 text-orange-800 border-orange-300',
      'casse': 'bg-red-100 text-red-800 border-red-300',
      'vol': 'bg-purple-100 text-purple-800 border-purple-300',
      'erreur': 'bg-blue-100 text-blue-800 border-blue-300',
      'autre': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[category] || colors['autre'];
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
            <p>Chargement des pertes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats des pertes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total des pertes</p>
                <p className="text-2xl font-bold">{losses.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Coût total</p>
                <p className="text-2xl font-bold text-red-600">{totalLossCost.toLocaleString()} CFA</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Par catégorie</p>
              <div className="space-y-1">
                {Object.entries(lossesByCategory).map(([category, cost]) => (
                  <div key={category} className="flex justify-between text-sm">
                    <span className="capitalize">{category}</span>
                    <span className="font-medium">{cost.toLocaleString()} CFA</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header avec bouton d'ajout */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Pertes et gaspillage
            </CardTitle>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Enregistrer une perte
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {losses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune perte enregistrée</p>
            </div>
          ) : (
            <div className="space-y-3">
              {losses.map((loss) => (
                <div
                  key={loss.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {loss.inventory_items?.name || 'Article inconnu'}
                      </span>
                      <Badge variant="outline" className={getLossCategoryColor(loss.loss_category)}>
                        {loss.loss_category}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        Quantité perdue: <span className="font-medium">{loss.quantity}</span> {loss.inventory_items?.unit}
                      </p>
                      <p>
                        Coût: <span className="font-medium text-red-600">{(loss.cost_value || 0).toLocaleString()} CFA</span>
                      </p>
                      {loss.reason && (
                        <p className="text-xs italic">Raison: {loss.reason}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{format(new Date(loss.loss_date), 'dd MMM yyyy', { locale: fr })}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteLoss(loss.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal d'ajout */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer une perte</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Article *</Label>
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un article" />
                </SelectTrigger>
                <SelectContent>
                  {items.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} (Stock: {item.current_stock} {item.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Quantité perdue *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <Label>Type de perte *</Label>
              <Select value={lossType} onValueChange={setLossType}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="peremption">Péremption</SelectItem>
                  <SelectItem value="casse">Casse</SelectItem>
                  <SelectItem value="vol">Vol</SelectItem>
                  <SelectItem value="erreur">Erreur</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Catégorie *</Label>
              <Select value={lossCategory} onValueChange={setLossCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez la catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="peremption">Péremption</SelectItem>
                  <SelectItem value="casse">Casse</SelectItem>
                  <SelectItem value="vol">Vol</SelectItem>
                  <SelectItem value="erreur">Erreur de manipulation</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date de la perte</Label>
              <Input
                type="date"
                value={lossDate}
                onChange={(e) => setLossDate(e.target.value)}
              />
            </div>

            <div>
              <Label>Raison détaillée (optionnel)</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Détails supplémentaires..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleAddLoss}
              disabled={!selectedItemId || !quantity || !lossType || !lossCategory}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryLossesTab;
