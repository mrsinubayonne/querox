import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, UserX, Calendar, Plus, Minus, CalendarClock } from 'lucide-react';

interface Subscription {
  id: string;
  user_id: string;
  email: string;
  subscribed: boolean;
  subscription_tier: string;
  subscription_end: string | null;
  created_at: string;
  updated_at: string;
}

interface SubscriptionActionsProps {
  subscription: Subscription;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onChangeTier: (id: string, newTier: string) => void;
  onExtendSubscription: (id: string, days: number) => void;
  onSetCustomEndDate: (id: string, dateIso: string) => void;
}

const toDateInputValue = (iso: string | null) => {
  const d = iso ? new Date(iso) : new Date();
  if (isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const SubscriptionActions: React.FC<SubscriptionActionsProps> = ({
  subscription,
  onToggleStatus,
  onChangeTier,
  onExtendSubscription,
  onSetCustomEndDate,
}) => {
  const [customDays, setCustomDays] = useState<string>('');
  const [customDate, setCustomDate] = useState<string>(toDateInputValue(subscription.subscription_end));

  const applyCustomDays = (sign: 1 | -1) => {
    const n = parseInt(customDays, 10);
    if (!Number.isFinite(n) || n <= 0) return;
    onExtendSubscription(subscription.id, sign * n);
    setCustomDays('');
  };

  const applyCustomDate = () => {
    if (!customDate) return;
    // Fixe l'heure à 23:59:59 locale pour englober toute la journée
    const d = new Date(`${customDate}T23:59:59`);
    onSetCustomEndDate(subscription.id, d.toISOString());
  };

  return (
    <div className="border-t pt-4 space-y-4">
      <h5 className="font-medium text-gray-900">Actions de gestion</h5>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Statut */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Statut</label>
          <Button
            size="sm"
            variant={subscription.subscribed ? 'destructive' : 'default'}
            onClick={() => onToggleStatus(subscription.id, subscription.subscribed)}
            className="w-full"
          >
            {subscription.subscribed ? (
              <>
                <UserX className="w-4 h-4 mr-1" />
                Désactiver (expirer maintenant)
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 mr-1" />
                Activer
              </>
            )}
          </Button>
        </div>

        {/* Tier */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Modifier le tier</label>
          <Select onValueChange={(value) => onChangeTier(subscription.id, value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Changer tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="max">Max</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Ajustement rapide */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Ajustement rapide de la durée</label>
        <div className="grid grid-cols-4 gap-1">
          {[1, 7, 30, 90].map((d) => (
            <Button key={`plus-${d}`} size="sm" variant="outline" onClick={() => onExtendSubscription(subscription.id, d)}>
              <Plus className="w-3 h-3 mr-1" />
              {d}j
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[1, 7, 30, 90].map((d) => (
            <Button
              key={`minus-${d}`}
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={() => onExtendSubscription(subscription.id, -d)}
            >
              <Minus className="w-3 h-3 mr-1" />
              {d}j
            </Button>
          ))}
        </div>
      </div>

      {/* Nombre de jours personnalisé */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Nombre de jours personnalisé</label>
        <div className="flex gap-2">
          <Input
            type="number"
            min={1}
            placeholder="Ex: 15"
            value={customDays}
            onChange={(e) => setCustomDays(e.target.value)}
            className="flex-1"
          />
          <Button size="sm" variant="outline" onClick={() => applyCustomDays(1)}>
            <Plus className="w-3 h-3 mr-1" /> Ajouter
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:text-red-700"
            onClick={() => applyCustomDays(-1)}
          >
            <Minus className="w-3 h-3 mr-1" /> Retirer
          </Button>
        </div>
      </div>

      {/* Date d'expiration exacte */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Fixer une date d'expiration exacte</label>
        <div className="flex gap-2">
          <Input
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="flex-1"
          />
          <Button size="sm" onClick={applyCustomDate}>
            <CalendarClock className="w-4 h-4 mr-1" />
            Appliquer
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          <Calendar className="inline w-3 h-3 mr-1" />
          Si la date est passée, l'abonnement sera automatiquement désactivé.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionActions;
