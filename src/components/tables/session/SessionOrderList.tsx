import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Package, Pencil, Trash2, X } from "lucide-react";
import { format } from "date-fns";

interface Order {
  id: string;
  customer_name: string;
  items: any[];
  total_amount: number;
  status: string;
  created_at: string;
  session_id?: string;
}

interface Props {
  orders: Order[];
  sessionStatus: string;
  loading: boolean;
  deletingOrderId: string | null;
  onEditOrder: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onDeleteItem: (orderId: string, itemIndex: number) => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(amount);

const getStatusBadge = (status: string) => {
  const statusConfig = {
    pending: { label: "En attente", variant: "outline" as const },
    preparing: { label: "En préparation", variant: "default" as const },
    ready: { label: "Prêt", variant: "secondary" as const },
    delivered: { label: "Livré", variant: "default" as const },
  };
  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const SessionOrderList: React.FC<Props> = ({
  orders,
  sessionStatus,
  loading,
  deletingOrderId,
  onEditOrder,
  onDeleteOrder,
  onDeleteItem,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5" />
        <h3 className="font-semibold">Commandes ({orders.length})</h3>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement...</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucune commande pour cette session.
        </p>
      ) : (
        <div className="space-y-3">
          {orders.map((order, index) => (
            <div key={order.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Commande #{index + 1}</span>
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(order.created_at), "HH:mm")}
                  </span>
                  {sessionStatus === "active" && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onEditOrder(order.id)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDeleteOrder(order.id)}
                        disabled={deletingOrderId === order.id}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="text-sm space-y-1">
                {order.items.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between items-center group"
                  >
                    <span className="text-muted-foreground">
                      {item.quantity}x {item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                      {sessionStatus === "active" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive transition-opacity"
                          onClick={() => onDeleteItem(order.id, i)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />
              <div className="flex justify-between font-medium">
                <span>Sous-total</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionOrderList;
