
import React from 'react';
import { Input } from '@/components/ui/input';

interface QuantityCellProps {
  itemId: number;
  quantity: number;
  unit: string;
  editingId: number | null;
  editValue: number;
  onEditValueChange: (value: number) => void;
}

const QuantityCell: React.FC<QuantityCellProps> = ({
  itemId,
  quantity,
  unit,
  editingId,
  editValue,
  onEditValueChange
}) => {
  if (editingId === itemId) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={editValue}
          onChange={(e) => onEditValueChange(Number(e.target.value))}
          className="w-20"
          min="0"
        />
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">{quantity}</span>
      <span className="text-sm text-muted-foreground">{unit}</span>
    </div>
  );
};

export default QuantityCell;
