
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MenuItem } from '@/types/menu';
import SafeImage from '@/components/SafeImage';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddToCart }) => {
  return (
    <article className="bg-white rounded-xl shadow-sm overflow-hidden group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <SafeImage
          src={item.image_url}
          alt={item.name}
          fallbackSrc="/lovable-uploads/logo-querox.png"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-playfair font-bold text-lg text-gray-800 mb-1 truncate">{item.name}</h3>
        <div className="flex-grow">
          {item.description && (
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{item.description}</p>
          )}
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <span className="text-lg font-bold text-emerald-600">
            {item.price.toLocaleString('fr-FR')} FCFA
          </span>
          <Button
            onClick={() => onAddToCart(item)}
            size="icon"
            className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700 shadow-md group-hover:scale-110 transition-all duration-300 w-10 h-10"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </article>
  );
};

export default MenuItemCard;
