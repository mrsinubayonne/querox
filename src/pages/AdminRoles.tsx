
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { Search, UserPlus, Shield } from "lucide-react";
import RolesManager from '@/components/admin/RolesManager';

interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
}

const AdminRoles: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Charger les utilisateurs avec leurs rôles
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, full_name');

      if (usersError) {
        throw usersError;
      }

      // Charger les rôles des utilisateurs
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Erreur lors du chargement des rôles:', rolesError);
      }

      // Combiner les données
      const usersWithRoles = usersData?.map(user => ({
        ...user,
        role: userRoles?.find(ur => ur.user_id === user.id)?.role || 'user'
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // Vérifier si l'utilisateur a déjà un rôle
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingRole) {
        // Mettre à jour le rôle existant
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole as any })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Créer un nouveau rôle
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole as any });

        if (error) throw error;
      }

      toast.success("Rôle mis à jour avec succès");
      loadUsers();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      toast.error("Erreur lors de la mise à jour du rôle");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Rôles et Utilisateurs</h1>
          <p className="text-muted-foreground">Gérez les permissions et rôles de vos utilisateurs</p>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'users' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('users')}
          className="rounded-md"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Utilisateurs
        </Button>
        <Button
          variant={activeTab === 'roles' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('roles')}
          className="rounded-md"
        >
          <Shield className="h-4 w-4 mr-2" />
          Rôles
        </Button>
      </div>

      {activeTab === 'roles' && (
        <RolesManager />
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Liste des utilisateurs */}
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {(user.full_name || user.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{user.full_name || 'Nom non défini'}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge variant={user.role === 'admin' ? 'default' : user.role === 'moderator' ? 'outline' : 'secondary'}>
                        {user.role === 'admin' ? 'Administrateur' : user.role === 'moderator' ? 'Modérateur' : 'Utilisateur'}
                      </Badge>
                      
                      <Select
                        value={user.role}
                        onValueChange={(value) => updateUserRole(user.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Utilisateur</SelectItem>
                          <SelectItem value="admin">Administrateur</SelectItem>
                          <SelectItem value="moderator">Modérateur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminRoles;
