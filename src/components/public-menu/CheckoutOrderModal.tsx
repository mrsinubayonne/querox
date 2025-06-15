
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
  const [deliveryTime, setDeliveryTime] = useState("");
  const [notes, setNotes] = useState("");
  const [orderType, setOrderType] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [restaurantUserId, setRestaurantUserId] = useState<string | null>(null);

  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    const fetchRestaurantUser = async () => {
      const params = new URLSearchParams(location.search);
      const menuId = params.get('menu_id');

      if (!menuId) {
        console.error("No menu_id found in URL");
        return;
      }
      
      const { data, error } = await supabase
        .from('menus')
        .select('user_id')
        .eq('id', menuId)
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

    if(open) {
      fetchRestaurantUser();
    }
  }, [location.search, toast, open]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderType) {
      toast({ title: "Champ requis", description: "Veuillez sélectionner un type de commande.", variant: "destructive" });
      return;
    }

    if (!restaurantUserId) {
      toast({ title: "Erreur", description: "Impossible d'identifier le restaurant. La commande ne peut être passée.", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const orderData: { [key: string]: any } = {
        user_id: restaurantUserId,
        customer_name: customerName,
        customer_phone: customerPhone,
        items: cart,
        total_amount: totalPrice,
        status: 'pending',
        notes: notes || null,
        order_type: orderType,
      };

      if (orderType === 'delivery') {
        orderData.delivery_address = deliveryAddress;
        orderData.delivery_time = deliveryTime;
      } else if (orderType === 'dine-in') {
        orderData.table_number = tableNumber;
      }

      const { error } = await supabase.from('orders').insert([orderData]).select().single();

      if (error) throw error;

      toast({ title: "Commande envoyée !", description: "Votre commande a été transmise au restaurant." });
      onClearCart();
      onOpenChange(false);
      
      setCustomerName("");
      setCustomerPhone("");
      setDeliveryAddress("");
      setDeliveryTime("");
      setNotes("");
      setOrderType("");
      setTableNumber("");

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
            deliveryTime={deliveryTime}
            setDeliveryTime={setDeliveryTime}
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
