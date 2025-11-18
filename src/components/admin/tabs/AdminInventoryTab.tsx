import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertTriangle, TrendingDown, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const AdminInventoryTab: React.FC = () => {
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0
  });
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      const { data: inventory, error } = await supabase
        .from('inventory_items')
        .select('*');

      if (error) throw error;

      const total = inventory?.length || 0;
      const lowStock = inventory?.filter(item => 
        (item.current_stock || 0) <= (item.min_stock || 0) && (item.current_stock || 0) > 0
      ).length || 0;
      const outOfStock = inventory?.filter(item => (item.current_stock || 0) === 0).length || 0;
      const totalValue = inventory?.reduce((sum, item) => 
        sum + ((item.current_stock || 0) * (item.unit_price || 0)), 0
      ) || 0;

      setStats({ total, lowStock, outOfStock, totalValue });
      setItems(inventory?.slice(0, 15) || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement de l\'inventaire');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="space-y-4">
      {[1, 2, 3].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-32" /></Card>)}
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardDescription>Articles Total</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Package className="w-4 h-4 mr-2" />
              En inventaire
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardDescription>Stock Bas</CardDescription>
            <CardTitle className="text-3xl">{stats.lowStock}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <AlertTriangle className="w-4 h-4 mr-2" />
              À réapprovisionner
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardDescription>Rupture de Stock</CardDescription>
            <CardTitle className="text-3xl">{stats.outOfStock}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingDown className="w-4 h-4 mr-2" />
              Articles épuisés
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardDescription>Valeur Totale</CardDescription>
            <CardTitle className="text-3xl">{stats.totalValue.toFixed(2)}€</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4 mr-2" />
              Stock actuel
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Articles en Stock Critique</CardTitle>
          <CardDescription>Articles nécessitant une attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.filter(item => (item.current_stock || 0) <= (item.min_stock || 0)).map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">{item.current_stock || 0} {item.unit}</p>
                  <p className="text-xs text-muted-foreground">Min: {item.min_stock || 0}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
