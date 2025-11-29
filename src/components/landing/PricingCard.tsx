
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  annualPrice?: string;
  annualPeriod?: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
  tier: string;
  isWhatsApp?: boolean;
  whatsappNumber?: string;
  spotsLeft?: number;
}

interface PricingCardProps {
  plan: PricingPlan;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const getPaymentUrl = (tier: string, isAnnual: boolean = false) => {
    if (isAnnual) {
      const annualUrls = {
        starter: 'https://querox-me.mymaketou.store/fr/products/abonnement-annuel-pro-0/checkout',
        premium: 'https://querox-me.mymaketou.store/fr/products/abonnement-annuel-pro/checkout',
        pro: 'https://querox-me.mymaketou.store/fr/products/abonnement-annuel-pro-5/checkout'
      };
      return annualUrls[tier as keyof typeof annualUrls];
    }
    
    const urls = {
      starter: 'https://querox.maketou.com/products/plan-starter-querox/checkout',
      premium: 'https://querox.maketou.com/products/plan-starter-querox-6/checkout',
      pro: 'https://querox.maketou.com/products/plan-starter-querox-6-1/checkout'
    };
    return urls[tier as keyof typeof urls];
  };

  const handleSubscribe = async () => {
    if (plan.isWhatsApp && plan.whatsappNumber) {
      const message = encodeURIComponent(`Bonjour, je suis intéressé par la LICENCE QUEROX. Pouvez-vous me donner plus d'informations ?`);
      const whatsappUrl = `https://wa.me/${plan.whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`;
      window.open(whatsappUrl, '_blank');
      return;
    }

    if (!user) {
      window.location.href = '/auth';
      return;
    }

    setProcessing(true);

    try {
      const paymentUrl = getPaymentUrl(plan.tier, billingPeriod === 'annual');
      
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        toast({
          title: "Erreur",
          description: "URL de paiement non configurée pour ce plan",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('💥 Erreur lors du paiement:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la redirection",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className={`relative ${plan.popular ? 'border-2 border-blue-500 shadow-lg scale-105' : ''}`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Le plus populaire
          </span>
        </div>
      )}
      
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
        
        {plan.spotsLeft && plan.tier !== 'licence' && (
          <div className="mt-2 inline-flex items-center justify-center bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">
            ⚡ Plus que {plan.spotsLeft} places disponibles
          </div>
        )}
        
        {plan.tier !== 'licence' && plan.annualPrice ? (
          <Tabs value={billingPeriod} onValueChange={(value) => setBillingPeriod(value as 'monthly' | 'annual')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="monthly">Mensuel</TabsTrigger>
              <TabsTrigger value="annual">Annuel</TabsTrigger>
            </TabsList>
            <TabsContent value="monthly" className="mt-0">
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-600 ml-2">{plan.period}</span>
              </div>
            </TabsContent>
            <TabsContent value="annual" className="mt-0">
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.annualPrice}</span>
                <span className="text-gray-600 ml-2">{plan.annualPeriod}</span>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="mt-4">
            <span className="text-4xl font-bold">{plan.price}</span>
            <span className="text-gray-600 ml-2">{plan.period}</span>
          </div>
        )}
        
        <p className="text-gray-600 mt-2">{plan.description}</p>
      </CardHeader>
      
      <CardContent>
        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          className="w-full" 
          onClick={handleSubscribe}
          disabled={processing}
          variant={plan.popular ? "default" : "outline"}
        >
          {processing ? 'Redirection...' : plan.cta}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PricingCard;
