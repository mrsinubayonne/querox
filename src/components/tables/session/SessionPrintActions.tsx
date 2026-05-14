import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Receipt } from "lucide-react";
import InvoicePrintView, {
  InvoicePrintViewRef,
} from "@/components/invoices/InvoicePrintView";
import KitchenTicketPrint, {
  KitchenTicketPrintRef,
} from "@/components/orders/KitchenTicketPrint";
import { Invoice } from "@/hooks/useInvoices";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { getData } from "@/lib/offlineStorage";
import { toast as sonnerToast } from "sonner";
import type { TableSession } from "@/hooks/useOptimizedTableSessions";

interface Order {
  id: string;
  items: any[];
  customer_name?: string;
  [k: string]: any;
}

export interface SessionPrintActionsRef {
  printInvoice: () => Promise<void>;
  printKitchenTicket: () => Promise<void>;
}

interface Props {
  session: TableSession;
  orders: Order[];
}

export const SessionPrintActions = forwardRef<SessionPrintActionsRef, Props>(
  ({ session, orders }, ref) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const { isOffline } = useNetworkStatus();

    const [showPrintDialog, setShowPrintDialog] = useState(false);
    const [servedBy, setServedBy] = useState("");
    const [invoiceToPrint, setInvoiceToPrint] = useState<Invoice | null>(null);
    const [printFormat, setPrintFormat] = useState<"a4" | "restaurant">(
      "restaurant",
    );
    const [printReady, setPrintReady] = useState(false);
    const [pendingPrint, setPendingPrint] = useState(false);
    const [showKitchenTicket, setShowKitchenTicket] = useState(false);
    const [outletNameForTicket, setOutletNameForTicket] = useState<
      string | undefined
    >(undefined);

    const printViewRef = useRef<InvoicePrintViewRef>(null);
    const kitchenTicketRef = useRef<KitchenTicketPrintRef>(null);

    // Cleanup print state after browser print dialog closes
    useEffect(() => {
      if (!invoiceToPrint) return;
      const cleanup = () => {
        setInvoiceToPrint(null);
        setServedBy("");
        setPrintReady(false);
        setPrintFormat("restaurant");
      };
      window.addEventListener("afterprint", cleanup);
      return () => window.removeEventListener("afterprint", cleanup);
    }, [invoiceToPrint]);

    const handlePrintReady = useCallback(() => {
      setPrintReady(true);
    }, []);

    useEffect(() => {
      if (printReady && pendingPrint) {
        setPendingPrint(false);
        setShowPrintDialog(false);
        setTimeout(() => {
          printViewRef.current?.print();
        }, 100);
      }
    }, [printReady, pendingPrint]);

    const printKitchenTicket = async () => {
      try {
        const oid =
          (session as any)?.outlet_id ||
          localStorage.getItem("selectedOutletId");
        if (oid && !outletNameForTicket) {
          const { data } = await supabase
            .from("outlets")
            .select("name")
            .eq("id", oid)
            .maybeSingle();
          if (data) setOutletNameForTicket((data as any).name);
        }
      } catch {}
      setShowKitchenTicket(true);
      setTimeout(() => {
        kitchenTicketRef.current?.print();
        setTimeout(() => setShowKitchenTicket(false), 1200);
      }, 250);
    };

    const printInvoice = async () => {
      try {
        if (isOffline) {
          const userId = user?.id || "";
          const outlet =
            (session as any).outlet_id ||
            localStorage.getItem("selectedOutletId") ||
            undefined;
          const cached = await getData<Invoice[]>("invoices", userId, outlet);
          const list = (cached?.data || []) as Invoice[];
          const inv = list.find((i) => (i as any).session_id === session.id);
          if (!inv) {
            toast({
              title: "Facture indisponible",
              description:
                "Fermez d'abord la table pour générer la facture (hors ligne).",
              variant: "destructive",
            });
            return;
          }
          setInvoiceToPrint(inv);
          setShowPrintDialog(true);
          return;
        }

        const { data: existingInvoice, error: invoiceError } = await supabase
          .from("invoices" as any)
          .select("*")
          .eq("session_id", session.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (invoiceError) {
          console.error("Error fetching invoice:", invoiceError);
        }

        let invoice = existingInvoice as any | null;

        if (!invoice) {
          try {
            const { data: ordersForSession, error: ordersError } =
              await supabase
                .from("orders" as any)
                .select(
                  "items, customer_name, customer_email, customer_phone, created_at",
                )
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

            const firstOrder: any | null =
              ordersList.length > 0 ? (ordersList[0] as any) : null;

            const { data: invoiceNumber, error: invoiceNumberError } =
              await supabase.rpc("generate_invoice_number");

            if (invoiceNumberError || !invoiceNumber) {
              throw (
                invoiceNumberError ||
                new Error("Impossible de générer un numéro de facture")
              );
            }

            const { data: insertedInvoice, error: insertError } = await supabase
              .from("invoices" as any)
              .insert([
                {
                  user_id: (session as any).user_id,
                  outlet_id: (session as any).outlet_id,
                  session_id: session.id,
                  invoice_number: invoiceNumber,
                  invoice_type: "b2c",
                  total_amount: (session as any).total_amount ?? 0,
                  status: "unpaid",
                  notes: `Facture générée automatiquement pour la table ${(session as any).table_number}`,
                  customer_name: firstOrder?.customer_name ?? "Client",
                  customer_email: firstOrder?.customer_email ?? null,
                  customer_phone: firstOrder?.customer_phone ?? null,
                  items: allItems,
                },
              ])
              .select("*")
              .maybeSingle();

            if (insertError || !insertedInvoice) {
              throw (
                insertError || new Error("Insertion de la facture échouée")
              );
            }

            invoice = insertedInvoice as any;
          } catch (genError) {
            console.error("Error generating invoice on-the-fly:", genError);
            toast({
              title: "Erreur facture",
              description:
                "Impossible de générer automatiquement la facture.",
              variant: "destructive",
            });
            return;
          }
        }

        setInvoiceToPrint(invoice as any as Invoice);
        setShowPrintDialog(true);
      } catch (error) {
        console.error("Error in printInvoice:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer la facture.",
          variant: "destructive",
        });
      }
    };

    useImperativeHandle(ref, () => ({
      printInvoice,
      printKitchenTicket,
    }));

    const handleConfirmPrint = () => {
      if (!printReady) {
        setPendingPrint(true);
        sonnerToast.message("Préparation de la facture…", {
          description: "Impression automatique dans un instant.",
        });
        return;
      }
      printViewRef.current?.print();
      setShowPrintDialog(false);
    };

    const handleClosePrintDialog = () => {
      setShowPrintDialog(false);
      setInvoiceToPrint(null);
      setServedBy("");
      setPrintReady(false);
      setPendingPrint(false);
      setPrintFormat("restaurant");
    };

    return (
      <>
        <AlertDialog
          open={showPrintDialog}
          onOpenChange={setShowPrintDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Imprimer la facture</AlertDialogTitle>
              <AlertDialogDescription>
                Choisissez le format et indiquez qui a servi cette table.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <Label>Format d'impression</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={
                      printFormat === "restaurant" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setPrintFormat("restaurant")}
                    className="flex-1"
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Ticket (80mm)
                  </Button>
                  <Button
                    variant={printFormat === "a4" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPrintFormat("a4")}
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    A4
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="served-by">Servi par (optionnel)</Label>
                <Input
                  id="served-by"
                  placeholder="Ex: Jean, Marie..."
                  value={servedBy}
                  onChange={(e) => setServedBy(e.target.value)}
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleClosePrintDialog}>
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmPrint}>
                Imprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {invoiceToPrint && (
          <InvoicePrintView
            ref={printViewRef}
            invoice={invoiceToPrint}
            servedBy={servedBy || undefined}
            format={printFormat}
            autoPrint={false}
            onReady={handlePrintReady}
          />
        )}

        {showKitchenTicket && (
          <KitchenTicketPrint
            ref={kitchenTicketRef}
            outletName={outletNameForTicket}
            tableNumber={session.table_number}
            customerName={(session as any)?.customer_name}
            orderType="Sur place"
            reference={session.id.slice(0, 8).toUpperCase()}
            items={orders.flatMap((o) =>
              (o.items || []).map((it: any) => ({
                name: it.name,
                quantity: it.quantity,
                notes: it.notes,
                selectedOptions: it.selectedOptions || it.selected_options,
              })),
            )}
          />
        )}
      </>
    );
  },
);

SessionPrintActions.displayName = "SessionPrintActions";

export default SessionPrintActions;
