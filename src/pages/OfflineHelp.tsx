import React from 'react';
import PageWithSidebar from '@/components/PageWithSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, Info, HelpCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const OfflineHelp: React.FC = () => {
  return (
    <PageWithSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Aide - Mode Hors Ligne</h1>
          <p className="text-muted-foreground mt-2">
            Tout ce que vous devez savoir sur le fonctionnement hors ligne de QUEROX
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Comment ça marche ?</AlertTitle>
          <AlertDescription>
            QUEROX fonctionne même sans connexion Internet. Vos actions sont enregistrées localement 
            et automatiquement synchronisées dès que vous retrouvez une connexion.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Fonctionnalités disponibles hors ligne</CardTitle>
            <CardDescription>Ce que vous pouvez faire sans connexion Internet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Consultation et recherche dans les menus</p>
                <p className="text-sm text-muted-foreground">Accédez à tous vos menus et articles</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Prise de commandes</p>
                <p className="text-sm text-muted-foreground">Créez des commandes qui seront synchronisées plus tard</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Gestion des tables et sessions</p>
                <p className="text-sm text-muted-foreground">Ouvrez et gérez les sessions de tables</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Consultation des clients récents</p>
                <p className="text-sm text-muted-foreground">Accédez aux informations des clients stockées localement</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Consultation de l'inventaire</p>
                <p className="text-sm text-muted-foreground">Vérifiez les stocks disponibles</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Ajout de notes</p>
                <p className="text-sm text-muted-foreground">Ajoutez des notes sur les commandes et tables</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fonctionnalités nécessitant une connexion</CardTitle>
            <CardDescription>Ces actions requièrent d'être en ligne</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <XCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium">Finalisation des paiements</p>
                <p className="text-sm text-muted-foreground">Les transactions financières nécessitent une connexion</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <XCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium">Modifications comptables</p>
                <p className="text-sm text-muted-foreground">Les ajustements comptables doivent être faits en ligne</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <XCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium">Gestion d'équipe</p>
                <p className="text-sm text-muted-foreground">Ajout et suppression de membres nécessitent une connexion</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <XCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium">Statistiques en temps réel</p>
                <p className="text-sm text-muted-foreground">Les données en temps réel nécessitent une connexion active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions fréquentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    <span>Mes données sont-elles sauvegardées hors ligne ?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  Oui, toutes les actions que vous effectuez hors ligne sont sauvegardées localement 
                  dans votre navigateur. Elles seront automatiquement synchronisées dès que vous 
                  retrouverez une connexion Internet.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    <span>Que se passe-t-il si je perds ma connexion pendant une commande ?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  Aucun problème ! QUEROX bascule automatiquement en mode hors ligne. Vous pouvez 
                  continuer à prendre des commandes normalement. Elles seront synchronisées 
                  automatiquement dès que la connexion sera rétablie.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    <span>Combien de temps les données sont-elles conservées ?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  Les données synchronisées sont conservées localement pendant 7 jours. Les actions 
                  en attente de synchronisation sont conservées jusqu'à ce qu'elles soient envoyées 
                  avec succès au serveur. Un nettoyage automatique est effectué régulièrement pour 
                  libérer de l'espace.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    <span>Comment savoir si mes données sont synchronisées ?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  Un indicateur en temps réel s'affiche dans l'en-tête de l'application. Il vous 
                  indique si vous êtes en ligne ou hors ligne, et combien d'actions sont en attente 
                  de synchronisation. Vous pouvez aussi consulter la page "État de la Synchronisation" 
                  pour plus de détails.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    <span>Que faire si mes données ne se synchronisent pas ?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  1. Vérifiez votre connexion Internet<br />
                  2. Consultez la page "État de la Synchronisation" pour voir les détails<br />
                  3. Essayez de forcer la synchronisation manuellement<br />
                  4. Si le problème persiste après 5 tentatives, les actions échouées seront 
                  enregistrées dans les logs pour analyse<br />
                  5. Contactez le support si nécessaire
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    <span>Puis-je vider le cache local ?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  Oui, vous pouvez vider le cache local depuis la page "État de la Synchronisation". 
                  Attention : cette action supprimera toutes les données stockées localement, y compris 
                  les actions en attente de synchronisation. Assurez-vous d'être en ligne et que toutes 
                  vos données sont synchronisées avant de vider le cache.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Limite de stockage</AlertTitle>
          <AlertDescription>
            Le cache local est limité à 50 MB. Un nettoyage automatique des anciennes données 
            est effectué régulièrement. Vous pouvez vérifier l'utilisation du stockage dans 
            la page "État de la Synchronisation".
          </AlertDescription>
        </Alert>
      </div>
    </PageWithSidebar>
  );
};

export default OfflineHelp;
