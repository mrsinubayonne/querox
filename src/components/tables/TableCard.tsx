import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Clock, Sparkles, Pencil, Receipt, CheckCircle2, Loader2 } from "lucide-react";
import type { TableSession } from "@/hooks/useOptimizedTableSessions";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface TableCardProps {
  tableNumber: string;
  session: TableSession | null;
  customName?: string | null;
  onClick: () => void;
  onRename?: () => void;
  onQuickPay?: () => void;
}

export const TableCard: React.FC<TableCardProps> = ({
  tableNumber,
  session,
  customName,
  onClick,
  onRename,
  onQuickPay,
}) => {
  const getStatusStyles = () => {
    if (!session) {
      return {
        card: "bg-card hover:bg-accent/5 border-2 border-border shadow-sm hover:shadow-md",
        badge: "bg-success text-success-foreground font-semibold",
        icon: "text-foreground",
        title: "text-foreground",
      };
    }
    
    switch (session.status) {
      case "active":
        return {
          card: "bg-destructive/5 hover:bg-destructive/10 border-2 border-destructive shadow-md hover:shadow-lg",
          badge: "bg-destructive text-destructive-foreground font-semibold",
          icon: "text-destructive",
          title: "text-foreground",
        };
      case "closed":
        return {
          card: "bg-warning/5 hover:bg-warning/10 border-2 border-warning shadow-md hover:shadow-lg",
          badge: "bg-warning text-warning-foreground font-semibold",
          icon: "text-warning",
          title: "text-foreground",
        };
      case "paid":
        return {
          card: "bg-primary/5 hover:bg-primary/10 border-2 border-primary shadow-sm hover:shadow-md",
          badge: "bg-primary text-primary-foreground font-semibold",
          icon: "text-primary",
          title: "text-foreground",
        };
      default:
        return {
          card: "bg-card hover:bg-accent/5 border-2 border-border shadow-sm hover:shadow-md",
          badge: "bg-muted text-muted-foreground font-semibold",
          icon: "text-foreground",
          title: "text-foreground",
        };
    }
  };

  const getStatusBadge = () => {
    if (!session) {
      return (
        <Badge className={styles.badge}>
          <Sparkles className="h-3.5 w-3.5 mr-1.5" />
          Libre
        </Badge>
      );
    }

    switch (session.status) {
      case "active":
        return (
          <Badge className={styles.badge}>
            <span className="relative flex h-2.5 w-2.5 mr-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            Occupée
          </Badge>
        );
      case "closed":
        return (
          <Badge className={styles.badge}>
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            En attente
          </Badge>
        );
      case "paid":
        return (
          <Badge className={styles.badge}>
            <span className="mr-1">✅</span>
            Payée
          </Badge>
        );
      default:
        return <Badge>Libre</Badge>;
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

  // Quick pay sub-component with animation
  const QuickPayButton: React.FC<{ onQuickPay: () => void }> = ({ onQuickPay: pay }) => {
    const [paying, setPaying] = useState(false);
    const [done, setDone] = useState(false);

    const handleClick = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (paying || done) return;
      setPaying(true);
      try {
        await pay();
        setDone(true);
      } catch {
        setPaying(false);
      }
    };

    return (
      <Button
        size="sm"
        disabled={paying || done}
        className={`transition-all duration-300 ${done ? 'bg-emerald-500 hover:bg-emerald-500 scale-105' : ''}`}
        onClick={handleClick}
      >
        {done ? (
          <>
            <CheckCircle2 className="h-4 w-4 animate-in zoom-in-50 duration-300" />
            Payée ✓
          </>
        ) : paying ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Paiement...
          </>
        ) : (
          <>
            <Receipt className="h-4 w-4" />
            Marquer payée
          </>
        )}
      </Button>
    );
  };

  const displayName = session?.custom_table_name || customName || `Table ${tableNumber}`;

  return (
    <Card
      className={`relative overflow-hidden p-6 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${styles.card}`}
      onClick={onClick}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <h3 className={`text-3xl font-bold tracking-tight ${styles.title}`}>
                {displayName}
              </h3>
              {onRename && session && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRename();
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
            {session && session.number_of_guests && (
              <div className={`flex items-center gap-2 text-sm font-medium ${styles.icon}`}>
                <Users className="h-4 w-4" />
                <span>{session.number_of_guests} {session.number_of_guests > 1 ? "personnes" : "personne"}</span>
              </div>
            )}
          </div>
          {getStatusBadge()}
        </div>

        {session && (
          <div className="space-y-3 pt-4 border-t-2 border-border">
            <div className={`flex items-center gap-2.5 text-sm font-medium ${styles.icon}`}>
              <Clock className="h-4 w-4" />
              <span>
                {formatDistanceToNow(new Date(session.started_at), {
                  addSuffix: true,
                  locale: fr,
                })}
              </span>
            </div>

            {session.status === "closed" && onQuickPay && (
              <div className="pt-2">
                <QuickPayButton onQuickPay={onQuickPay} />
              </div>
            )}

            {session.status === "active" && (
              <div className="pt-2">
                <p className="text-2xl font-bold text-foreground">
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
