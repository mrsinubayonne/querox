import React, { useEffect, useRef } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const LowStockAlert: React.FC = () => {
  const { items, loading } = useInventory();
  const hasShownToast = useRef(false);

  const lowStockItems = items.filter(
    (item) => item.current_stock <= item.min_stock
  );

  const outOfStockItems = lowStockItems.filter((item) => item.current_stock === 0);
  const criticalItems = lowStockItems.filter((item) => item.current_stock > 0);

  useEffect(() => {
    if (loading || hasShownToast.current) return;
    if (lowStockItems.length === 0) return;

    hasShownToast.current = true;

    if (outOfStockItems.length > 0) {
      toast.error(`⚠️ ${outOfStockItems.length} article(s) en rupture de stock !`, { description: outOfStockItems.map((i) => i.name).join(', ') });
    } else if (criticalItems.length > 0) {
      toast.success(`📦 ${criticalItems.length} article(s) en stock faible`, { description: criticalItems.map((i) => `${i.name} (${i.current_stock})`).join(', ') });
    }
  }, [loading, lowStockItems.length]);

  if (loading || lowStockItems.length === 0) return null;

  return (
    <Alert className="border-destructive/50 bg-destructive/10 mb-4">
      <AlertTriangle className="h-5 w-5 text-destructive" />
      <AlertDescription className="flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-semibold text-destructive">
            {outOfStockItems.length > 0
              ? `🚨 ${outOfStockItems.length} rupture(s) de stock`
              : `⚠️ ${criticalItems.length} stock(s) faible(s)`}
          </span>
          <Link to="/inventaire">
            <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10">
              <Package className="h-4 w-4 mr-1" />
              Voir l'inventaire
            </Button>
          </Link>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {outOfStockItems.map((item) => (
            <Badge key={item.id} variant="destructive" className="text-xs">
              {item.name} — RUPTURE
            </Badge>
          ))}
          {criticalItems.map((item) => (
            <Badge key={item.id} className="bg-orange-500/90 text-white text-xs">
              {item.name} ({item.current_stock} {item.unit})
            </Badge>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default LowStockAlert;
