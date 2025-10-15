
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useOrders } from "@/hooks/useOrders";

type AddOrderModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const AddOrderModal: React.FC<AddOrderModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { refetch } = useOrders();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = supabase.auth.getUser && (await supabase.auth.getUser()).data?.user;
      if (!user) {
        toast({
          title: "Erreur",
          description: "Utilisateur non authentifié.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("orders").insert([
        {
          user_id: user.id,
          customer_name: customerName,
          total_amount: Number(totalAmount || 0),
          status: "pending",
        },
      ]);

      if (error) {
        throw error;
      }

      toast({
        title: "Commande ajoutée",
        description: "La commande a bien été créée !",
      });

      setCustomerName("");
      setTotalAmount("");
      onOpenChange(false);
      refetch();
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err?.message || "Impossible d'ajouter la commande.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle commande</DialogTitle>
          <DialogDescription>
            Renseignez les informations du client et le montant.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Nom du client *</label>
            <Input
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nom complet"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Montant total (FCFA) *</label>
            <Input
              required
              type="number"
              min={0}
              step={0.01}
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="ex : 20000 FCFA"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Ajout en cours..." : "Créer"}
            </Button>
            <DialogClose asChild>
              <Button variant="secondary" type="button" disabled={loading}>
                Annuler
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddOrderModal;
