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
import { Banknote, CreditCard, Smartphone, Building } from 'lucide-react';

interface PaymentMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (method: string) => void;
}

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  open,
  onOpenChange,
  onConfirm
}) => {
  const [selectedMethod, setSelectedMethod] = useState('Espèces');

  const paymentMethods = [
    { value: 'Espèces', label: 'Espèces', icon: Banknote, color: 'text-green-600' },
    { value: 'Virement', label: 'Virement', icon: Building, color: 'text-blue-600' },
    { value: 'Visa/Mastercard', label: 'Visa/Mastercard', icon: CreditCard, color: 'text-purple-600' },
    { value: 'Mobile Money', label: 'Mobile Money', icon: Smartphone, color: 'text-orange-600' },
  ];

  const handleConfirm = () => {
    onConfirm(selectedMethod);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">Moyen de paiement</AlertDialogTitle>
          <AlertDialogDescription className="text-lg">
            Comment le client a-t-il payé ?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod} className="gap-3 py-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <div key={method.value} className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => setSelectedMethod(method.value)}>
                <RadioGroupItem value={method.value} id={method.value} />
                <Label htmlFor={method.value} className="flex items-center gap-3 cursor-pointer flex-1">
                  <Icon className={`h-5 w-5 ${method.color}`} />
                  <span className="font-medium">{method.label}</span>
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        <AlertDialogFooter>
          <AlertDialogAction onClick={handleConfirm} className="w-full">
            Confirmer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PaymentMethodModal;
