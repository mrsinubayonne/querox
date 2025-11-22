import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useInventory } from '@/hooks/useInventory';
import { useSuppliers } from '@/hooks/useSuppliers';
import { Package, TrendingDown, TrendingUp, Edit, Trash2, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from '@/components/EmptyState';
import { format, differenceInDays } from 'date-fns';

interface InventoryStocksTabProps {
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  onAdjust: (item: any) => void;
}

const InventoryStocksTab: React.FC<InventoryStocksTabProps> = ({ onEdit, onDelete, onAdjust }) => {
  const { items, loading, updateItem } = useInventory();
  const { suppliers } = useSuppliers();

  const handleQuickUpdate = async (id: string, change: number, currentStock: number) => {
    const newStock = Math.max(0, currentStock + change);
    await updateItem(id, { current_stock: newStock });
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

  const getExpirationStatus = (expirationDate: string | null) => {
    if (!expirationDate) return null;
    const days = differenceInDays(new Date(expirationDate), new Date());
    if (days < 0) return { label: 'Périmé', color: 'bg-red-600', days };
    if (days <= 7) return { label: 'Expire bientôt', color: 'bg-orange-600', days };
    if (days <= 30) return { label: `${days}j restants`, color: 'bg-yellow-600', days };
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Aucun article"
        description="Ajoutez votre premier article pour commencer"
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const status = getStockStatus(item.current_stock, item.min_stock);
        const percentage = getStockPercentage(item.current_stock, item.min_stock);
        const expirationStatus = getExpirationStatus(item.expiration_date);
        const supplier = suppliers.find(s => s.id === item.supplier_id);

        return (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold">{item.name}</span>
                    </div>
                    <Badge variant="outline">{item.category}</Badge>
                    {status === 'rupture' && <Badge variant="destructive">Rupture</Badge>}
                    {status === 'faible' && <Badge className="bg-orange-500">Stock faible</Badge>}
                    {expirationStatus && (
                      <Badge className={expirationStatus.color}>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {expirationStatus.label}
                      </Badge>
                    )}
                    {item.batch_number && (
                      <Badge variant="outline" className="text-xs">
                        Lot: {item.batch_number}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
                    <span>Stock: <strong>{item.current_stock} {item.unit}</strong></span>
                    <span>Min: {item.min_stock} {item.unit}</span>
                    {item.unit_price && <span>Prix: {item.unit_price.toLocaleString()} CFA/{item.unit}</span>}
                    {supplier && <span>Fournisseur: {supplier.name}</span>}
                    {item.expiration_date && (
                      <span>Expire: {format(new Date(item.expiration_date), 'dd/MM/yyyy')}</span>
                    )}
                  </div>
                  {item.unit_price && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Valeur: </span>
                      <span className="font-bold">{(item.current_stock * item.unit_price).toLocaleString()} CFA</span>
                    </div>
                  )}
                  <Progress value={percentage} className="h-2" />
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleQuickUpdate(item.id, -1, item.current_stock)}
                  >
                    <TrendingDown className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleQuickUpdate(item.id, 1, item.current_stock)}
                  >
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onAdjust(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default InventoryStocksTab;
