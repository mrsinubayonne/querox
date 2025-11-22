import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { useSuppliers } from '@/hooks/useSuppliers';
import { Package, Plus, ShoppingCart, Eye, Trash2, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import PurchaseOrderModal from './PurchaseOrderModal';

const InventorySuppliersTab: React.FC = () => {
  const { orders, loading, updateOrder, deleteOrder } = usePurchaseOrders();
  const { suppliers } = useSuppliers();
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'sent': return 'bg-blue-500';
      case 'confirmed': return 'bg-purple-500';
      case 'partially_received': return 'bg-yellow-500';
      case 'received': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'sent': return 'Envoyé';
      case 'confirmed': return 'Confirmé';
      case 'partially_received': return 'Partiellement reçu';
      case 'received': return 'Reçu';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    await updateOrder(orderId, { status: newStatus });
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      await deleteOrder(orderId);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
            <p>Chargement des commandes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Commandes fournisseurs</h3>
          <p className="text-sm text-muted-foreground">Gérez vos commandes et approvisionnements</p>
        </div>
        <Button onClick={() => setShowAddOrder(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle commande
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total commandes</p>
            <p className="text-2xl font-bold">{orders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">En attente</p>
            <p className="text-2xl font-bold text-blue-600">
              {orders.filter(o => o.status === 'sent' || o.status === 'confirmed').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Reçues</p>
            <p className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.status === 'received').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Montant total</p>
            <p className="text-2xl font-bold">
              {orders.reduce((sum, o) => sum + (o.total_amount || 0), 0).toLocaleString()} CFA
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des commandes */}
      <div className="space-y-3">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Aucune commande pour le moment</p>
              <Button className="mt-4" onClick={() => setShowAddOrder(true)}>
                Créer une commande
              </Button>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => {
            const supplier = suppliers.find(s => s.id === order.supplier_id);
            return (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg">{order.order_number}</span>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {supplier && (
                          <span>Fournisseur: <strong>{supplier.name}</strong></span>
                        )}
                        <span>Date: {format(new Date(order.order_date), 'dd/MM/yyyy')}</span>
                        {order.expected_delivery_date && (
                          <span>Livraison prévue: {format(new Date(order.expected_delivery_date), 'dd/MM/yyyy')}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {Array.isArray(order.items) ? order.items.length : 0} article(s)
                        </span>
                        <span className="text-sm font-bold">
                          {(order.total_amount || 0).toLocaleString()} CFA
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.status !== 'received' && order.status !== 'cancelled' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(order.id, 'received')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Marquer reçu
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteOrder(order.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal d'ajout de commande */}
      <PurchaseOrderModal
        open={showAddOrder}
        onOpenChange={setShowAddOrder}
        onSuccess={() => setShowAddOrder(false)}
      />

      {/* Modal de détails de commande */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails de la commande {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Fournisseur</p>
                  <p className="font-medium">
                    {suppliers.find(s => s.id === selectedOrder.supplier_id)?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {getStatusLabel(selectedOrder.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date de commande</p>
                  <p className="font-medium">{format(new Date(selectedOrder.order_date), 'dd/MM/yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Livraison prévue</p>
                  <p className="font-medium">
                    {selectedOrder.expected_delivery_date
                      ? format(new Date(selectedOrder.expected_delivery_date), 'dd/MM/yyyy')
                      : 'Non définie'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Articles commandés</h4>
                <div className="space-y-2">
                  {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantité: {item.quantity} {item.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{(item.unit_price * item.quantity).toLocaleString()} CFA</p>
                        <p className="text-sm text-muted-foreground">{item.unit_price.toLocaleString()} CFA/{item.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="font-bold text-2xl">{(selectedOrder.total_amount || 0).toLocaleString()} CFA</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventorySuppliersTab;
