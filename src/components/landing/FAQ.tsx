import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "Ai-je besoin de compétences techniques pour utiliser QUEROX ?",
    answer: "Absolument pas ! QUEROX est conçu pour être utilisé par n'importe qui, sans aucune compétence technique. Notre interface est intuitive et notre équipe vous accompagne à chaque étape. La configuration complète prend moins de 15 minutes."
  },
  {
    question: "Puis-je vraiment essayer gratuitement pendant 14 jours ?",
    answer: "Oui ! Vous avez accès à toutes les fonctionnalités premium pendant 14 jours sans avoir à entrer votre carte bancaire. À la fin de la période d'essai, vous pouvez choisir de continuer avec un abonnement ou arrêter sans frais."
  },
  {
    question: "Comment QUEROX peut-il m'aider à augmenter mon chiffre d'affaires ?",
    answer: "QUEROX automatise vos tâches chronophages (jusqu'à 4h économisées par jour), réduit vos pertes de stock de 40% en moyenne, optimise votre gestion des réservations (+65% de remplissage), et vous fournit des insights précis pour prendre les bonnes décisions. Nos clients constatent en moyenne une augmentation de 87% de leur CA en 6 mois."
  },
  {
    question: "Que se passe-t-il si j'ai besoin d'aide ?",
    answer: "Notre équipe support est disponible 24/7 par chat, email ou téléphone. Le temps de réponse moyen est de moins de 2 heures. De plus, vous avez accès à une bibliothèque complète de tutoriels vidéo et à notre communauté d'entraide."
  },
  {
    question: "Puis-je changer de plan ou annuler à tout moment ?",
    answer: "Oui, absolument ! Vous pouvez upgrader, downgrader ou annuler votre abonnement à tout moment depuis votre tableau de bord. Aucun engagement, aucune pénalité. Si vous annulez, vous gardez l'accès jusqu'à la fin de votre période payée."
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer: "La sécurité est notre priorité absolue. Vos données sont cryptées, sauvegardées quotidiennement et hébergées sur des serveurs certifiés en Europe (RGPD). Nous n'avons jamais eu de fuite de données et nous ne vendrons jamais vos informations."
  },
  {
    question: "QUEROX fonctionne-t-il sur mobile ?",
    answer: "Oui ! QUEROX est 100% responsive et fonctionne parfaitement sur tous les appareils (ordinateur, tablette, smartphone). Vous et votre équipe pouvez gérer le restaurant depuis n'importe où."
  },
  {
    question: "Combien de temps faut-il pour voir des résultats ?",
    answer: "La plupart de nos clients voient des résultats dès les premières semaines : économie de temps immédiate, meilleure visibilité sur les stocks, augmentation des réservations. Les résultats financiers significatifs apparaissent généralement dans les 60-90 jours."
  }
];

const FAQ: React.FC = () => {
  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 mb-6">
            <HelpCircle className="h-4 w-4" />
            <span className="text-sm font-semibold">Vos questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-6">
            Questions fréquentes
          </h2>
          <p className="text-xl text-muted-foreground">
            Tout ce que vous devez savoir avant de commencer
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-card border border-border rounded-xl px-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <p className="text-lg text-muted-foreground mb-6">
            Vous avez d'autres questions ?
          </p>
          <a 
            href="mailto:contact@querox.com"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            Contactez notre équipe
            <HelpCircle className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
