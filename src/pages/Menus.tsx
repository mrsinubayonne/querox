import { useOutletContext } from '@/contexts/OutletContext';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useOutlets } from '@/hooks/useOutlets';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { getData } from '@/lib/offlineStorage';
import PageWithSidebar from '@/components/PageWithSidebar';
import EmptyState from '@/components/EmptyState';
import MenuItemManager from '@/components/menu-management/MenuItemManager';
import CreateMenuModal from '@/components/CreateMenuModal';
import { Menu, Eye, Trash2, Download, Upload } from 'lucide-react';
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
import { toast } from 'sonner';

interface MenuType {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

const Menus: React.FC = () => {
  const { selectedOutletId: ctxOutletId } = useOutletContext();
  const [menus, setMenus] = useState<MenuType[]>([]);
  const [activeMenu, setActiveMenu] = useState<MenuType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<MenuType | null>(null);
  const { user } = useAuth();
  const { selectedOutletId } = useOutlets();
  const { isOffline } = useNetworkStatus();
  const navigate = useNavigate();

  const fetchMenus = async () => {
    if (!user) {
      setMenus([]);
      setActiveMenu(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // En mode hors-ligne, lire directement depuis IndexedDB
    if (isOffline) {
      try {
        const resolvedOutletId = selectedOutletId || ctxOutletId || undefined;
        let cached = await getData<MenuType[]>('menus', user.id, resolvedOutletId);
        if (!cached?.data || (cached.data as any[]).length === 0) {
          cached = await getData<MenuType[]>('menus', user.id);
        }
        const data = (cached?.data || []) as MenuType[];
        setMenus(data);
        if (data.length > 0) {
          const stillValid = activeMenu && data.some(m => m.id === activeMenu.id);
          if (!stillValid) setActiveMenu(data[0]);
        } else {
          setActiveMenu(null);
        }
      } catch (err) {
        console.warn('[Menus] IndexedDB read failed:', err);
        setMenus([]);
        setActiveMenu(null);
      } finally {
        setLoading(false);
      }
      return;
    }

    // En ligne : appel Supabase avec fallback IndexedDB
    const resolvedOutletId = selectedOutletId || ctxOutletId || undefined;

    try {
      const query = supabase
        .from('menus')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (resolvedOutletId) query.eq('outlet_id', resolvedOutletId);

      const { data, error } = await query;

      if (error) throw error;

      setMenus(data || []);
      if (data && data.length > 0) {
        const stillValid = activeMenu && data.some(m => m.id === activeMenu.id);
        if (!stillValid) setActiveMenu(data[0]);
      } else {
        setActiveMenu(null);
      }
    } catch (err) {
      console.warn('[Menus] Supabase failed, falling back to IndexedDB:', err);
      // Fallback IndexedDB
      try {
        let cached = await getData<MenuType[]>('menus', user.id, resolvedOutletId);
        if (!cached?.data || (cached.data as any[]).length === 0) {
          cached = await getData<MenuType[]>('menus', user.id);
        }
        const data = (cached?.data || []) as MenuType[];
        setMenus(data);
        if (data.length > 0) {
          const stillValid = activeMenu && data.some(m => m.id === activeMenu.id);
          if (!stillValid) setActiveMenu(data[0]);
        } else {
          setActiveMenu(null);
        }
      } catch {
        toast.error("Erreur", { description: "Impossible de charger les menus" });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setActiveMenu(null);
    fetchMenus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, selectedOutletId, isOffline]);

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
      toast.error("Erreur", { description: "Aucun menu actif sélectionné" });
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

      toast.success("Menu supprimé", { description: "Le menu a été supprimé avec succès" });

      setMenuToDelete(null);
      fetchMenus();
    } catch (error) {
      console.error('Error deleting menu:', error);
      toast.error("Erreur", { description: "Impossible de supprimer le menu" });
    }
  };

  const handleExportMenu = async () => {
    if (!activeMenu || !user) return;
    try {
      const { data: menuRow } = await supabase
        .from('menus')
        .select('name, description, is_active, header_image_url, logo_url')
        .eq('id', activeMenu.id)
        .maybeSingle();

      const { data: categories } = await supabase
        .from('menu_categories')
        .select('id, name, description, order_index')
        .eq('menu_id', activeMenu.id)
        .order('order_index');

      const categoryIds = (categories || []).map(c => c.id);
      let items: any[] = [];
      if (categoryIds.length > 0) {
        const { data: itemsData } = await supabase
          .from('menu_items')
          .select('category_id, name, description, price, image_url, is_available, order_index, allergens')
          .in('category_id', categoryIds);
        items = itemsData || [];
      }

      const exportPayload = {
        format: 'querox-menu-v1',
        exported_at: new Date().toISOString(),
        menu: {
          name: menuRow?.name || activeMenu.name,
          description: menuRow?.description || null,
          is_active: menuRow?.is_active ?? true,
          header_image_url: menuRow?.header_image_url || null,
          logo_url: menuRow?.logo_url || null,
        },
        categories: (categories || []).map(c => ({
          name: c.name,
          description: c.description,
          order_index: c.order_index,
          items: items
            .filter(i => i.category_id === c.id)
            .map(i => ({
              name: i.name,
              description: i.description,
              price: i.price,
              image_url: i.image_url,
              is_available: i.is_available,
              order_index: i.order_index,
              allergens: i.allergens,
            })),
        })),
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = (menuRow?.name || activeMenu.name).replace(/[^a-z0-9-_]+/gi, '_');
      a.download = `menu_${safeName}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Export réussi', { description: 'Le menu a été exporté en JSON' });
    } catch (e) {
      console.error('Export menu failed', e);
      toast.error('Erreur', { description: "Impossible d'exporter le menu" });
    }
  };

  const handleImportMenu = () => {
    if (!user) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const payload = JSON.parse(text);
        if (payload?.format !== 'querox-menu-v1' || !payload?.menu || !Array.isArray(payload?.categories)) {
          toast.error('Fichier invalide', { description: 'Format de menu non reconnu (querox-menu-v1 attendu)' });
          return;
        }

        const resolvedOutletId = selectedOutletId || ctxOutletId || null;

        const { data: createdMenu, error: menuErr } = await supabase
          .from('menus')
          .insert({
            user_id: user.id,
            outlet_id: resolvedOutletId,
            name: `${payload.menu.name || 'Menu importé'} (importé)`,
            description: payload.menu.description || null,
            is_active: payload.menu.is_active ?? true,
            header_image_url: payload.menu.header_image_url || null,
            logo_url: payload.menu.logo_url || null,
          })
          .select()
          .single();

        if (menuErr || !createdMenu) throw menuErr || new Error('Création du menu échouée');

        for (const cat of payload.categories) {
          const { data: createdCat, error: catErr } = await supabase
            .from('menu_categories')
            .insert({
              menu_id: createdMenu.id,
              name: cat.name,
              description: cat.description || null,
              order_index: cat.order_index ?? 0,
            })
            .select()
            .single();
          if (catErr || !createdCat) continue;

          if (Array.isArray(cat.items) && cat.items.length > 0) {
            const itemsToInsert = cat.items.map((it: any) => ({
              category_id: createdCat.id,
              name: it.name,
              description: it.description || null,
              price: Number(it.price) || 0,
              image_url: it.image_url || null,
              is_available: it.is_available ?? true,
              order_index: it.order_index ?? 0,
              allergens: it.allergens || null,
            }));
            await supabase.from('menu_items').insert(itemsToInsert);
          }
        }

        toast.success('Import réussi', { description: 'Le menu a été importé avec succès' });
        fetchMenus();
      } catch (err) {
        console.error('Import menu failed', err);
        toast.error('Erreur', { description: "Impossible d'importer le menu" });
      }
    };
    input.click();
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
          
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleImportMenu}
              variant="outline"
              disabled={isOffline}
              title={isOffline ? "Indisponible hors-ligne" : "Importer un menu (.json)"}
            >
              <Upload className="w-4 h-4 mr-2" />
              Importer
            </Button>
            <Button
              onClick={handleExportMenu}
              variant="outline"
              disabled={!activeMenu}
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
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
