
import React from 'react';

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

interface SubscriptionDetailsProps {
  subscription: Subscription;
}

const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({ subscription }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
      <div>
        <p><strong>Créé le:</strong> {new Date(subscription.created_at).toLocaleDateString('fr-FR')}</p>
        <p><strong>Mis à jour:</strong> {new Date(subscription.updated_at).toLocaleDateString('fr-FR')}</p>
      </div>
      <div>
        {subscription.subscription_end && (
          <p><strong>Expire le:</strong> {new Date(subscription.subscription_end).toLocaleDateString('fr-FR')}</p>
        )}
        <p><strong>ID:</strong> {subscription.id.slice(0, 8)}...</p>
      </div>
    </div>
  );
};

export default SubscriptionDetails;
