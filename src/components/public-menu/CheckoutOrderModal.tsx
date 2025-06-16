
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
};

const CheckoutOrderModal: React.FC<CheckoutOrderModalProps> = ({
  open,
  onOpenChange,
  cart,
  totalPrice,
  onClearCart,
}) => {
  const {
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    deliveryAddress,
    setDeliveryAddress,
    notes,
    setNotes,
    orderType,
    setOrderType,
    tableNumber,
    setTableNumber,
    loading,
    handleSubmit,
    restaurantUserId,
  } = useCheckoutOrderModal(cart, totalPrice, onOpenChange, onClearCart);

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
