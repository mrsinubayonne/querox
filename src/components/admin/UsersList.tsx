import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Search, Mail, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
}

interface Subscriber {
  user_id: string | null;
  email: string;
  subscribed: boolean;
  subscription_tier: string | null;
}

interface UsersListProps {
  onSelectUser: (email: string, fullName: string | null) => void;
}

const UsersList: React.FC<UsersListProps> = ({ onSelectUser }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch subscribers
      const { data: subscribersData, error: subscribersError } = await supabase
        .from('subscribers')
        .select('user_id, email, subscribed, subscription_tier');

      if (subscribersError) throw subscribersError;

      setProfiles(profilesData || []);
      setSubscribers(subscribersData || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les utilisateurs: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserSubscription = (userId: string, email: string | null) => {
    return subscribers.find(s => 
      s.user_id === userId || (email && s.email === email)
    );
  };

  const filteredProfiles = profiles.filter(profile => 
    profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Liste des utilisateurs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher par email ou nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun utilisateur trouvé
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredProfiles.map((profile) => {
                const subscription = getUserSubscription(profile.id, profile.email);
                const hasSubscription = subscription?.subscribed;

                return (
                  <div
                    key={profile.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium truncate">
                          {profile.email || 'Email non disponible'}
                        </span>
                      </div>
                      {profile.full_name && (
                        <p className="text-sm text-muted-foreground truncate">
                          {profile.full_name}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {hasSubscription ? (
                          <Badge variant="default" className="text-xs">
                            {subscription.subscription_tier || 'Abonné'}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Sans abonnement
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onSelectUser(profile.email || '', profile.full_name)}
                      disabled={!profile.email}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Attribuer
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UsersList;
