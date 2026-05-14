import React from "react";
import { Button } from "@/components/ui/button";
import {
  ChefHat,
  Eye,
  Plus,
  Printer,
  Receipt,
  RotateCcw,
} from "lucide-react";
import { useButtonTracking } from "@/hooks/useButtonTracking";
import type { TableSession } from "@/hooks/useOptimizedTableSessions";

interface Props {
  session: TableSession;
  busy: boolean;
  onPreview: () => void;
  onAddOrder: () => void;
  onPrintKitchen: () => void;
  onCloseSession: () => void;
  onReopenSession?: () => void;
  onPrintInvoice: () => void;
  onMarkPaidClick: () => void;
  onViewInvoice: () => void;
  onClose: () => void;
}

export const SessionActionButtons: React.FC<Props> = ({
  session,
  busy,
  onPreview,
  onAddOrder,
  onPrintKitchen,
  onCloseSession,
  onReopenSession,
  onPrintInvoice,
  onMarkPaidClick,
  onViewInvoice,
  onClose,
}) => {
  const { trackClick } = useButtonTracking();

  return (
    <>
      {session.status === "active" && (
        <>
          <Button onClick={onPreview} variant="outline" disabled={busy}>
            <Eye className="h-4 w-4 mr-2" />
            Prévisualiser
          </Button>
          <Button
            onClick={() => {
              trackClick("Tables: Ajouter commande", "tables");
              onAddOrder();
            }}
            variant="secondary"
            disabled={busy}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une commande
          </Button>
          <Button
            onClick={() => {
              trackClick("Tables: Bon cuisine", "tables");
              onPrintKitchen();
            }}
            variant="outline"
            disabled={busy}
          >
            <ChefHat className="h-4 w-4 mr-2" />
            Bon cuisine
          </Button>
          <Button
            disabled={busy}
            onClick={() => {
              trackClick("Tables: Fermer session", "tables");
              onCloseSession();
            }}
            variant="default"
          >
            <Receipt className="h-4 w-4 mr-2" />
            {busy
              ? "En cours..."
              : session.debtor_id
                ? "Fermer & Créer Crédit"
                : "Fermer & Générer Facture"}
          </Button>
        </>
      )}

      {session.status === "closed" && (
        <>
          {onReopenSession && (
            <Button
              disabled={busy}
              onClick={() => {
                trackClick("Tables: Réouvrir table", "tables");
                onReopenSession();
              }}
              variant="outline"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Réouvrir
            </Button>
          )}
          <Button
            onClick={() => {
              trackClick("Tables: Imprimer facture", "tables");
              onPrintInvoice();
            }}
            variant="outline"
            disabled={busy}
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>

          <Button
            disabled={busy}
            onClick={() => {
              trackClick("Tables: Marquer payée", "tables");
              onMarkPaidClick();
            }}
          >
            {busy ? "En cours..." : "Marquer comme Payée"}
          </Button>
        </>
      )}

      {session.status === "paid" && (
        <>
          {onReopenSession && (
            <Button
              disabled={busy}
              onClick={onReopenSession}
              variant="outline"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Réouvrir
            </Button>
          )}
          <Button onClick={onPrintInvoice} variant="outline" disabled={busy}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <Button onClick={onViewInvoice} variant="secondary" disabled={busy}>
            Voir la Facture
          </Button>
        </>
      )}

      <Button variant="outline" onClick={onClose}>
        Fermer
      </Button>
    </>
  );
};

export default SessionActionButtons;
