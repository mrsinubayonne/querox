import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { TableSession } from "@/hooks/useOptimizedTableSessions";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import QuickAddOrderToSessionModal from "./QuickAddOrderToSessionModal";
import { InvoicePreviewModal } from "./InvoicePreviewModal";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import {
  getData,
  queueMutation,
  generateLocalId,
  storeData,
} from "@/lib/offlineStorage";
import { toast as sonnerToast, toast } from 'sonner';
import {
  SessionHeader,
  SessionTotal,
} from "./session/SessionHeader";
import { SessionOrderList } from "./session/SessionOrderList";
import { SessionActionButtons } from "./session/SessionActionButtons";
import {
  SessionPrintActions,
  SessionPrintActionsRef,
} from "./session/SessionPrintActions";
import { SessionPaymentFlow } from "./session/SessionPaymentFlow";

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
  isMutating?: boolean;
}

export const TableSessionModal: React.FC<TableSessionModalProps> = ({
  isOpen,
  onClose,
  session,
  onCloseSession,
  onMarkAsPaid,
  onReopenSession,
  isMutating = false,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);

  const { isOffline } = useNetworkStatus();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, isTeamMember, teamMemberSession } = useAuth();
  const printRef = useRef<SessionPrintActionsRef>(null);

  const resolvedUserId = isTeamMember
    ? teamMemberSession?.ownerId || user?.id || ""
    : user?.id || "";

  const busy = isMutating || actionInProgress;

  // Safety auto-reset: if actionInProgress is stuck for 20s, force-reset it
  useEffect(() => {
    if (!actionInProgress) return;
    const timer = setTimeout(() => {
      console.warn("⚠️ actionInProgress stuck for 20s — auto-resetting");
      setActionInProgress(false);
    }, 20_000);
    return () => clearTimeout(timer);
  }, [actionInProgress]);

  const fetchOrdersStable = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const outletId =
        (session as any).outlet_id ||
        localStorage.getItem("selectedOutletId") ||
        undefined;

      const cachedScoped = await getData<Order[]>("orders", resolvedUserId, outletId);
      const cachedFallback =
        !cachedScoped?.data && outletId
          ? await getData<Order[]>("orders", resolvedUserId)
          : cachedScoped;
      const cachedList = (cachedFallback?.data || cachedScoped?.data || []) as Order[];
      const cachedSessionOrders = cachedList.filter(
        (o) => (o as any).session_id === session.id,
      );

      if (isOffline) {
        setOrders(cachedSessionOrders);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("orders" as any)
          .select("*")
          .eq("session_id", session.id)
          .order("created_at", { ascending: true });

        if (error) throw error;
        const serverOrders = ((data as any) || []) as Order[];
        const serverIds = new Set(serverOrders.map((o) => o.id));
        const unsyncedLocal = cachedSessionOrders.filter((o) => !serverIds.has(o.id));
        setOrders([...serverOrders, ...unsyncedLocal]);
      } catch (error) {
        console.warn("Error fetching orders, using cache:", error);
        setOrders(cachedSessionOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.id, isOffline, resolvedUserId]);

  useEffect(() => {
    if (session && isOpen) {
      fetchOrdersStable();
    }
  }, [session?.id, isOpen, fetchOrdersStable]);

  // Real-time listeners for orders + session
  useEffect(() => {
    if (!session?.id || !isOpen) return;

    const ordersChannel = supabase
      .channel(`modal-orders-${session.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `session_id=eq.${session.id}`,
        },
        () => {
          fetchOrdersStable();
        },
      )
      .subscribe();

    const sessionChannel = supabase
      .channel(`modal-session-${session.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "table_sessions",
          filter: `id=eq.${session.id}`,
        },
        () => {
          window.dispatchEvent(new CustomEvent("session-updated"));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(sessionChannel);
    };
  }, [session?.id, isOpen, fetchOrdersStable]);

  const handleViewInvoice = async () => {
    if (!session) return;
    try {
      const { data: invoice } = await supabase
        .from("invoices" as any)
        .select("id")
        .eq("session_id", session.id)
        .maybeSingle();
      if (invoice) {
        navigate("/factures");
        onClose();
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
    }
  };

  const handleEditOrder = (orderId: string) => {
    navigate(`/commandes?edit=${orderId}`);
    onClose();
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Supprimer cette commande ?")) return;
    setDeletingOrderId(orderId);

    try {
      if (isOffline && session) {
        const outletKey =
          (session as any).outlet_id ||
          localStorage.getItem("selectedOutletId") ||
          undefined;
        const ordersKey = ["orders", resolvedUserId, outletKey] as const;
        const sessionsKey = ["table-sessions", resolvedUserId, outletKey] as const;

        await queueMutation({
          table: "orders",
          operation: "delete",
          data: { id: orderId },
          localId: generateLocalId(),
          userId: resolvedUserId,
          outletId: outletKey,
          maxRetries: 3,
          conflictResolution: "client-wins",
        });

        const currentOrders =
          (queryClient.getQueryData(ordersKey) as Order[] | undefined) || orders;
        const nextOrders = currentOrders.filter((o) => o.id !== orderId);
        setOrders(nextOrders.filter((o) => (o as any).session_id === session.id));
        queryClient.setQueryData(ordersKey, nextOrders);
        await storeData("orders", nextOrders as any, resolvedUserId, outletKey);

        const newSessionTotal = nextOrders
          .filter((o) => (o as any).session_id === session.id)
          .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

        await queueMutation({
          table: "table_sessions",
          operation: "update",
          data: {
            id: session.id,
            total_amount: newSessionTotal,
            updated_at: new Date().toISOString(),
          },
          localId: generateLocalId(),
          userId: resolvedUserId,
          outletId: outletKey,
          maxRetries: 3,
          conflictResolution: "client-wins",
        });

        const cachedSessionsScoped = await getData<TableSession[]>(
          "table_sessions",
          resolvedUserId,
          outletKey,
        );
        const cachedSessionsFallback =
          !cachedSessionsScoped?.data && outletKey
            ? await getData<TableSession[]>("table_sessions", resolvedUserId)
            : cachedSessionsScoped;
        const currentSessions =
          (queryClient.getQueryData(sessionsKey) as TableSession[] | undefined) ||
          (cachedSessionsFallback?.data as TableSession[] | undefined) ||
          (cachedSessionsScoped?.data as TableSession[] | undefined) ||
          [];
        const nextSessions = currentSessions.map((s) =>
          s.id === session.id
            ? { ...s, total_amount: newSessionTotal, updated_at: new Date().toISOString() }
            : s,
        );

        if (nextSessions.length > 0) {
          queryClient.setQueryData(sessionsKey, nextSessions);
          await storeData("table_sessions", nextSessions as any, resolvedUserId, outletKey);
        }

        toast.success("Commande supprimée", { description: "Suppression enregistrée hors ligne." });
        window.dispatchEvent(new CustomEvent("session-updated"));
        return;
      }

      const { error } = await supabase.from("orders").delete().eq("id", orderId);
      if (error) throw error;

      toast.success("Commande supprimée", { description: "La commande a été supprimée avec succès." });
      fetchOrdersStable();
      window.dispatchEvent(new CustomEvent("session-updated"));
    } catch (error: any) {
      console.error("Error deleting order:", error);
      toast.error("Erreur", { description: "Impossible de supprimer la commande." });
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleDeleteItem = async (orderId: string, itemIndex: number) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || !session) return;

    const updatedItems = order.items.filter((_: any, i: number) => i !== itemIndex);

    if (updatedItems.length === 0) {
      await handleDeleteOrder(orderId);
      return;
    }

    const newTotal = updatedItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0,
    );

    try {
      if (isOffline) {
        const outletKey =
          (session as any).outlet_id ||
          localStorage.getItem("selectedOutletId") ||
          undefined;
        const ordersKey = ["orders", resolvedUserId, outletKey] as const;
        const sessionsKey = ["table-sessions", resolvedUserId, outletKey] as const;
        const nowIso = new Date().toISOString();

        await queueMutation({
          table: "orders",
          operation: "update",
          data: { id: orderId, items: updatedItems, total_amount: newTotal, updated_at: nowIso },
          localId: generateLocalId(),
          userId: resolvedUserId,
          outletId: outletKey,
          maxRetries: 3,
          conflictResolution: "client-wins",
        });

        const currentOrders =
          (queryClient.getQueryData(ordersKey) as Order[] | undefined) || orders;
        const nextOrders = currentOrders.map((o) =>
          o.id === orderId
            ? ({ ...o, items: updatedItems, total_amount: newTotal, updated_at: nowIso } as any)
            : o,
        );

        queryClient.setQueryData(ordersKey, nextOrders);
        await storeData("orders", nextOrders as any, resolvedUserId, outletKey);
        setOrders(nextOrders.filter((o) => (o as any).session_id === session.id));

        const newSessionTotal = nextOrders
          .filter((o) => (o as any).session_id === session.id)
          .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

        await queueMutation({
          table: "table_sessions",
          operation: "update",
          data: { id: session.id, total_amount: newSessionTotal, updated_at: nowIso },
          localId: generateLocalId(),
          userId: resolvedUserId,
          outletId: outletKey,
          maxRetries: 3,
          conflictResolution: "client-wins",
        });

        const cachedSessionsScoped = await getData<TableSession[]>(
          "table_sessions",
          resolvedUserId,
          outletKey,
        );
        const cachedSessionsFallback =
          !cachedSessionsScoped?.data && outletKey
            ? await getData<TableSession[]>("table_sessions", resolvedUserId)
            : cachedSessionsScoped;
        const currentSessions =
          (queryClient.getQueryData(sessionsKey) as TableSession[] | undefined) ||
          (cachedSessionsFallback?.data as TableSession[] | undefined) ||
          (cachedSessionsScoped?.data as TableSession[] | undefined) ||
          [];
        const nextSessions = currentSessions.map((s) =>
          s.id === session.id
            ? { ...s, total_amount: newSessionTotal, updated_at: nowIso }
            : s,
        );

        if (nextSessions.length > 0) {
          queryClient.setQueryData(sessionsKey, nextSessions);
          await storeData("table_sessions", nextSessions as any, resolvedUserId, outletKey);
        }

        window.dispatchEvent(new CustomEvent("session-updated"));
        toast.success("Plat supprimé", { description: "Suppression enregistrée hors ligne." });
        return;
      }

      const { error } = await supabase
        .from("orders")
        .update({ items: updatedItems, total_amount: newTotal })
        .eq("id", orderId);

      if (error) throw error;

      toast.success("Plat supprimé", { description: "L'article a été retiré de la commande." });
      fetchOrdersStable();
      window.dispatchEvent(new CustomEvent("session-updated"));
    } catch (error: any) {
      console.error("Error deleting item:", error);
      toast.error("Erreur", { description: "Impossible de supprimer l'article." });
    }
  };

  const handleCloseSessionClick = async () => {
    if (!session) return;
    setActionInProgress(true);
    try {
      await onCloseSession(session.id);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      onClose();
    } catch (e) {
      console.error("Error closing session:", e);
      sonnerToast.error("Erreur lors de la fermeture");
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReopenClick = async () => {
    if (!session || !onReopenSession) return;
    setActionInProgress(true);
    try {
      await onReopenSession(session.id);
    } catch (e) {
      sonnerToast.error("Erreur");
    } finally {
      setActionInProgress(false);
    }
  };

  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <SessionHeader session={session} />

        <ScrollArea className="max-h-[50vh]">
          <div className="space-y-4">
            <Separator />
            <SessionOrderList
              orders={orders}
              sessionStatus={session.status}
              loading={loading}
              deletingOrderId={deletingOrderId}
              onEditOrder={handleEditOrder}
              onDeleteOrder={handleDeleteOrder}
              onDeleteItem={handleDeleteItem}
            />
            <Separator />
            <SessionTotal session={session} />
          </div>
        </ScrollArea>

        <DialogFooter className="flex-wrap gap-2">
          <SessionActionButtons
            session={session}
            busy={busy}
            onPreview={() => setShowPreview(true)}
            onAddOrder={() => setShowQuickAddModal(true)}
            onPrintKitchen={() => printRef.current?.printKitchenTicket()}
            onCloseSession={handleCloseSessionClick}
            onReopenSession={onReopenSession ? handleReopenClick : undefined}
            onPrintInvoice={() => printRef.current?.printInvoice()}
            onMarkPaidClick={() => setShowPaymentMethod(true)}
            onViewInvoice={handleViewInvoice}
            onClose={onClose}
          />
        </DialogFooter>
      </DialogContent>

      <QuickAddOrderToSessionModal
        isOpen={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        onSuccess={() => setShowQuickAddModal(false)}
        sessionId={session.id}
        tableNumber={session.table_number}
      />

      <SessionPrintActions ref={printRef} session={session} orders={orders} />

      <InvoicePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        sessionId={session.id}
        tableNumber={session.table_number}
      />

      <SessionPaymentFlow
        session={session}
        open={showPaymentMethod}
        onOpenChange={setShowPaymentMethod}
        onMarkAsPaid={onMarkAsPaid}
        onBusyChange={setActionInProgress}
      />
    </Dialog>
  );
};
