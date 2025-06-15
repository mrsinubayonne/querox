
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Clock, MapPin } from 'lucide-react';

interface PublicMenuHeaderProps {
  totalItems: number;
  onCartToggle: () => void;
}

const PublicMenuHeader: React.FC<PublicMenuHeaderProps> = ({ totalItems, onCartToggle }) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-2">
              <div className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center shadow">
                <span className="text-white font-bold text-2xl">🍽️</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800 font-playfair">Notre Menu</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Ouvert maintenant
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    Livraison disponible
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button
              onClick={onCartToggle}
              className="relative bg-emerald-600 hover:bg-emerald-700 text-white shadow-md lg:hidden"
              size="lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Panier
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicMenuHeader;
