import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableSession } from "@/hooks/useTableSessions";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, Users, FileText, Package, Receipt, Plus, Pencil, Trash2, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import QuickAddOrderToSessionModal from "./QuickAddOrderToSessionModal";
import InvoicePrintView from "@/components/invoices/InvoicePrintView";
import { Invoice } from "@/hooks/useInvoices";
interface Order {
  id: string;
  customer_name: string;
  items: any[];
  total_amount: number;
  status: string;
  created_at: string;
}
interface TableSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: TableSession | null;
  onCloseSession: () => void;
  onMarkAsPaid: () => void;
}
export const TableSessionModal: React.FC<TableSessionModalProps> = ({
  isOpen,
  onClose,
  session,
  onCloseSession,
  onMarkAsPaid
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [servedBy, setServedBy] = useState("");
  const [invoiceToPrint, setInvoiceToPrint] = useState<Invoice | null>(null);
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
      const {
        data,
        error
      } = await supabase.from("orders" as any).select("*").eq("session_id", session.id).order("created_at", {
        ascending: true
      });
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
      // Fetch invoice for this session
      const {
        data: invoice,
        error: invoiceError
      } = await supabase.from("invoices" as any).select("*").eq("session_id", session.id).maybeSingle();
      if (invoiceError || !invoice) {
        toast({
          title: "Aucune facture",
          description: "Veuillez d'abord fermer la session pour générer une facture.",
          variant: "destructive"
        });
        return;
      }

      // Show dialog to ask for "served by" information
      setInvoiceToPrint(invoice as any as Invoice);
      setShowPrintDialog(true);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer la facture.",
        variant: "destructive"
      });
    }
  };
  const handleConfirmPrint = () => {
    setShowPrintDialog(false);
    // InvoicePrintView gère automatiquement l'impression après chargement des données
    // Nettoyer après l'impression
    setTimeout(() => {
      setInvoiceToPrint(null);
      setServedBy("");
    }, 2000);
  };
  const handleClosePrintDialog = () => {
    setShowPrintDialog(false);
    setInvoiceToPrint(null);
    setServedBy("");
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
              <Button onClick={handleAddOrder} variant="secondary">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une commande
              </Button>
              <Button onClick={onCloseSession} variant="default">
                <Receipt className="h-4 w-4 mr-2" />
                Fermer & Générer Facture
              </Button>
            </>}
          
          {session.status === "closed" && <>
              <Button onClick={handlePrintSession} variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              
              <Button onClick={onMarkAsPaid}>
                Marquer comme Payée
              </Button>
            </>}

          {session.status === "paid" && <>
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

      {/* Invoice Print View */}
      {invoiceToPrint && !showPrintDialog && <InvoicePrintView invoice={invoiceToPrint} servedBy={servedBy || undefined} />}
    </Dialog>;
};