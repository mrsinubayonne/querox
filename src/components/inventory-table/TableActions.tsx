
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Plus, Minus } from 'lucide-react';

interface TableActionsProps {
  itemId: number;
  quantity: number;
  editingId: number | null;
  editValue: number;
  onEditStart: () => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onEditValueChange: (value: number) => void;
  onQuickUpdate: (change: number) => void;
}

const TableActions: React.FC<TableActionsProps> = ({
  itemId,
  quantity,
  editingId,
  editValue,
  onEditStart,
  onEditSave,
  onEditCancel,
  onEditValueChange,
  onQuickUpdate
}) => {
  if (editingId === itemId) {
    return (
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          onClick={onEditSave}
          className="h-8 px-2 bg-green-600 hover:bg-green-700"
        >
          ✓
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onEditCancel}
          className="h-8 px-2"
        >
          ✕
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        size="sm"
        variant="outline"
        onClick={() => onQuickUpdate(-1)}
        className="h-8 w-8 p-0"
        disabled={quantity === 0}
      >
        <Minus size={12} />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onEditStart}
        className="h-8 w-8 p-0"
      >
        <Edit size={12} />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onQuickUpdate(1)}
        className="h-8 w-8 p-0"
      >
        <Plus size={12} />
      </Button>
    </div>
  );
};

export default TableActions;
