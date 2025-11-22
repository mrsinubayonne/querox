import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStockMovements } from '@/hooks/useStockMovements';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Package, Search, Filter } from "lucide-react";

const InventoryMovementsTab: React.FC = () => {
  const { movements, loading } = useStockMovements();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = movement.inventory_items?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || movement.movement_type === filterType;
    return matchesSearch && matchesType;
  });

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'entrée':
      case 'achat':
      case 'retour':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'sortie':
      case 'vente':
      case 'perte':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-blue-600" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'entrée':
      case 'achat':
      case 'retour':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'sortie':
      case 'vente':
      case 'perte':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
            <p>Chargement de l'historique...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type de mouvement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les mouvements</SelectItem>
                <SelectItem value="entrée">Entrées</SelectItem>
                <SelectItem value="sortie">Sorties</SelectItem>
                <SelectItem value="vente">Ventes automatiques</SelectItem>
                <SelectItem value="ajustement">Ajustements</SelectItem>
                <SelectItem value="perte">Pertes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des mouvements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Historique des mouvements ({filteredMovements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMovements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun mouvement trouvé</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMovements.map((movement) => (
                <div
                  key={movement.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getMovementIcon(movement.movement_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {movement.inventory_items?.name || 'Article inconnu'}
                        </span>
                        <Badge variant="outline" className={getMovementColor(movement.movement_type)}>
                          {movement.movement_type}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          Quantité: <span className="font-medium">{movement.quantity > 0 ? '+' : ''}{movement.quantity}</span> {movement.inventory_items?.unit}
                        </p>
                        {(movement.before_quantity !== 0 || movement.after_quantity !== 0) && (
                          <p>
                            Stock: <span className="font-medium">{movement.before_quantity}</span> → <span className="font-medium">{movement.after_quantity}</span>
                          </p>
                        )}
                        {movement.reason && (
                          <p className="text-xs italic">Raison: {movement.reason}</p>
                        )}
                        {movement.notes && (
                          <p className="text-xs italic">Note: {movement.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{format(new Date(movement.created_at), 'dd MMM yyyy', { locale: fr })}</p>
                    <p className="text-xs">{format(new Date(movement.created_at), 'HH:mm', { locale: fr })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryMovementsTab;
