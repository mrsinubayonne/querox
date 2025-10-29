import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock } from "lucide-react";
import { TableSession } from "@/hooks/useTableSessions";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface TableCardProps {
  tableNumber: string;
  session: TableSession | null;
  onClick: () => void;
}

export const TableCard: React.FC<TableCardProps> = ({
  tableNumber,
  session,
  onClick,
}) => {
  const getStatusColor = () => {
    if (!session) return "bg-muted/50 hover:bg-muted border-border";
    
    switch (session.status) {
      case "active":
        return "bg-destructive/20 hover:bg-destructive/30 border-destructive";
      case "closed":
        return "bg-warning/20 hover:bg-warning/30 border-warning";
      case "paid":
        return "bg-success/20 hover:bg-success/30 border-success";
      default:
        return "bg-muted/50 hover:bg-muted border-border";
    }
  };

  const getStatusBadge = () => {
    if (!session) {
      return <Badge variant="outline" className="bg-success/10">🟢 Libre</Badge>;
    }

    switch (session.status) {
      case "active":
        return <Badge variant="destructive">🔴 Occupée</Badge>;
      case "closed":
        return <Badge variant="outline" className="bg-warning/10">🟡 En attente</Badge>;
      case "paid":
        return <Badge variant="outline" className="bg-success/10">✅ Payée</Badge>;
      default:
        return <Badge variant="outline">Libre</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card
      className={`p-6 cursor-pointer transition-all ${getStatusColor()}`}
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">Table {tableNumber}</h3>
          {getStatusBadge()}
        </div>

        {session && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            {session.number_of_guests && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{session.number_of_guests} personne{session.number_of_guests > 1 ? "s" : ""}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {formatDistanceToNow(new Date(session.started_at), {
                  addSuffix: true,
                  locale: fr,
                })}
              </span>
            </div>

            {session.status === "active" && (
              <div className="pt-2">
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(session.total_amount)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
