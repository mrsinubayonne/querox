import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ServiceCardData {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  deliveryTime?: string;
  price?: string;
}

interface ServiceCardProps {
  service: ServiceCardData;
  onSelect: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onSelect }) => {
  const Icon = service.icon;

  return (
    <Card className="border-0 shadow-xl bg-card hover:shadow-2xl transition-all duration-300 group">
      <CardContent className="p-8 space-y-6">
        <div className="flex items-start gap-5">
          <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-black text-foreground mb-2">{service.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{service.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          {service.deliveryTime && (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {service.deliveryTime}
            </span>
          )}
          {service.price && (
            <span className="font-bold text-foreground">{service.price}</span>
          )}
        </div>

        <Button
          onClick={onSelect}
          className={`w-full bg-gradient-to-r ${service.color} hover:opacity-90 text-primary-foreground font-semibold py-3 group`}
        >
          <span>Demander ce service</span>
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
