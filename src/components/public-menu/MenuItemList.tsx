
import React from 'react';
import MenuItemCard from './MenuItemCard';
import { MenuItem } from '@/types/menu';

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
  if (Object.keys(groupedItems).length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🔍</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun plat trouvé</h3>
        <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
        <div className="mt-4 text-sm text-gray-400">
          <p>Debug: {menuItemsCount} plats au total, {filteredItemsCount} après filtrage</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {Object.entries(groupedItems).map(([category, items]) => (
        <section key={category} className="mb-12">
          <div className="flex items-baseline gap-3 mb-6">
            <h2 className="text-3xl font-bold font-playfair text-gray-800">{category}</h2>
            <span className="text-lg font-medium text-gray-400">{items.length}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map((item) => (
              <MenuItemCard key={item.id} item={item} onAddToCart={onAddToCart} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
};

export default MenuItemList;
