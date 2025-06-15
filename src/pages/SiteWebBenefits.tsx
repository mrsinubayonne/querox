
import React from "react";
import { Rocket, Smartphone, BadgeCheck } from "lucide-react";

interface Benefit {
  icon: React.ElementType;
  title: string;
  desc: string;
  color: string;
}

const benefits: Benefit[] = [
  {
    icon: Rocket,
    title: "Mise en ligne Express",
    desc: "Votre site livré en 1 à 3 jours, prêt à l'emploi.",
    color: "text-purple-600",
  },
  {
    icon: Smartphone,
    title: "Adapté mobile/tablette",
    desc: "Un design parfait sur tous les écrans pour une expérience client optimale.",
    color: "text-blue-600",
  },
  {
    icon: BadgeCheck,
    title: "Aucun engagement",
    desc: "Service 100% sans abonnement. Vous êtes propriétaire de votre site.",
    color: "text-green-600",
  },
];

const SiteWebBenefits: React.FC = () => (
  <div className="mt-8 space-y-5">
    {benefits.map((benefit, idx) => {
      const Icon = benefit.icon;
      return (
        <div key={idx} className="flex items-start gap-4">
          <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
            <Icon size={22} className={benefit.color} />
          </span>
          <div>
            <h4 className="font-semibold text-gray-800">{benefit.title}</h4>
            <p className="text-sm text-gray-600">{benefit.desc}</p>
          </div>
        </div>
      );
    })}
  </div>
);

export default SiteWebBenefits;
