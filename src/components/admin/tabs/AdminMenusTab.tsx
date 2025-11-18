import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Menu, Utensils, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const AdminMenusTab: React.FC = () => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalItems: 0
  });
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenusData();
  }, []);

  const fetchMenusData = async () => {
    try {
      const { data: menusList, error: menusError } = await supabase
        .from('menus')
        .select('*');

      const { data: items, error: itemsError } = await supabase
        .from('menu_items')
        .select('id');

      if (menusError) throw menusError;

      const total = menusList?.length || 0;
      const active = menusList?.filter(m => m.is_active).length || 0;
      const inactive = total - active;
      const totalItems = items?.length || 0;

      setStats({ total, active, inactive, totalItems });
      setMenus(menusList || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des menus');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="space-y-4">
      {[1, 2, 3].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-32" /></Card>)}
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardDescription>Total Menus</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Menu className="w-4 h-4 mr-2" />
              Tous les menus
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardDescription>Menus Actifs</CardDescription>
            <CardTitle className="text-3xl">{stats.active}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Eye className="w-4 h-4 mr-2" />
              Publiés
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500">
          <CardHeader className="pb-2">
            <CardDescription>Menus Inactifs</CardDescription>
            <CardTitle className="text-3xl">{stats.inactive}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <EyeOff className="w-4 h-4 mr-2" />
              Non publiés
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardDescription>Total Articles</CardDescription>
            <CardTitle className="text-3xl">{stats.totalItems}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Utensils className="w-4 h-4 mr-2" />
              Tous menus
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Menus</CardTitle>
          <CardDescription>Tous les menus de la plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {menus.map(menu => (
              <div key={menu.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex gap-4">
                  {menu.logo_url ? (
                    <img src={menu.logo_url} alt={menu.name} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Menu className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{menu.name}</p>
                    {menu.description && (
                      <p className="text-sm text-muted-foreground">{menu.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Créé le {new Date(menu.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  menu.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {menu.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
