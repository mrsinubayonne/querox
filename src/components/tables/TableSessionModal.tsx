import React, { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TableSession } from "@/hooks/useOptimizedTableSessions";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, Users, FileText, Package, Receipt, Plus, Pencil, Trash2, Printer, Eye, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import QuickAddOrderToSessionModal from "./QuickAddOrderToSessionModal";
import InvoicePrintView, { InvoicePrintViewRef } from "@/components/invoices/InvoicePrintView";
import { Invoice } from "@/hooks/useInvoices";
import { usePaidCelebration } from "@/hooks/usePaidCelebration";
import PaymentMethodModal, { MultiplePaymentBreakdown } from "@/components/invoices/PaymentMethodModal";
import { toast as sonnerToast } from "sonner";
import { InvoicePreviewModal } from "./InvoicePreviewModal";
import { useButtonTracking } from "@/hooks/useButtonTracking";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { getData } from "@/lib/offlineStorage";

interface Order {
  id: string;
  customer_name: string;
  items: any[];
  total_amount: number;
  status: string;
  created_at: string;
  session_id?: string;
}

interface TableSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: TableSession | null;
  onCloseSession: (sessionId: string) => Promise<void> | void;
  onMarkAsPaid: (sessionId: string, paymentMethod?: string) => Promise<void> | void;
  onReopenSession?: (sessionId: string) => Promise<void> | void;
}
export const TableSessionModal: React.FC<TableSessionModalProps> = ({
  isOpen,
  onClose,
  session,
  onCloseSession,
  onMarkAsPaid,
  onReopenSession
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [servedBy, setServedBy] = useState("");
  const [invoiceToPrint, setInvoiceToPrint] = useState<Invoice | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [printReady, setPrintReady] = useState(false);
  const { celebrate, CelebrationMessage } = usePaidCelebration();
  const { trackClick } = useButtonTracking();
  const { isOffline } = useNetworkStatus();
  const queryClient = useQueryClient();
  const printViewRef = useRef<InvoicePrintViewRef>(null);

  // Cleanup print state after browser print dialog closes
  useEffect(() => {
    if (!invoiceToPrint) return;
    const cleanup = () => {
      setInvoiceToPrint(null);
      setServedBy("");
      setPrintReady(false);
    };
    window.addEventListener('afterprint', cleanup);
    return () => window.removeEventListener('afterprint', cleanup);
  }, [invoiceToPrint]);

  const handleMarkAsPaidWithMethod = async (
    paymentMethod: string,
    debtorId?: string,
    multipleBreakdown?: MultiplePaymentBreakdown
  ) => {
    if (!session) return;
    
    // Track payment method used
    trackClick(`Paiement: ${paymentMethod}`, 'tables');
    
    try {
      // If debtor payment, handle differently
      if (paymentMethod === 'Debiteur' && debtorId) {
        // Update session with debtor_id and status to closed (not paid)
        // Note: payment_method is null for debtor payments (will be set when they actually pay)
        const { error: sessionError } = await supabase
          .from('table_sessions')
          .update({ 
            status: 'closed',
            debtor_id: debtorId,
            payment_method: null
          })
          .eq('id', session.id);

        if (sessionError) throw sessionError;

        // The trigger create_invoice_for_closed_session will handle invoice creation
        // Wait a bit then update the invoice to be B2B unpaid
        setTimeout(async () => {
          try {
            // Update the invoice to B2B unpaid
            await supabase
              .from('invoices')
              .update({ 
                status: 'unpaid',
                invoice_type: 'b2b',
                business_customer_id: debtorId,
                payment_method: null,
                paid_date: null
              })
              .eq('session_id', session.id);

            // Update debtor's current_debt
            const { data: invoice } = await supabase
              .from('invoices')
              .select('total_amount')
              .eq('session_id', session.id)
              .single();

            if (invoice) {
              // Get current debt and add the new amount
              const { data: debtor } = await supabase
                .from('business_customers')
                .select('current_debt')
                .eq('id', debtorId)
                .single();

              const currentDebt = (debtor as any)?.current_debt || 0;
              const newDebt = currentDebt + invoice.total_amount;

              await supabase
                .from('business_customers')
                .update({ current_debt: newDebt })
                .eq('id', debtorId);
            }
          } catch (e) {
            console.error('Error updating invoice/debt:', e);
          }
        }, 500);

        // Ne PAS appeler onMarkAsPaid() pour les débiteurs - juste fermer le modal
        onClose();
        sonnerToast.success('Crédit enregistré pour le débiteur');
        return;
      }

      // Build payment method string for multiple payments
      let paymentMethodString = paymentMethod;
      let notesForMultiple = '';
      
      if (paymentMethod === 'Multiple' && multipleBreakdown) {
        const parts: string[] = [];
        if (multipleBreakdown.especes > 0) parts.push(`Espèces: ${multipleBreakdown.especes} FCFA`);
        if (multipleBreakdown.virement > 0) parts.push(`Virement: ${multipleBreakdown.virement} FCFA`);
        if (multipleBreakdown.carte > 0) parts.push(`Carte: ${multipleBreakdown.carte} FCFA`);
        if (multipleBreakdown.mobileMoney > 0) parts.push(`Mobile Money: ${multipleBreakdown.mobileMoney} FCFA`);
        if (multipleBreakdown.debiteur > 0) parts.push(`Débiteur: ${multipleBreakdown.debiteur} FCFA`);
        notesForMultiple = parts.join(' | ');
        paymentMethodString = 'Multiple';
      }

      // Regular payment flow
      const { error: sessionError } = await supabase
        .from('table_sessions')
        .update({ 
          status: 'paid',
          payment_method: paymentMethodString,
          notes: paymentMethod === 'Multiple' ? notesForMultiple : session.notes
        })
        .eq('id', session.id);

      if (sessionError) throw sessionError;

      // Update invoice with payment method
      const invoiceUpdate: any = { 
        status: 'paid',
        paid_date: new Date().toISOString(),
        payment_method: paymentMethodString
      };
      
      if (paymentMethod === 'Multiple' && notesForMultiple) {
        invoiceUpdate.notes = notesForMultiple;
      }
      
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update(invoiceUpdate)
        .eq('session_id', session.id);

      if (invoiceError) throw invoiceError;

      // Handle debtor portion in multiple payment
      if (paymentMethod === 'Multiple' && multipleBreakdown && multipleBreakdown.debiteur > 0 && multipleBreakdown.debiteurId) {
        // Create a debtor payment record for the amount that needs to be paid later
        const { data: debtor } = await supabase
          .from('business_customers')
          .select('current_debt')
          .eq('id', multipleBreakdown.debiteurId)
          .single();
        
        if (debtor) {
          const currentDebt = (debtor as any)?.current_debt || 0;
          const newDebt = currentDebt + multipleBreakdown.debiteur;
          
          await supabase
            .from('business_customers')
            .update({ current_debt: newDebt })
            .eq('id', multipleBreakdown.debiteurId);
        }
      }

      celebrate();
      await onMarkAsPaid(session.id, paymentMethodString);
      sonnerToast.success('Table marquée comme payée');
    } catch (error) {
      console.error('Error marking as paid:', error);
      sonnerToast.error('Erreur lors de la mise à jour');
    }
  };
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  useEffect(() => {
    if (session && isOpen) {
      fetchOrders();
    }
  }, [session, isOpen]);

  // Real-time listener pour les commandes
  useEffect(() => {
    if (!session || !isOpen) return;
    const channel = supabase.channel(`session-orders-${session.id}`).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "orders",
      filter: `session_id=eq.${session.id}`
    }, () => {
      fetchOrders();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.id, isOpen]);

  // Real-time listener pour les changements de session (total_amount)
  useEffect(() => {
    if (!session || !isOpen) return;
    const channel = supabase.channel(`session-${session.id}`).on("postgres_changes", {
      event: "UPDATE",
      schema: "public",
      table: "table_sessions",
      filter: `id=eq.${session.id}`
    }, () => {
      // Recharger la page parent pour voir les changements
      window.dispatchEvent(new CustomEvent("session-updated"));
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.id, isOpen]);
  const fetchOrders = async () => {
    if (!session) return;
    setLoading(true);
    try {
      // Offline: load from cache
      if (isOffline) {
        const userId = user?.id || '';
        const outletId = (session as any).outlet_id || localStorage.getItem('selectedOutletId') || undefined;
        const cached = await getData<Order[]>('orders', userId, outletId);
        const list = (cached?.data || []) as Order[];
        const sessionOrders = list.filter((o) => (o as any).session_id === session.id);
        setOrders(sessionOrders);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("orders" as any)
        .select("*")
        .eq("session_id", session.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setOrders(data as any || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0
    }).format(amount);
  };
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        label: "En attente",
        variant: "outline" as const
      },
      preparing: {
        label: "En préparation",
        variant: "default" as const
      },
      ready: {
        label: "Prêt",
        variant: "secondary" as const
      },
      delivered: {
        label: "Livré",
        variant: "default" as const
      }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };
  const handleViewInvoice = async () => {
    if (!session) return;
    try {
      const {
        data: invoice
      } = await supabase.from("invoices" as any).select("id").eq("session_id", session.id).maybeSingle();
      if (invoice) {
        navigate("/factures");
        onClose();
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
    }
  };
  const handleOpenInvoiceSettings = () => {
    // Fermer la modale puis ouvrir directement l'onglet paramètres des tables
    onClose();
    navigate("/parametres?tab=tables");
  };
  const handleAddOrder = () => {
    setShowQuickAddModal(true);
  };
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Supprimer cette commande ?")) return;
    setDeletingOrderId(orderId);
    try {
      const {
        error
      } = await supabase.from("orders").delete().eq("id", orderId);
      if (error) throw error;
      toast({
        title: "Commande supprimée",
        description: "La commande a été supprimée avec succès."
      });
      fetchOrders();
      window.dispatchEvent(new CustomEvent("session-updated"));
    } catch (error: any) {
      console.error("Error deleting order:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la commande.",
        variant: "destructive"
      });
    } finally {
      setDeletingOrderId(null);
    }
  };
  const handleEditOrder = (orderId: string) => {
    // Redirect to orders page with the order ID
    navigate(`/commandes?edit=${orderId}`);
    onClose();
  };
  const handlePrintSession = async () => {
    if (!session) return;

    try {
      // Offline: use cached invoice if available
      if (isOffline) {
        const userId = user?.id || '';
        const outlet = (session as any).outlet_id || localStorage.getItem('selectedOutletId') || undefined;
        const cached = await getData<Invoice[]>('invoices', userId, outlet);
        const list = (cached?.data || []) as Invoice[];
        const inv = list.find((i) => (i as any).session_id === session.id);
        if (!inv) {
          toast({
            title: 'Facture indisponible',
            description: "Fermez d'abord la table pour générer la facture (hors ligne).",
            variant: 'destructive',
          });
          return;
        }
        setInvoiceToPrint(inv);
        setShowPrintDialog(true);
        return;
      }

      // 1) Chercher d'abord une facture existante pour cette session
      const {
        data: existingInvoice,
        error: invoiceError,
      } = await supabase
        .from("invoices" as any)
        .select("*")
        .eq("session_id", session.id)
        .maybeSingle();

      if (invoiceError) {
        console.error("Error fetching invoice:", invoiceError);
      }

      let invoice = existingInvoice as any | null;

      // 2) Si aucune facture trouvée, la générer automatiquement
      if (!invoice) {
        try {
          // Récupérer toutes les commandes de la session
          const { data: ordersForSession, error: ordersError } = await supabase
            .from("orders" as any)
            .select("items, customer_name, customer_email, customer_phone, created_at")
            .eq("session_id", session.id)
            .order("created_at", { ascending: true });

          if (ordersError) throw ordersError;

          const ordersList = (ordersForSession ?? []) as any[];

          const allItems: any[] = [];
          ordersList.forEach((order: any) => {
            const orderItems = Array.isArray(order.items)
              ? order.items
              : order.items
              ? (order.items as any[])
              : [];
            allItems.push(...orderItems);
          });

          const firstOrder: any | null = ordersList.length > 0 ? (ordersList[0] as any) : null;

          // Générer un numéro de facture séquentiel via la fonction SQL
          const { data: invoiceNumber, error: invoiceNumberError } = await supabase.rpc(
            "generate_invoice_number"
          );

          if (invoiceNumberError || !invoiceNumber) {
            throw invoiceNumberError || new Error("Impossible de générer un numéro de facture");
          }

          // Paramètres spécifiques si la session est liée à un débiteur
          const hasDebtor = (session as any).debtor_id !== null;
          let dueDate: string | null = null;
          let paymentTermsDays: number | null = null;
          let businessCustomerId: string | null = null;
          let invoiceType = "b2c";
          let billingAddress: string | null = null;
          let siret: string | null = null;

          if (hasDebtor && (session as any).debtor_id) {
            invoiceType = "b2b";
            businessCustomerId = (session as any).debtor_id as string;

            const { data: debtor, error: debtorError } = await supabase
              .from("business_customers" as any)
              .select("payment_terms_days, address, siret")
              .eq("id", businessCustomerId)
              .maybeSingle();

            if (debtorError && (debtorError as any).code !== "PGRST116") throw debtorError;

            paymentTermsDays = (debtor as any)?.payment_terms_days ?? 30;
            const now = new Date();
            now.setDate(now.getDate() + paymentTermsDays);
            dueDate = now.toISOString().split("T")[0];
            billingAddress = (debtor as any)?.address ?? null;
            siret = (debtor as any)?.siret ?? null;
          }

          const { data: insertedInvoice, error: insertError } = await supabase
            .from("invoices" as any)
            .insert([
              {
                user_id: (session as any).user_id,
                outlet_id: (session as any).outlet_id,
                session_id: session.id,
                business_customer_id: businessCustomerId,
                invoice_number: invoiceNumber,
                invoice_type: invoiceType,
                total_amount: (session as any).total_amount ?? 0,
                status: "unpaid",
                due_date: dueDate,
                payment_terms_days: paymentTermsDays,
                notes: `Facture générée automatiquement pour la table ${(session as any).table_number}`,
                billing_address: billingAddress,
                siret,
                customer_name: firstOrder?.customer_name ?? "Client",
                customer_email: firstOrder?.customer_email ?? null,
                customer_phone: firstOrder?.customer_phone ?? null,
                items: allItems,
              },
            ])
            .select("*")
            .maybeSingle();

          if (insertError || !insertedInvoice) {
            throw insertError || new Error("Insertion de la facture échouée");
          }

          invoice = insertedInvoice as any;
        } catch (genError) {
          console.error("Error generating invoice on-the-fly:", genError);
          toast({
            title: "Erreur facture",
            description: "Impossible de générer automatiquement la facture.",
            variant: "destructive",
          });
          return;
        }
      }

      // À ce stade, on a forcément une facture pour la session
      setInvoiceToPrint(invoice as any as Invoice);
      setShowPrintDialog(true);
    } catch (error) {
      console.error("Error in handlePrintSession:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer la facture.",
        variant: "destructive",
      });
    }
  };
  // Called when InvoicePrintView has loaded its data
  const handlePrintReady = useCallback(() => {
    setPrintReady(true);
  }, []);

  const handleConfirmPrint = () => {
    if (!printReady) {
      sonnerToast.message('Préparation de la facture…', { description: 'Veuillez patienter une seconde.' });
      return;
    }

    // Print via ref (avoid setTimeout: preserves user gesture on tablets)
    printViewRef.current?.print();
    setShowPrintDialog(false);
  };

  const handleClosePrintDialog = () => {
    setShowPrintDialog(false);
    setInvoiceToPrint(null);
    setServedBy("");
    setPrintReady(false);
  };
  if (!session) return null;
  return <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Table {session.table_number}
            {session.status === "active" && <Badge variant="destructive">🔴 Active</Badge>}
            {session.status === "closed" && <Badge variant="outline" className="bg-warning/10">🟡 Fermée</Badge>}
            {session.status === "paid" && <Badge variant="outline" className="bg-success/10">✅ Payée</Badge>}
          </DialogTitle>
          <DialogDescription>
            Session ouverte le {format(new Date(session.started_at), "PPP 'à' HH:mm", {
            locale: fr
          })}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh]">
          <div className="space-y-4">
            {/* Session Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              {session.number_of_guests && <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {session.number_of_guests} personne{session.number_of_guests > 1 ? "s" : ""}
                  </span>
                </div>}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Durée: {format(new Date(session.started_at), "HH:mm")}
                  {session.closed_at && ` - ${format(new Date(session.closed_at), "HH:mm")}`}
                </span>
              </div>
            </div>

            {session.notes && <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Notes:</p>
                    <p className="text-sm text-muted-foreground">{session.notes}</p>
                  </div>
                </div>
              </div>}

            <Separator />

            {/* Orders List */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                <h3 className="font-semibold">Commandes ({orders.length})</h3>
              </div>

              {loading ? <p className="text-sm text-muted-foreground">Chargement...</p> : orders.length === 0 ? <p className="text-sm text-muted-foreground">Aucune commande pour cette session.</p> : <div className="space-y-3">
                  {orders.map((order, index) => <div key={order.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Commande #{index + 1}</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(order.created_at), "HH:mm")}
                          </span>
                          {session.status === "active" && <>
                              <Button size="icon" variant="ghost" onClick={() => handleEditOrder(order.id)} className="h-8 w-8">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => handleDeleteOrder(order.id)} disabled={deletingOrderId === order.id} className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>}
                        </div>
                      </div>
                      
                      <div className="text-sm space-y-1">
                        {order.items.map((item: any, i: number) => <div key={i} className="flex justify-between">
                            <span className="text-muted-foreground">
                              {item.quantity}x {item.name}
                            </span>
                            <span>{formatCurrency(item.price * item.quantity)}</span>
                          </div>)}
                      </div>

                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Sous-total</span>
                        <span>{formatCurrency(order.total_amount)}</span>
                      </div>
                    </div>)}
                </div>}
            </div>

            <Separator />

            {/* Total */}
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Session</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(session.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-wrap gap-2">
          {session.status === "active" && <>
              <Button onClick={() => setShowPreview(true)} variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Prévisualiser
              </Button>
              <Button onClick={() => {
                trackClick('Tables: Ajouter commande', 'tables');
                handleAddOrder();
              }} variant="secondary">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une commande
              </Button>
              <Button onClick={async () => {
                trackClick('Tables: Fermer session', 'tables');
                await onCloseSession(session.id);
                // Refresh invoices list
                queryClient.invalidateQueries({ queryKey: ['invoices'] });
              }} variant="default">
                <Receipt className="h-4 w-4 mr-2" />
                {session.debtor_id ? "Fermer & Créer Crédit" : "Fermer & Générer Facture"}
              </Button>
            </>}
          
          {session.status === "closed" && <>
              {onReopenSession && (
                <Button onClick={async () => {
                  trackClick('Tables: Réouvrir table', 'tables');
                  await onReopenSession(session.id);
                }} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Réouvrir
                </Button>
              )}
              <Button onClick={() => {
                trackClick('Tables: Imprimer facture', 'tables');
                handlePrintSession();
              }} variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              
              <Button onClick={() => {
                trackClick('Tables: Marquer payée', 'tables');
                setShowPaymentMethod(true);
              }}>
                Marquer comme Payée
              </Button>
            </>}

          {session.status === "paid" && <>
              {onReopenSession && (
                <Button onClick={() => onReopenSession(session.id)} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Réouvrir
                </Button>
              )}
              <Button onClick={handlePrintSession} variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              <Button onClick={handleViewInvoice} variant="secondary">
                Voir la Facture
              </Button>
            </>}

          

          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>

        </DialogFooter>
      </DialogContent>
      <QuickAddOrderToSessionModal isOpen={showQuickAddModal} onClose={() => setShowQuickAddModal(false)} onSuccess={() => {
      setShowQuickAddModal(false);
    }} sessionId={session.id} tableNumber={session.table_number} />

      {/* Print Dialog */}
      <AlertDialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Imprimer la facture</AlertDialogTitle>
            <AlertDialogDescription>
              Souhaitez-vous indiquer qui a servi cette table ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="served-by">Servi par (optionnel)</Label>
            <Input id="served-by" placeholder="Ex: Jean, Marie..." value={servedBy} onChange={e => setServedBy(e.target.value)} />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleClosePrintDialog}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPrint}>Imprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invoice Print View - mount early to load data, print via ref */}
      {invoiceToPrint && (
        <InvoicePrintView
          ref={printViewRef}
          invoice={invoiceToPrint}
          servedBy={servedBy || undefined}
          format="restaurant"
          autoPrint={false}
          onReady={handlePrintReady}
        />
      )}
      
      {/* Invoice Preview Modal */}
      <InvoicePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        sessionId={session.id}
        tableNumber={session.table_number}
      />
      
      <PaymentMethodModal
        open={showPaymentMethod}
        onOpenChange={setShowPaymentMethod}
        onConfirm={handleMarkAsPaidWithMethod}
        totalAmount={session.total_amount}
      />

      <CelebrationMessage />
    </Dialog>;
};