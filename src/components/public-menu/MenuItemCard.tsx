
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Star } from 'lucide-react';
import { MenuItem } from '@/types/menu';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddToCart }) => {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md group">
      <div className="relative overflow-hidden">
        <img
          src={item.image_url || "/lovable-uploads/eedf6dca-ced1-4275-a5ca-db24eefce183.png"}
          alt={item.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <Badge className="bg-green-500 text-white shadow-lg">
            Disponible
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-white text-xs font-medium">4.8</span>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        <h3 className="font-bold text-lg mb-2 text-gray-900">{item.name}</h3>
        {item.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            {item.price.toLocaleString('fr-FR')} FCFA
          </div>
          <Button
            onClick={() => onAddToCart(item)}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            size="sm"
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
