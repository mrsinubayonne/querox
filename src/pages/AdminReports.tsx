import React, { useEffect, useMemo, useState } from 'react';
import PageWithSidebar from '@/components/PageWithSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText, MessageCircle, RefreshCw, Search, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import { toast } from 'sonner';

interface OutletRow {
  id: string;
  name: string;
  user_id: string;
  whatsapp_number: string | null;
  ownerPhone?: string | null;
  ownerName?: string | null;
  dailyRevenue: number;
  dailyCount: number;
  weeklyRevenue: number;
  weeklyCount: number;
}

const fmt = (n: number) => `${Math.round(n).toLocaleString('fr-FR')} XAF`;

const AdminReports: React.FC = () => {
  const { isAdmin, loading: authLoading } = useSubscription();
  const [rows, setRows] = useState<OutletRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<OutletRow | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [reportType, setReportType] = useState<'daily' | 'weekly'>('daily');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
      const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - 6); startOfWeek.setHours(0, 0, 0, 0);

      const [outletsRes, invoicesRes, profilesRes] = await Promise.all([
        supabase.from('outlets').select('id,name,user_id,whatsapp_number'),
        supabase
          .from('invoices')
          .select('id,outlet_id,total_amount,paid_date,updated_at,status,created_at')
          .eq('status', 'paid')
          .gte('updated_at', startOfWeek.toISOString())
          .limit(10000),
        supabase.from('profiles').select('id,full_name'),
      ]);

      const outlets = outletsRes.data || [];
      const invoices = invoicesRes.data || [];
      const profiles = profilesRes.data || [];
      const profileById = new Map(profiles.map((p: any) => [p.id, p]));

      const perOutlet = new Map<string, { d: number; dc: number; w: number; wc: number }>();
      for (const inv of invoices as any[]) {
        const ts = new Date(inv.paid_date || inv.updated_at || inv.created_at);
        const oid = inv.outlet_id || '__none__';
        if (!perOutlet.has(oid)) perOutlet.set(oid, { d: 0, dc: 0, w: 0, wc: 0 });
        const bucket = perOutlet.get(oid)!;
        const amt = Number(inv.total_amount) || 0;
        if (ts >= startOfWeek) { bucket.w += amt; bucket.wc += 1; }
        if (ts >= startOfDay) { bucket.d += amt; bucket.dc += 1; }
      }

      const list: OutletRow[] = outlets.map((o: any) => {
        const b = perOutlet.get(o.id) || { d: 0, dc: 0, w: 0, wc: 0 };
        const owner: any = profileById.get(o.user_id);
        return {
          id: o.id,
          name: o.name,
          user_id: o.user_id,
          whatsapp_number: o.whatsapp_number,
          ownerPhone: owner?.phone || null,
          ownerName: owner?.full_name || null,
          dailyRevenue: b.d, dailyCount: b.dc,
          weeklyRevenue: b.w, weeklyCount: b.wc,
        };
      }).sort((a, b) => b.weeklyRevenue - a.weeklyRevenue);

      setRows(list);
    } catch (e: any) {
      toast.error(e.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) void fetchAll();
    const ch = supabase
      .channel('admin-reports-invoices')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => isAdmin && fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [isAdmin]);

  const filtered = useMemo(
    () => rows.filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase())),
    [rows, search]
  );

  const openWhatsApp = (row: OutletRow, type: 'daily' | 'weekly') => {
    setSelected(row);
    setReportType(type);
    const label = type === 'daily' ? "aujourd'hui" : 'des 7 derniers jours';
    const rev = type === 'daily' ? row.dailyRevenue : row.weeklyRevenue;
    const count = type === 'daily' ? row.dailyCount : row.weeklyCount;
    setCustomMessage(
      `Bonjour${row.ownerName ? ' ' + row.ownerName : ''} 👋\n\n` +
      `Voici le rapport ${label} de votre point de vente *${row.name}* :\n\n` +
      `💰 Chiffre d'affaires : *${fmt(rev)}*\n` +
      `🧾 Factures encaissées : *${count}*\n\n` +
      `Bonne journée !\nL'équipe Querox`
    );
  };

  const sendWhatsApp = () => {
    if (!selected) return;
    const phone = (selected.whatsapp_number || selected.ownerPhone || '').replace(/[^\d]/g, '');
    if (!phone) { toast.error('Aucun numéro WhatsApp trouvé pour ce compte'); return; }
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(customMessage)}`;
    window.open(url, '_blank');
    setSelected(null);
  };

  if (authLoading) return <div className="p-8">Chargement…</div>;
  if (!isAdmin) return <UnauthorizedAccess />;

  return (
    <PageWithSidebar>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg"><FileText className="h-6 w-6 text-primary" /></div>
            <div>
              <h1 className="text-3xl font-bold">Rapports par PDV</h1>
              <p className="text-muted-foreground">Rapports temps réel · Envoi direct sur WhatsApp</p>
            </div>
          </div>
          <Button variant="outline" onClick={fetchAll} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Rafraîchir
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Rechercher un PDV…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="grid gap-3">
          {filtered.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold truncate">{r.name}</h3>
                    {r.ownerName && <Badge variant="outline">{r.ownerName}</Badge>}
                    {!(r.whatsapp_number || r.ownerPhone) && (
                      <Badge variant="destructive" className="text-xs">Sans WhatsApp</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-6 text-sm">
                  <div>
                    <div className="text-muted-foreground text-xs">Aujourd'hui</div>
                    <div className="font-bold">{fmt(r.dailyRevenue)}</div>
                    <div className="text-xs text-muted-foreground">{r.dailyCount} facture(s)</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs flex items-center gap-1"><TrendingUp className="w-3 h-3" />7 jours</div>
                    <div className="font-bold">{fmt(r.weeklyRevenue)}</div>
                    <div className="text-xs text-muted-foreground">{r.weeklyCount} facture(s)</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openWhatsApp(r, 'daily')}>
                    <MessageCircle className="w-4 h-4 mr-1" />Journalier
                  </Button>
                  <Button size="sm" onClick={() => openWhatsApp(r, 'weekly')}>
                    <MessageCircle className="w-4 h-4 mr-1" />Hebdo
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!loading && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Aucun PDV trouvé.</p>
          )}
        </div>

        {selected && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <Card className="max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <CardTitle>Envoyer le rapport {reportType === 'daily' ? 'journalier' : 'hebdomadaire'}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Destinataire : {selected.name} · {selected.whatsapp_number || selected.ownerPhone || 'aucun numéro'}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Label>Message personnalisé</Label>
                <Textarea rows={10} value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" onClick={() => setSelected(null)}>Annuler</Button>
                  <Button onClick={sendWhatsApp}>
                    <MessageCircle className="w-4 h-4 mr-2" />Ouvrir WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PageWithSidebar>
  );
};

export default AdminReports;
