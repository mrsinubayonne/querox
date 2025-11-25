import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Building2 } from "lucide-react";
import { useBusinessCustomers } from "@/hooks/useBusinessCustomers";
import BusinessCustomerModal from "./BusinessCustomerModal";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BusinessCustomersListProps {
  outletId?: string;
  filteredCustomers?: any[];
}

const BusinessCustomersList: React.FC<BusinessCustomersListProps> = ({ 
  outletId,
  filteredCustomers 
}) => {
  const { customers, isLoading, deleteCustomer } = useBusinessCustomers(outletId);
  const displayCustomers = filteredCustomers || customers;
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

  const handleEdit = (customer: any) => {
    setSelectedCustomer(customer);
    setModalOpen(true);
  };

  const handleDelete = (customerId: string) => {
    setCustomerToDelete(customerId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (customerToDelete) {
      deleteCustomer(customerToDelete);
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          Clients Entreprise
        </h2>
        <Button
          onClick={() => {
            setSelectedCustomer(null);
            setModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouveau client B2B
        </Button>
      </div>

      <div className="grid gap-4">
        {displayCustomers.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {customers.length === 0 
                ? "Aucun client entreprise enregistré" 
                : "Aucun client ne correspond aux critères de recherche"
              }
            </p>
          </Card>
        ) : (
          displayCustomers.map((customer) => (
            <Card key={customer.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{customer.company_name}</h3>
                    <Badge variant={customer.is_active ? "default" : "secondary"}>
                      {customer.is_active ? "Actif" : "Inactif"}
                    </Badge>
                    {customer.current_debt > 0 && (
                      <Badge variant="destructive">
                        Dette: {customer.current_debt.toLocaleString()} FCFA
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    {customer.siret && (
                      <div>
                        <span className="text-muted-foreground">SIRET:</span> {customer.siret}
                      </div>
                    )}
                    {customer.contact_person && (
                      <div>
                        <span className="text-muted-foreground">Contact:</span> {customer.contact_person}
                      </div>
                    )}
                    {customer.email && (
                      <div>
                        <span className="text-muted-foreground">Email:</span> {customer.email}
                      </div>
                    )}
                    {customer.phone && (
                      <div>
                        <span className="text-muted-foreground">Tél:</span> {customer.phone}
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Délai:</span> {customer.payment_terms_days} jours
                    </div>
                    <div>
                      <span className="text-muted-foreground">Limite:</span>{" "}
                      {customer.credit_limit.toLocaleString()} FCFA
                    </div>
                  </div>

                  {customer.address && (
                    <p className="text-sm text-muted-foreground">{customer.address}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(customer)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(customer.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <BusinessCustomerModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        customer={selectedCustomer}
        outletId={outletId}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BusinessCustomersList;
