
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface SubscriptionTierBadgeProps {
  tier: string;
}

const SubscriptionTierBadge: React.FC<SubscriptionTierBadgeProps> = ({ tier }) => {
  const colors = {
    starter: 'bg-green-100 text-green-800',
    premium: 'bg-blue-100 text-blue-800',
    pro: 'bg-purple-100 text-purple-800'
  };

  return (
    <Badge className={colors[tier as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
      {tier?.toUpperCase() || 'AUCUN'}
    </Badge>
  );
};

export default SubscriptionTierBadge;
