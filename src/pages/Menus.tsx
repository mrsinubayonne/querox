import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOutlets } from '@/hooks/useOutlets';
import PageWithSidebar from '@/components/PageWithSidebar';
import EmptyState from '@/components/EmptyState';
import MenuItemManager from '@/components/menu-management/MenuItemManager';
import CreateMenuModal from '@/components/CreateMenuModal';
import { Menu, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { APP_CONFIG } from '@/config/app.config';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<MenuType | null>(null);
  const { user } = useAuth();
  const { selectedOutletId } = useOutlets();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchMenus = async () => {
    if (!user || !selectedOutletId) {
      setMenus([]);
      setActiveMenu(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .eq('user_id', user.id)
        .eq('outlet_id', selectedOutletId)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les menus",
          variant: "destructive",
        });
      } else {
        setMenus(data || []);
        // Réinitialiser le menu actif si il ne correspond pas au nouvel outlet
        if (data && data.length > 0) {
          const stillValid = activeMenu && data.some(m => m.id === activeMenu.id);
          if (!stillValid) setActiveMenu(data[0]);
        } else {
          setActiveMenu(null);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Quand l'outlet change, on réinitialise le menu actif et on recharge
    setActiveMenu(null);
    fetchMenus();
  }, [user?.id, selectedOutletId]);

  const handleMenuChange = (menuId: string) => {
    const selectedMenu = menus.find(menu => menu.id === menuId);
    setActiveMenu(selectedMenu || null);
  };

  const handleCreateMenuSuccess = () => {
    setShowCreateModal(false);
    fetchMenus(); // Recharger les menus après création
  };

  const handleCreateMenu = () => {
    setShowCreateModal(true);
  };

  const handleViewPublicMenu = () => {
    if (!activeMenu?.id) {
      toast({
        title: "Erreur",
        description: "Aucun menu actif sélectionné",
        variant: "destructive",
      });
      return;
    }
    // Ouvrir la version publique dans l'application pour éviter les blocages de pop-up en preview
    navigate(`/menu/${activeMenu.id}`);
  };

  const handleDeleteMenu = async () => {
    if (!menuToDelete || !user) return;

    try {
      // Supprimer les items du menu d'abord
      const { data: categories } = await supabase
        .from('menu_categories')
        .select('id')
        .eq('menu_id', menuToDelete.id);

      if (categories && categories.length > 0) {
        const categoryIds = categories.map(c => c.id);
        
        // Supprimer les items
        await supabase
          .from('menu_items')
          .delete()
          .in('category_id', categoryIds);
        
        // Supprimer les catégories
        await supabase
          .from('menu_categories')
          .delete()
          .eq('menu_id', menuToDelete.id);
      }

      // Supprimer le menu
      const { error } = await supabase
        .from('menus')
        .delete()
        .eq('id', menuToDelete.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Menu supprimé",
        description: "Le menu a été supprimé avec succès",
      });

      setMenuToDelete(null);
      fetchMenus();
    } catch (error) {
      console.error('Error deleting menu:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le menu",
        variant: "destructive",
      });
    }
  };

  return (
    <PageWithSidebar>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Menus</h1>
            <p className="text-gray-600 mt-2">Gérez vos menus et vos plats</p>
          </div>
          
          <div className="flex gap-2">
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMenuToDelete(activeMenu)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        {activeMenu ? (
          <MenuItemManager activeMenuId={activeMenu.id} />
        ) : (
          <EmptyState
            icon={Menu}
            title="Aucun menu disponible"
            description="Créez votre premier menu pour commencer à gérer vos plats et boissons"
            actionLabel="Créer un menu"
            onAction={handleCreateMenu}
          />
        )}

        {/* Modal de création de menu */}
        <CreateMenuModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateMenuSuccess}
        />

        {/* Dialog de confirmation de suppression */}
        <AlertDialog open={!!menuToDelete} onOpenChange={() => setMenuToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer le menu "{menuToDelete?.name}" ? 
                Cette action supprimera également toutes les catégories et plats associés.
                Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteMenu}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageWithSidebar>
  );
};

export default Menus;
