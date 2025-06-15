
import React from 'react';
import MenuItemCard from './MenuItemCard';
import { Badge } from '@/components/ui/badge';
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
        <div key={category} className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{category}</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-orange-200 to-transparent"></div>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              {items.length} plat{items.length > 1 ? 's' : ''}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map((item) => (
              <MenuItemCard key={item.id} item={item} onAddToCart={onAddToCart} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

export default MenuItemList;
