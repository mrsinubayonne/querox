
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: any[];
  is_system_role: boolean;
  created_at: string;
}

interface RolesManagerProps {
  onRoleChange?: () => void;
}

const RolesManager: React.FC<RolesManagerProps> = ({ onRoleChange }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      // Utiliser une requête SQL directe pour contourner le problème de types
      const { data, error } = await supabase.rpc('execute_sql', {
        query: 'SELECT * FROM roles ORDER BY is_system_role DESC, name ASC'
      });

      if (error) {
        // Fallback: essayer avec une requête basique
        const { data: fallbackData, error: fallbackError } = await (supabase as any)
          .from('roles')
          .select('*')
          .order('is_system_role', { ascending: false })
          .order('name');

        if (fallbackError) throw fallbackError;
        setRoles(fallbackData || []);
      } else {
        setRoles(data || []);
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des rôles:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les rôles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du rôle est requis",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingRole) {
        // Mise à jour d'un rôle existant
        const { error } = await (supabase as any)
          .from('roles')
          .update({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingRole.id);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Rôle modifié avec succès",
        });
      } else {
        // Création d'un nouveau rôle
        const { error } = await (supabase as any)
          .from('roles')
          .insert({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            is_system_role: false
          });

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Nouveau rôle créé avec succès",
        });
      }

      setIsModalOpen(false);
      setEditingRole(null);
      setFormData({ name: '', description: '' });
      fetchRoles();
      onRoleChange?.();

    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde du rôle:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder le rôle",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (role: Role) => {
    if (role.is_system_role) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer un rôle système",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${role.name}" ?`)) {
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from('roles')
        .delete()
        .eq('id', role.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Rôle supprimé avec succès",
      });

      fetchRoles();
      onRoleChange?.();

    } catch (error: any) {
      console.error('Erreur lors de la suppression du rôle:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le rôle",
        variant: "destructive",
      });
    }
  };

  const openCreateModal = () => {
    setEditingRole(null);
    setFormData({ name: '', description: '' });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Chargement des rôles...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Gestion des Rôles ({roles.length})
          </CardTitle>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateModal} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nouveau Rôle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingRole ? 'Modifier le rôle' : 'Créer un nouveau rôle'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nom du rôle <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: moderator, editor, etc."
                    disabled={editingRole?.is_system_role}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description du rôle et de ses responsabilités"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingRole ? 'Modifier' : 'Créer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {roles.map((role) => (
            <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{role.name}</h4>
                  {role.is_system_role && (
                    <Badge variant="secondary" className="text-xs">
                      Système
                    </Badge>
                  )}
                </div>
                {role.description && (
                  <p className="text-sm text-gray-600">{role.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Créé le {new Date(role.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(role)}
                  className="flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Modifier
                </Button>
                
                {!role.is_system_role && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(role)}
                    className="text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Supprimer
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {roles.length === 0 && (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rôle trouvé</h3>
              <p className="text-gray-600">Créez votre premier rôle personnalisé</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RolesManager;
