
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { CartItem } from '@/types/menu';

export const ORDER_TYPE_OPTIONS = [
  { value: 'sur_place', label: 'Sur place' },
  { value: 'emporter', label: 'À emporter' },
  { value: 'livrer', label: 'Livraison' },
];

export const TABLE_NUMBERS = [
  'Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5',
  'Table 6', 'Table 7', 'Table 8', 'Table 9', 'Table 10'
];

export const useCheckoutOrderModal = (
  cart: CartItem[],
  totalPrice: number,
  onOpenChange: (open: boolean) => void,
  onClearCart: () => void,
  restaurantUserId: string | null
) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [notes, setNotes] = useState('');
  const [orderType, setOrderType] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  console.log("🔥 useCheckoutOrderModal - restaurantUserId reçu:", restaurantUserId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!restaurantUserId) {
      toast({
        title: "Erreur",
        description: "Impossible d'identifier le restaurant. Veuillez réessayer.",
        variant: "destructive",
      });
      return;
    }

    if (!orderType) {
      toast({
        title: "Type de commande requis",
        description: "Veuillez sélectionner un type de commande.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log("🔥 Envoi de la commande avec restaurantUserId:", restaurantUserId);
      
      const orderData = {
        customer_name: customerName,
        customer_phone: customerPhone || null,
        customer_email: null,
        delivery_address: orderType === 'livrer' ? deliveryAddress : null,
        delivery_time: deliveryTime || null,
        notes: notes || null,
        order_type: orderType,
        table_number: orderType === 'sur_place' ? tableNumber : null,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total_amount: totalPrice,
        user_id: restaurantUserId,
        status: 'pending'
      };

      console.log("🔥 Données de commande à envoyer:", orderData);

      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select();

      if (error) {
        console.error("🔥 Erreur lors de l'insertion de la commande:", error);
        throw error;
      }

      console.log("🔥 Commande créée avec succès:", data);

      toast({
        title: "Commande envoyée !",
        description: "Votre commande a été transmise au restaurant avec succès.",
      });

      // Réinitialiser le formulaire et fermer le modal
      setCustomerName('');
      setCustomerPhone('');
      setDeliveryAddress('');
      setDeliveryTime('');
      setNotes('');
      setOrderType('');
      setTableNumber('');
      onClearCart();
      onOpenChange(false);

    } catch (error: any) {
      console.error('🔥 Erreur lors de la soumission de la commande:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'envoi de la commande.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
};
