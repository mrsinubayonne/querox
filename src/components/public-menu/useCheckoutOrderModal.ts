
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { CartItem } from "@/types/menu";

export const ORDER_TYPE_OPTIONS = [
  { value: "sur_place", label: "À manger sur place" },
  { value: "emporter", label: "À emporter" },
  { value: "livrer", label: "À livrer" },
];

export const TABLE_NUMBERS = Array.from({ length: 20 }, (_, i) => (i + 1).toString());

export function useCheckoutOrderModal(cart: CartItem[], totalPrice: number, onOpenChange: (open: boolean) => void, onClearCart: () => void) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [notes, setNotes] = useState("");
  const [orderType, setOrderType] = useState("");
  const [tableNumber, setTableNumber] = useState("");
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
    if (!orderType) {
      toast({
        title: "Type de commande requis",
        description: "Veuillez choisir un type de commande.",
        variant: "destructive",
      });
      return;
    }
    if (
      (orderType === "sur_place" || orderType === "emporter") &&
      !tableNumber
    ) {
      toast({
        title: "Numéro de table requis",
        description: "Veuillez choisir un numéro de table.",
        variant: "destructive",
      });
      return;
    }
    if (orderType === "livrer" && !deliveryAddress) {
      toast({
        title: "Adresse de livraison requise",
        description: "Veuillez saisir votre adresse de livraison.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_address: orderType === "livrer" ? deliveryAddress : null,
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
        table_number:
          (orderType === "sur_place" || orderType === "emporter")
            ? tableNumber
            : null,
      };
      const { error } = await supabase.from("orders").insert([payload]);

      if (error) throw error;

      toast({
        title: "Commande envoyée !",
        description:
          "Votre commande a bien été transmise. Nous vous contacterons rapidement.",
      });
      setCustomerName("");
      setCustomerPhone("");
      setDeliveryAddress("");
      setDeliveryTime("");
      setNotes("");
      setOrderType("");
      setTableNumber("");
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

  // Reset conditional fields when changing order type
  const handleOrderTypeChange = (val: string) => {
    setOrderType(val);
    setDeliveryAddress("");
    setTableNumber("");
  };

  return {
    customerName, setCustomerName,
    customerPhone, setCustomerPhone,
    deliveryAddress, setDeliveryAddress,
    deliveryTime, setDeliveryTime,
    notes, setNotes,
    orderType, setOrderType: handleOrderTypeChange,
    tableNumber, setTableNumber,
    loading,
    handleSubmit,
  };
}
