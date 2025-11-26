import React, { useState, useMemo } from "react";
import PageWithSidebar from "@/components/PageWithSidebar";
import DebtorsList from "@/components/invoices/DebtorsList";
import { useRestaurant } from "@/contexts/RestaurantContext";
import { useDebtors } from "@/hooks/useBusinessCustomers";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, TrendingUp, AlertCircle, CreditCard, Search } from "lucide-react";

const Debiteurs = () => {
  const { outletId } = useRestaurant();
  const { customers } = useDebtors(outletId || undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Statistiques
  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.is_active).length;
    const totalDebt = customers.reduce((sum, c) => sum + c.current_debt, 0);
    const totalCreditLimit = customers.reduce((sum, c) => sum + c.credit_limit, 0);
    const customersWithDebt = customers.filter(c => c.current_debt > 0).length;

    return {
      totalCustomers,
      activeCustomers,
      totalDebt,
      totalCreditLimit,
      customersWithDebt,
      averagePaymentTerms: totalCustomers > 0 
        ? Math.round(customers.reduce((sum, c) => sum + c.payment_terms_days, 0) / totalCustomers)
        : 0
    };
  }, [customers]);

  // Filtres
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch = 
        customer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.email?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = 
        statusFilter === "all" ||
        (statusFilter === "active" && customer.is_active) ||
        (statusFilter === "inactive" && !customer.is_active) ||
        (statusFilter === "debt" && customer.current_debt > 0);

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  return (
    <PageWithSidebar>
      <div className="container mx-auto p-6 space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Débiteurs
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos clients à paiement différé (entreprises, particuliers, etc.)
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Débiteurs</p>
                <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.activeCustomers} actifs
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dette Totale</p>
                <p className="text-2xl font-bold">{stats.totalDebt.toLocaleString()} FCFA</p>
                <p className="text-xs text-muted-foreground">
                  {stats.customersWithDebt} clients
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Crédit Total</p>
                <p className="text-2xl font-bold">{stats.totalCreditLimit.toLocaleString()} FCFA</p>
                <p className="text-xs text-muted-foreground">
                  {stats.totalDebt > 0 
                    ? `${Math.round((stats.totalDebt / stats.totalCreditLimit) * 100)}% utilisé`
                    : 'Aucune dette'
                  }
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Délai Moyen</p>
                <p className="text-2xl font-bold">{stats.averagePaymentTerms} jours</p>
                <p className="text-xs text-muted-foreground">Paiement différé</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, contact, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les clients</SelectItem>
              <SelectItem value="active">Actifs uniquement</SelectItem>
              <SelectItem value="inactive">Inactifs uniquement</SelectItem>
              <SelectItem value="debt">Avec dette</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Liste des débiteurs */}
        <DebtorsList 
          outletId={outletId || undefined}
          filteredCustomers={filteredCustomers}
        />
      </div>
    </PageWithSidebar>
  );
};

export default Debiteurs;
