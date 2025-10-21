
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
import { Label } from "@/components/ui/label";

type AddOrderModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated: () => Promise<void>;
};

const AddOrderModal: React.FC<AddOrderModalProps> = ({
  open,
  onOpenChange,
  onOrderCreated,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

      // Get selected outlet
      const { data: profile } = await supabase
        .from('profiles')
        .select('selected_outlet_id')
        .eq('id', user.id)
        .maybeSingle();
      
      const outletId = profile?.selected_outlet_id;
      if (!outletId) {
        toast({
          title: "Erreur",
          description: "Aucun point de vente sélectionné",
          variant: "destructive"
        });
        return;
      }

      // Créer la commande
      const { error: orderError } = await supabase.from("orders").insert([
        {
          user_id: user.id,
          outlet_id: outletId,
          customer_name: customerName,
          customer_phone: customerPhone || null,
          customer_email: customerEmail || null,
          total_amount: Number(totalAmount || 0),
          status: "pending",
        },
      ]);

      if (orderError) {
        throw orderError;
      }

      // Vérifier si le client existe déjà
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id, total_visits, total_spent")
        .eq("user_id", user.id)
        .eq("outlet_id", outletId)
        .eq("phone", customerPhone)
        .maybeSingle();

      if (existingCustomer) {
        // Mettre à jour le client existant
        await supabase
          .from("customers")
          .update({
            name: customerName,
            email: customerEmail || null,
            total_visits: (existingCustomer.total_visits || 0) + 1,
            total_spent: (existingCustomer.total_spent || 0) + Number(totalAmount || 0),
            last_visit: new Date().toISOString().split('T')[0],
          })
          .eq("id", existingCustomer.id);
      } else {
        // Créer un nouveau client
        await supabase.from("customers").insert([
          {
            user_id: user.id,
            outlet_id: outletId,
            name: customerName,
            phone: customerPhone || null,
            email: customerEmail || null,
            total_visits: 1,
            total_spent: Number(totalAmount || 0),
            last_visit: new Date().toISOString().split('T')[0],
          },
        ]);
      }

      toast({
        title: "Commande ajoutée",
        description: "La commande a bien été créée et le client a été enregistré !",
      });

      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setTotalAmount("");
      onOpenChange(false);
      await onOrderCreated();
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
            <Label htmlFor="customer-name">Nom du client *</Label>
            <Input
              id="customer-name"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nom complet"
            />
          </div>
          <div>
            <Label htmlFor="customer-phone">Téléphone *</Label>
            <Input
              id="customer-phone"
              required
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+242 XX XXX XX XX"
            />
          </div>
          <div>
            <Label htmlFor="customer-email">Email (optionnel)</Label>
            <Input
              id="customer-email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="email@exemple.com"
            />
          </div>
          <div>
            <Label htmlFor="total-amount">Montant total (FCFA) *</Label>
            <Input
              id="total-amount"
              required
              type="number"
              min={0}
              step={0.01}
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="ex : 20000 FCFA"
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
