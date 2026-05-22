import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface OptionValue {
  id?: string;
  group_id?: string;
  name: string;
  extra_price: number;
  is_available: boolean;
  order_index: number;
  _new?: boolean;
}

interface OptionGroup {
  id?: string;
  menu_item_id: string;
  name: string;
  selection_type: 'single' | 'multiple';
  is_required: boolean;
  order_index: number;
  values: OptionValue[];
  _new?: boolean;
  _expanded?: boolean;
}

interface Props {
  menuItemId: string;
}

const MenuItemOptionsEditor: React.FC<Props> = ({ menuItemId }) => {
  const [groups, setGroups] = useState<OptionGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const load = async () => {
    if (!menuItemId) return;
    setLoading(true);
    try {
      const { data: gs } = await (supabase as any)
        .from('menu_item_option_groups')
        .select('*')
        .eq('menu_item_id', menuItemId)
        .order('order_index');
      const groupIds = (gs || []).map((g: any) => g.id);
      let vals: any[] = [];
      if (groupIds.length > 0) {
        const { data: vs } = await (supabase as any)
          .from('menu_item_option_values')
          .select('*')
          .in('group_id', groupIds)
          .order('order_index');
        vals = vs || [];
      }
      setGroups(
        (gs || []).map((g: any) => ({
          ...g,
          _expanded: true,
          values: vals.filter((v: any) => v.group_id === g.id),
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuItemId]);

  const addGroup = () => {
    setGroups(g => [
      ...g,
      {
        menu_item_id: menuItemId,
        name: '',
        selection_type: 'single',
        is_required: false,
        order_index: g.length,
        values: [],
        _new: true,
        _expanded: true,
      },
    ]);
  };

  const updateGroup = (idx: number, patch: Partial<OptionGroup>) => {
    setGroups(prev => prev.map((g, i) => (i === idx ? { ...g, ...patch } : g)));
  };

  const removeGroup = async (idx: number) => {
    const g = groups[idx];
    if (g.id) {
      const ok = confirm(`Supprimer le groupe "${g.name}" et toutes ses options ?`);
      if (!ok) return;
      await (supabase as any).from('menu_item_option_groups').delete().eq('id', g.id);
    }
    setGroups(prev => prev.filter((_, i) => i !== idx));
  };

  const addValue = (gIdx: number) => {
    setGroups(prev =>
      prev.map((g, i) =>
        i === gIdx
          ? {
              ...g,
              values: [
                ...g.values,
                { name: '', extra_price: 0, is_available: true, order_index: g.values.length, _new: true },
              ],
            }
          : g
      )
    );
  };

  const updateValue = (gIdx: number, vIdx: number, patch: Partial<OptionValue>) => {
    setGroups(prev =>
      prev.map((g, i) =>
        i === gIdx
          ? { ...g, values: g.values.map((v, j) => (j === vIdx ? { ...v, ...patch } : v)) }
          : g
      )
    );
  };

  const removeValue = async (gIdx: number, vIdx: number) => {
    const v = groups[gIdx].values[vIdx];
    if (v.id) {
      await (supabase as any).from('menu_item_option_values').delete().eq('id', v.id);
    }
    setGroups(prev =>
      prev.map((g, i) =>
        i === gIdx ? { ...g, values: g.values.filter((_, j) => j !== vIdx) } : g
      )
    );
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      for (let gi = 0; gi < groups.length; gi++) {
        const g = groups[gi];
        if (!g.name.trim()) continue;
        let groupId = g.id;
        if (!groupId) {
          const { data, error } = await (supabase as any)
            .from('menu_item_option_groups')
            .insert({
              menu_item_id: g.menu_item_id,
              name: g.name,
              selection_type: g.selection_type,
              is_required: g.is_required,
              order_index: gi,
            })
            .select('id')
            .single();
          if (error) throw error;
          groupId = data.id;
        } else {
          await (supabase as any)
            .from('menu_item_option_groups')
            .update({
              name: g.name,
              selection_type: g.selection_type,
              is_required: g.is_required,
              order_index: gi,
            })
            .eq('id', groupId);
        }
        for (let vi = 0; vi < g.values.length; vi++) {
          const v = g.values[vi];
          if (!v.name.trim()) continue;
          if (!v.id) {
            await (supabase as any).from('menu_item_option_values').insert({
              group_id: groupId,
              name: v.name,
              extra_price: Number(v.extra_price) || 0,
              is_available: v.is_available,
              order_index: vi,
            });
          } else {
            await (supabase as any)
              .from('menu_item_option_values')
              .update({
                name: v.name,
                extra_price: Number(v.extra_price) || 0,
                is_available: v.is_available,
                order_index: vi,
              })
              .eq('id', v.id);
          }
        }
      }
      toast.success('Variantes enregistrées');
      await load();
    } catch (e: any) {
      toast.error('Erreur', { description: e.message || 'Sauvegarde impossible' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 border rounded-lg p-3 bg-muted/30">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Label className="text-base font-semibold">Variantes & suppléments</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCopyModalOpen(true)}
            disabled={!menuItemId}
          >
            <Copy className="h-4 w-4 mr-1" /> Importer d'un plat
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={addGroup}>
            <Plus className="h-4 w-4 mr-1" /> Groupe
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Ex: "Viande" (Bœuf / Poulet) en choix unique, ou "Suppléments" (Fromage +500, Bacon +700) en choix multiple.
      </p>

      {loading && <p className="text-sm text-muted-foreground">Chargement…</p>}

      {groups.map((g, gi) => (
        <Card key={g.id || `new-${gi}`} className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateGroup(gi, { _expanded: !g._expanded })}
              className="text-muted-foreground"
            >
              {g._expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <Input
              value={g.name}
              onChange={e => updateGroup(gi, { name: e.target.value })}
              placeholder="Nom du groupe (ex: Viande)"
              className="flex-1"
            />
            <Select
              value={g.selection_type}
              onValueChange={(v: any) => updateGroup(gi, { selection_type: v })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Choix unique</SelectItem>
                <SelectItem value="multiple">Multiple</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeGroup(gi)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {g._expanded && (
            <>
              <div className="flex items-center gap-2 pl-6">
                <Switch
                  checked={g.is_required}
                  onCheckedChange={c => updateGroup(gi, { is_required: c })}
                />
                <Label className="text-sm">Obligatoire</Label>
              </div>

              <div className="space-y-2 pl-6">
                {g.values.map((v, vi) => (
                  <div key={v.id || `vnew-${vi}`} className="flex items-center gap-2">
                    <Input
                      value={v.name}
                      onChange={e => updateValue(gi, vi, { name: e.target.value })}
                      placeholder="Option (ex: Bœuf)"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={v.extra_price}
                      onChange={e => updateValue(gi, vi, { extra_price: parseFloat(e.target.value) || 0 })}
                      placeholder="Suppl. FCFA"
                      className="w-28"
                    />
                    <Switch
                      checked={v.is_available}
                      onCheckedChange={c => updateValue(gi, vi, { is_available: c })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeValue(gi, vi)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => addValue(gi)}>
                  <Plus className="h-4 w-4 mr-1" /> Option
                </Button>
              </div>
            </>
          )}
        </Card>
      ))}

      {groups.length > 0 && (
        <Button type="button" onClick={saveAll} disabled={saving} className="w-full">
          {saving ? 'Enregistrement…' : 'Enregistrer les variantes'}
        </Button>
      )}

      <CopyOptionsFromItemModal
        open={copyModalOpen}
        onOpenChange={setCopyModalOpen}
        targetMenuItemId={menuItemId}
        onImported={load}
      />
    </div>
  );
};

export default MenuItemOptionsEditor;
