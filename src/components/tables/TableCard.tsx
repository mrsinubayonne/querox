import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Sparkles } from "lucide-react";
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
  const getStatusStyles = () => {
    if (!session) {
      return {
        card: "bg-gradient-to-br from-success/5 via-background to-background hover:from-success/10 hover:shadow-lg hover:shadow-success/5 border-success/20",
        glow: "opacity-0",
        badge: "bg-success/10 text-success border-success/30",
        icon: "text-success",
      };
    }
    
    switch (session.status) {
      case "active":
        return {
          card: "bg-gradient-to-br from-destructive/10 via-background to-background hover:from-destructive/15 hover:shadow-xl hover:shadow-destructive/10 border-destructive/30",
          glow: "absolute inset-0 bg-gradient-to-r from-destructive/20 to-transparent opacity-50 blur-xl",
          badge: "bg-destructive/10 text-destructive border-destructive/30",
          icon: "text-destructive",
        };
      case "closed":
        return {
          card: "bg-gradient-to-br from-warning/10 via-background to-background hover:from-warning/15 hover:shadow-lg hover:shadow-warning/10 border-warning/30",
          glow: "absolute inset-0 bg-gradient-to-r from-warning/20 to-transparent opacity-30 blur-xl",
          badge: "bg-warning/10 text-warning border-warning/30",
          icon: "text-warning",
        };
      case "paid":
        return {
          card: "bg-gradient-to-br from-primary/5 via-background to-background hover:from-primary/10 hover:shadow-lg hover:shadow-primary/5 border-primary/20",
          glow: "opacity-0",
          badge: "bg-primary/10 text-primary border-primary/30",
          icon: "text-primary",
        };
      default:
        return {
          card: "bg-gradient-to-br from-muted/50 to-background hover:from-muted border-border",
          glow: "opacity-0",
          badge: "bg-muted text-muted-foreground",
          icon: "text-muted-foreground",
        };
    }
  };

  const getStatusBadge = () => {
    if (!session) {
      return (
        <Badge variant="outline" className={styles.badge}>
          <Sparkles className="h-3 w-3 mr-1" />
          Libre
        </Badge>
      );
    }

    switch (session.status) {
      case "active":
        return (
          <Badge variant="outline" className={styles.badge}>
            <span className="relative flex h-2 w-2 mr-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
            </span>
            Occupée
          </Badge>
        );
      case "closed":
        return (
          <Badge variant="outline" className={styles.badge}>
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      case "paid":
        return (
          <Badge variant="outline" className={styles.badge}>
            ✅ Payée
          </Badge>
        );
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

  const styles = getStatusStyles();

  return (
    <div className="relative group">
      <div className={styles.glow}></div>
      <Card
        className={`relative overflow-hidden p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${styles.card}`}
        onClick={onClick}
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                Table {tableNumber}
              </h3>
              {session && session.number_of_guests && (
                <div className={`flex items-center gap-1.5 text-xs ${styles.icon}`}>
                  <Users className="h-3.5 w-3.5" />
                  <span className="font-medium">{session.number_of_guests} {session.number_of_guests > 1 ? "personnes" : "personne"}</span>
                </div>
              )}
            </div>
            {getStatusBadge()}
          </div>

          {session && (
            <div className="space-y-3 pt-3 border-t border-border/50">
              <div className={`flex items-center gap-2 text-sm ${styles.icon}`}>
                <Clock className="h-4 w-4" />
                <span className="font-medium">
                  {formatDistanceToNow(new Date(session.started_at), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </span>
              </div>

              {session.status === "active" && (
                <div className="pt-2">
                  <p className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    {formatCurrency(session.total_amount)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-50"></div>
      </Card>
    </div>
  );
};
