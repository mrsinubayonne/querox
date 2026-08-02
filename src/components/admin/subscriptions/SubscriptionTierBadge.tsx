
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface SubscriptionTierBadgeProps {
  tier: string;
}

const SubscriptionTierBadge: React.FC<SubscriptionTierBadgeProps> = ({ tier }) => {
  const colors = {
    pro: 'bg-purple-100 text-purple-800',
    business: 'bg-blue-100 text-blue-800',
    max: 'bg-orange-100 text-orange-800',
    licence: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <Badge className={colors[tier as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
      {tier?.toUpperCase() || 'AUCUN'}
    </Badge>
  );
};

export default SubscriptionTierBadge;
