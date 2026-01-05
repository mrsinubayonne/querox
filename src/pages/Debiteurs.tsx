import React, { useState, useMemo, useEffect } from "react";
import PageWithSidebar from "@/components/PageWithSidebar";
import DebtorsList from "@/components/invoices/DebtorsList";
import { useRestaurant } from "@/contexts/RestaurantContext";
import { useDebtors } from "@/hooks/useBusinessCustomers";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, TrendingUp, AlertCircle, CreditCard, Search, FileText, Clock, CheckCircle, Banknote } from "lucide-react";
import DebtorPaymentModal from "@/components/accounting/DebtorPaymentModal";
import { useDebtorPayments } from "@/hooks/useDebtorPayments";

interface DebtorInvoice {
  id: string;
  invoice_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  due_date: string | null;
  paid_date: string | null;
  business_customer_id: string;
  debtor_name: string;
  debtor_contact: string | null;
  total_paid: number;
  remaining_amount: number;
}

const Debiteurs = () => {
  const { outletId } = useRestaurant();
  const { user } = useAuth();
  const { customers } = useDebtors(outletId || undefined);
  const { getPaymentsForInvoice } = useDebtorPayments(outletId || undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("debiteurs");
  
  // Invoices state
  const [invoices, setInvoices] = useState<DebtorInvoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  
  // Payment modal
  const [selectedInvoice, setSelectedInvoice] = useState<DebtorInvoice | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Fetch debtor invoices
  useEffect(() => {
    const fetchDebtorInvoices = async () => {
      if (!user?.id) return;
      
      setLoadingInvoices(true);
      try {
        let query = supabase
          .from("invoices")
          .select(`
            *,
            business_customers (
              company_name,
              contact_person
            )
          `)
          .eq("user_id", user.id)
          .eq("invoice_type", "b2b")
          .order("created_at", { ascending: false });

        if (outletId) {
          query = query.eq("outlet_id", outletId);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Get payments for each invoice
        const invoicesWithPayments = await Promise.all(
          (data || []).map(async (invoice) => {
            const { data: payments } = await supabase
              .from("debtor_payments" as any)
              .select("amount")
              .eq("invoice_id", invoice.id);
            
            const totalPaid = (payments || []).reduce((sum: number, p: any) => sum + p.amount, 0);
            
            return {
              id: invoice.id,
              invoice_number: invoice.invoice_number,
              total_amount: invoice.total_amount,
              status: invoice.status,
              created_at: invoice.created_at,
              due_date: invoice.due_date,
              paid_date: invoice.paid_date,
              business_customer_id: invoice.business_customer_id || "",
              debtor_name: invoice.business_customers?.company_name || invoice.customer_name || "Inconnu",
              debtor_contact: invoice.business_customers?.contact_person || null,
              total_paid: totalPaid,
              remaining_amount: invoice.total_amount - totalPaid,
            };
          })
        );

        setInvoices(invoicesWithPayments);
      } catch (error) {
        console.error("Error fetching debtor invoices:", error);
      } finally {
        setLoadingInvoices(false);
      }
    };

    fetchDebtorInvoices();
  }, [user?.id, outletId]);

  // Statistics
  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.is_active).length;
    const totalDebt = customers.reduce((sum, c) => sum + c.current_debt, 0);
    const totalCreditLimit = customers.reduce((sum, c) => sum + c.credit_limit, 0);
    const customersWithDebt = customers.filter(c => c.current_debt > 0).length;
    
    // Invoice stats
    const unpaidInvoices = invoices.filter(i => i.status !== "paid");
    const totalReceivables = unpaidInvoices.reduce((sum, i) => sum + i.remaining_amount, 0);
    const overdueInvoices = unpaidInvoices.filter(i => 
      i.due_date && new Date(i.due_date) < new Date()
    );
    const overdueAmount = overdueInvoices.reduce((sum, i) => sum + i.remaining_amount, 0);

    return {
      totalCustomers,
      activeCustomers,
      totalDebt,
      totalCreditLimit,
      customersWithDebt,
      averagePaymentTerms: totalCustomers > 0 
        ? Math.round(customers.reduce((sum, c) => sum + c.payment_terms_days, 0) / totalCustomers)
        : 0,
      totalReceivables,
      overdueAmount,
      overdueCount: overdueInvoices.length,
      unpaidCount: unpaidInvoices.length,
    };
  }, [customers, invoices]);

  // Filter customers
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

  // Filter invoices
  const pendingInvoices = useMemo(() => 
    invoices.filter(i => i.status !== "paid" && i.remaining_amount > 0),
    [invoices]
  );
  
  const paidInvoices = useMemo(() => 
    invoices.filter(i => i.status === "paid" || i.remaining_amount <= 0),
    [invoices]
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value) + ' FCFA';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusBadge = (invoice: DebtorInvoice) => {
    if (invoice.remaining_amount <= 0) {
      return <Badge className="bg-green-500/20 text-green-600">Soldé</Badge>;
    }
    if (invoice.due_date && new Date(invoice.due_date) < new Date()) {
      return <Badge variant="destructive">En retard</Badge>;
    }
    if (invoice.total_paid > 0) {
      return <Badge className="bg-yellow-500/20 text-yellow-600">Partiel</Badge>;
    }
    return <Badge variant="secondary">En attente</Badge>;
  };

  const handleRegisterPayment = (invoice: DebtorInvoice) => {
    setSelectedInvoice(invoice);
    setPaymentModalOpen(true);
  };

  const refreshInvoices = async () => {
    // Trigger a refresh by updating state
    const event = new CustomEvent('refresh-invoices');
    window.dispatchEvent(event);
  };

  return (
    <PageWithSidebar>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Débiteurs
            <span className="text-sm font-normal px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
              Beta
            </span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos clients à paiement différé et suivez les factures en cours
          </p>
        </div>

        {/* Statistics */}
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
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Créances en cours</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalReceivables)}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.unpaidCount} factures
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
                <p className="text-sm text-muted-foreground">En retard</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.overdueAmount)}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.overdueCount} factures
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
                <p className="text-2xl font-bold">{formatCurrency(stats.totalCreditLimit)}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.totalDebt > 0 
                    ? `${Math.round((stats.totalDebt / stats.totalCreditLimit) * 100)}% utilisé`
                    : 'Aucune dette'
                  }
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="debiteurs" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Débiteurs
            </TabsTrigger>
            <TabsTrigger value="factures-en-cours" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Factures en cours
              {pendingInvoices.length > 0 && (
                <Badge variant="secondary" className="ml-1">{pendingInvoices.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="historique" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Historique
            </TabsTrigger>
          </TabsList>

          {/* Débiteurs Tab */}
          <TabsContent value="debiteurs" className="space-y-4">
            {/* Filters */}
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

            <DebtorsList 
              outletId={outletId || undefined}
              filteredCustomers={filteredCustomers}
            />
          </TabsContent>

          {/* Factures en cours Tab */}
          <TabsContent value="factures-en-cours" className="space-y-4">
            {loadingInvoices ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : pendingInvoices.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-medium">Aucune facture en attente</h3>
                <p className="text-muted-foreground">Toutes les factures débiteurs sont soldées</p>
              </Card>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {pendingInvoices.map((invoice) => (
                    <Card key={invoice.id} className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{invoice.invoice_number}</span>
                            {getStatusBadge(invoice)}
                          </div>
                          <p className="text-sm font-medium text-foreground">{invoice.debtor_name}</p>
                          {invoice.debtor_contact && (
                            <p className="text-xs text-muted-foreground">{invoice.debtor_contact}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Créée: {formatDate(invoice.created_at)}</span>
                            {invoice.due_date && (
                              <span className={invoice.due_date && new Date(invoice.due_date) < new Date() ? "text-destructive font-medium" : ""}>
                                Échéance: {formatDate(invoice.due_date)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:items-end gap-2">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total: {formatCurrency(invoice.total_amount)}</p>
                            {invoice.total_paid > 0 && (
                              <p className="text-xs text-green-600">Payé: {formatCurrency(invoice.total_paid)}</p>
                            )}
                            <p className="text-lg font-bold text-destructive">
                              Reste: {formatCurrency(invoice.remaining_amount)}
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handleRegisterPayment(invoice)}
                            className="flex items-center gap-2"
                          >
                            <Banknote className="h-4 w-4" />
                            Enregistrer un paiement
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* Historique Tab */}
          <TabsContent value="historique" className="space-y-4">
            {loadingInvoices ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : paidInvoices.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">Aucune facture soldée</h3>
                <p className="text-muted-foreground">L'historique des paiements apparaîtra ici</p>
              </Card>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {paidInvoices.map((invoice) => (
                    <Card key={invoice.id} className="p-4 bg-muted/30">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{invoice.invoice_number}</span>
                            <Badge className="bg-green-500/20 text-green-600">Soldé</Badge>
                          </div>
                          <p className="text-sm font-medium text-foreground">{invoice.debtor_name}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Créée: {formatDate(invoice.created_at)}</span>
                            {invoice.paid_date && (
                              <span>Soldée: {formatDate(invoice.paid_date)}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(invoice.total_amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">Payé intégralement</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Modal */}
      {selectedInvoice && (
        <DebtorPaymentModal
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          invoice={{
            id: selectedInvoice.id,
            invoice_number: selectedInvoice.invoice_number,
            total_amount: selectedInvoice.total_amount,
            business_customer_id: selectedInvoice.business_customer_id,
            debtor_name: selectedInvoice.debtor_name,
          }}
          remainingAmount={selectedInvoice.remaining_amount}
          onSuccess={() => {
            // Refresh invoices
            window.location.reload();
          }}
        />
      )}
    </PageWithSidebar>
  );
};

export default Debiteurs;
