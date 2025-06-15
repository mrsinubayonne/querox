
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { MenuItem } from '@/types/menu';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddToCart }) => {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 bg-white rounded-2xl group border-0 shadow-md">
      <div className="relative overflow-hidden">
        <img
          src={item.image_url || "/lovable-uploads/eedf6dca-ced1-4275-a5ca-db24eefce183.png"}
          alt={item.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <Badge className="bg-emerald-100 text-emerald-800 shadow-lg border border-emerald-200">
            Disponible
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-5 flex flex-col">
        <div className="flex-grow">
          <h3 className="font-playfair font-bold text-xl mb-2 text-gray-800">{item.name}</h3>
          {item.description && (
            <p className="text-gray-500 text-sm mb-4 h-10 line-clamp-2">{item.description}</p>
          )}
        </div>
        
        <div className="flex items-center justify-between pt-4 mt-auto">
          <div className="text-xl font-bold text-gray-900">
            {item.price.toLocaleString('fr-FR')} FCFA
          </div>
          <Button
            onClick={() => onAddToCart(item)}
            size="sm"
            variant="outline"
            className="rounded-full border-emerald-200 text-emerald-700 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-colors duration-300"
          >
            <Plus className="w-4 h-4 mr-1" />
            Ajouter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuItemCard;
