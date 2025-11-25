
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { CartItem } from "@/types/menu";
import { useRestaurant } from "@/contexts/RestaurantContext";
import { useLocation } from "react-router-dom";

export const ORDER_TYPE_OPTIONS = [
  { value: "sur_place", label: "À manger sur place" }
];

export const TABLE_NUMBERS = Array.from({ length: 120 }, (_, i) => (i + 1).toString().padStart(2, '0'));

export function useCheckoutOrderModal(cart: CartItem[], totalPrice: number, onOpenChange: (open: boolean) => void, onClearCart: () => void) {
  const location = useLocation();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [orderType, setOrderType] = useState("sur_place");
  const [tableNumber, setTableNumber] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { restaurantUserId, outletId } = useRestaurant();

  // Pre-fill table number from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tableFromUrl = params.get('table');
    if (tableFromUrl) {
      setTableNumber(tableFromUrl.padStart(2, '0'));
      setOrderType("sur_place");
    }
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderType) {
      toast({ title: "Type de commande requis", description: "Veuillez sélectionner un type de commande.", variant: "destructive" });
      return;
    }

    if (!tableNumber) {
      toast({ title: "Numéro de table requis", description: "Veuillez sélectionner un numéro de table.", variant: "destructive" });
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

    setLoading(true);

    try {
      // Vérifier que l'outlet_id est disponible depuis le menu
      if (!outletId) {
        toast({ 
          title: "Erreur", 
          description: "Point de vente non configuré pour ce menu.", 
          variant: "destructive" 
        });
        setLoading(false);
        return;
      }

      // Check if there's an active session for this table
      let sessionId = null;
      if (orderType === "sur_place" && tableNumber) {
        const { data: existingSession, error: checkError } = await supabase
          .from("table_sessions" as any)
          .select("id")
          .eq("user_id", restaurantUserId)
          .eq("outlet_id", outletId)
          .eq("table_number", tableNumber)
          .eq("status", "active")
          .maybeSingle();

        if (!checkError && existingSession) {
          sessionId = (existingSession as any).id;
        } else {
          // Create new session for this table
          const { data: newSession, error: sessionError } = await supabase
            .from("table_sessions" as any)
            .insert([{
              user_id: restaurantUserId,
              outlet_id: outletId,
              table_number: tableNumber,
              number_of_guests: numberOfPeople ? parseInt(numberOfPeople) : null,
              status: "active",
            }])
            .select()
            .single();

          if (!sessionError && newSession) {
            sessionId = (newSession as any).id;
          }
        }
      }

      const payload: any = {
        user_id: restaurantUserId,
        outlet_id: outletId,
        session_id: sessionId,
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
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
        table_number: orderType === "sur_place" && tableNumber ? tableNumber : null,
        delivery_address: orderType === "livrer" && deliveryAddress ? deliveryAddress : null,
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
      setNumberOfPeople("");
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
    numberOfPeople, setNumberOfPeople,
    loading,
    handleSubmit,
    restaurantUserId,
  };
}
