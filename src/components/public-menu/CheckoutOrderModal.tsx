import React from "react";
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
import { useCheckoutOrderModal } from "./useCheckoutOrderModal";

type CheckoutOrderModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  totalPrice: number;
  onClearCart: () => void;
  restaurantUserId: string | null;
};

const CheckoutOrderModal: React.FC<CheckoutOrderModalProps> = ({
  open,
  onOpenChange,
  cart,
  totalPrice,
  onClearCart,
  restaurantUserId,
}) => {
  const {
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    deliveryAddress,
    setDeliveryAddress,
    deliveryTime,
    setDeliveryTime,
    notes,
    setNotes,
    orderType,
    setOrderType,
    tableNumber,
    setTableNumber,
    loading,
    handleSubmit,
  } = useCheckoutOrderModal(cart, totalPrice, onOpenChange, onClearCart, restaurantUserId);

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
          {!restaurantUserId && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">
                ⚠️ Configuration manquante: impossible d'identifier le restaurant
              </p>
            </div>
          )}
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
