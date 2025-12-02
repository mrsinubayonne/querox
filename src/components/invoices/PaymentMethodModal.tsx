import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Banknote, CreditCard, Smartphone, Building, UserPlus, Plus } from 'lucide-react';
import { useDebtors } from '@/hooks/useBusinessCustomers';
import { useRestaurant } from '@/contexts/RestaurantContext';
import { useOutlets } from '@/hooks/useOutlets';

interface PaymentMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (method: string, debtorId?: string) => void;
}

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  open,
  onOpenChange,
  onConfirm
}) => {
  const [selectedMethod, setSelectedMethod] = useState('Espèces');
  const [selectedDebtorId, setSelectedDebtorId] = useState<string>('');
  const [showNewDebtor, setShowNewDebtor] = useState(false);
  const [newDebtorName, setNewDebtorName] = useState('');
  const [newDebtorContact, setNewDebtorContact] = useState('');
  const [newDebtorPhone, setNewDebtorPhone] = useState('');
  const { outletId } = useRestaurant();
  const { customers: debtors, createCustomer, isCreating } = useDebtors(outletId || undefined);

  const paymentMethods = [
    { value: 'Espèces', label: 'Espèces', icon: Banknote, color: 'text-green-600' },
    { value: 'Virement', label: 'Virement', icon: Building, color: 'text-blue-600' },
    { value: 'Visa/Mastercard', label: 'Visa/Mastercard', icon: CreditCard, color: 'text-purple-600' },
    { value: 'Mobile Money', label: 'Mobile Money', icon: Smartphone, color: 'text-orange-600' },
    { value: 'Debiteur', label: 'Débiteur (à crédit)', icon: UserPlus, color: 'text-red-600' },
  ];

  const handleConfirm = async () => {
    if (selectedMethod === 'Debiteur') {
      if (showNewDebtor && newDebtorName) {
        // Create new debtor first
        createCustomer({
          company_name: newDebtorName,
          contact_person: newDebtorContact || undefined,
          phone: newDebtorPhone || undefined,
          credit_limit: 0,
          payment_terms_days: 30,
          is_active: true,
        }, {
          onSuccess: (data: any) => {
            onConfirm('Debiteur', data.id);
            resetForm();
            onOpenChange(false);
          }
        });
        return;
      } else if (selectedDebtorId) {
        onConfirm('Debiteur', selectedDebtorId);
      } else {
        return; // Need to select or create a debtor
      }
    } else {
      onConfirm(selectedMethod);
    }
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setSelectedMethod('Espèces');
    setSelectedDebtorId('');
    setShowNewDebtor(false);
    setNewDebtorName('');
    setNewDebtorContact('');
    setNewDebtorPhone('');
  };

  const activeDebtors = debtors.filter(d => d.is_active);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">Moyen de paiement</AlertDialogTitle>
          <AlertDialogDescription className="text-lg">
            Comment le client a-t-il payé ?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <RadioGroup value={selectedMethod} onValueChange={(v) => {
          setSelectedMethod(v);
          if (v !== 'Debiteur') {
            setSelectedDebtorId('');
            setShowNewDebtor(false);
          }
        }} className="gap-3 py-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <div key={method.value} className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => {
                setSelectedMethod(method.value);
                if (method.value !== 'Debiteur') {
                  setSelectedDebtorId('');
                  setShowNewDebtor(false);
                }
              }}>
                <RadioGroupItem value={method.value} id={method.value} />
                <Label htmlFor={method.value} className="flex items-center gap-3 cursor-pointer flex-1">
                  <Icon className={`h-5 w-5 ${method.color}`} />
                  <span className="font-medium">{method.label}</span>
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        {/* Debtor Selection Section */}
        {selectedMethod === 'Debiteur' && (
          <div className="space-y-4 border-t pt-4">
            {!showNewDebtor ? (
              <>
                <div className="space-y-2">
                  <Label>Sélectionner un débiteur</Label>
                  <Select value={selectedDebtorId} onValueChange={setSelectedDebtorId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un débiteur..." />
                    </SelectTrigger>
                    <SelectContent>
                      {activeDebtors.map((debtor) => (
                        <SelectItem key={debtor.id} value={debtor.id}>
                          {debtor.company_name}
                          {debtor.contact_person && ` (${debtor.contact_person})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowNewDebtor(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau débiteur
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Nom de l'entreprise *</Label>
                  <Input
                    value={newDebtorName}
                    onChange={(e) => setNewDebtorName(e.target.value)}
                    placeholder="Nom de l'entreprise"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Personne de contact</Label>
                  <Input
                    value={newDebtorContact}
                    onChange={(e) => setNewDebtorContact(e.target.value)}
                    placeholder="Nom du contact"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input
                    value={newDebtorPhone}
                    onChange={(e) => setNewDebtorPhone(e.target.value)}
                    placeholder="Numéro de téléphone"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowNewDebtor(false);
                    setNewDebtorName('');
                    setNewDebtorContact('');
                    setNewDebtorPhone('');
                  }}
                >
                  ← Retour à la liste
                </Button>
              </div>
            )}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={resetForm}>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={
              isCreating ||
              (selectedMethod === 'Debiteur' && !selectedDebtorId && (!showNewDebtor || !newDebtorName))
            }
          >
            {isCreating ? 'Création...' : 'Confirmer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PaymentMethodModal;
