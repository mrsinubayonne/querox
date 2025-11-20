
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface SubscriptionFormProps {
  onSubscriptionCreated: () => void;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({ onSubscriptionCreated }) => {
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('30');
  const [isLifetime, setIsLifetime] = useState(false);
  const [isTrial, setIsTrial] = useState(false);
  const { toast } = useToast();

  const createOrUpdateSubscription = async () => {
    if (!searchEmail || !selectedTier) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir l'email et le tier",
        variant: "destructive",
      });
      return;
    }

    try {
      let endDate = null;
      let subscriptionStatus = 'active';
      
      if (isLifetime) {
        // Abonnement à vie - date dans 100 ans
        endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 100);
      } else if (isTrial) {
        // Essai gratuit
        endDate = new Date();
        endDate.setDate(endDate.getDate() + parseInt(selectedDuration));
        subscriptionStatus = 'trialing';
      } else {
        // Abonnement temporaire
        endDate = new Date();
        endDate.setDate(endDate.getDate() + parseInt(selectedDuration));
      }

      const { error } = await supabase
        .from('subscribers')
        .upsert({
          email: searchEmail,
          subscription_tier: selectedTier,
          subscribed: true,
          subscription_end: endDate.toISOString(),
          subscription_status: subscriptionStatus,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: isLifetime 
          ? `Abonnement ${selectedTier} à vie accordé`
          : isTrial
          ? `Essai gratuit ${selectedTier} accordé pour ${selectedDuration} jours`
          : `Abonnement ${selectedTier} accordé pour ${selectedDuration} jours`,
      });

      setSearchEmail('');
      setSelectedTier('');
      setIsLifetime(false);
      setIsTrial(false);
      onSubscriptionCreated();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer/modifier l'abonnement",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserPlus className="w-5 h-5 mr-2" />
          Accorder un Abonnement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email utilisateur</label>
            <Input
              placeholder="email@example.com"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tier d'abonnement</label>
            <Select value={selectedTier} onValueChange={setSelectedTier}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Durée (jours)</label>
            <Select 
              value={selectedDuration} 
              onValueChange={setSelectedDuration}
              disabled={isLifetime}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 jours</SelectItem>
                <SelectItem value="30">30 jours</SelectItem>
                <SelectItem value="90">90 jours</SelectItem>
                <SelectItem value="365">365 jours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2 justify-end">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="lifetime" 
                checked={isLifetime}
                onCheckedChange={(checked) => {
                  setIsLifetime(checked as boolean);
                  if (checked) setIsTrial(false);
                }}
              />
              <Label htmlFor="lifetime" className="text-sm font-medium cursor-pointer">
                Abonnement à vie
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="trial" 
                checked={isTrial}
                onCheckedChange={(checked) => {
                  setIsTrial(checked as boolean);
                  if (checked) setIsLifetime(false);
                }}
              />
              <Label htmlFor="trial" className="text-sm font-medium cursor-pointer">
                Essai gratuit
              </Label>
            </div>
          </div>
          <div className="flex items-end">
            <Button onClick={createOrUpdateSubscription} className="w-full">
              Accorder l'abonnement
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionForm;
