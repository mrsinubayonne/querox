import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getPlanBadgeClass, getPlanDisplayName } from '@/utils/subscriptionPlans';

interface SubscriptionTierBadgeProps {
  tier: string;
}

const SubscriptionTierBadge: React.FC<SubscriptionTierBadgeProps> = ({ tier }) => {
  return (
    <Badge className={getPlanBadgeClass(tier)}>
      {getPlanDisplayName(tier).toUpperCase()}
    </Badge>
  );
};

export default SubscriptionTierBadge;
