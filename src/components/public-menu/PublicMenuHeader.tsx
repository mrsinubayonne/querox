
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
    <div className="bg-white shadow-lg border-b-2 border-orange-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">🍽️</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notre Menu</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Ouvert maintenant
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Livraison disponible
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-600 max-w-md mx-auto lg:mx-0">
              Découvrez nos délicieux plats préparés avec passion et des ingrédients frais
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button
              onClick={onCartToggle}
              className="relative bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
              size="lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Panier ({totalItems})
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs animate-pulse">
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
