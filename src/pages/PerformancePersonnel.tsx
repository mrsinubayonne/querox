import React from 'react';
import PageWithSidebar from '@/components/PageWithSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Rocket, BarChart3, Target, Users, TrendingUp } from 'lucide-react';

const PerformancePersonnel: React.FC = () => {
  const upcomingFeatures = [
    {
      icon: BarChart3,
      title: 'Tableaux de bord personnalisés',
      description: 'Visualisez les performances individuelles et collectives avec des graphiques détaillés'
    },
    {
      icon: Target,
      title: 'Objectifs & KPIs',
      description: 'Définissez des objectifs pour chaque membre et suivez leur progression'
    },
    {
      icon: Users,
      title: 'Classements & Récompenses',
      description: 'Motivez votre équipe avec des classements et un système de récompenses'
    },
    {
      icon: TrendingUp,
      title: 'Rapports de productivité',
      description: 'Générez des rapports détaillés sur la productivité de chaque employé'
    }
  ];

  return (
    <SubscriptionGuard feature="la gestion de performance">
      <PageWithSidebar>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold">Performance du Personnel</h1>
                <p className="text-muted-foreground">Suivez les performances et l'activité de votre équipe</p>
              </div>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">
                <Rocket className="w-3 h-3 mr-1" />
                Bientôt disponible
              </Badge>
            </div>
          </div>

          {/* Coming Soon Card */}
          <Card className="border-2 border-dashed border-amber-300 bg-amber-50/50">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto">
                  <Rocket className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Fonctionnalité en cours de développement</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Nous travaillons activement sur cette fonctionnalité pour vous offrir 
                  le meilleur outil de suivi de performance pour votre équipe.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Features */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Ce qui vous attend...</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingFeatures.map((feature, index) => (
                <Card key={index} className="opacity-75">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </PageWithSidebar>
    </SubscriptionGuard>
  );
};

export default PerformancePersonnel;
