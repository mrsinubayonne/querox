
import React, { useState } from 'react';
import { usePublicMenu } from '@/hooks/usePublicMenu';

import PublicMenuHeader from '@/components/public-menu/PublicMenuHeader';
import MenuItemList from '@/components/public-menu/MenuItemList';
import ShoppingCartSidebar from '@/components/public-menu/ShoppingCartSidebar';
import PublicMenuLoader from '@/components/public-menu/PublicMenuLoader';
import PromotionalBanner from '@/components/public-menu/PromotionalBanner';
import CategoryFilter from '@/components/CategoryFilter';
import MenuSearch from '@/components/public-menu/MenuSearch';
import { Sheet, SheetContent } from '@/components/ui/sheet';

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
  } = usePublicMenu();

  if (loading) {
    return <PublicMenuLoader />;
  }

  // 🔥 NOUVEAU: fond dégradé tout doux et container superposée sur desktop
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-white to-teal-100 flex flex-col">
      <PublicMenuHeader totalItems={getTotalItems()} onCartToggle={() => setShowCart(!showCart)} />
      
      <div className="relative flex-1">
        <div className="max-w-8xl mx-auto px-2 md:px-6 py-10">
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            {/* Légère surcouche blanc en transparence pour laisser passer le gradient */}
          </div>

          <div className="xl:px-20">
            {/* Banner centrée */}
            <PromotionalBanner />

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
  );
};

export default PublicMenu;
