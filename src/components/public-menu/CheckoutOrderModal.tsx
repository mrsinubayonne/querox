
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/types/menu";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type CheckoutOrderModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  totalPrice: number;
  onClearCart: () => void;
};

const ORDER_TYPE_OPTIONS = [
  { value: "sur_place", label: "À manger sur place" },
  { value: "emporter", label: "À emporter" },
  { value: "livrer", label: "À livrer" },
];

const CheckoutOrderModal: React.FC<CheckoutOrderModalProps> = ({
  open,
  onOpenChange,
  cart,
  totalPrice,
  onClearCart,
}) => {
  const [customerName, setCustomerName] = useState("");
  // const [customerEmail, setCustomerEmail] = useState(""); // supprimé
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [notes, setNotes] = useState("");
  const [orderType, setOrderType] = useState("sur_place");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast({
        title: "Panier vide",
        description: "Ajoutez un plat avant de passer commande.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        customer_name: customerName,
        // customer_email: customerEmail, // supprimé
        customer_phone: customerPhone,
        delivery_address: deliveryAddress,
        delivery_time: deliveryTime ? new Date(deliveryTime).toISOString() : null,
        notes,
        status: "pending",
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total_amount: totalPrice,
        order_type: orderType,
      };
      const { error } = await supabase.from("orders").insert([payload]);

      if (error) throw error;

      toast({
        title: "Commande envoyée !",
        description:
          "Votre commande a bien été transmise. Nous vous contacterons rapidement.",
      });
      setCustomerName("");
      // setCustomerEmail(""); // supprimé
      setCustomerPhone("");
      setDeliveryAddress("");
      setDeliveryTime("");
      setNotes("");
      setOrderType("sur_place");
      onOpenChange(false);
      onClearCart();
    } catch (err: any) {
      toast({
        title: "Erreur",
        description:
          err?.message ||
          "Impossible d'envoyer la commande. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Valider ma commande</DialogTitle>
          <DialogDescription>
            Renseignez les informations ci-dessous pour passer votre commande.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <div>
              <label className="block font-medium mb-1">Nom et prénom *</label>
              <Input
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Votre nom complet"
              />
            </div>
            {/* Email supprimé */}
            <div>
              <label className="block font-medium mb-1">Téléphone *</label>
              <Input
                required
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Numéro de téléphone"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Type de commande *</label>
              <Select value={orderType} onValueChange={setOrderType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_TYPE_OPTIONS.map(option => (
                    <SelectItem value={option.value} key={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block font-medium mb-1">Adresse de livraison *</label>
              <Textarea
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Rue, quartier, spécificités…"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Heure de livraison souhaitée</label>
              <Input
                type="datetime-local"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                placeholder="Sélectionner une date/heure"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Notes (optionnel)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Instructions, allergies, code porte…"
              />
            </div>
          </div>
          <div className="border-t pt-2 space-y-3">
            <div className="font-semibold text-gray-800">Récapitulatif :</div>
            <ul className="space-y-1 text-sm">
              {cart.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>{(item.price * item.quantity).toLocaleString("fr-FR")} FCFA</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between font-bold text-lg mt-2">
              <span>Total à payer :</span>
              <span className="text-emerald-600">{totalPrice.toLocaleString("fr-FR")} FCFA</span>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Transmission en cours..." : "Confirmer la commande"}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={loading}>
                Annuler
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutOrderModal;

