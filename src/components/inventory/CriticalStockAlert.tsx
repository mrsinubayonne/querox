
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  status: string;
}

interface CriticalStockAlertProps {
  criticalItems: InventoryItem[];
}

const CriticalStockAlert: React.FC<CriticalStockAlertProps> = ({ criticalItems }) => {
  if (criticalItems.length === 0) return null;

  return (
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
  );
};

export default CriticalStockAlert;
