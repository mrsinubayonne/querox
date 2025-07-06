
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon, Clock, Euro } from 'lucide-react';

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
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group overflow-hidden">
      <div className={`h-2 bg-gradient-to-r ${service.color}`}></div>
      <CardContent className="p-8">
        <div className="flex items-start space-x-6">
          <div className={`p-4 bg-gradient-to-br ${service.color} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <IconComponent className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors">
              {service.title}
            </h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              {service.description}
            </p>
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-full">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">{service.deliveryTime}</span>
                </div>
                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-full">
                  <Euro className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">{service.price}</span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={onSelect}
              className={`w-full bg-gradient-to-r ${service.color} hover:opacity-90 transition-all duration-300 font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl`}
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
