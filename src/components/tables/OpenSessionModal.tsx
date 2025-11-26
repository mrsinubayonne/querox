import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebtors } from "@/hooks/useBusinessCustomers";
import { useRestaurant } from "@/contexts/RestaurantContext";
import { AlertCircle } from "lucide-react";

interface OpenSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (numberOfGuests: number, notes: string, debtorId?: string) => void;
  tableNumber: string;
  loading?: boolean;
}

export const OpenSessionModal: React.FC<OpenSessionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tableNumber,
  loading = false,
}) => {
  const { outletId } = useRestaurant();
  const { customers } = useDebtors(outletId || undefined);
  const [numberOfGuests, setNumberOfGuests] = useState("");
  const [notes, setNotes] = useState("");
  const [isDebtorOrder, setIsDebtorOrder] = useState(false);
  const [selectedDebtorId, setSelectedDebtorId] = useState<string>("");

  const selectedDebtor = customers.find(c => c.id === selectedDebtorId);
  const availableCredit = selectedDebtor 
    ? selectedDebtor.credit_limit - selectedDebtor.current_debt 
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const guests = parseInt(numberOfGuests) || 1;
    onConfirm(guests, notes, isDebtorOrder ? selectedDebtorId : undefined);
    setNumberOfGuests("");
    setNotes("");
    setIsDebtorOrder(false);
    setSelectedDebtorId("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ouvrir la Table {tableNumber}</DialogTitle>
          <DialogDescription>
            Entrez les détails pour démarrer une nouvelle session.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guests">Nombre de personnes (optionnel)</Label>
            <Input
              id="guests"
              type="number"
              min="1"
              placeholder="Ex: 4"
              value={numberOfGuests}
              onChange={(e) => setNumberOfGuests(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="debtor-mode">Client à crédit / Débiteur</Label>
              <p className="text-sm text-muted-foreground">
                Facturation avec paiement différé
              </p>
            </div>
            <Switch
              id="debtor-mode"
              checked={isDebtorOrder}
              onCheckedChange={setIsDebtorOrder}
            />
          </div>

          {isDebtorOrder && (
            <div className="space-y-2">
              <Label htmlFor="debtor">Sélectionner le débiteur *</Label>
              <Select value={selectedDebtorId} onValueChange={setSelectedDebtorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un débiteur" />
                </SelectTrigger>
                <SelectContent>
                  {customers.filter(c => c.is_active).map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.company_name} - Crédit: {(customer.credit_limit - customer.current_debt).toLocaleString()} FCFA
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedDebtor && (
                <div className="text-sm space-y-1">
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Crédit disponible:</span>
                    <span className={availableCredit > 0 ? "text-green-600" : "text-red-600"}>
                      {availableCredit.toLocaleString()} FCFA
                    </span>
                  </p>
                  {availableCredit <= 0 && (
                    <div className="flex items-start gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4 mt-0.5" />
                      <span>Ce débiteur a atteint sa limite de crédit</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Allergies, préférences..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading || (isDebtorOrder && (!selectedDebtorId || availableCredit <= 0))}
            >
              {loading ? "Ouverture..." : "Ouvrir la session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
