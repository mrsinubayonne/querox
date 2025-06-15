
import React, { useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import MenuHeader from '@/components/MenuHeader';
import { Link } from "react-router-dom";
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MenuItemManager from '@/components/menu-management/MenuItemManager';
import CategoryManager from '@/components/menu-management/CategoryManager';
import RestaurantNameTab from '@/components/menu-management/RestaurantNameTab';
import { useMenusList } from '@/hooks/useMenusList';

const Menus: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { menus, loading } = useMenusList();
  
  // Debug des menus récupérés
  console.log("🔥 Menus récupérés dans Menus.tsx:", menus);
  console.log("🔥 Loading état:", loading);
  console.log("🔥 Nombre de menus:", menus?.length || 0);
  
  // On prend le premier menu ACTIF comme menu par défaut
  const activeMenu = menus && menus.length > 0 
    ? menus.find(menu => menu.is_active) || menus[0] 
    : null;

  console.log("🔥 Menu actif sélectionné:", activeMenu);

  const handleAddItem = () => {
    console.log("Add item clicked");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <MenuHeader onAddItem={handleAddItem} />
          
          {/* Debug panel pour comprendre l'état */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">🔧 Debug Info</h3>
              <p className="text-xs text-blue-700">Loading: {loading ? 'Oui' : 'Non'}</p>
              <p className="text-xs text-blue-700">Nombre de menus: {menus?.length || 0}</p>
              <p className="text-xs text-blue-700">Menu actif ID: {activeMenu?.id || 'Aucun'}</p>
              <p className="text-xs text-blue-700">Menu actif nom: {activeMenu?.name || 'Aucun'}</p>
            </div>
          )}
          
          <div className="flex justify-end items-center mb-6">
            {loading ? (
              <Button variant="outline" disabled className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Chargement...
              </Button>
            ) : !activeMenu ? (
              <div className="text-center">
                <p className="text-gray-600 mb-2">Aucun menu trouvé</p>
                <p className="text-sm text-gray-500">Créez d'abord un menu pour pouvoir le visualiser</p>
              </div>
            ) : (
              <Link
                to={`/menu-public?menu_id=${activeMenu.id}`}
                target="_blank"
              >
                <Button variant="outline" className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Voir le menu public ({activeMenu.name})
                </Button>
              </Link>
            )}
          </div>
          
          <Tabs defaultValue="items" className="w-full">
            <TabsList>
              <TabsTrigger value="items">Plats</TabsTrigger>
              <TabsTrigger value="categories">Catégories</TabsTrigger>
              <TabsTrigger value="general">Général</TabsTrigger>
            </TabsList>
            <TabsContent value="items">
              <MenuItemManager />
            </TabsContent>
            <TabsContent value="categories">
              <CategoryManager />
            </TabsContent>
            <TabsContent value="general">
              <RestaurantNameTab />
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </div>
  );
};

export default Menus;
