
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
  
  // On prend le premier menu ACTIF comme menu par défaut
  const activeMenu = menus && menus.length > 0 
    ? menus.find(menu => menu.is_active) || menus[0] 
    : null;

  const handleAddItem = () => {
    console.log("Add item clicked");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <MenuHeader onAddItem={handleAddItem} />
          
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
