
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

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

const MarketingServiceCard: React.FC<MarketingServiceCardProps> = ({ service, onSelect }) => {
  const IconComponent = service.icon;

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className={`p-3 bg-gradient-to-br ${service.color} rounded-xl`}>
            <IconComponent className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {service.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {service.description}
            </p>
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  Délai: {service.deliveryTime}
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                  {service.price}
                </span>
              </div>
            </div>
            <Button 
              onClick={onSelect}
              className={`w-full bg-gradient-to-r ${service.color} hover:opacity-90 transition-opacity`}
            >
              Commander ce service
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketingServiceCard;
