
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
import CheckoutOrderFormFields from "./CheckoutOrderFormFields";
import CheckoutOrderCartSummary from "./CheckoutOrderCartSummary";
import type { CartItem } from "@/types/menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type CheckoutOrderModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  totalPrice: number;
  onClearCart: () => void;
};

const CheckoutOrderModal: React.FC<CheckoutOrderModalProps> = ({
  open,
  onOpenChange,
  cart,
  totalPrice,
  onClearCart,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryTime, setDeliveryTime] = useState(""); // ADD THIS LINE
  const [notes, setNotes] = useState("");
  const [orderType, setOrderType] = useState(""); // "sur_place" | "emporter" | "livrer"
  const [tableNumber, setTableNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [restaurantUserId, setRestaurantUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    const fetchRestaurantUser = async () => {
      const params = new URLSearchParams(location.search);
      const menuId = params.get("menu_id");
      if (!menuId) {
        console.error("No menu_id found in URL");
        return;
      }
      const { data, error } = await supabase
        .from("menus")
        .select("user_id")
        .eq("id", menuId)
        .single();
      if (error) {
        console.error("Error fetching restaurant user ID:", error);
        toast({
          title: "Erreur",
          description: "Impossible de vérifier les informations du restaurant.",
          variant: "destructive",
        });
      } else if (data) {
        setRestaurantUserId(data.user_id);
      }
    };

    if (open) {
      fetchRestaurantUser();
    }
  }, [location.search, toast, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderType) {
      toast({
        title: "Type de commande requis",
        description: "Veuillez sélectionner un type de commande.",
        variant: "destructive",
      });
      return;
    }

    if (!restaurantUserId) {
      toast({
        title: "Erreur",
        description: "Impossible d'identifier le restaurant. La commande ne peut être passée.",
        variant: "destructive",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Panier vide",
        description: "Ajoutez un plat avant de passer commande.",
        variant: "destructive",
      });
      return;
    }

    if (orderType === "sur_place" && !tableNumber) {
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
      const orderData: { [key: string]: any } = {
        user_id: restaurantUserId,
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
        order_type: orderType, // "sur_place" | "emporter" | "livrer"
        table_number: orderType === "sur_place" ? tableNumber : null,
        delivery_address: orderType === "livrer" ? deliveryAddress : null,
        delivery_time: deliveryTime || null, // For compatibility if needed elsewhere
      };
      const { error } = await supabase.from("orders").insert([orderData]);

      if (error) throw error;

      toast({
        title: "Commande envoyée !",
        description: "Votre commande a été transmise au restaurant.",
      });
      onClearCart();
      onOpenChange(false);

      setCustomerName("");
      setCustomerPhone("");
      setDeliveryAddress("");
      setDeliveryTime(""); // RESET HERE TOO
      setNotes("");
      setOrderType("");
      setTableNumber("");
      // keep restaurantUserId intact
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
          <CheckoutOrderFormFields
            customerName={customerName}
            setCustomerName={setCustomerName}
            customerPhone={customerPhone}
            setCustomerPhone={setCustomerPhone}
            deliveryAddress={deliveryAddress}
            setDeliveryAddress={setDeliveryAddress}
            deliveryTime={deliveryTime} // ADD THIS
            setDeliveryTime={setDeliveryTime} // ADD THIS
            notes={notes}
            setNotes={setNotes}
            orderType={orderType}
            setOrderType={setOrderType}
            tableNumber={tableNumber}
            setTableNumber={setTableNumber}
          />
          <CheckoutOrderCartSummary
            cart={cart}
            totalPrice={totalPrice}
            orderType={orderType}
          />
          <DialogFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !orderType || !restaurantUserId}
            >
              {loading
                ? "Transmission en cours..."
                : "Confirmer la commande"}
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

// ... end of file
