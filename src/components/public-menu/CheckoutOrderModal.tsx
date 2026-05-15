
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
import { MessageCircle, CheckCircle2 } from "lucide-react";

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
    numberOfPeople,
    setNumberOfPeople,
    loading,
    handleSubmit,
    restaurantUserId,
    pendingWhatsAppUrl,
    clearPendingWhatsApp,
  } = useCheckoutOrderModal(cart, totalPrice, onOpenChange, onClearCart);

  const handleOpenChange = (next: boolean) => {
    if (!next) clearPendingWhatsApp();
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl">
        {pendingWhatsAppUrl ? (
          <div className="space-y-5 py-2">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Commande envoyée !
              </DialogTitle>
              <DialogDescription>
                Cliquez sur le bouton ci-dessous pour ouvrir WhatsApp et confirmer votre commande au restaurant.
              </DialogDescription>
            </DialogHeader>
            <a
              href={pendingWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                // Close after a short delay so the click can navigate
                setTimeout(() => handleOpenChange(false), 300);
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 active:scale-[0.97] text-white font-semibold py-4 text-base transition-all shadow-lg"
            >
              <MessageCircle className="h-5 w-5" />
              Ouvrir WhatsApp pour confirmer
            </a>
            <p className="text-xs text-center text-muted-foreground">
              Si rien ne s'ouvre, vérifiez que WhatsApp est installé sur votre appareil.
            </p>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
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
                numberOfPeople={numberOfPeople}
                setNumberOfPeople={setNumberOfPeople}
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutOrderModal;
