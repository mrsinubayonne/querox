import React, { useMemo, useState } from 'react';
import PageWithSidebar from '@/components/PageWithSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { History, Trash2, RefreshCw, PlusCircle, PencilLine, XCircle } from 'lucide-react';
import { getAuditLog, clearAuditLog, AuditEntry } from '@/lib/profileAccess';
import { useOutletProfile } from '@/hooks/useOutletProfile';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';

const ACTION_META: Record<AuditEntry['action'], { icon: React.ElementType; className: string; label: string }> = {
  ajout: { icon: PlusCircle, className: 'bg-emerald-500', label: 'Ajout' },
  modification: { icon: PencilLine, className: 'bg-blue-500', label: 'Modification' },
  suppression: { icon: XCircle, className: 'bg-destructive', label: 'Suppression' },
};

const Journal: React.FC = () => {
  const { isProfileAuthenticated, loading } = useOutletProfile();
  const [entries, setEntries] = useState<AuditEntry[]>(() => getAuditLog());
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) =>
      [e.actor, e.entity, e.details, ACTION_META[e.action].label]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [entries, search]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${String(d.getFullYear()).slice(-2)} ${p(d.getHours())}:${p(d.getMinutes())}`;
  };

  if (loading) return null;
  if (isProfileAuthenticated()) return <Navigate to="/dashboard" replace />;


  return (
    <PageWithSidebar>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center">
              <History className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Journal d'activité</h1>
              <p className="text-muted-foreground">
                Tous les ajouts, modifications et suppressions, avec l'auteur de chaque action.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setEntries(getAuditLog()); toast.success('Journal actualisé'); }}>
              <RefreshCw className="w-4 h-4 mr-2" /> Actualiser
            </Button>
            <Button
              variant="outline"
              className="text-destructive"
              onClick={() => {
                if (confirm("Vider le journal d'activité ?")) {
                  clearAuditLog();
                  setEntries([]);
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Vider
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Dernières actions</span>
              <Badge variant="secondary">{filtered.length}</Badge>
            </CardTitle>
            <CardDescription>Journal local du poste, conservé sur les 400 dernières actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Rechercher par profil, section ou action…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune action enregistrée.</p>
            ) : (
              <div className="space-y-2">
                {filtered.map((e) => {
                  const meta = ACTION_META[e.action];
                  const Icon = meta.icon;
                  return (
                    <div key={e.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${meta.className}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {meta.label} — {e.entity}
                          {e.details ? <span className="text-muted-foreground"> · {e.details}</span> : null}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {e.actor} <span className="capitalize">({e.role})</span> · {formatDate(e.at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageWithSidebar>
  );
};

export default Journal;
