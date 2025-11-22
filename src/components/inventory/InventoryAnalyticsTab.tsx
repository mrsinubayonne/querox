import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useInventoryAnalytics } from '@/hooks/useInventoryAnalytics';
import { useInventory } from '@/hooks/useInventory';
import { AlertTriangle, TrendingUp, ShoppingCart, Package } from "lucide-react";

const InventoryAnalyticsTab: React.FC = () => {
  const { reorderSuggestions, loading } = useInventoryAnalytics();
  const { items } = useInventory();

  const totalInventoryValue = items.reduce((sum, item) => {
    return sum + (item.current_stock * (item.unit_price || 0));
  }, 0);

  const lowStockItems = items.filter(item => item.current_stock <= item.min_stock);
  const criticalStockItems = items.filter(item => item.current_stock === 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
            <p>Analyse en cours...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats clés */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valeur totale</p>
                <p className="text-2xl font-bold">{totalInventoryValue.toLocaleString()} CFA</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stock faible</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockItems.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rupture</p>
                <p className="text-2xl font-bold text-red-600">{criticalStockItems.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">À commander</p>
                <p className="text-2xl font-bold text-blue-600">{reorderSuggestions.length}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions de réapprovisionnement */}
      {reorderSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Suggestions de réapprovisionnement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reorderSuggestions.map((suggestion) => (
                <div
                  key={suggestion.item_id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{suggestion.item_name}</span>
                      <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                        Stock: {suggestion.current_stock}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>
                        Min: {suggestion.min_stock} | Suggéré: <span className="font-medium">{suggestion.suggested_order_quantity}</span>
                      </p>
                      {suggestion.supplier_name && (
                        <p>Fournisseur: {suggestion.supplier_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{suggestion.total_cost.toLocaleString()} CFA</p>
                    {suggestion.unit_price && (
                      <p className="text-sm text-muted-foreground">
                        {suggestion.unit_price.toLocaleString()} CFA/unité
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-lg">Coût total estimé</span>
                  <span className="font-bold text-2xl text-primary">
                    {reorderSuggestions.reduce((sum, s) => sum + s.total_cost, 0).toLocaleString()} CFA
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Articles à surveiller */}
      {lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Articles à surveiller
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.slice(0, 10).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        item.current_stock === 0 ? 'bg-red-600' : 'bg-orange-600'
                      }`}
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Stock: {item.current_stock} {item.unit} (Min: {item.min_stock})
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      item.current_stock === 0
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : 'bg-orange-100 text-orange-800 border-orange-300'
                    }
                  >
                    {item.current_stock === 0 ? 'Rupture' : 'Faible'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rotation du stock */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Vue d'ensemble
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Articles totaux</p>
                <p className="text-3xl font-bold">{items.length}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Articles actifs</p>
                <p className="text-3xl font-bold text-green-600">
                  {items.filter(item => item.current_stock > item.min_stock).length}
                </p>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">État global du stock</span>
                <span className="text-sm font-medium">
                  {Math.round((items.filter(item => item.current_stock > item.min_stock).length / items.length) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 transition-all"
                  style={{
                    width: `${Math.round((items.filter(item => item.current_stock > item.min_stock).length / items.length) * 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryAnalyticsTab;
