import React, { useState } from 'react';
import { useOutlets } from '@/hooks/useOutlets';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Trash2, UserPlus, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

interface OutletUserRole {
  id: string;
  role: OutletRole;
  created_at: string;
  profiles: {
    email: string;
    full_name: string;
  };
}

export const ProfileManagement: React.FC = () => {
  const { profile } = useProfile();
  const { selectedOutletId } = useOutlets();
  const queryClient = useQueryClient();
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<OutletRole>('caissier');

  const { data: outletRoles, isLoading } = useQuery({
    queryKey: ['outlet-roles', selectedOutletId],
    queryFn: async () => {
      if (!selectedOutletId) return [];

      const { data, error } = await supabase
        .from('outlet_user_roles')
        .select(`
          id,
          role,
          created_at,
          user_id
        `)
        .eq('outlet_id', selectedOutletId);

      if (error) throw error;

      // Fetch profiles separately
      const userIds = data?.map(r => r.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      // Combine data
      const combined = data?.map(role => ({
        ...role,
        profiles: profiles?.find(p => p.id === role.user_id) || { email: '', full_name: '' }
      }));

      return combined as OutletUserRole[];
    },
    enabled: !!selectedOutletId
  });

  const addUserMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOutletId || !newUserEmail) return;

      // Find user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', newUserEmail)
        .single();

      if (userError) {
        throw new Error("Utilisateur non trouvé avec cet email");
      }

      // Add role
      const { error: roleError } = await supabase
        .from('outlet_user_roles')
        .insert({
          outlet_id: selectedOutletId,
          user_id: userData.id,
          role: newUserRole
        });

      if (roleError) throw roleError;
    },
    onSuccess: () => {
      toast.success('Utilisateur ajouté avec succès');
      setNewUserEmail('');
      setNewUserRole('caissier');
      queryClient.invalidateQueries({ queryKey: ['outlet-roles'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'ajout');
    }
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from('outlet_user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Profil supprimé');
      queryClient.invalidateQueries({ queryKey: ['outlet-roles'] });
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    }
  });

  const handleAddUser = () => {
    if (!newUserEmail) {
      toast.error('Veuillez entrer un email');
      return;
    }
    addUserMutation.mutate();
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
          {/* Add User Form */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Ajouter un utilisateur
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email de l'utilisateur</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Profil</Label>
                <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as OutletRole)}>
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
                  onClick={handleAddUser}
                  disabled={addUserMutation.isPending}
                  className="w-full"
                >
                  Ajouter
                </Button>
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-3">
            <h3 className="font-semibold">Utilisateurs avec accès</h3>
            {outletRoles && outletRoles.length > 0 ? (
              <div className="space-y-2">
                {outletRoles.map((roleEntry) => (
                  <div
                    key={roleEntry.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{roleEntry.profiles?.full_name || 'Nom non défini'}</p>
                      <p className="text-sm text-gray-500">{roleEntry.profiles?.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={ROLE_COLORS[roleEntry.role]}>
                        {ROLE_LABELS[roleEntry.role]}
                      </Badge>
                      {roleEntry.role !== 'proprietaire' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteRoleMutation.mutate(roleEntry.id)}
                          disabled={deleteRoleMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Aucun utilisateur avec accès</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
