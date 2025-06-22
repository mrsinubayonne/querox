
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { UserCheck, UserX, Clock } from 'lucide-react';

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

interface SubscriptionStatusBadgeProps {
  subscription: Subscription;
}

const SubscriptionStatusBadge: React.FC<SubscriptionStatusBadgeProps> = ({ subscription }) => {
  if (!subscription.subscribed) {
    return <Badge variant="destructive" className="flex items-center gap-1"><UserX className="w-3 h-3" />Inactif</Badge>;
  }

  if (subscription.subscription_end) {
    const endDate = new Date(subscription.subscription_end);
    const now = new Date();
    
    if (endDate < now) {
      return <Badge variant="destructive" className="flex items-center gap-1"><Clock className="w-3 h-3" />Expiré</Badge>;
    }
    
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 7) {
      return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" />Expire dans {daysLeft} jour(s)</Badge>;
    }
    
    return <Badge variant="default" className="flex items-center gap-1"><UserCheck className="w-3 h-3" />Actif ({daysLeft} jours)</Badge>;
  }

  return <Badge variant="default" className="flex items-center gap-1"><UserCheck className="w-3 h-3" />Actif (permanent)</Badge>;
};

export default SubscriptionStatusBadge;
