
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
import { useCheckoutOrderModal } from "./useCheckoutOrderModal";
import CheckoutOrderFormFields from "./CheckoutOrderFormFields";
import CheckoutOrderCartSummary from "./CheckoutOrderCartSummary";
import type { CartItem } from "@/types/menu";

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
  const modal = useCheckoutOrderModal(cart, totalPrice, onOpenChange, onClearCart);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Valider ma commande</DialogTitle>
          <DialogDescription>
            Renseignez les informations ci-dessous pour passer votre commande.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={modal.handleSubmit} className="space-y-5">
          <CheckoutOrderFormFields
            customerName={modal.customerName}
            setCustomerName={modal.setCustomerName}
            customerPhone={modal.customerPhone}
            setCustomerPhone={modal.setCustomerPhone}
            deliveryAddress={modal.deliveryAddress}
            setDeliveryAddress={modal.setDeliveryAddress}
            deliveryTime={modal.deliveryTime}
            setDeliveryTime={modal.setDeliveryTime}
            notes={modal.notes}
            setNotes={modal.setNotes}
            orderType={modal.orderType}
            setOrderType={modal.setOrderType}
            tableNumber={modal.tableNumber}
            setTableNumber={modal.setTableNumber}
          />
          <CheckoutOrderCartSummary
            cart={cart}
            totalPrice={totalPrice}
            orderType={modal.orderType}
          />
          <DialogFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={modal.loading || !modal.orderType}
            >
              {modal.loading
                ? "Transmission en cours..."
                : "Confirmer la commande"}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={modal.loading}>
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
