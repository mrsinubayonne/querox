import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useOptimizedOutlet } from "@/hooks/useOptimizedOutlet";
import { supabase } from "@/integrations/supabase/client";
import type { Debtor } from "@/hooks/useBusinessCustomers";
import DebtorInvoiceItemsManager, { InvoiceItem } from "./DebtorInvoiceItemsManager";
import { toast } from 'sonner';

interface CreateDebtorInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debtor: Debtor | null;
}

const CreateDebtorInvoiceModal: React.FC<CreateDebtorInvoiceModalProps> = ({
  open,
  onOpenChange,
  debtor,
}) => {
  const { user } = useAuth();
  const { outletId } = useOptimizedOutlet();
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!debtor) return null;

  const paymentTerms = debtor.payment_terms_days || 30;
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  const handleClose = () => {
    if (loading) return;
    setItems([]);
    setNotes("");
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Erreur", { description: "Vous devez être connecté pour créer une facture" });
      return;
    }

    if (!outletId) {
      toast.error("Erreur", { description: "Aucun point de vente sélectionné" });
      return;
    }

    if (items.length === 0) {
      toast.error("Articles manquants", { description: "Veuillez ajouter au moins un article à la facture" });
      return;
    }

    try {
      setLoading(true);

      // Générer un numéro de facture séquentiel conforme
      const { data: invoiceNumber, error: numberError } = await supabase.rpc(
        "generate_invoice_number"
      );

      if (numberError || !invoiceNumber) {
        throw numberError || new Error("Impossible de générer le numéro de facture");
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + paymentTerms);
      const dueDateString = dueDate.toISOString().split("T")[0];

      // Convertir les items au format attendu par la BDD
      const invoiceItems = items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: insertError } = await supabase.from("invoices").insert({
        user_id: user.id,
        outlet_id: outletId,
        business_customer_id: debtor.id,
        invoice_number: invoiceNumber as string,
        invoice_type: "b2b",
        total_amount: totalAmount,
        status: "unpaid",
        due_date: dueDateString,
        payment_terms_days: paymentTerms,
        siret: debtor.siret,
        billing_address: debtor.address,
        customer_name: debtor.company_name,
        customer_email: debtor.email,
        customer_phone: debtor.phone,
        notes: notes || null,
        items: invoiceItems,
      });

      if (insertError) {
        throw insertError;
      }

      toast.success("Facture créée", { description: `Facture ${invoiceNumber} créée pour ${debtor.company_name}` });

      handleClose();
    } catch (error: any) {
      console.error("Error creating debtor invoice:", error);
      toast.error("Erreur", { description: "Impossible de créer la facture pour ce débiteur" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une facture pour ce débiteur</DialogTitle>
          <DialogDescription>
            Génère une facture B2B non payée pour {debtor.company_name}. Le crédit sera
            automatiquement ajouté à sa dette.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Débiteur</Label>
            <div className="text-sm font-medium">
              {debtor.company_name}
            </div>
            {debtor.contact_person && (
              <div className="text-xs text-muted-foreground">
                Contact : {debtor.contact_person}
              </div>
            )}
          </div>

          <DebtorInvoiceItemsManager
            items={items}
            onChange={setItems}
          />

          <div className="space-y-1 text-sm text-muted-foreground">
            <div>
              Délai de paiement : <span className="font-medium">{paymentTerms} jours</span>
            </div>
            {totalAmount > 0 && (
              <div className="text-lg font-bold text-foreground">
                Montant total : {totalAmount.toLocaleString()} XAF
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Détails sur la facture, conditions spécifiques, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || items.length === 0}>
              {loading ? "Création..." : "Créer la facture"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDebtorInvoiceModal;
