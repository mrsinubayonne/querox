
import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Edit, Trash2 } from "lucide-react";

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minQuantity: number;
  price: number;
  supplier: string;
  status: string;
}

interface InventoryItemCardProps {
  item: InventoryItem;
  onEdit: (itemId: number) => void;
  onDelete: (itemId: number) => void;
}

const InventoryItemCard: React.FC<InventoryItemCardProps> = ({ item, onEdit, onDelete }) => {
  const getStockPercentage = (current: number, min: number) => {
    const max = min * 3;
    return Math.min((current / max) * 100, 100);
  };

  const stockPercentage = getStockPercentage(item.quantity, item.minQuantity);

  return (
    <Card className="p-4">
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
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 w-8 p-0"
            onClick={() => onEdit(item.id)}
          >
            <Edit size={14} />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 w-8 p-0"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default InventoryItemCard;
