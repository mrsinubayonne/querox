import React from "react";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { TableSession } from "@/hooks/useOptimizedTableSessions";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(amount);

interface Props {
  session: TableSession;
}

export const SessionHeader: React.FC<Props> = ({ session }) => (
  <>
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        Table {session.table_number}
        {session.status === "active" && <Badge variant="destructive">🔴 Active</Badge>}
        {session.status === "closed" && (
          <Badge variant="outline" className="bg-warning/10">🟡 Fermée</Badge>
        )}
        {session.status === "paid" && (
          <Badge variant="outline" className="bg-success/10">✅ Payée</Badge>
        )}
      </DialogTitle>
      <DialogDescription>
        Session ouverte le{" "}
        {format(new Date(session.started_at), "PPP 'à' HH:mm", { locale: fr })}
      </DialogDescription>
    </DialogHeader>

    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
      {session.number_of_guests && (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {session.number_of_guests} personne{session.number_of_guests > 1 ? "s" : ""}
          </span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">
          Durée: {format(new Date(session.started_at), "HH:mm")}
          {session.closed_at && ` - ${format(new Date(session.closed_at), "HH:mm")}`}
        </span>
      </div>
    </div>

    {session.notes && (
      <div className="p-4 bg-muted/30 rounded-lg">
        <div className="flex items-start gap-2">
          <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">Notes:</p>
            <p className="text-sm text-muted-foreground">{session.notes}</p>
          </div>
        </div>
      </div>
    )}
  </>
);

export const SessionTotal: React.FC<Props> = ({ session }) => (
  <div className="p-4 bg-primary/10 rounded-lg">
    <div className="flex justify-between items-center">
      <span className="text-lg font-semibold">Total Session</span>
      <span className="text-2xl font-bold text-primary">
        {formatCurrency(session.total_amount)}
      </span>
    </div>
  </div>
);

export default SessionHeader;
