
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: string;
  status: string;
  description: string;
  image: string;
  isActive: boolean;
}

interface ViewItemModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const ViewItemModal: React.FC<ViewItemModalProps> = ({ item, isOpen, onClose }) => {
  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Détails du plat</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-48 object-cover rounded-lg"
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
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.name}</h3>
            <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50 mb-3">
              {item.category}
            </Badge>
          </div>
          
          <p className="text-gray-600">{item.description}</p>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-2xl font-bold text-green-600">
              {item.price}
            </div>
            <div className="text-sm text-gray-500">
              {item.isActive ? "Plat activé" : "Plat désactivé"}
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewItemModal;
