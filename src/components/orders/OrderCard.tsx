
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Clock, MapPin, Phone, Mail, SquareArrowOutUpRight } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { OrderStatusSelect } from './OrderStatusSelect';
import { useNavigate } from 'react-router-dom';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  items: OrderItem[];
  total_amount: number;
  status: string;
  notes?: string;
  delivery_address?: string;
  delivery_time?: string;
  created_at: string;
  table_number?: string;
  order_type?: string;
}

interface OrderCardProps {
  order: Order;
  onStatusChange: () => void;
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    pending: { label: 'En attente', variant: 'secondary' as const },
    confirmed: { label: 'Confirmée', variant: 'default' as const },
    preparing: { label: 'En préparation', variant: 'default' as const },
    ready: { label: 'Prête', variant: 'default' as const },
    delivered: { label: 'Livrée', variant: 'default' as const },
    cancelled: { label: 'Annulée', variant: 'destructive' as const },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const getOrderTypeDisplay = (orderType?: string, tableNumber?: string) => {
  if (!orderType) return null;
  
  switch (orderType) {
    case 'sur_place':
      return `Sur place ${tableNumber ? `- Table ${tableNumber}` : ''}`;
    case 'emporter':
      return 'À emporter';
    case 'livrer':
      return 'À livrer';
    default:
      return orderType;
  }
};

export const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusChange }) => {
  const navigate = useNavigate();
  const orderDate = new Date(order.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const orderTypeDisplay = getOrderTypeDisplay(order.order_type, order.table_number);
  const hasTable = order.order_type === 'sur_place' && order.table_number;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="font-semibold text-lg">{order.customer_name}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {orderDate}
                </div>
                {orderTypeDisplay && (
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {orderTypeDisplay}
                    </span>
                    {hasTable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/tables')}
                        className="h-6 px-2 text-xs"
                      >
                        <SquareArrowOutUpRight className="w-3 h-3 mr-1" />
                        Voir la table
                      </Button>
                    )}
                  </div>
                )}
                {order.customer_phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {order.customer_phone}
                  </div>
                )}
                {order.customer_email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {order.customer_email}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <OrderStatusSelect 
              orderId={order.id}
              currentStatus={order.status}
              onStatusChange={onStatusChange}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Voir les détails</DropdownMenuItem>
                <DropdownMenuItem>Éditer</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">Supprimer</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Items */}
          <div>
            <h4 className="font-medium mb-2">Articles commandés</h4>
            <div className="space-y-1">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span>{(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery info */}
          {order.delivery_address && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
              <span className="text-gray-600">{order.delivery_address}</span>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Notes: </span>
              {order.notes}
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-bold text-emerald-600">
              {order.total_amount.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
