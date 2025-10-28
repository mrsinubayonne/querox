
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ORDER_TYPE_OPTIONS, TABLE_NUMBERS } from "./useCheckoutOrderModal";

type Props = {
  customerName: string;
  setCustomerName: (val: string) => void;
  customerPhone: string;
  setCustomerPhone: (val: string) => void;
  deliveryAddress: string;
  setDeliveryAddress: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
  orderType: string;
  setOrderType: (val: string) => void;
  tableNumber: string;
  setTableNumber: (val: string) => void;
  numberOfPeople: string;
  setNumberOfPeople: (val: string) => void;
};

const CheckoutOrderFormFields: React.FC<Props> = ({
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
}) => {
  return (
    <div className="space-y-2">
      <div>
        <label className="block font-medium mb-1">Nom et prénom</label>
        <Input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Votre nom complet"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Téléphone</label>
        <Input
          type="tel"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="Numéro de téléphone"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Type de commande *</label>
        <Select
          value={orderType}
          onValueChange={setOrderType}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choisir..." />
          </SelectTrigger>
          <SelectContent>
            {ORDER_TYPE_OPTIONS.map((option) => (
              <SelectItem value={option.value} key={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {orderType === "sur_place" && (
        <>
          <div>
            <label className="block font-medium mb-1">
              Numéro de table
            </label>
            <Select
              value={tableNumber}
              onValueChange={setTableNumber}
            >
              <SelectTrigger>
                <SelectValue placeholder="N° de table" />
              </SelectTrigger>
              <SelectContent>
                {TABLE_NUMBERS.map((num) => (
                  <SelectItem value={num} key={num}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block font-medium mb-1">
              Nombre de personnes
            </label>
            <Input
              type="number"
              min="1"
              value={numberOfPeople}
              onChange={(e) => setNumberOfPeople(e.target.value)}
              placeholder="Nombre de personnes"
            />
          </div>
        </>
      )}

      {orderType === "livrer" && (
        <div>
          <label className="block font-medium mb-1">
            Adresse de livraison
          </label>
          <Textarea
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="Rue, quartier, spécificités…"
          />
        </div>
      )}

      <div>
        <label className="block font-medium mb-1">
          Notes (optionnel)
        </label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Instructions, allergies, code porte…"
          disabled={orderType === ""}
        />
      </div>
    </div>
  );
};

export default CheckoutOrderFormFields;
