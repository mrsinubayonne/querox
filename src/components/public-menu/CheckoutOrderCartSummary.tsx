
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
      <div className="text-gray-800" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: '900' }}>Récapitulatif :</div>
      <ul className="space-y-1 text-sm">
        {cart.map((item) => (
          <li key={item.cartKey} className="flex justify-between">
            <span>
              {item.name}
              {item.selected_options && item.selected_options.length > 0 && (
                <span className="text-xs text-gray-500"> ({item.selected_options.map(o => o.value_name).join(', ')})</span>
              )}
              {' '}× {item.quantity}
            </span>
            <span>
              {(item.unit_price * item.quantity).toLocaleString("fr-FR")} FCFA
            </span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between text-lg mt-2" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: '900' }}>
        <span>Total à payer :</span>
        <span className="text-emerald-600">
          {totalPrice.toLocaleString("fr-FR")} FCFA
        </span>
      </div>
    </div>
  );
};

export default CheckoutOrderCartSummary;
