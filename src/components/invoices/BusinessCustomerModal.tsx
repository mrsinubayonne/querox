import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBusinessCustomers, BusinessCustomer } from "@/hooks/useBusinessCustomers";
import { Loader2 } from "lucide-react";

interface BusinessCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: BusinessCustomer | null;
  outletId?: string;
}

const BusinessCustomerModal: React.FC<BusinessCustomerModalProps> = ({
  open,
  onOpenChange,
  customer,
  outletId,
}) => {
  const { createCustomer, updateCustomer, isCreating, isUpdating } = useBusinessCustomers(outletId);
  
  const [formData, setFormData] = useState({
    company_name: "",
    siret: "",
    address: "",
    contact_person: "",
    email: "",
    phone: "",
    credit_limit: 0,
    payment_terms_days: 30,
    is_active: true,
    notes: "",
    outlet_id: outletId,
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        company_name: customer.company_name || "",
        siret: customer.siret || "",
        address: customer.address || "",
        contact_person: customer.contact_person || "",
        email: customer.email || "",
        phone: customer.phone || "",
        credit_limit: customer.credit_limit || 0,
        payment_terms_days: customer.payment_terms_days || 30,
        is_active: customer.is_active,
        notes: customer.notes || "",
        outlet_id: customer.outlet_id,
      });
    } else {
      setFormData({
        company_name: "",
        siret: "",
        address: "",
        contact_person: "",
        email: "",
        phone: "",
        credit_limit: 0,
        payment_terms_days: 30,
        is_active: true,
        notes: "",
        outlet_id: outletId,
      });
    }
  }, [customer, outletId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (customer) {
      updateCustomer({ id: customer.id, ...formData });
    } else {
      createCustomer(formData);
    }
    
    onOpenChange(false);
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {customer ? "Modifier le client" : "Ajouter un client entreprise"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_name">Nom de l'entreprise *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="siret">SIRET</Label>
              <Input
                id="siret"
                value={formData.siret}
                onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="contact_person">Personne de contact</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="payment_terms_days">Délai de paiement</Label>
              <Select
                value={formData.payment_terms_days.toString()}
                onValueChange={(value) => setFormData({ ...formData, payment_terms_days: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 jours</SelectItem>
                  <SelectItem value="45">45 jours</SelectItem>
                  <SelectItem value="60">60 jours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="credit_limit">Limite de crédit (FCFA)</Label>
              <Input
                id="credit_limit"
                type="number"
                value={formData.credit_limit}
                onChange={(e) => setFormData({ ...formData, credit_limit: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Adresse de facturation</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {customer ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessCustomerModal;
