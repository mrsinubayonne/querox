import React, { useEffect, useState } from 'react';
import PageWithSidebar from '@/components/PageWithSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import { toast } from 'sonner';

interface Announcement {
  id: string;
  title: string;
  message: string;
  kind: 'modal' | 'banner' | 'both';
  variant: 'info' | 'success' | 'warning' | 'destructive';
  is_active: boolean;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
}

const AdminAnnouncements: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, loading } = useSubscription();
  const [items, setItems] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [kind, setKind] = useState<'modal' | 'banner' | 'both'>('modal');
  const [variant, setVariant] = useState<'info' | 'success' | 'warning' | 'destructive'>('info');
  const [endsAt, setEndsAt] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data, error } = await (supabase as any)
      .from('app_announcements')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return toast.error(error.message);
    setItems((data as Announcement[]) || []);
  };

  useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin]);

  const submit = async () => {
    if (!title.trim() || !message.trim()) return toast.error('Titre et message requis');
    setSaving(true);
    const { error } = await (supabase as any).from('app_announcements').insert({
      title: title.trim(),
      message: message.trim(),
      kind,
      variant,
      is_active: true,
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      created_by: user?.id,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success('Publication envoyée à tous les comptes');
    setTitle(''); setMessage(''); setEndsAt('');
    load();
  };

  const toggleActive = async (a: Announcement) => {
    const { error } = await (supabase as any)
      .from('app_announcements').update({ is_active: !a.is_active }).eq('id', a.id);
    if (error) return toast.error(error.message);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Supprimer cette publication ?')) return;
    const { error } = await (supabase as any).from('app_announcements').delete().eq('id', id);
    if (error) return toast.error(error.message);
    load();
  };

  if (loading) return <div className="p-8">Chargement…</div>;
  if (!isAdmin) return <UnauthorizedAccess />;

  return (
    <PageWithSidebar>
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg"><Megaphone className="h-6 w-6 text-primary" /></div>
          <div>
            <h1 className="text-3xl font-bold">Communications globales</h1>
            <p className="text-muted-foreground">Pop-ups et bannières visibles par tous les comptes clients</p>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5" />Nouvelle publication</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label>Titre</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Maintenance prévue dimanche" />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={kind} onValueChange={(v: any) => setKind(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modal">Pop-up</SelectItem>
                    <SelectItem value="banner">Bannière</SelectItem>
                    <SelectItem value="both">Pop-up + Bannière</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Message</Label>
              <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Contenu de la communication…" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Style</Label>
                <Select value={variant} onValueChange={(v: any) => setVariant(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Information (bleu)</SelectItem>
                    <SelectItem value="success">Succès (vert)</SelectItem>
                    <SelectItem value="warning">Attention (orange)</SelectItem>
                    <SelectItem value="destructive">Urgent (rouge)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date de fin (optionnel)</Label>
                <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
              </div>
            </div>
            <Button onClick={submit} disabled={saving} className="w-full">
              {saving ? 'Envoi…' : 'Publier à tous les comptes'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Historique</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {items.length === 0 && <p className="text-sm text-muted-foreground">Aucune publication.</p>}
            {items.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{a.title}</span>
                    <Badge variant="secondary">{a.kind}</Badge>
                    <Badge variant="outline">{a.variant}</Badge>
                    {a.is_active ? <Badge className="bg-green-500">Actif</Badge> : <Badge variant="outline">Inactif</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{a.message}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => toggleActive(a)}>
                    {a.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(a.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageWithSidebar>
  );
};

export default AdminAnnouncements;
