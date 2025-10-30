
import React, { createContext, useContext, ReactNode } from 'react';

type RestaurantContextType = {
  restaurantUserId: string | null;
};

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider = ({ children, restaurantUserId }: { children: ReactNode; restaurantUserId: string | null }) => {
  return (
    <RestaurantContext.Provider value={{ restaurantUserId }}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurant doit être utilisé à l\'intérieur d\'un RestaurantProvider');
  }
  return context;
};
