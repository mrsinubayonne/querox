import React, { useState } from 'react';
import MenuItemCard from './MenuItemCard';
import { MenuItem } from '@/types/menu';
import { Button } from '@/components/ui/button';

interface MenuItemListProps {
  groupedItems: Record<string, MenuItem[]>;
  onAddToCart: (item: MenuItem) => void;
  menuItemsCount: number;
  filteredItemsCount: number;
}

const MenuItemList: React.FC<MenuItemListProps> = ({ 
  groupedItems, 
  onAddToCart,
  menuItemsCount,
  filteredItemsCount,
}) => {
  const [visibleItemsPerCategory, setVisibleItemsPerCategory] = useState<Record<string, number>>({});
  const INITIAL_ITEMS = 6;
  
  const getVisibleCount = (category: string, totalItems: number) => {
    return visibleItemsPerCategory[category] || Math.min(INITIAL_ITEMS, totalItems);
  };
  
  const showMoreItems = (category: string, currentVisible: number) => {
    setVisibleItemsPerCategory(prev => ({
      ...prev,
      [category]: currentVisible + 6
    }));
  };

  if (Object.keys(groupedItems).length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🔍</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun plat trouvé</h3>
        <p className="text-gray-500 mb-4">
          {menuItemsCount === 0 
            ? "Ce menu ne contient aucun plat disponible." 
            : "Essayez de modifier vos critères de recherche."
          }
        </p>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="font-medium mb-2">Informations de débogage :</p>
          <p>• Plats totaux dans le menu : {menuItemsCount}</p>
          <p>• Plats après filtrage : {filteredItemsCount}</p>
          <p>• Catégories trouvées : {Object.keys(groupedItems).length}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {Object.entries(groupedItems).map(([category, items]) => {
        const visibleCount = getVisibleCount(category, items.length);
        const visibleItems = items.slice(0, visibleCount);
        const hasMore = visibleCount < items.length;
        
        return (
          <section key={category} className="mb-12">
            <div className="flex items-baseline gap-3 mb-6">
              <h2 className="text-3xl font-bold font-playfair text-gray-800">{category}</h2>
              <span className="text-lg font-medium text-gray-400">{items.length}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {visibleItems.map((item) => (
                <MenuItemCard key={item.id} item={item} onAddToCart={onAddToCart} />
              ))}
            </div>
            
            {hasMore && (
              <div className="text-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => showMoreItems(category, visibleCount)}
                  className="px-8"
                >
                  Voir plus ({items.length - visibleCount} restant{items.length - visibleCount > 1 ? 's' : ''})
                </Button>
              </div>
            )}
          </section>
        );
      })}
    </>
  );
};

export default MenuItemList;
