
import React from 'react';
import { Mail } from 'lucide-react';
import SubscriptionStatusBadge from './SubscriptionStatusBadge';
import SubscriptionTierBadge from './SubscriptionTierBadge';
import SubscriptionDetails from './SubscriptionDetails';
import SubscriptionActions from './SubscriptionActions';

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

interface SubscriptionCardProps {
  subscription: Subscription;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onChangeTier: (id: string, newTier: string) => void;
  onExtendSubscription: (id: string, days: number) => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onToggleStatus,
  onChangeTier,
  onExtendSubscription
}) => {
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <div className="space-y-4">
        {/* En-tête avec email et statuts */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <Mail className="w-4 h-4 text-gray-500" />
              <h4 className="font-semibold text-lg text-gray-900">{subscription.email}</h4>
            </div>
            <div className="flex items-center space-x-3 mb-3">
              <SubscriptionStatusBadge subscription={subscription} />
              <SubscriptionTierBadge tier={subscription.subscription_tier} />
            </div>
          </div>
        </div>

        {/* Informations détaillées */}
        <SubscriptionDetails subscription={subscription} />

        {/* Actions de gestion */}
        <SubscriptionActions
          subscription={subscription}
          onToggleStatus={onToggleStatus}
          onChangeTier={onChangeTier}
          onExtendSubscription={onExtendSubscription}
        />
      </div>
    </div>
  );
};

export default SubscriptionCard;
