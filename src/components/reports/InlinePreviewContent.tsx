import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Utensils, Package, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Props {
  periodId?: string;
  periodStart?: string;
  periodEnd?: string | null;
  outletId?: string | null;
  outletName?: string;
}

interface DishRow { name: string; qty: number; revenue: number }
interface InvRow { name: string; category: string; unit: string; qty: number }

const formatFCFA = (v: number) =>
  `${Math.round(Number(v) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} CFA`;

export const InlinePreviewContent: React.FC<Props> = ({
  periodId, periodStart, periodEnd, outletId, outletName,
}) => {
  const { user, isTeamMember, teamMemberSession } = useAuth();
  const [dishes, setDishes] = useState<DishRow[]>([]);
  const [inventory, setInventory] = useState<InvRow[]>([]);
  const [loading, setLoading] = useState(false);

  const effectiveUserId = isTeamMember && teamMemberSession ? teamMemberSession.ownerId : user?.id;

  const signatureName = isTeamMember && teamMemberSession
    ? teamMemberSession.memberEmail
    : (user?.email || 'Propriétaire');
  const signatureRole = isTeamMember && teamMemberSession
    ? (teamMemberSession.role || 'Membre équipe')
    : 'Propriétaire du compte';

  useEffect(() => {
    const run = async () => {
      if (!effectiveUserId || !periodStart) return;
      setLoading(true);
      try {
        const startISO = periodStart;
        const endISO = periodEnd || new Date().toISOString();

        // --- Orders -> top dishes
        let oq = supabase.from('orders')
          .select('items, created_at, outlet_id')
          .eq('user_id', effectiveUserId)
          .gte('created_at', startISO)
          .lte('created_at', endISO)
          .limit(10000);
        if (outletId) oq = oq.eq('outlet_id', outletId);
        const { data: orders } = await oq;

        const dishMap = new Map<string, DishRow>();
        (orders || []).forEach((o: any) => {
          if (Array.isArray(o.items)) {
            o.items.forEach((it: any) => {
              const key = (it.name || it.id || 'Inconnu').toString();
              const qty = Number(it.quantity) || 0;
              const price = Number(it.price) || 0;
              const ex = dishMap.get(key);
              if (ex) { ex.qty += qty; ex.revenue += qty * price; }
              else dishMap.set(key, { name: key, qty, revenue: qty * price });
            });
          }
        });
        setDishes(Array.from(dishMap.values()).sort((a, b) => b.qty - a.qty));

        // --- Inventory consumption
        let mq = supabase.from('stock_movements')
          .select('item_id, quantity, movement_type, inventory_items!inner(name, category, unit, user_id, outlet_id)')
          .eq('inventory_items.user_id', effectiveUserId)
          .in('movement_type', ['out', 'sale', 'adjustment_down', 'loss'])
          .gte('created_at', startISO)
          .lte('created_at', endISO)
          .limit(5000);
        if (outletId) mq = mq.eq('inventory_items.outlet_id', outletId);
        const { data: movs } = await mq;

        const invMap = new Map<string, InvRow>();
        (movs || []).forEach((m: any) => {
          const k = m.item_id;
          const qty = Math.abs(Number(m.quantity) || 0);
          const ex = invMap.get(k);
          if (ex) ex.qty += qty;
          else invMap.set(k, {
            name: m.inventory_items?.name || '?',
            category: m.inventory_items?.category || '-',
            unit: m.inventory_items?.unit || 'pcs',
            qty,
          });
        });
        setInventory(Array.from(invMap.values()).sort((a, b) => b.qty - a.qty));
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [effectiveUserId, periodId, periodStart, periodEnd, outletId]);

  return (
    <div className="space-y-6">
      {/* Plats consommés */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-orange-600" />
            Plats consommés
          </CardTitle>
          <CardDescription>
            {outletName ? `${outletName} — ` : ''}
            depuis {periodStart ? format(new Date(periodStart), 'dd/MM/yyyy HH:mm', { locale: fr }) : '-'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : dishes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun plat enregistré sur cette période.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground border-b">
                  <tr>
                    <th className="py-2 pr-2">#</th>
                    <th className="py-2 pr-2">Plat</th>
                    <th className="py-2 pr-2 text-right">Quantité</th>
                    <th className="py-2 pr-2 text-right">CA estimé</th>
                  </tr>
                </thead>
                <tbody>
                  {dishes.map((d, i) => (
                    <tr key={d.name} className="border-b last:border-0">
                      <td className="py-2 pr-2 text-muted-foreground">{i + 1}</td>
                      <td className="py-2 pr-2 font-medium">{d.name}</td>
                      <td className="py-2 pr-2 text-right font-bold">{d.qty}</td>
                      <td className="py-2 pr-2 text-right text-green-700">{formatFCFA(d.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inventaire consommé */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-purple-600" />
            Inventaire consommé
          </CardTitle>
          <CardDescription>
            Boissons, ingrédients et autres articles sortis du stock sur la période.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : inventory.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun mouvement de stock sur cette période.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground border-b">
                  <tr>
                    <th className="py-2 pr-2">Article</th>
                    <th className="py-2 pr-2">Catégorie</th>
                    <th className="py-2 pr-2 text-right">Quantité</th>
                    <th className="py-2 pr-2">Unité</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((it) => (
                    <tr key={it.name} className="border-b last:border-0">
                      <td className="py-2 pr-2 font-medium">{it.name}</td>
                      <td className="py-2 pr-2 text-muted-foreground">{it.category}</td>
                      <td className="py-2 pr-2 text-right font-bold">{it.qty}</td>
                      <td className="py-2 pr-2 text-muted-foreground">{it.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Signature */}
      <Card className="border-l-4 border-l-slate-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenLine className="h-5 w-5 text-slate-700" />
            Signature
          </CardTitle>
          <CardDescription>
            Personne du compte ayant généré cet aperçu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Nom / Identifiant</p>
              <p className="font-semibold">{signatureName}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Rôle</p>
              <p className="font-semibold capitalize">{signatureRole}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Date / heure de l'aperçu</p>
              <p className="font-semibold">{format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr })}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Point de vente</p>
              <p className="font-semibold">{outletName || 'Tous les points de vente'}</p>
            </div>
          </div>
          <div className="mt-6 border-t pt-4">
            <p className="text-xs text-muted-foreground mb-8">Signature manuscrite :</p>
            <div className="border-b border-dashed border-slate-400 h-12" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
