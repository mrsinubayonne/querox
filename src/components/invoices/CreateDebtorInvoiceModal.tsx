import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useOptimizedOutlet } from "@/hooks/useOptimizedOutlet";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Debtor } from "@/hooks/useBusinessCustomers";

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
  const { toast } = useToast();

  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!debtor) return null;

  const paymentTerms = debtor.payment_terms_days || 30;

  const handleClose = () => {
    if (loading) return;
    setAmount("");
    setNotes("");
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer une facture",
        variant: "destructive",
      });
      return;
    }

    if (!outletId) {
      toast({
        title: "Erreur",
        description: "Aucun point de vente sélectionné",
        variant: "destructive",
      });
      return;
    }

    const numericAmount = parseFloat(amount.replace(",", "."));

    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Montant invalide",
        description: "Veuillez saisir un montant supérieur à 0",
        variant: "destructive",
      });
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

      const { error: insertError } = await supabase.from("invoices").insert({
        user_id: user.id,
        outlet_id: outletId,
        business_customer_id: debtor.id,
        invoice_number: invoiceNumber as string,
        invoice_type: "b2b",
        total_amount: numericAmount,
        status: "unpaid",
        due_date: dueDateString,
        payment_terms_days: paymentTerms,
        siret: debtor.siret,
        billing_address: debtor.address,
        customer_name: debtor.company_name,
        customer_email: debtor.email,
        customer_phone: debtor.phone,
        notes: notes || null,
        items: [],
      });

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Facture créée",
        description: `Facture ${invoiceNumber} créée pour ${debtor.company_name}`,
      });

      handleClose();
    } catch (error: any) {
      console.error("Error creating debtor invoice:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la facture pour ce débiteur",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
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

          <div className="space-y-2">
            <Label htmlFor="amount">Montant (FCFA) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="Ex: 150000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1 text-sm text-muted-foreground">
            <div>
              Délai de paiement : <span className="font-medium">{paymentTerms} jours</span>
            </div>
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
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer la facture"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDebtorInvoiceModal;
