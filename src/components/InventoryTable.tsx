
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Plus, Minus, Package } from 'lucide-react';

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  price: number;
  supplier: string;
  lastUpdated: string;
  status: string;
}

interface InventoryTableProps {
  items: InventoryItem[];
  onUpdateQuantity: (itemId: number, newQuantity: number) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ items, onUpdateQuantity }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'En stock':
        return <Badge className="bg-green-100 text-green-800 border-green-200">En stock</Badge>;
      case 'Stock faible':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Stock faible</Badge>;
      case 'Rupture':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rupture</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleEditStart = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditValue(item.quantity);
  };

  const handleEditSave = (itemId: number) => {
    onUpdateQuantity(itemId, editValue);
    setEditingId(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue(0);
  };

  const handleQuickUpdate = (itemId: number, currentQuantity: number, change: number) => {
    const newQuantity = Math.max(0, currentQuantity + change);
    onUpdateQuantity(itemId, newQuantity);
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Article</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Quantité</TableHead>
              <TableHead>Seuil Min.</TableHead>
              <TableHead>Prix Unitaire</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Dernière MAJ</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    {item.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  {editingId === item.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(Number(e.target.value))}
                        className="w-20"
                        min="0"
                      />
                      <span className="text-sm text-muted-foreground">{item.unit}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.quantity}</span>
                      <span className="text-sm text-muted-foreground">{item.unit}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>{item.minQuantity} {item.unit}</TableCell>
                <TableCell>{item.price.toLocaleString()} CFA</TableCell>
                <TableCell className="text-sm">{item.supplier}</TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.lastUpdated}</TableCell>
                <TableCell>
                  {editingId === item.id ? (
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleEditSave(item.id)}
                        className="h-8 px-2 bg-green-600 hover:bg-green-700"
                      >
                        ✓
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleEditCancel}
                        className="h-8 px-2"
                      >
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickUpdate(item.id, item.quantity, -1)}
                        className="h-8 w-8 p-0"
                        disabled={item.quantity === 0}
                      >
                        <Minus size={12} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditStart(item)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit size={12} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickUpdate(item.id, item.quantity, 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus size={12} />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {items.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun article trouvé</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryTable;
