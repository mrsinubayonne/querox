
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { CartItem } from "@/types/menu";
import { useRestaurant } from "@/contexts/RestaurantContext";

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
  const [notes, setNotes] = useState("");
  const [orderType, setOrderType] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { restaurantUserId } = useRestaurant();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderType) {
      toast({ title: "Type de commande requis", description: "Veuillez sélectionner un type de commande.", variant: "destructive" });
      return;
    }

    if (!restaurantUserId) {
      toast({ title: "Erreur", description: "Impossible d'identifier le restaurant. La commande ne peut être passée.", variant: "destructive" });
      return;
    }

    if (cart.length === 0) {
      toast({ title: "Panier vide", description: "Ajoutez un plat avant de passer commande.", variant: "destructive" });
      return;
    }

    if (orderType === "sur_place" && !tableNumber) {
      toast({ title: "Numéro de table requis", description: "Veuillez choisir un numéro de table.", variant: "destructive" });
      return;
    }

    if (orderType === "livrer" && !deliveryAddress) {
      toast({ title: "Adresse de livraison requise", description: "Veuillez saisir votre adresse de livraison.", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      // Call the validate-order edge function for server-side validation
      const { data, error } = await supabase.functions.invoke('validate-order', {
        body: {
          restaurantUserId,
          items: cart.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
          customerName,
          customerPhone,
          orderType,
          tableNumber: orderType === "sur_place" ? tableNumber : undefined,
          deliveryAddress: orderType === "livrer" ? deliveryAddress : undefined,
          notes: notes || undefined,
        },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Order validation failed');
      }

      toast({
        title: "Commande envoyée !",
        description: "Votre commande a été transmise au restaurant.",
      });

      // Reset form
      setCustomerName("");
      setCustomerPhone("");
      setDeliveryAddress("");
      setNotes("");
      setOrderType("");
      setTableNumber("");
      onOpenChange(false);
      onClearCart();
    } catch (err: any) {
      console.error("Order submission error:", err);
      toast({
        title: "Erreur de soumission",
        description: err.message || "Une erreur est survenue lors de l'envoi de votre commande.",
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
    notes, setNotes,
    orderType, setOrderType: handleOrderTypeChange,
    tableNumber, setTableNumber,
    loading,
    handleSubmit,
    restaurantUserId,
  };
}
