import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { InvoiceDisplayOptions, DEFAULT_DISPLAY_OPTIONS } from "@/types/invoiceDisplayOptions";

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  tableNumber: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  total_amount: number;
  created_at: string;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  isOpen,
  onClose,
  sessionId,
  tableNumber,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, sessionId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (ordersError) throw ordersError;
      setOrders((ordersData as any) || []);

      // Fetch invoice settings
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: settingsData } = await supabase
          .from("invoice_settings")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        setSettings(settingsData);
      }
    } catch (error) {
      console.error("Error fetching preview data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " XAF";
  };

  const totalAmount = orders.reduce((sum, order) => sum + order.total_amount, 0);

  // Group all items from all orders
  const allItems: Record<string, { name: string; quantity: number; price: number }> = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const key = `${item.id}-${item.price}`;
      if (allItems[key]) {
        allItems[key].quantity += item.quantity;
      } else {
        allItems[key] = { ...item };
      }
    });
  });

  const opts: InvoiceDisplayOptions = { ...DEFAULT_DISPLAY_OPTIONS, ...(settings?.display_options || {}) };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Prévisualisation de la facture</DialogTitle>
          <DialogDescription>
            Aperçu de la facture avant clôture de la table
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-4 p-4 bg-card border rounded-lg">
              {/* Header */}
              <div className="flex justify-between items-start pb-4 border-b">
                <div>
                  {opts.show_logo && settings?.logo_url && (
                    <img
                      src={settings.logo_url}
                      alt="Logo"
                      className="h-16 mb-2"
                    />
                  )}
                  <h2 className="text-xl font-bold">
                    {settings?.company_name || "Mon Restaurant"}
                  </h2>
                  {opts.show_company_address && settings?.company_address && (
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {settings.company_address}
                    </p>
                  )}
                  {opts.show_company_phone && settings?.company_phone && (
                    <p className="text-sm text-muted-foreground">
                      Tél: {settings.company_phone}
                    </p>
                  )}
                  {opts.show_tax_id && settings?.tax_id && (
                    <p className="text-sm text-muted-foreground">SIRET/TVA: {settings.tax_id}</p>
                  )}
                  {opts.show_nif && settings?.nif_number && (
                    <p className="text-sm text-muted-foreground">NIU: {settings.nif_number}</p>
                  )}
                  {opts.show_rccm && settings?.rccm_number && (
                    <p className="text-sm text-muted-foreground">RCCM: {settings.rccm_number}</p>
                  )}
                  {opts.show_other_registration && settings?.other_registration && (
                    <p className="text-sm text-muted-foreground">{settings.other_registration}</p>
                  )}
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="mb-2">
                    PRÉVISUALISATION
                  </Badge>
                  <h3 className="text-lg font-bold">
                    {settings?.invoice_title || "FACTURE"}
                  </h3>
                  {opts.show_table_number && (
                    <p className="text-sm text-muted-foreground">
                      Table {tableNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold mb-3">Détails</h3>
                <div className="space-y-2">
                  {Object.values(allItems).map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center text-xl font-bold pt-2">
                <span>TOTAL</span>
                <span className="text-primary">{formatCurrency(totalAmount)}</span>
              </div>

              {/* Footer note */}
              {opts.show_footer_note && settings?.footer_note && (
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground whitespace-pre-line">
                    {settings.footer_note}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};
