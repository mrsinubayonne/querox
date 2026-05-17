import React, { useState, useEffect } from 'react';
import { useMenus } from '@/hooks/useMenus';
import { useMenuCategories } from '@/hooks/useMenuCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash, PlusCircle } from 'lucide-react';
import { MenuCategory } from '@/hooks/useMenus';
import { toast } from 'sonner';

const CategoryManager: React.FC = () => {
  const { menus, categories, loading, refetch } = useMenus();
  const { addCategory, updateCategory, deleteCategory, loading: actionLoading } = useMenuCategories();
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    menu_id: ''
  });

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        description: editingCategory.description || '',
        menu_id: editingCategory.menu_id,
      });
    } else {
      // Auto-select first menu if available
      const firstMenu = menus.length > 0 ? menus[0].id : '';
      setFormData({ 
        name: '', 
        description: '', 
        menu_id: firstMenu 
      });
    }
  }, [editingCategory, menus]);

  const getMenuName = (menuId: string) => 
    menus.find(m => m.id === menuId)?.name || 'Menu inconnu';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.menu_id) {
      toast.error("Champs requis", { description: "Veuillez renseigner le nom et sélectionner un menu." });
      return;
    }

    let success;
    if (editingCategory) {
      success = await updateCategory(editingCategory.id, {
        name: formData.name,
        description: formData.description,
      });
    } else {
      const newCategory = await addCategory(formData);
      success = !!newCategory;
    }

    if (success) {
      setEditingCategory(null);
      setFormData({ 
        name: '', 
        description: '', 
        menu_id: menus.length > 0 ? menus[0].id : '' 
      });
      await refetch();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette catégorie ? Cette action est irréversible.')) {
      const success = await deleteCategory(id);
      if (success) {
        await refetch();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Chargement des catégories...</p>
        </div>
      </div>
    );
  }

  if (menus.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestion des catégories</CardTitle>
          <CardDescription>Aucun menu disponible pour gérer les catégories.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">
            Vous devez d'abord créer un menu pour pouvoir gérer les catégories.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Liste des catégories ({categories.length})</CardTitle>
              <CardDescription>Gérez les catégories de vos menus.</CardDescription>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="text-center py-8">
                  <PlusCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune catégorie</h3>
                  <p className="text-gray-500 mb-4">
                    Commencez par créer votre première catégorie de plats.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Menu</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{getMenuName(category.menu_id)}</TableCell>
                        <TableCell className="text-gray-500">
                          {category.description || 'Aucune description'}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setEditingCategory(category)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(category.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {editingCategory ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
              </CardTitle>
              <CardDescription>
                {editingCategory 
                  ? 'Modifiez les informations de la catégorie.'
                  : 'Créez une nouvelle catégorie pour organiser vos plats.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Nom de la catégorie *
                  </label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} 
                    placeholder="Ex: Entrées, Plats principaux..."
                    required 
                  />
                </div>
                
                <div>
                  <label htmlFor="menu" className="block text-sm font-medium mb-2">
                    Menu *
                  </label>
                  <Select 
                    value={formData.menu_id} 
                    onValueChange={val => setFormData(f => ({ ...f, menu_id: val }))}
                    disabled={editingCategory !== null} // Cannot change menu when editing
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un menu..." />
                    </SelectTrigger>
                    <SelectContent>
                      {menus.map(menu => (
                        <SelectItem key={menu.id} value={menu.id}>
                          {menu.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {editingCategory && (
                    <p className="text-xs text-gray-500 mt-1">
                      Le menu ne peut pas être modifié lors de l'édition
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <Textarea 
                    id="description" 
                    value={formData.description} 
                    onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} 
                    placeholder="Description optionnelle de la catégorie..."
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  {editingCategory && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setEditingCategory(null)}
                    >
                      Annuler
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    disabled={actionLoading || !formData.name || !formData.menu_id}
                  >
                    {actionLoading ? 'Enregistrement...' : (editingCategory ? 'Mettre à jour' : 'Ajouter')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;