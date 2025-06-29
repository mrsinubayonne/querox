
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PublicMenuHeaderProps {
  totalItems: number;
  onCartToggle: () => void;
  menuName?: string;
  menuLogo?: string;
}

const PublicMenuHeader: React.FC<PublicMenuHeaderProps> = ({ 
  totalItems, 
  onCartToggle,
  menuName,
  menuLogo
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {menuLogo && (
              <img
                src={menuLogo}
                alt={menuName || "Restaurant"}
                className="h-10 w-10 object-cover rounded-full"
              />
            )}
            <h1 className="text-xl font-bold text-gray-900">
              {menuName || "Menu"}
            </h1>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onCartToggle}
            className="relative lg:hidden"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default PublicMenuHeader;
