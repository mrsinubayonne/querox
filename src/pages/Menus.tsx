
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageWithSidebar from '@/components/PageWithSidebar';
import EmptyState from '@/components/EmptyState';
import MenuItemManager from '@/components/menu-management/MenuItemManager';
import { Menu, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface MenuType {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

const Menus: React.FC = () => {
  const [menus, setMenus] = useState<MenuType[]>([]);
  const [activeMenu, setActiveMenu] = useState<MenuType | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchMenus = useCallback(async () => {
    if (!user) {
      console.error('Pas d\'utilisateur connecté');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Erreur récupération menus:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les menus",
          variant: "destructive",
        });
      } else {
        console.log('🔥 Menus récupérés:', data);
        setMenus(data || []);
        if (data && data.length > 0 && !activeMenu) {
          const firstMenu = data[0];
          console.log('🔥 Définition du menu actif:', firstMenu);
          setActiveMenu(firstMenu);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user, toast, activeMenu]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const handleMenuChange = (menuId: string) => {
    const selectedMenu = menus.find(menu => menu.id === menuId);
    console.log('🔥 Changement de menu:', selectedMenu);
    setActiveMenu(selectedMenu || null);
  };

  const handleViewPublicMenu = useCallback(() => {
    if (!activeMenu?.id) {
      console.error('🔥 Aucun menu actif pour générer l\'URL publique');
      toast({
        title: "Erreur",
        description: "Aucun menu actif sélectionné",
        variant: "destructive",
      });
      return;
    }
    
    const baseUrl = window.location.origin;
    const publicUrl = `${baseUrl}/menu-public?menu_id=${activeMenu.id}`;
    console.log('🔥 URL du menu public générée:', publicUrl);
    console.log('🔥 Menu actif utilisé:', activeMenu);
    
    // Ouvrir dans un nouvel onglet
    window.open(publicUrl, '_blank');
  }, [activeMenu, toast]);

  return (
    <PageWithSidebar>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Menus</h1>
            <p className="text-gray-600 mt-2">Gérez vos menus et vos plats</p>
          </div>
          
          <div>
            <Button 
              onClick={handleViewPublicMenu}
              variant="outline" 
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              disabled={!activeMenu}
            >
              <Eye className="w-4 h-4 mr-2" />
              Menu Public
            </Button>
          </div>
        </div>

        {/* Menu Selection */}
        {menus.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-semibold mb-4">Restaurant</h2>
            <div className="flex items-center gap-4">
              <Select 
                value={activeMenu?.id || ''} 
                onValueChange={handleMenuChange}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Sélectionner un restaurant" />
                </SelectTrigger>
                <SelectContent>
                  {menus.map((menu) => (
                    <SelectItem key={menu.id} value={menu.id}>
                      {menu.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {activeMenu && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Badge variant={activeMenu.is_active ? "default" : "secondary"}>
                    {activeMenu.is_active ? "Actif" : "Inactif"}
                  </Badge>
                  <span>•</span>
                  <span>{new Date(activeMenu.created_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        {activeMenu ? (
          <MenuItemManager />
        ) : (
          <EmptyState
            icon={Menu}
            title="Aucun menu sélectionné"
            description="Créez votre premier menu ou sélectionnez un menu existant pour commencer"
            actionLabel="Créer un menu"
            onAction={() => {}}
          />
        )}
      </div>
    </PageWithSidebar>
  );
};

export default Menus;
