import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Banknote, Loader2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ServiceSession } from "@/hooks/useServiceTables";

interface Props {
  tableNumber: string;
  session: ServiceSession | null;
  onOpen: () => void;
  onPay?: () => void;
  paying?: boolean;
}

const formatXAF = (n: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + " F CFA";

export const ServiceTableCard: React.FC<Props> = ({
  tableNumber,
  session,
  onOpen,
  onPay,
  paying,
}) => {
  const occupied = !!session;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen();
      }}
      className={cn(
        "rounded-xl border p-4 cursor-pointer transition active:scale-[0.97] hover:shadow-sm flex flex-col gap-3",
        occupied ? "border-destructive/40 bg-destructive/5" : "border-border bg-card",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xl font-bold leading-tight">
          {session?.custom_table_name || `Table ${tableNumber}`}
        </p>
        <Badge variant={occupied ? "destructive" : "secondary"} className="shrink-0">
          {occupied ? "Occupée" : "Libre"}
        </Badge>
      </div>

      {occupied && (
        <>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {session?.number_of_guests || 1} personne
            {(session?.number_of_guests || 1) > 1 ? "s" : ""}
          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatXAF(session?.total_amount || 0)}
          </p>
          {onPay && (
            <Button
              className="w-full"
              disabled={paying}
              onClick={(e) => {
                e.stopPropagation();
                onPay();
              }}
            >
              {paying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Banknote className="h-4 w-4" />
              )}
              Encaisser
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default ServiceTableCard;
