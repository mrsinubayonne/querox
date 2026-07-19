import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOutlets } from '@/hooks/useOutlets';
import { useOutletProfile } from '@/hooks/useOutletProfile';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Trash2, UserPlus, Shield, Copy, CheckCircle2, Briefcase, Calculator, Wallet, Eye, LogIn, KeyRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

type OutletRole = 'proprietaire' | 'superviseur' | 'comptable' | 'caissier';

const ROLES: { value: Exclude<OutletRole, 'proprietaire'>; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'caissier',    label: 'Caissier',    icon: Wallet,     color: 'from-purple-500 to-fuchsia-500' },
  { value: 'comptable',   label: 'Comptable',   icon: Calculator, color: 'from-emerald-500 to-teal-500' },
  { value: 'superviseur', label: 'Superviseur', icon: Briefcase,  color: 'from-blue-500 to-indigo-500' },
];

const ROLE_LABELS: Record<OutletRole, string> = {
  proprietaire: 'Propriétaire',
  superviseur: 'Superviseur',
  comptable: 'Comptable',
  caissier: 'Caissier'
};

interface OutletProfile {
  id: string;
  role: OutletRole;
  access_code: string;
  profile_name: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export const ProfileManagement: React.FC = () => {
  const { selectedOutletId, outlets } = useOutlets();
  const { login: loginProfile } = useOutletProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [role, setRole] = useState<Exclude<OutletRole, 'proprietaire'>>('caissier');
  const [justCreated, setJustCreated] = useState<{ name: string; code: string } | null>(null);

  const currentOutletName = outlets?.find((o: any) => o.id === selectedOutletId)?.name || '';

  const { data: outletProfiles, isLoading } = useQuery({
    queryKey: ['outlet-profiles', selectedOutletId],
    queryFn: async () => {
      if (!selectedOutletId) return [];
      const { data, error } = await supabase
        .from('outlet_profiles' as any)
        .select('*')
        .eq('outlet_id', selectedOutletId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as any) as OutletProfile[];
    },
    enabled: !!selectedOutletId
  });

  const addProfileMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOutletId) throw new Error('Aucun point de vente sélectionné');
      let plainCode = customCode.trim().toUpperCase();
      if (!plainCode) {
        const { data: codeData, error: codeError } = await supabase.rpc('generate_outlet_access_code' as any, {
          _outlet_id: selectedOutletId,
          _role: role
        });
        if (codeError) throw codeError;
        plainCode = codeData as any;
      } else if (plainCode.length < 4) {
        throw new Error('Le code doit faire au moins 4 caractères');
      }
      const { data, error } = await supabase
        .from('outlet_profiles' as any)
        .insert({
          outlet_id: selectedOutletId,
          profile_name: name.trim(),
          role,
          access_code: plainCode,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data as any;
    },
    onSuccess: (data: any) => {
      setJustCreated({ name: data.profile_name, code: data.access_code });
      setName('');
      setCustomCode('');
      setRole('caissier');
      queryClient.invalidateQueries({ queryKey: ['outlet-profiles'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création');
    }
  });

  const connectAs = (profile: OutletProfile) => {
    if (!selectedOutletId) return;
    loginProfile({
      profileId: profile.id,
      outletId: selectedOutletId,
      role: profile.role,
      profileName: profile.profile_name,
      outletName: currentOutletName,
      ownerId: user?.id || '',
    });
    toast.success(`Connecté en tant que ${profile.profile_name}`);
    navigate('/');
  };


  const toggleProfileMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('outlet_profiles' as any)
        .update({ is_active: isActive } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['outlet-profiles'] }),
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const deleteProfileMutation = useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase.from('outlet_profiles' as any).delete().eq('id', profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Profil supprimé');
      queryClient.invalidateQueries({ queryKey: ['outlet-profiles'] });
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copié');
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error('Donnez un nom au profil');
      return;
    }
    addProfileMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Success card just after creation */}
      {justCreated && (
        <Card className="border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800">
          <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                  Profil « {justCreated.name} » créé
                </p>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80">
                  Partagez ce code — il permet la connexion.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700 rounded-lg px-3 py-2">
              <code className="font-mono text-lg tracking-wider font-bold text-emerald-900 dark:text-emerald-100">
                {justCreated.code}
              </code>
              <Button size="sm" variant="ghost" onClick={() => copyCode(justCreated.code)}>
                <Copy className="w-4 h-4 mr-1" /> Copier
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setJustCreated(null)}>OK</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Ajouter un profil
          </CardTitle>
          <CardDescription>
            Choisissez un rôle, donnez un nom — un code d'accès est généré automatiquement.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Role picker as icon cards */}
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const active = role === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={cn(
                    'group relative rounded-xl border-2 p-3 text-left transition active:scale-[0.97]',
                    active
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/40 bg-background'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center mb-2',
                    r.color
                  )}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm font-medium">{r.label}</p>
                  {active && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Name */}
          <Input
            placeholder={`Nom du ${ROLE_LABELS[role].toLowerCase()} (ex : Awa)`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="h-11"
          />

          {/* Custom code (optional) + create */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Code d'accès (optionnel — auto si vide)"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                className="pl-9 h-11 font-mono tracking-wider uppercase"
                maxLength={20}
              />
            </div>
            <Button
              onClick={handleCreate}
              disabled={addProfileMutation.isPending || !name.trim()}
              size="lg"
              className="h-11 sm:w-auto"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {addProfileMutation.isPending ? 'Création…' : 'Créer'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Les accès sont pré-configurés selon le rôle sélectionné.
          </p>
        </CardContent>
      </Card>

      {/* Profiles list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Profils existants</span>
            <Badge variant="secondary">{outletProfiles?.length || 0}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-6">Chargement…</p>
          ) : outletProfiles && outletProfiles.length > 0 ? (
            <div className="space-y-2">
              {outletProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border transition',
                    profile.is_active ? 'bg-background' : 'bg-muted/50 opacity-70'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">{profile.profile_name}</p>
                      <Badge variant="outline" className="text-xs">
                        {ROLE_LABELS[profile.role]}
                      </Badge>
                    </div>
                    <button
                      onClick={() => copyCode(profile.access_code)}
                      className="mt-1 inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition"
                      title="Copier le code"
                    >
                      <Eye className="w-3 h-3" />
                      <span className="tracking-wider">{profile.access_code}</span>
                      <Copy className="w-3 h-3 opacity-60" />
                    </button>
                  </div>
                  {profile.is_active && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => connectAs(profile)}
                      className="h-9"
                    >
                      <LogIn className="w-4 h-4 mr-1" />
                      Se connecter
                    </Button>
                  )}
                  <Switch
                    checked={profile.is_active}
                    onCheckedChange={(checked) =>
                      toggleProfileMutation.mutate({ id: profile.id, isActive: checked })
                    }
                  />
                  {profile.role !== 'proprietaire' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(`Supprimer le profil « ${profile.profile_name} » ?`)) {
                          deleteProfileMutation.mutate(profile.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              Aucun profil pour ce point de vente
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
