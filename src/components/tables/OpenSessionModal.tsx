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

interface OpenSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (numberOfGuests: number, notes: string) => void;
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
  const [numberOfGuests, setNumberOfGuests] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const guests = parseInt(numberOfGuests) || 1;
    onConfirm(guests, notes);
    setNumberOfGuests("");
    setNotes("");
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
            <Button type="submit" disabled={loading}>
              {loading ? "Ouverture..." : "Ouvrir la session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
