
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MenuItem } from '@/types/menu';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddToCart }) => {
  return (
    <article className="flex items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-transparent hover:border-emerald-200 group w-full">
      <div className="relative shrink-0">
        <img
          src={item.image_url || "/lovable-uploads/eedf6dca-ced1-4275-a5ca-db24eefce183.png"}
          alt={item.name}
          className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-md"
        />
      </div>
      <div className="flex-grow px-4 min-w-0">
        <h3 className="font-playfair font-bold text-md md:text-lg text-gray-800 truncate">{item.name}</h3>
        {item.description && (
          <p className="text-gray-500 text-sm mt-1 line-clamp-2 h-10">{item.description}</p>
        )}
      </div>
      <div className="flex flex-col items-end justify-center gap-2 pl-4 shrink-0 w-28 md:w-32 text-right">
        <div className="text-md md:text-lg font-bold text-gray-900">
          {item.price.toLocaleString('fr-FR')} FCFA
        </div>
        <Button
          onClick={() => onAddToCart(item)}
          size="sm"
          className="w-full rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline ml-1">Ajouter</span>
        </Button>
      </div>
    </article>
  );
};

export default MenuItemCard;
