import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

const problems = [
  {
    problem: "Vous perdez des heures sur la gestion manuelle",
    impact: "Vous ne pouvez pas vous concentrer sur vos clients"
  },
  {
    problem: "Vos stocks disparaissent sans savoir pourquoi",
    impact: "Vous perdez des milliers d'euros chaque mois"
  },
  {
    problem: "Vous n'avez aucune visibilité sur vos performances",
    impact: "Impossible d'optimiser et de grandir"
  },
  {
    problem: "Vos outils actuels sont complexes et coûteux",
    impact: "Vous payez pour des fonctionnalités inutiles"
  }
];

const solutions = [
  "Automatisation complète en 1 clic",
  "Suivi des stocks en temps réel avec alertes",
  "Tableaux de bord clairs et actionnables",
  "Tout-en-un simple à 59€/mois"
];

const ProblemSolution: React.FC = () => {
  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-red-100 text-red-600 rounded-full px-4 py-2 mb-6">
            <AlertCircle className="inline h-4 w-4 mr-2" />
            <span className="text-sm font-semibold">Vous reconnaissez ces problèmes ?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-6">
            La réalité des restaurateurs aujourd'hui
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            95% des restaurants rencontrent ces défis quotidiennement. Et si nous vous disions qu'il existe une solution ?
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Problems Side */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Sans QUEROX</h3>
            </div>
            
            {problems.map((item, index) => (
              <Card key={index} className="border-red-200 bg-red-50/50">
                <CardContent className="p-6">
                  <p className="font-bold text-foreground mb-2">{item.problem}</p>
                  <p className="text-sm text-muted-foreground">{item.impact}</p>
                </CardContent>
              </Card>
            ))}

            <Card className="bg-gradient-to-br from-red-100 to-red-50 border-red-200">
              <CardContent className="p-6 text-center">
                <p className="text-3xl font-black text-red-600 mb-2">-40%</p>
                <p className="text-sm font-semibold text-foreground">
                  de rentabilité perdue en moyenne
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Solutions Side */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Avec QUEROX</h3>
            </div>
            
            {solutions.map((solution, index) => (
              <Card key={index} className="border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="font-semibold text-foreground">{solution}</p>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="bg-gradient-to-br from-green-500 to-emerald-500 border-0 text-white">
              <CardContent className="p-6 text-center">
                <p className="text-3xl font-black mb-2">+87%</p>
                <p className="text-sm font-semibold">
                  d'augmentation des revenus en moyenne
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-2xl font-bold text-foreground mb-6">
            Prêt à rejoindre les 500+ restaurants qui ont transformé leur business ?
          </p>
          <a 
            href="#pricing"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-white font-bold text-lg px-8 py-4 rounded-xl hover:opacity-90 transition-opacity"
          >
            Démarrer ma transformation
            <CheckCircle2 className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
