
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Shield, User } from "lucide-react";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  is_system: boolean;
  created_at: string;
}

const RolesManager: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: ''
  });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des rôles:', error);
        toast.error("Erreur lors du chargement des rôles");
        return;
      }

      if (data) {
        setRoles(data as Role[]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors du chargement des rôles");
    } finally {
      setLoading(false);
    }
  };

  const createRole = async () => {
    try {
      const permissionsArray = newRole.permissions.split(',').map(p => p.trim()).filter(p => p);

      const { error } = await supabase
        .from('roles')
        .insert({
          name: newRole.name,
          description: newRole.description,
          permissions: permissionsArray,
          is_system: false
        });

      if (error) {
        throw error;
      }

      toast.success("Rôle créé avec succès");
      setNewRole({ name: '', description: '', permissions: '' });
      loadRoles();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la création du rôle:', error);
      toast.error("Erreur lors de la création du rôle");
    }
  };

  const updateRole = async () => {
    if (!editingRole) return;

    try {
      const { error } = await supabase
        .from('roles')
        .update({
          name: editingRole.name,
          description: editingRole.description,
          permissions: editingRole.permissions,
        })
        .eq('id', editingRole.id);

      if (error) {
        throw error;
      }

      toast.success("Rôle mis à jour avec succès");
      setEditingRole(null);
      loadRoles();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      toast.error("Erreur lors de la mise à jour du rôle");
    }
  };

  const deleteRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);

      if (error) {
        throw error;
      }

      toast.success("Rôle supprimé avec succès");
      loadRoles();
    } catch (error) {
      console.error('Erreur lors de la suppression du rôle:', error);
      toast.error("Erreur lors de la suppression du rôle");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement des rôles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Rôles</h2>
          <p className="text-muted-foreground">Gérez les rôles et permissions de votre plateforme</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Rôle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau rôle</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nom
                </Label>
                <Input
                  type="text"
                  id="name"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="permissions" className="text-right">
                  Permissions (séparées par des virgules)
                </Label>
                <Input
                  type="text"
                  id="permissions"
                  value={newRole.permissions}
                  onChange={(e) => setNewRole({ ...newRole, permissions: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <Button onClick={createRole}>Créer</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <Card key={role.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {role.is_system ? (
                    <Shield className="h-5 w-5 text-orange-500" />
                  ) : (
                    <User className="h-5 w-5 text-blue-500" />
                  )}
                  <CardTitle className="text-lg">{role.name}</CardTitle>
                </div>
                
                {role.is_system && (
                  <Badge variant="secondary" className="text-xs">
                    Système
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {role.description}
              </p>
              
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Permissions:</p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.map((permission, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {!role.is_system && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingRole(role);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteRole(role.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditModalOpen && !!editingRole} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le rôle</DialogTitle>
          </DialogHeader>
          {editingRole && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nom
                </Label>
                <Input
                  type="text"
                  id="name"
                  value={editingRole.name}
                  onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={editingRole.description}
                  onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="permissions" className="text-right">
                  Permissions (séparées par des virgules)
                </Label>
                <Input
                  type="text"
                  id="permissions"
                  value={editingRole.permissions.join(', ')}
                  onChange={(e) => {
                    const permissionsArray = e.target.value.split(',').map(p => p.trim()).filter(p => p);
                    setEditingRole({ ...editingRole, permissions: permissionsArray });
                  }}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <Button onClick={updateRole}>Mettre à jour</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RolesManager;
