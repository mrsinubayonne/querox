import React, { useState, useCallback } from 'react';
import MenuItemOptionsModal from '@/components/public-menu/MenuItemOptionsModal';
import type { MenuItem, SelectedOption } from '@/types/menu';

export interface OptionPickerResult {
  unitPrice: number;
  selectedOptions: SelectedOption[];
  optionsLabel: string;
  cartKey: string;
}

/**
 * Reusable helper for internal order modals.
 * If the item has option_groups, opens the options modal before completing add-to-cart.
 * Otherwise calls onResolved immediately with no options.
 */
export function useMenuItemOptionsPicker(
  onResolved: (item: MenuItem, result: OptionPickerResult) => void,
) {
  const [pendingItem, setPendingItem] = useState<MenuItem | null>(null);

  const requestAdd = useCallback((item: MenuItem) => {
    const groups = item.option_groups || [];
    if (groups.length === 0) {
      onResolved(item, {
        unitPrice: Number(item.price) || 0,
        selectedOptions: [],
        optionsLabel: '',
        cartKey: item.id,
      });
      return;
    }
    setPendingItem(item);
  }, [onResolved]);

  const handleConfirm = useCallback((selections: SelectedOption[]) => {
    if (!pendingItem) return;
    const extras = selections.reduce((s, o) => s + (Number(o.extra_price) || 0), 0);
    const label = selections.map(o => o.value_name).join(', ');
    const cartKey = `${pendingItem.id}__${selections.map(o => o.value_id).sort().join('_')}`;
    onResolved(pendingItem, {
      unitPrice: (Number(pendingItem.price) || 0) + extras,
      selectedOptions: selections,
      optionsLabel: label,
      cartKey,
    });
    setPendingItem(null);
  }, [pendingItem, onResolved]);

  const pickerNode = (
    <MenuItemOptionsModal
      open={!!pendingItem}
      onOpenChange={(o) => { if (!o) setPendingItem(null); }}
      item={pendingItem}
      onConfirm={handleConfirm}
    />
  );

  return { requestAdd, pickerNode };
}
