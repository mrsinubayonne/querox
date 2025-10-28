
import React from "react";
import type { CartItem } from "@/types/menu";

type Props = {
  cart: CartItem[];
  totalPrice: number;
  orderType: string;
};

const CheckoutOrderCartSummary: React.FC<Props> = ({ cart, totalPrice, orderType }) => {
  if (!orderType) return null;
  return (
    <div className="border-t pt-2 space-y-3">
      <div className="font-semibold text-gray-800">Récapitulatif :</div>
      <ul className="space-y-1 text-sm">
        {cart.map((item) => (
          <li key={item.id} className="flex justify-between">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>
              {(item.price * item.quantity).toLocaleString("fr-FR")} FCFA
            </span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between font-bold text-lg mt-2">
        <span>Total à payer :</span>
        <span className="text-emerald-600">
          {totalPrice.toLocaleString("fr-FR")} FCFA
        </span>
      </div>
    </div>
  );
};

export default CheckoutOrderCartSummary;
