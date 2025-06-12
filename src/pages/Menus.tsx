
import React, { useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import MenuHeader from '@/components/MenuHeader';
import MenuCard from '@/components/MenuCard';
import EmptyState from '@/components/EmptyState';
import { useMenus } from '@/hooks/useMenus';
import { useToast } from '@/hooks/use-toast';
import { Menu, Plus } from 'lucide-react';

const Menus: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { items, loading } = useMenus();
  const { toast } = useToast();

  // Données de démonstration pour interface vide
  const mockMenuItems = [
    {
      id: "mock-1",
      name: "Burger Classic",
      category: "Plats principaux",
      price: "12,90 €",
      status: "Disponible",
      description: "Burger avec steak haché, salade, tomate et sauce maison",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
      isActive: true
    },
    {
      id: "mock-2",
      name: "Salade César",
      category: "Entrées",
      price: "8,50 €",
      status: "Disponible",
      description: "Salade verte, croûtons, parmesan et sauce césar",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500",
      isActive: true
    },
    {
      id: "mock-3",
      name: "Tiramisu",
      category: "Desserts",
      price: "6,90 €",
      status: "Non disponible",
      description: "Tiramisu traditionnel avec café et mascarpone",
      image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500",
      isActive: false
    }
  ];

  const handleVisitorView = () => {
    toast({
      title: "Vue visiteur",
      description: "Fonctionnalité bientôt disponible",
    });
  };

  const handleAddItem = () => {
    toast({
      title: "Ajouter un plat",
      description: "Fonctionnalité bientôt disponible",
    });
  };

  const handleToggleStatus = (itemId: string | number) => {
    toast({
      title: "Statut modifié",
      description: "Fonctionnalité bientôt disponible",
    });
  };

  const handleViewItem = (item: any) => {
    toast({
      title: "Voir le plat",
      description: "Fonctionnalité bientôt disponible",
    });
  };

  const handleEditItem = (item: any) => {
    toast({
      title: "Modifier le plat",
      description: "Fonctionnalité bientôt disponible",
    });
  };

  // Transform real data to match expected format
  const transformedItems = items.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    price: `${item.price.toFixed(2)} €`,
    status: item.isActive ? "Disponible" : "Non disponible",
    description: item.description || '',
    image: item.image || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    isActive: item.isActive
  }));

  const displayItems = transformedItems.length > 0 ? transformedItems : mockMenuItems;
  const isEmptyState = transformedItems.length === 0;

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Chargement des plats...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <MenuHeader onVisitorView={handleVisitorView} onAddItem={handleAddItem} />
          
          {isEmptyState && (
            <div className="mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-800">
                    Interface de démonstration - Aucune donnée trouvée
                  </span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  Voici à quoi ressemblera votre interface une fois que vous aurez ajouté des plats.
                </p>
              </div>
            </div>
          )}

          {displayItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayItems.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  onToggleStatus={handleToggleStatus}
                  onViewItem={handleViewItem}
                  onEditItem={handleEditItem}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Menu}
              title="Aucun plat configuré"
              description="Commencez par ajouter vos premiers plats à votre menu"
              actionLabel="Ajouter un plat"
              onAction={handleAddItem}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Menus;
