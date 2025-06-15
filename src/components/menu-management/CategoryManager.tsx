
import React, { useState, useEffect } from 'react';
import { useMenuCategories } from '@/hooks/useMenuCategories';
import { useMenuCategoryActions, MenuCategoryInput } from '@/hooks/useMenuCategoryActions';
import { useMenusList } from '@/hooks/useMenusList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type MenuCategory = ReturnType<typeof useMenuCategories>['categories'][0];

const CategoryManager: React.FC = () => {
  const { categories, loading: loadingCategories, refetch: refetchCategories } = useMenuCategories();
  const { menus, loading: loadingMenus } = useMenusList();
  const { addCategory, updateCategory, deleteCategory, loading: actionLoading } = useMenuCategoryActions();
  const { toast } = useToast();

  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [formData, setFormData] = useState<MenuCategoryInput>({ name: '', description: '', menu_id: '' });

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        description: editingCategory.description || '',
        menu_id: editingCategory.menu_id,
      });
    } else {
      setFormData({ name: '', description: '', menu_id: '' });
    }
  }, [editingCategory]);

  const getMenuName = (menuId: string) => menus.find(m => m.id === menuId)?.name || menuId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.menu_id) {
      toast({ title: "Champs requis", description: "Veuillez renseigner le nom et le menu.", variant: "destructive" });
      return;
    }

    let success;
    if (editingCategory) {
      success = await updateCategory(editingCategory.id, formData);
    } else {
      success = await addCategory(formData);
    }

    if (success) {
      setEditingCategory(null);
      setFormData({ name: '', description: '', menu_id: '' });
      refetchCategories();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette catégorie ?')) {
      const success = await deleteCategory(id);
      if (success) {
        refetchCategories();
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Liste des catégories</CardTitle>
            <CardDescription>Gérez les catégories de vos menus.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCategories ? (
              <p>Chargement...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Menu</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell>{getMenuName(cat.menu_id)}</TableCell>
                      <TableCell className="space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => setEditingCategory(cat)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}>
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
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
            <CardTitle>{editingCategory ? 'Modifier la catégorie' : 'Ajouter une catégorie'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name">Nom *</label>
                <Input id="name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label htmlFor="menu">Menu *</label>
                <Select value={formData.menu_id} onValueChange={val => setFormData(f => ({ ...f, menu_id: val }))} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un menu..." />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingMenus ? <SelectItem value="loading" disabled>Chargement...</SelectItem> : menus.map(menu => (
                      <SelectItem key={menu.id} value={menu.id}>{menu.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="description">Description</label>
                <Textarea id="description" value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2">
                {editingCategory && (
                  <Button type="button" variant="ghost" onClick={() => setEditingCategory(null)}>Annuler</Button>
                )}
                <Button type="submit" disabled={actionLoading}>
                  {actionLoading ? 'Enregistrement...' : (editingCategory ? 'Mettre à jour' : 'Ajouter')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CategoryManager;
