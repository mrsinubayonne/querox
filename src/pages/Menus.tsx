
import React, { useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import MenuHeader from '@/components/MenuHeader';
import { useToast } from '@/hooks/use-toast';
import { Link } from "react-router-dom";
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MenuItemManager from '@/components/menu-management/MenuItemManager';
import CategoryManager from '@/components/menu-management/CategoryManager';
import GeneralSettingsTab from '@/components/menu-management/GeneralSettingsTab';

const Menus: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();

  const handleVisitorView = () => {
    toast({
      title: "Vue visiteur",
      description: "Ouverture de la vue publique du menu",
    });
  };

  const handleAddItem = () => {
    // This logic is now in MenuItemManager, but we can open the modal from here
    // For now, let's rely on the button within the manager
    console.log("Add item clicked");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <MenuHeader onVisitorView={handleVisitorView} onAddItem={handleAddItem} />
          <div className="flex justify-end items-center mb-6">
            <Link to="/menu-public" target="_blank">
              <Button variant="outline" className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Voir le menu public
              </Button>
            </Link>
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
              <GeneralSettingsTab />
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </div>
  );
};

export default Menus;
