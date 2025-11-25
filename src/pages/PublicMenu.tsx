
import React, { useState } from 'react';
import { usePublicMenu } from '@/hooks/usePublicMenu';
import { RestaurantProvider } from '@/contexts/RestaurantContext';

import PublicMenuHeader from '@/components/public-menu/PublicMenuHeader';
import MenuItemList from '@/components/public-menu/MenuItemList';
import ShoppingCartSidebar from '@/components/public-menu/ShoppingCartSidebar';
import PublicMenuLoader from '@/components/public-menu/PublicMenuLoader';
import CategoryFilter from '@/components/CategoryFilter';
import MenuSearch from '@/components/public-menu/MenuSearch';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { AlertTriangle } from 'lucide-react';
import SafeImage from '@/components/SafeImage';

const PublicMenu: React.FC = () => {
  const [showCart, setShowCart] = useState(false);
  const {
    loading,
    cart,
    menuItems,
    filteredItems,
    activeCategory,
    setActiveCategory,
    categories,
    groupedItems,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems,
    searchTerm,
    setSearchTerm,
    menuError,
    restaurantUserId,
    menuData,
    outletId,
  } = usePublicMenu();

  if (loading) {
    return <PublicMenuLoader />;
  }

  if (menuError) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-red-50 via-white to-amber-50 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-2xl">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Erreur de configuration du menu</h1>
          <p className="text-lg text-gray-600 mb-6">{menuError}</p>
          <p className="text-gray-500">
            Pour afficher un menu, l'adresse de la page doit inclure l'identifiant du menu, comme ceci :
            <br />
            <code className="bg-gray-200 text-gray-700 rounded-md px-2 py-1 mt-2 inline-block">
              /menu/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
            </code>
          </p>
          <p className="mt-8 text-sm text-gray-400">Si vous êtes le propriétaire du restaurant, vous pouvez trouver ce lien dans votre panneau d'administration des menus.</p>
        </div>
      </div>
    );
  }

  return (
    <RestaurantProvider restaurantUserId={restaurantUserId} outletId={outletId}>
      <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-white to-teal-100 flex flex-col">
        <PublicMenuHeader 
          totalItems={getTotalItems()} 
          onCartToggle={() => setShowCart(!showCart)}
          menuName={menuData?.name}
          menuLogo={menuData?.logo_url}
        />
        
        <div className="relative flex-1">
          <div className="max-w-8xl mx-auto px-2 md:px-6 py-10">
            <div className="xl:px-20">
              {/* Hero section avec les informations du menu */}
              {menuData && (
                <div className="text-center mb-10">
                  {menuData.header_image_url && (
                    <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
                      <SafeImage
                        src={menuData.header_image_url}
                        alt={menuData.name}
                        className="w-full h-64 md:h-80 object-cover"
                      />
                    </div>
                  )}
                  <h1 className="font-playfair text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                    {menuData.name}
                  </h1>
                  {menuData.description && (
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                      {menuData.description}
                    </p>
                  )}
                </div>
              )}

              <MenuSearch searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />

              <div className="mb-10">
                <CategoryFilter
                  categories={categories}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                />
              </div>

              <div className="flex flex-col lg:flex-row gap-10 items-start">
                <div className="flex-1 w-full min-w-0">
                  <MenuItemList
                    groupedItems={groupedItems}
                    onAddToCart={addToCart}
                    menuItemsCount={menuItems.length}
                    filteredItemsCount={filteredItems.length}
                  />
                </div>

                {/* Desktop cart sidebar */}
                <div className="hidden lg:block w-full lg:w-96 xl:w-[420px] shrink-0">
                  <ShoppingCartSidebar
                    cart={cart}
                    onAddToCart={addToCart}
                    onRemoveFromCart={removeFromCart}
                    onClearCart={clearCart}
                    totalPrice={getTotalPrice()}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile cart sheet */}
        <div className="lg:hidden">
          <Sheet open={showCart} onOpenChange={setShowCart}>
            <SheetContent>
              <ShoppingCartSidebar
                cart={cart}
                onAddToCart={addToCart}
                onRemoveFromCart={removeFromCart}
                onClearCart={clearCart}
                totalPrice={getTotalPrice()}
                className="p-0 shadow-none border-0 bg-transparent h-full sticky top-0"
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </RestaurantProvider>
  );
};

export default PublicMenu;
