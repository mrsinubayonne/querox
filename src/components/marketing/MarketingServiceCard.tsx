import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon, Clock, Euro, Star } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
interface MarketingService {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  deliveryTime: string;
  price: string;
}
interface MarketingServiceCardProps {
  service: MarketingService;
  onSelect: () => void;
}
const MarketingServiceCard: React.FC<MarketingServiceCardProps> = ({
  service,
  onSelect
}) => {
  const IconComponent = service.icon;
  const isMobile = useIsMobile();
  return <Card className="border-0 shadow-2xl shadow-gray-500/10 bg-white/95 backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-[1.02] group overflow-hidden">
      <div className={`h-1 bg-gradient-to-r ${service.color}`}></div>
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2">
          <Star className="h-4 w-4 text-white" />
        </div>
      </div>
      
    </Card>;
};
export default MarketingServiceCard;