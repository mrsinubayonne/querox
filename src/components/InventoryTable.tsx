
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package } from 'lucide-react';
import TableActions from './inventory-table/TableActions';
import QuantityCell from './inventory-table/QuantityCell';

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
                  <QuantityCell
                    itemId={item.id}
                    quantity={item.quantity}
                    unit={item.unit}
                    editingId={editingId}
                    editValue={editValue}
                    onEditValueChange={setEditValue}
                  />
                </TableCell>
                <TableCell>{item.minQuantity} {item.unit}</TableCell>
                <TableCell>{item.price.toLocaleString()} CFA</TableCell>
                <TableCell className="text-sm">{item.supplier}</TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.lastUpdated}</TableCell>
                <TableCell>
                  <TableActions
                    itemId={item.id}
                    quantity={item.quantity}
                    editingId={editingId}
                    editValue={editValue}
                    onEditStart={() => handleEditStart(item)}
                    onEditSave={() => handleEditSave(item.id)}
                    onEditCancel={handleEditCancel}
                    onEditValueChange={setEditValue}
                    onQuickUpdate={(change) => handleQuickUpdate(item.id, item.quantity, change)}
                  />
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
