
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Clock, MapPin } from 'lucide-react';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';

interface PublicMenuHeaderProps {
  totalItems: number;
  onCartToggle: () => void;
}

const PublicMenuHeader: React.FC<PublicMenuHeaderProps> = ({ totalItems, onCartToggle }) => {
  const { website, loading } = useRestaurantSettings();

  const headerBg = website?.header_image_url
    ? {
        backgroundImage: `linear-gradient(to bottom, rgba(16, 185, 129, .77) 0%, rgba(255,255,255,0.75) 90%), url(${website.header_image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {};

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 relative">
      {/* Image d'arrière-plan si disponible */}
      {website?.header_image_url && (
        <div
          className="absolute inset-0 w-full h-full z-0 rounded-b-2xl"
          style={headerBg}
          aria-hidden="true"
        />
      )}
      <div className={`max-w-7xl mx-auto px-4 py-6 relative z-10 ${website?.header_image_url ? 'text-white' : ''}`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="text-center lg:text-left w-full">
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-2">
              <div className={`w-14 h-14 ${website?.header_image_url ? 'bg-white bg-opacity-70' : 'bg-emerald-600'} rounded-full flex items-center justify-center shadow overflow-hidden`}>
                {website?.logo_url ? (
                  <img
                    src={website.logo_url}
                    alt={website?.name || 'Logo'}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className={`font-bold text-2xl ${website?.header_image_url ? 'text-emerald-600' : 'text-white'}`}>🍽️</span>
                )}
              </div>
              <div className="flex flex-col">
                <h1 className="text-4xl font-bold font-playfair drop-shadow-sm">
                  {loading ? '...' : website?.name || 'Nom du restaurant'}
                </h1>
                <div className={`flex items-center gap-4 text-sm mt-2 ${website?.header_image_url ? 'text-white/90' : 'text-gray-500'}`}>
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
            {/* Description sous le header */}
            {website?.description && (
              <div className={`mt-4 text-base max-w-2xl mx-auto lg:mx-0 ${website?.header_image_url ? 'text-white/90' : 'text-gray-600'}`}>
                {website.description}
              </div>
            )}
            {/* Suppression de l'image sous la description */}
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
      {/* Overlay pour effet fondu en bas du header */}
      {website?.header_image_url && (
        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white/90 via-white/50 to-transparent z-10 pointer-events-none rounded-b-2xl" />
      )}
    </div>
  );
};

export default PublicMenuHeader;

