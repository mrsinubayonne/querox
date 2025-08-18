import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ModernSidebar from '@/components/ModernSidebar';
import RolesManager from '@/components/admin/RolesManager';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import { Users, Shield, Edit, Search } from 'lucide-react';

const ADMIN_EMAILS = [
  'emmanuelhussinbayonne@gmail.com',
  'bayonnecastadorkhloe@gmail.com', 
  'mrsinulion@gmail.com'
];

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  created_at: string;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  is_system_role: boolean;
}

const AdminRoles: React.FC = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    checkAuthorization();
  }, [user]);

  useEffect(() => {
    if (isAuthorized) {
      fetchUsersWithRoles();
      fetchRoles();
    }
  }, [isAuthorized]);

  const checkAuthorization = () => {
    console.log('🔍 AdminRoles - Vérification des autorisations');
    
    if (!user) {
      console.log('❌ Aucun utilisateur connecté');
      setLoading(false);
      return;
    }

    if (ADMIN_EMAILS.includes(user.email || '')) {
      console.log('✅ Utilisateur autorisé comme admin QUEROX');
      setIsAuthorized(true);
    } else {
      console.log('❌ Utilisateur non autorisé');
      setIsAuthorized(false);
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas l'autorisation d'accéder à la gestion des rôles",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const fetchRoles = async () => {
    try {
      // Utiliser une requête avec cast pour contourner le problème de types
      const { data, error } = await (supabase as any)
        .from('roles')
        .select('*')
        .order('name');

      if (error) throw error;
      setRoles(data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des rôles:', error);
    }
  };

  const fetchUsersWithRoles = async () => {
    console.log('👥 Récupération des utilisateurs et leurs rôles...');
    
    try {
      // Récupérer tous les profils utilisateurs
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('❌ Erreur lors de la récupération des profils:', profilesError);
        throw profilesError;
      }

      // Récupérer tous les rôles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) {
        console.error('❌ Erreur lors de la récupération des rôles:', rolesError);
        throw rolesError;
      }

      // Combiner les données
      const usersWithRoles: UserWithRole[] = profiles?.map(profile => {
        const userRole = userRoles?.find(role => role.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email || '',
          full_name: profile.full_name,
          role: userRole?.role || null,
          created_at: profile.created_at
        };
      }) || [];

      setUsers(usersWithRoles);
      console.log('✅ Utilisateurs chargés:', usersWithRoles.length);

    } catch (error: any) {
      console.error('💥 Erreur lors du chargement des utilisateurs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: string | null) => {
    console.log('🔄 Modification du rôle utilisateur:', { userId, newRole });
    
    try {
      if (newRole === null) {
        // Retirer le rôle
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Ajouter ou mettre à jour le rôle
        const { error } = await supabase
          .from('user_roles')
          .upsert({
            user_id: userId,
            role: newRole
          }, {
            onConflict: 'user_id,role'
          });

        if (error) throw error;
      }

      toast({
        title: "Succès",
        description: `Rôle ${newRole ? `modifié vers ${newRole}` : 'retiré'}`,
      });

      // Recharger les données
      fetchUsersWithRoles();

    } catch (error: any) {
      console.error('💥 Erreur lors de la modification du rôle:', error);
      toast({
        title: "Erreur",
        description: `Impossible de modifier le rôle: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string | null) => {
    if (role === 'admin') {
      return <Badge variant="destructive" className="bg-red-100 text-red-800">Admin</Badge>;
    }
    if (role === 'user') {
      return <Badge variant="secondary">Utilisateur</Badge>;
    }
    if (role) {
      return <Badge variant="outline">{role}</Badge>;
    }
    return <Badge variant="outline">Aucun rôle</Badge>;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = selectedRole === 'all' || user.role === selectedRole || 
                       (selectedRole === 'none' && user.role === null);
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = () => {
    fetchRoles();
    fetchUsersWithRoles();
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Vérification des autorisations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex h-screen bg-gray-50">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <UnauthorizedAccess userEmail={user?.email} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestion des Rôles QUEROX
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez les rôles et assignez-les aux membres de l'équipe QUEROX
            </p>
            <div className="mt-2 text-sm text-green-600 font-medium">
              ✓ Connecté en tant qu'administrateur: {user?.email}
            </div>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Attribution des Rôles
              </TabsTrigger>
              <TabsTrigger value="roles" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Gestion des Rôles
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              {/* Filtres */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Filtres
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Rechercher par email ou nom..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="w-48">
                      <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filtrer par rôle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les rôles</SelectItem>
                          {roles.map(role => (
                            <SelectItem key={role.id} value={role.name}>
                              {role.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="none">Aucun rôle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Liste des utilisateurs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Utilisateurs QUEROX ({filteredUsers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredUsers.map((userItem) => (
                      <div key={userItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">{userItem.full_name || 'Nom non défini'}</h3>
                              <p className="text-sm text-gray-600">{userItem.email}</p>
                              <p className="text-xs text-gray-500">
                                Inscrit le {new Date(userItem.created_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {getRoleBadge(userItem.role)}
                          
                          <div className="flex gap-2 flex-wrap">
                            {roles.map(role => (
                              <Button
                                key={role.id}
                                variant="outline"
                                size="sm"
                                onClick={() => updateUserRole(userItem.id, role.name)}
                                disabled={userItem.role === role.name}
                                className={role.name === 'admin' ? 'text-red-600 hover:text-red-700' : ''}
                              >
                                <Shield className="w-4 h-4 mr-1" />
                                {role.name}
                              </Button>
                            ))}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateUserRole(userItem.id, null)}
                              disabled={userItem.role === null}
                            >
                              Retirer
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {filteredUsers.length === 0 && (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
                        <p className="text-gray-600">
                          {searchTerm || selectedRole !== 'all' ? 'Essayez de modifier vos filtres' : 'Aucun utilisateur dans la base de données'}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roles">
              <RolesManager onRoleChange={handleRoleChange} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminRoles;
