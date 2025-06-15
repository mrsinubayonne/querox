
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MenuItem } from '@/types/menu';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddToCart }) => {
  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onAddToCart(item);
  };

  return (
    <article className="bg-white rounded-xl shadow-sm overflow-hidden group transition-all duration-300 hover:shadow-lg border flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={item.image_url || "/lovable-uploads/eedf6dca-ced1-4275-a5ca-db24eefce183.png"}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
          <Button
            onClick={handleAddToCart}
            variant="secondary"
            className="rounded-full bg-white/90 text-gray-800 hover:bg-white font-semibold shadow-md opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-baseline mb-2">
          <h3 className="font-playfair font-bold text-lg text-gray-800 truncate pr-2">{item.name}</h3>
          <span className="text-lg font-bold text-emerald-600 whitespace-nowrap">
            {item.price.toLocaleString('fr-FR')} FCFA
          </span>
        </div>
        {item.description && (
          <p className="text-gray-500 text-sm line-clamp-2 flex-grow">{item.description}</p>
        )}
      </div>
    </article>
  );
};

export default MenuItemCard;
