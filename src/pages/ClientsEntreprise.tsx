import React from "react";
import PageWithSidebar from "@/components/PageWithSidebar";
import BusinessCustomersList from "@/components/invoices/BusinessCustomersList";
import { useRestaurant } from "@/contexts/RestaurantContext";

const ClientsEntreprise = () => {
  const { outletId } = useRestaurant();

  return (
    <PageWithSidebar>
      <div className="container mx-auto p-6">
        <BusinessCustomersList outletId={outletId || undefined} />
      </div>
    </PageWithSidebar>
  );
};

export default ClientsEntreprise;
