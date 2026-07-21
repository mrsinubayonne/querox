import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOutletProfile } from '@/hooks/useOutletProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Wallet, Calculator, Briefcase, Crown, KeyRound, ArrowRight, Building2, Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type OutletRole = 'proprietaire' | 'superviseur' | 'comptable' | 'caissier';

interface ProfileRow {
  id: string;
  outlet_id: string;
  role: OutletRole;
  profile_name: string;
  access_code: string;
  is_active: boolean;
  outlets: { id: string; name: string; user_id: string } | null;
}

const ROLE_META: Record<Exclude<OutletRole, 'proprietaire'>, { label: string; icon: React.ElementType; color: string }> = {
  caissier:    { label: 'Caissier',    icon: Wallet,     color: 'from-purple-500 to-fuchsia-500' },
  comptable:   { label: 'Comptable',   icon: Calculator, color: 'from-emerald-500 to-teal-500' },
  superviseur: { label: 'Superviseur', icon: Briefcase,  color: 'from-blue-500 to-indigo-500' },
};

const ProfileLogin: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { login: loginProfile } = useOutletProfile();
  const [selected, setSelected] = useState<ProfileRow | null>(null);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['owner-outlet-profiles', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('outlet_profiles' as any)
        .select('id, outlet_id, role, profile_name, access_code, is_active, outlets!inner(id, name, user_id)')
        .eq('outlets.user_id', user!.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data as any) as ProfileRow[];
    },
  });

  const grouped = useMemo(() => {
    const map = new Map<string, { outletName: string; items: ProfileRow[] }>();
    (profiles || []).forEach((p) => {
      const key = p.outlet_id;
      if (!map.has(key)) map.set(key, { outletName: p.outlets?.name || 'Point de vente', items: [] });
      map.get(key)!.items.push(p);
    });
    return Array.from(map.entries());
  }, [profiles]);

  const continueAsOwner = () => {
    // Skip profile step — go to PDV selection (owner mode)
    navigate('/select-outlet');
  };

  const handleConnect = async () => {
    if (!selected) return;
    const entered = code.trim().toUpperCase();
    if (!entered) {
      toast.error("Code d'accès requis");
      return;
    }
    setSubmitting(true);
    try {
      if (entered !== (selected.access_code || '').toUpperCase()) {
        toast.error("Code d'accès incorrect");
        return;
      }
      // Bind outlet immediately so downstream hooks see it
      if (selected.outlet_id) {
        localStorage.setItem('selectedOutletId', selected.outlet_id);
        try { window.dispatchEvent(new CustomEvent('outlet:changed', { detail: { id: selected.outlet_id } })); } catch {}
      }
      loginProfile({
        profileId: selected.id,
        outletId: selected.outlet_id,
        role: selected.role,
        profileName: selected.profile_name,
        outletName: selected.outlets?.name || '',
        ownerId: user?.id || '',
      });
      toast.success(`Connecté en tant que ${selected.profile_name}`);
      navigate('/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">Choisissez votre profil</h1>
          <p className="text-lg text-muted-foreground">
            Sélectionnez le profil avec lequel vous souhaitez travailler.
          </p>
        </div>

        {/* Owner bypass */}
        <Card
          className="mb-8 cursor-pointer border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 hover:shadow-lg transition"
          onClick={continueAsOwner}
        >
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">Continuer en tant que Propriétaire</p>
              <p className="text-sm text-muted-foreground">Accès complet — vous choisirez ensuite le point de vente.</p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>

        {isLoading ? (
          <p className="text-center text-muted-foreground">Chargement des profils…</p>
        ) : grouped.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center space-y-3">
              <p className="text-muted-foreground">Aucun profil équipe n'a encore été créé.</p>
              <Button variant="outline" onClick={continueAsOwner}>
                Continuer et créer des profils plus tard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {grouped.map(([outletId, group]) => (
              <div key={outletId}>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {group.outletName}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.items.map((p) => {
                    const meta = ROLE_META[p.role as Exclude<OutletRole, 'proprietaire'>] || ROLE_META.caissier;
                    const Icon = meta.icon;
                    return (
                      <button
                        key={p.id}
                        onClick={() => { setSelected(p); setCode(''); }}
                        className={cn(
                          'group text-left rounded-xl border-2 border-border bg-card p-4 transition',
                          'hover:border-primary hover:shadow-md active:scale-[0.98]'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn('w-11 h-11 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0', meta.color)}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{p.profile_name}</p>
                            <Badge variant="outline" className="text-xs mt-0.5">{meta.label}</Badge>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Code d'accès</DialogTitle>
            <DialogDescription>
              Entrez le code du profil « {selected?.profile_name} ».
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
              className="pl-9 h-11 font-mono tracking-widest uppercase text-center"
              maxLength={20}
            />
          </div>
          <Button onClick={handleConnect} disabled={submitting || !code.trim()} className="w-full h-11">
            {submitting ? 'Connexion…' : 'Se connecter'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileLogin;
