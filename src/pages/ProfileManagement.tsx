import React, { useState } from 'react';
import { useOutlets } from '@/hooks/useOutlets';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Trash2, UserPlus, Shield, Copy, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

type OutletRole = 'proprietaire' | 'superviseur' | 'comptable' | 'caissier';

const ROLE_LABELS: Record<OutletRole, string> = {
  proprietaire: 'Propriétaire',
  superviseur: 'Superviseur',
  comptable: 'Comptable',
  caissier: 'Caissier'
};

const ROLE_COLORS: Record<OutletRole, string> = {
  proprietaire: 'bg-yellow-100 text-yellow-800',
  superviseur: 'bg-blue-100 text-blue-800',
  comptable: 'bg-green-100 text-green-800',
  caissier: 'bg-purple-100 text-purple-800'
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
  const { selectedOutletId } = useOutlets();
  const queryClient = useQueryClient();
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileRole, setNewProfileRole] = useState<OutletRole>('caissier');
  const [showCodes, setShowCodes] = useState<Record<string, boolean>>({});

  const { data: outletProfiles, isLoading } = useQuery({
    queryKey: ['outlet-profiles', selectedOutletId],
    queryFn: async () => {
      if (!selectedOutletId) return [];

      const { data, error } = await supabase
        .from('outlet_profiles')
        .select('*')
        .eq('outlet_id', selectedOutletId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as OutletProfile[];
    },
    enabled: !!selectedOutletId
  });

  const addProfileMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOutletId || !newProfileName) return;

      // Generate access code
      const { data: codeData, error: codeError } = await supabase.rpc('generate_outlet_access_code', {
        _outlet_id: selectedOutletId,
        _role: newProfileRole
      });

      if (codeError) throw codeError;

      // Create profile
      const { data, error } = await supabase
        .from('outlet_profiles')
        .insert({
          outlet_id: selectedOutletId,
          profile_name: newProfileName,
          role: newProfileRole,
          access_code: codeData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Profil créé ! Code: ${data?.access_code}`);
      setNewProfileName('');
      setNewProfileRole('caissier');
      queryClient.invalidateQueries({ queryKey: ['outlet-profiles'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création');
    }
  });

  const toggleProfileMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('outlet_profiles')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Statut du profil mis à jour');
      queryClient.invalidateQueries({ queryKey: ['outlet-profiles'] });
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    }
  });

  const deleteProfileMutation = useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase
        .from('outlet_profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Profil supprimé');
      queryClient.invalidateQueries({ queryKey: ['outlet-profiles'] });
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    }
  });

  const copyAccessCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copié dans le presse-papier !');
  };

  const toggleCodeVisibility = (profileId: string) => {
    setShowCodes(prev => ({ ...prev, [profileId]: !prev[profileId] }));
  };

  const handleAddProfile = () => {
    if (!newProfileName.trim()) {
      toast.error('Veuillez entrer un nom de profil');
      return;
    }
    addProfileMutation.mutate();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gestion des Profils
          </CardTitle>
          <CardDescription>
            Gérez les profils d'accès pour ce point de vente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Profile Form */}
          <div className="border rounded-lg p-4 space-y-4 bg-blue-50">
            <h3 className="font-semibold flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Créer un nouveau profil
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profileName">Nom du profil</Label>
                <Input
                  id="profileName"
                  placeholder="Ex: Caissier Principal"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select value={newProfileRole} onValueChange={(v) => setNewProfileRole(v as OutletRole)}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="superviseur">Superviseur</SelectItem>
                    <SelectItem value="comptable">Comptable</SelectItem>
                    <SelectItem value="caissier">Caissier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleAddProfile}
                  disabled={addProfileMutation.isPending}
                  className="w-full"
                >
                  {addProfileMutation.isPending ? 'Création...' : 'Créer le profil'}
                </Button>
              </div>
            </div>
            <p className="text-xs text-blue-600">
              Un code d'accès unique sera généré automatiquement (format: QRX-XXX-XXXX)
            </p>
          </div>

          {/* Profiles List */}
          <div className="space-y-3">
            <h3 className="font-semibold">Profils existants ({outletProfiles?.length || 0})</h3>
            {outletProfiles && outletProfiles.length > 0 ? (
              <div className="space-y-2">
                {outletProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className={`p-4 border rounded-lg ${profile.is_active ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <p className="font-medium text-lg">{profile.profile_name}</p>
                          <Badge className={ROLE_COLORS[profile.role]}>
                            {ROLE_LABELS[profile.role]}
                          </Badge>
                          {!profile.is_active && (
                            <Badge variant="destructive">Désactivé</Badge>
                          )}
                        </div>

                        {/* Access Code */}
                        <div className="flex items-center gap-2 bg-gray-100 p-2 rounded">
                          <code className="font-mono text-sm flex-1">
                            {showCodes[profile.id] ? profile.access_code : '●●●●-●●●-●●●●'}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleCodeVisibility(profile.id)}
                            className="h-8 w-8"
                          >
                            {showCodes[profile.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyAccessCode(profile.access_code)}
                            className="h-8 w-8"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Last Login */}
                        <p className="text-xs text-gray-500">
                          {profile.last_login_at 
                            ? `Dernière connexion: ${new Date(profile.last_login_at).toLocaleString('fr-FR')}`
                            : 'Jamais connecté'}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`active-${profile.id}`} className="text-xs">
                            {profile.is_active ? 'Actif' : 'Inactif'}
                          </Label>
                          <Switch
                            id={`active-${profile.id}`}
                            checked={profile.is_active}
                            onCheckedChange={(checked) => 
                              toggleProfileMutation.mutate({ id: profile.id, isActive: checked })
                            }
                          />
                        </div>
                        {profile.role !== 'proprietaire' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteProfileMutation.mutate(profile.id)}
                            disabled={deleteProfileMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                Aucun profil créé pour ce point de vente
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
