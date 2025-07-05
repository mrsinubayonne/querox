
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
}

interface PricingCardProps {
  plan: PricingPlan;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const getPaymentUrl = (tier: string, period: 'monthly' | 'annual' = 'monthly') => {
    const urls = {
      starter: {
        monthly: 'https://querox.mychariow.com/prd_fbf5sx/checkout',
        annual: 'https://querox.mychariow.com/prd_fbf5sx_annual/checkout'
      },
      premium: {
        monthly: 'https://querox.mychariow.com/prd_aba7bf/checkout',
        annual: 'https://querox.mychariow.com/prd_aba7bf_annual/checkout'
      },
      pro: {
        monthly: 'https://querox.mychariow.com/prd_idfv3d/checkout',
        annual: 'https://querox.mychariow.com/prd_idfv3d_annual/checkout'
      }
    };
    return urls[tier as keyof typeof urls]?.[period];
  };

  const handleSubscribe = async () => {
    console.log('🚀 Bouton cliqué - Début du processus');
    console.log('👤 Utilisateur connecté:', !!user);
    console.log('📦 Plan sélectionné:', plan.tier);

    if (plan.isWhatsApp && plan.whatsappNumber) {
      const message = encodeURIComponent(`Bonjour, je suis intéressé par la LICENCE QUEROX. Pouvez-vous me donner plus d'informations ?`);
      const whatsappUrl = `https://wa.me/${plan.whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`;
      window.open(whatsappUrl, '_blank');
      return;
    }

    if (!user) {
      console.log('❌ Utilisateur non connecté - redirection vers auth');
      window.location.href = '/auth';
      return;
    }

    setProcessing(true);
    console.log('⏳ Processing activé');

    try {
      const paymentUrl = getPaymentUrl(plan.tier, billingPeriod);
      
      if (paymentUrl) {
        console.log('✅ URL de paiement trouvée:', paymentUrl);
        console.log('🌐 Redirection vers:', paymentUrl);
        window.location.href = paymentUrl;
      } else {
        console.log('❌ Aucune URL de paiement trouvée pour le tier:', plan.tier);
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
      console.log('🏁 Processing désactivé');
    }
  };

  const getCurrentPrice = () => {
    if (plan.isWhatsApp) return plan.price;
    return billingPeriod === 'annual' && plan.annualPrice ? plan.annualPrice : plan.price;
  };

  const getCurrentPeriod = () => {
    if (plan.isWhatsApp) return plan.period;
    return billingPeriod === 'annual' && plan.annualPeriod ? plan.annualPeriod : plan.period;
  };

  const getSavings = () => {
    if (!plan.annualPrice || plan.isWhatsApp) return null;
    const monthlyTotal = parseInt(plan.price.replace(/\s/g, '')) * 12;
    const annualPrice = parseInt(plan.annualPrice.replace(/\s/g, ''));
    const savings = monthlyTotal - annualPrice;
    return savings > 0 ? savings : null;
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
        
        {!plan.isWhatsApp && plan.annualPrice ? (
          <div className="mt-4">
            <Tabs value={billingPeriod} onValueChange={(value) => setBillingPeriod(value as 'monthly' | 'annual')}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="monthly">Mensuel</TabsTrigger>
                <TabsTrigger value="annual">Annuel</TabsTrigger>
              </TabsList>
              <TabsContent value="monthly" className="mt-0">
                <div>
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-600 ml-2">{plan.period}</span>
                </div>
              </TabsContent>
              <TabsContent value="annual" className="mt-0">
                <div>
                  <span className="text-4xl font-bold">{plan.annualPrice}</span>
                  <span className="text-gray-600 ml-2">{plan.annualPeriod}</span>
                  {getSavings() && (
                    <div className="mt-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Économisez {getSavings()?.toLocaleString()} FCFA (2 mois offerts)
                      </span>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="mt-4">
            <span className="text-4xl font-bold">{getCurrentPrice()}</span>
            <span className="text-gray-600 ml-2">{getCurrentPeriod()}</span>
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
