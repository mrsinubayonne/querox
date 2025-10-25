
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { CartItem } from "@/types/menu";
import { useRestaurant } from "@/contexts/RestaurantContext";

export const ORDER_TYPE_OPTIONS = [
  { value: "sur_place", label: "À manger sur place" }
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
  const { restaurantUserId, outletId } = useRestaurant();

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
      // Resolve outlet_id: prefer outlet from menu context, fallback to owner's selected outlet
      let resolvedOutletId = outletId || null;

      if (!resolvedOutletId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('selected_outlet_id')
          .eq('id', restaurantUserId)
          .maybeSingle();
        resolvedOutletId = profile?.selected_outlet_id || null;
      }
      
      if (!resolvedOutletId) {
        toast({ 
          title: "Erreur", 
          description: "Point de vente non configuré pour ce restaurant.", 
          variant: "destructive" 
        });
        setLoading(false);
        return;
      }

      const payload: any = {
        user_id: restaurantUserId,
        outlet_id: resolvedOutletId,
        customer_name: customerName,
        customer_phone: customerPhone,
        notes: notes || null,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total_amount: totalPrice,
        status: "pending",
        order_type: orderType,
        table_number: orderType === "sur_place" ? tableNumber : null,
        delivery_address: orderType === "livrer" ? deliveryAddress : null,
      };
      const { error } = await supabase.from("orders").insert([payload]);

      if (error) throw error;

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
