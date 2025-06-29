
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMenuCategories } from '@/hooks/useMenuCategories';
import { useOptimizedMenus } from '@/hooks/useOptimizedMenus';
import CategoryManager from './CategoryManager';
import GeneralSettingsTab from './GeneralSettingsTab';
import RestaurantNameTab from './RestaurantNameTab';
import { Package, Settings, Store, Building } from 'lucide-react';

const MenuItemManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const { categories, loading: categoriesLoading } = useMenuCategories();
  const { items, loading: itemsLoading } = useOptimizedMenus();

  const isLoading = categoriesLoading || itemsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Gestion du Menu
          </CardTitle>
          <CardDescription>
            Configurez votre menu, vos catégories et vos plats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Général
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Catégories
              </TabsTrigger>
              <TabsTrigger value="items" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Plats
              </TabsTrigger>
              <TabsTrigger value="restaurant" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Restaurant
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="general" className="space-y-6">
                <GeneralSettingsTab />
              </TabsContent>

              <TabsContent value="categories" className="space-y-6">
                <CategoryManager />
              </TabsContent>

              <TabsContent value="items" className="space-y-6">
                <div className="grid gap-6">
                  {categories.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center py-8">
                          <Package className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-4 text-lg font-semibold text-gray-900">
                            Aucune catégorie
                          </h3>
                          <p className="mt-2 text-gray-600">
                            Créez d'abord des catégories pour organiser vos plats
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {items.map((item) => (
                        <Card key={item.id}>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{item.name}</h3>
                                <p className="text-gray-600 mt-1">{item.description}</p>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="text-lg font-bold text-primary">
                                    {item.price}€
                                  </span>
                                  <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                                    {item.category}
                                  </span>
                                  <span className={`text-sm px-2 py-1 rounded ${
                                    item.isActive 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {item.isActive ? 'Disponible' : 'Indisponible'}
                                  </span>
                                </div>
                              </div>
                              {item.image && (
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  className="w-20 h-20 object-cover rounded-lg ml-4"
                                />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="restaurant" className="space-y-6">
                <RestaurantNameTab />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuItemManager;
