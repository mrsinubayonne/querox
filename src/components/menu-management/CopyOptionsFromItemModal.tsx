import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Search, Loader2, Copy } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetMenuItemId: string;
  onImported: () => void;
}

interface Candidate {
  id: string;
  name: string;
  groupCount: number;
}

const CopyOptionsFromItemModal: React.FC<Props> = ({ open, onOpenChange, targetMenuItemId, onImported }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [items, setItems] = useState<Candidate[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        // Get all menu items owned by the user (via menus.user_id)
        const { data: menus } = await (supabase as any)
          .from('menus')
          .select('id')
          .eq('user_id', user.id)
          .limit(1000);
        const menuIds = (menus || []).map((m: any) => m.id);
        if (menuIds.length === 0) {
          if (!cancelled) setItems([]);
          return;
        }
        const { data: menuItems } = await (supabase as any)
          .from('menu_items')
          .select('id, name')
          .in('menu_id', menuIds)
          .neq('id', targetMenuItemId)
          .order('name')
          .limit(1000);
        const ids = (menuItems || []).map((m: any) => m.id);
        if (ids.length === 0) {
          if (!cancelled) setItems([]);
          return;
        }
        const { data: groups } = await (supabase as any)
          .from('menu_item_option_groups')
          .select('menu_item_id')
          .in('menu_item_id', ids);
        const counts = new Map<string, number>();
        (groups || []).forEach((g: any) => counts.set(g.menu_item_id, (counts.get(g.menu_item_id) || 0) + 1));
        const result: Candidate[] = (menuItems || [])
          .map((m: any) => ({ id: m.id, name: m.name, groupCount: counts.get(m.id) || 0 }))
          .filter((c: Candidate) => c.groupCount > 0);
        if (!cancelled) setItems(result);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, user, targetMenuItemId]);

  const handleImport = async (sourceId: string) => {
    setImporting(sourceId);
    try {
      const { data: srcGroups } = await (supabase as any)
        .from('menu_item_option_groups')
        .select('*')
        .eq('menu_item_id', sourceId)
        .order('order_index');
      const srcGroupIds = (srcGroups || []).map((g: any) => g.id);
      let srcValues: any[] = [];
      if (srcGroupIds.length > 0) {
        const { data } = await (supabase as any)
          .from('menu_item_option_values')
          .select('*')
          .in('group_id', srcGroupIds)
          .order('order_index');
        srcValues = data || [];
      }

      // Determine current order_index offset on the target
      const { data: existingTargetGroups } = await (supabase as any)
        .from('menu_item_option_groups')
        .select('order_index')
        .eq('menu_item_id', targetMenuItemId);
      const offset = (existingTargetGroups || []).length;

      for (let i = 0; i < (srcGroups || []).length; i++) {
        const g = srcGroups[i];
        const { data: newGroup, error: gErr } = await (supabase as any)
          .from('menu_item_option_groups')
          .insert({
            menu_item_id: targetMenuItemId,
            name: g.name,
            selection_type: g.selection_type,
            is_required: g.is_required,
            order_index: offset + i,
          })
          .select('id')
          .single();
        if (gErr) throw gErr;

        const values = srcValues.filter((v) => v.group_id === g.id);
        if (values.length > 0) {
          const rows = values.map((v, vi) => ({
            group_id: newGroup.id,
            name: v.name,
            extra_price: Number(v.extra_price) || 0,
            is_available: v.is_available,
            order_index: vi,
          }));
          const { error: vErr } = await (supabase as any)
            .from('menu_item_option_values')
            .insert(rows);
          if (vErr) throw vErr;
        }
      }

      toast({ title: 'Suppléments copiés', description: 'Les groupes ont été importés.' });
      onImported();
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message || 'Import impossible', variant: 'destructive' });
    } finally {
      setImporting(null);
    }
  };

  const filtered = items.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Importer des suppléments</DialogTitle>
          <DialogDescription>
            Sélectionnez un plat dont vous voulez copier les groupes d'options et leurs valeurs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un plat..."
              className="pl-8"
            />
          </div>

          <div className="max-h-80 overflow-y-auto space-y-1 border rounded-lg p-2">
            {loading && (
              <div className="flex items-center justify-center py-6 text-muted-foreground">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Chargement…
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <p className="text-sm text-muted-foreground p-3 text-center">
                Aucun plat avec des suppléments à copier.
              </p>
            )}
            {!loading &&
              filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleImport(c.id)}
                  disabled={!!importing}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-accent transition-colors active:scale-[0.97] text-left disabled:opacity-50"
                >
                  <div>
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.groupCount} groupe(s)</p>
                  </div>
                  {importing === c.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Copy className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CopyOptionsFromItemModal;
