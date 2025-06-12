
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  Eye, 
  Edit, 
  MessageCircle
} from 'lucide-react';

interface MenuItem {
  id: string | number;
  name: string;
  category: string;
  price: string;
  status: string;
  description: string;
  image: string;
  isActive: boolean;
}

interface MenuCardProps {
  item: MenuItem;
  onToggleStatus: (itemId: string | number) => void;
  onViewItem: (item: MenuItem) => void;
  onEditItem: (item: MenuItem) => void;
}

const MenuCard: React.FC<MenuCardProps> = ({ 
  item, 
  onToggleStatus, 
  onViewItem, 
  onEditItem 
}) => {
  return (
    <Card className="overflow-hidden shadow-sm border border-gray-200">
      <div className="relative">
        <img 
          src={item.image} 
          alt={item.name}
          className="w-full h-48 object-cover"
        />
        <Badge 
          className={`absolute top-3 right-3 ${
            item.status === "Disponible" 
              ? "bg-green-500 text-white" 
              : "bg-red-500 text-white"
          }`}
        >
          {item.status}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
          <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
            {item.category}
          </Badge>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">{item.description}</p>
        
        {/* Activation/Désactivation */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">
            {item.isActive ? "Plat activé" : "Plat désactivé"}
          </span>
          <Switch
            checked={item.isActive}
            onCheckedChange={() => onToggleStatus(item.id)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-green-600">
            {item.price}
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewItem(item)}
            >
              <Eye size={14} />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEditItem(item)}
            >
              <Edit size={14} />
            </Button>
            <Button variant="outline" size="sm">
              <MessageCircle size={14} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuCard;
