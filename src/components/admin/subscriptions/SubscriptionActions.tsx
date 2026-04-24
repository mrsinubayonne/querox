
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, UserX, Calendar } from 'lucide-react';

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
}

const SubscriptionActions: React.FC<SubscriptionActionsProps> = ({
  subscription,
  onToggleStatus,
  onChangeTier,
  onExtendSubscription
}) => {
  return (
    <div className="border-t pt-4">
      <h5 className="font-medium text-gray-900 mb-3">Actions de gestion</h5>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Changement de statut */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Statut</label>
          <Button
            size="sm"
            variant={subscription.subscribed ? "destructive" : "default"}
            onClick={() => onToggleStatus(subscription.id, subscription.subscribed)}
            className="w-full"
          >
            {subscription.subscribed ? (
              <>
                <UserX className="w-4 h-4 mr-1" />
                Désactiver
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 mr-1" />
                Activer
              </>
            )}
          </Button>
        </div>

        {/* Changement de tier */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Modifier le tier</label>
          <Select onValueChange={(value) => onChangeTier(subscription.id, value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Changer tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="starter">Starter</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Extension de durée */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Prolonger</label>
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onExtendSubscription(subscription.id, 1)}
              className="flex-1"
            >
              <Calendar className="w-3 h-3 mr-1" />
              +1j
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onExtendSubscription(subscription.id, 7)}
              className="flex-1"
            >
              <Calendar className="w-3 h-3 mr-1" />
              +7j
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onExtendSubscription(subscription.id, 30)}
              className="flex-1"
            >
              <Calendar className="w-3 h-3 mr-1" />
              +30j
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onExtendSubscription(subscription.id, 90)}
              className="flex-1"
            >
              <Calendar className="w-3 h-3 mr-1" />
              +90j
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionActions;
