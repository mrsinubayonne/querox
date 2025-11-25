import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

interface InvoicePreviewLiveProps {
  sessionId: string;
  tableNumber: string;
  orders: any[];
}

export const InvoicePreviewLive: React.FC<InvoicePreviewLiveProps> = ({
  sessionId,
  tableNumber,
  orders,
}) => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
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
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
  };

  const totalAmount = orders.reduce((sum, order) => sum + order.total_amount, 0);

  // Group all items from all orders
  const allItems: Record<string, { name: string; quantity: number; price: number }> = {};
  orders.forEach((order) => {
    order.items.forEach((item: any) => {
      const key = `${item.id}-${item.price}`;
      if (allItems[key]) {
        allItems[key].quantity += item.quantity;
      } else {
        allItems[key] = { ...item };
      }
    });
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6 bg-card border rounded-lg h-full">
      {/* Header */}
      <div className="flex justify-between items-start pb-4 border-b">
        <div>
          {settings?.logo_url && (
            <img
              src={settings.logo_url}
              alt="Logo"
              className="h-12 mb-2"
            />
          )}
          <h2 className="text-lg font-bold">
            {settings?.company_name || "Mon Restaurant"}
          </h2>
          {settings?.company_address && (
            <p className="text-xs text-muted-foreground whitespace-pre-line">
              {settings.company_address}
            </p>
          )}
          {settings?.company_phone && (
            <p className="text-xs text-muted-foreground">
              Tél: {settings.company_phone}
            </p>
          )}
        </div>
        <div className="text-right">
          <Badge variant="secondary" className="mb-2">
            APERÇU EN DIRECT
          </Badge>
          <h3 className="text-base font-bold">
            {settings?.invoice_title || "FACTURE"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Table {tableNumber}
          </p>
        </div>
      </div>

      {/* Items */}
      <div>
        <h3 className="font-semibold mb-3 text-sm">Articles</h3>
        {Object.values(allItems).length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Aucun article pour le moment
          </p>
        ) : (
          <div className="space-y-2">
            {Object.values(allItems).map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} × {formatCurrency(item.price)}
                  </p>
                </div>
                <p className="font-semibold text-sm">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Total */}
      <div className="flex justify-between items-center text-xl font-bold pt-2 bg-primary/10 p-4 rounded-lg">
        <span>TOTAL</span>
        <span className="text-primary">{formatCurrency(totalAmount)}</span>
      </div>

      {/* Footer note */}
      {settings?.footer_note && (
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground whitespace-pre-line">
            {settings.footer_note}
          </p>
        </div>
      )}
    </div>
  );
};
