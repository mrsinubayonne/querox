
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Clock, MapPin } from 'lucide-react';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';

interface PublicMenuHeaderProps {
  totalItems: number;
  onCartToggle: () => void;
}

const PublicMenuHeader: React.FC<PublicMenuHeaderProps> = ({
  totalItems,
  onCartToggle
}) => {
  const {
    website,
    loading
  } = useRestaurantSettings();

  // Préparer le style dynamique si header_image_url est définie
  const hasHeaderImage = !!website?.header_image_url;
  const backgroundStyle = hasHeaderImage
    ? {
        backgroundImage: `linear-gradient(to bottom, rgba(34,34,34,0.55) 0%, rgba(34,34,34,0.64) 100%), url('${website.header_image_url}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : {};

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div
        className={
          "max-w-7xl mx-auto px-[32px] py-[131px] relative flex flex-col"
          + (hasHeaderImage ? ' text-white' : ' bg-gray-50')
        }
        style={backgroundStyle}
      >
        {/* Overlay fallback pour l'ombre si image, aspect accessibilité */}
        {hasHeaderImage && (
          <div className="absolute inset-0 bg-black/40 pointer-events-none rounded-none" aria-hidden="true"></div>
        )}

        {/* Bloc central logo, nom, description centré */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full">
          <div className="flex flex-col items-center justify-center w-full">
            <div className={`w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center shadow overflow-hidden border-4 mb-4 ${hasHeaderImage ? "border-emerald-300" : ""}`}>
              {website?.logo_url ? (
                <img src={website.logo_url} alt={website?.name || 'Logo'} className="object-cover w-full h-full" />
              ) : (
                <span className="text-white font-bold text-3xl">🍽️</span>
              )}
            </div>
            <h1
              className="text-4xl lg:text-5xl font-bold font-playfair"
              style={hasHeaderImage ? { color: 'white', textShadow: '0 2px 12px rgba(0,0,0,0.25)' } : undefined}
            >
              {loading ? '...' : website?.name || 'Nom du restaurant'}
            </h1>
            {/* Infos horaires/livraison => centrées aussi sous le nom */}
            <div
              className={
                "flex flex-col sm:flex-row items-center justify-center gap-3 text-sm mt-4"
                + (hasHeaderImage ? " text-white opacity-90" : " text-gray-500")
              }
            >
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Ouvert maintenant
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                Livraison disponible
              </span>
            </div>
            {/* Description centrée sous le nom */}
            {website?.description && (
              <div
                className={"mt-6 text-lg max-w-2xl mx-auto text-center" + (hasHeaderImage ? " text-white/90" : " text-gray-600")}
                style={hasHeaderImage ? { textShadow: '0 1px 10px rgba(0,0,0,0.18)' } : undefined}
              >
                {website.description}
              </div>
            )}
          </div>
        </div>

        {/* Bouton panier mobile uniquement, toujours aligné à droite */}
        <div className="flex flex-col sm:flex-row items-center gap-4 absolute top-6 right-6 z-20 lg:hidden">
          <Button
            onClick={onCartToggle}
            className="relative bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
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
  );
};

export default PublicMenuHeader;
