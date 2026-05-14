import React, { useState } from "react";
import PaymentMethodModal, {
  MultiplePaymentBreakdown,
} from "@/components/invoices/PaymentMethodModal";
import { toast as sonnerToast } from "sonner";
import { useButtonTracking } from "@/hooks/useButtonTracking";
import { usePaidCelebration } from "@/hooks/usePaidCelebration";
import type { TableSession } from "@/hooks/useOptimizedTableSessions";

interface Props {
  session: TableSession;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkAsPaid: (sessionId: string, paymentMethod?: string) => Promise<void> | void;
  onBusyChange: (busy: boolean) => void;
}

export const SessionPaymentFlow: React.FC<Props> = ({
  session,
  open,
  onOpenChange,
  onMarkAsPaid,
  onBusyChange,
}) => {
  const { trackClick } = useButtonTracking();
  const { celebrate, CelebrationMessage } = usePaidCelebration();

  const handleMarkAsPaidWithMethod = async (
    paymentMethod: string,
    _debtorId?: string,
    multipleBreakdown?: MultiplePaymentBreakdown,
  ) => {
    if (!session) return;

    trackClick(`Paiement: ${paymentMethod}`, "tables");
    onBusyChange(true);

    try {
      let paymentMethodString = paymentMethod;

      if (paymentMethod === "Multiple" && multipleBreakdown) {
        const parts: string[] = [];
        if (multipleBreakdown.especes > 0)
          parts.push(`Espèces: ${multipleBreakdown.especes} XAF`);
        if (multipleBreakdown.virement > 0)
          parts.push(`Virement: ${multipleBreakdown.virement} XAF`);
        if (multipleBreakdown.carte > 0)
          parts.push(`Carte: ${multipleBreakdown.carte} XAF`);
        if (multipleBreakdown.mobileMoney > 0)
          parts.push(`Mobile Money: ${multipleBreakdown.mobileMoney} XAF`);
        if (multipleBreakdown.debiteur > 0)
          parts.push(`Débiteur: ${multipleBreakdown.debiteur} XAF`);
        paymentMethodString = "Multiple";
      }

      await onMarkAsPaid(session.id, paymentMethodString);
      celebrate();
    } catch (error) {
      console.error("Error marking as paid:", error);
      sonnerToast.error("Erreur lors du paiement. Réessayez.");
    } finally {
      onBusyChange(false);
    }
  };

  return (
    <>
      <PaymentMethodModal
        open={open}
        onOpenChange={onOpenChange}
        onConfirm={handleMarkAsPaidWithMethod}
        totalAmount={session.total_amount}
      />
      <CelebrationMessage />
    </>
  );
};

export default SessionPaymentFlow;
