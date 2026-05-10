import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MenuItem, SelectedOption } from '@/types/menu';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MenuItem | null;
  onConfirm: (selections: SelectedOption[]) => void;
}

const MenuItemOptionsModal: React.FC<Props> = ({ open, onOpenChange, item, onConfirm }) => {
  const [singleSel, setSingleSel] = useState<Record<string, string>>({});
  const [multiSel, setMultiSel] = useState<Record<string, Record<string, boolean>>>({});

  React.useEffect(() => {
    if (open) { setSingleSel({}); setMultiSel({}); }
  }, [open, item?.id]);

  const groups = item?.option_groups || [];

  const totalExtras = useMemo(() => {
    let total = 0;
    for (const g of groups) {
      if (g.selection_type === 'single') {
        const vid = singleSel[g.id];
        const v = g.values.find(x => x.id === vid);
        if (v) total += Number(v.extra_price) || 0;
      } else {
        const sel = multiSel[g.id] || {};
        for (const v of g.values) if (sel[v.id]) total += Number(v.extra_price) || 0;
      }
    }
    return total;
  }, [groups, singleSel, multiSel]);

  const validate = (): SelectedOption[] | null => {
    const out: SelectedOption[] = [];
    for (const g of groups) {
      if (g.selection_type === 'single') {
        const vid = singleSel[g.id];
        if (!vid) {
          if (g.is_required) return null;
          continue;
        }
        const v = g.values.find(x => x.id === vid);
        if (v) out.push({ group_id: g.id, group_name: g.name, value_id: v.id, value_name: v.name, extra_price: Number(v.extra_price) || 0 });
      } else {
        const sel = multiSel[g.id] || {};
        const chosen = g.values.filter(v => sel[v.id]);
        if (g.is_required && chosen.length === 0) return null;
        for (const v of chosen) {
          out.push({ group_id: g.id, group_name: g.name, value_id: v.id, value_name: v.name, extra_price: Number(v.extra_price) || 0 });
        }
      }
    }
    return out;
  };

  if (!item) return null;
  const totalPrice = Number(item.price) + totalExtras;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          {groups.map(g => (
            <div key={g.id}>
              <div className="font-semibold mb-2">
                {g.name} {g.is_required && <span className="text-red-500">*</span>}
                <span className="text-xs text-muted-foreground ml-2">
                  {g.selection_type === 'single' ? '(choix unique)' : '(plusieurs possibles)'}
                </span>
              </div>
              {g.selection_type === 'single' ? (
                <RadioGroup value={singleSel[g.id] || ''} onValueChange={(v) => setSingleSel(s => ({ ...s, [g.id]: v }))}>
                  {g.values.map(v => (
                    <div key={v.id} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value={v.id} id={`r-${v.id}`} />
                        <Label htmlFor={`r-${v.id}`}>{v.name}</Label>
                      </div>
                      {Number(v.extra_price) > 0 && (
                        <span className="text-sm text-emerald-600">+{Number(v.extra_price).toLocaleString('fr-FR')} FCFA</span>
                      )}
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-1">
                  {g.values.map(v => (
                    <div key={v.id} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`c-${v.id}`}
                          checked={!!multiSel[g.id]?.[v.id]}
                          onCheckedChange={(checked) => setMultiSel(prev => ({
                            ...prev,
                            [g.id]: { ...(prev[g.id] || {}), [v.id]: !!checked }
                          }))}
                        />
                        <Label htmlFor={`c-${v.id}`}>{v.name}</Label>
                      </div>
                      {Number(v.extra_price) > 0 && (
                        <span className="text-sm text-emerald-600">+{Number(v.extra_price).toLocaleString('fr-FR')} FCFA</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <DialogFooter className="flex flex-row justify-between items-center sm:justify-between">
          <span className="text-lg font-bold text-emerald-600">{totalPrice.toLocaleString('fr-FR')} FCFA</span>
          <Button onClick={() => {
            const result = validate();
            if (!result) return;
            onConfirm(result);
            onOpenChange(false);
          }} className="bg-emerald-600 hover:bg-emerald-700">
            Ajouter au panier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MenuItemOptionsModal;
