import React from 'react';
import PageWithSidebar from '@/components/PageWithSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, KeySquare, LogIn } from 'lucide-react';
import { ProfileManagement } from '@/pages/ProfileManagement';

const Equipe: React.FC = () => {
  return (
    <SubscriptionGuard feature="la gestion d'équipe">
      <PageWithSidebar>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gestion d'équipe</h1>
                <p className="text-muted-foreground">
                  Créez simplement des profils internes avec code d'accès, sans invitation email.
                </p>
              </div>
            </div>
            <Button asChild variant="outline">
              <a href="/profile-login">
                <LogIn className="w-4 h-4 mr-2" />
                Connexion profil
              </a>
            </Button>
          </div>

          <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center shrink-0">
                <KeySquare className="w-5 h-5 text-purple-700 dark:text-purple-300" />
              </div>
              <div>
                <p className="font-semibold text-sm text-purple-900 dark:text-purple-100">
                  Mode unique activé : profils par code d'accès
                </p>
                <p className="text-xs text-purple-800/80 dark:text-purple-200/80 mt-1">
                  Ajoutez une caissière, un comptable ou un superviseur en créant un profil ci-dessous. Donnez-lui simplement son code.
                </p>
              </div>
            </CardContent>
          </Card>

          <ProfileManagement />
        </div>
      </PageWithSidebar>
    </SubscriptionGuard>
  );
};

export default Equipe;
