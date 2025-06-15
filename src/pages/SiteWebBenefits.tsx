
import React from "react";
import { Rocket, Smartphone } from "lucide-react";

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
    desc: "Votre site livré sous 72h, prêt à l'emploi.",
    color: "text-purple-600",
  },
  {
    icon: Smartphone,
    title: "Adapté mobile/tablette",
    desc: "Un design parfait sur tous les écrans pour une expérience optimale.",
    color: "text-blue-600",
  },
];

const SiteWebBenefits: React.FC = () => (
  <div className="mt-20 grid gap-10 md:grid-cols-2 md:gap-8">
    {benefits.map((benefit, idx) => {
      const Icon = benefit.icon;
      return (
        <div key={idx} className="flex flex-col items-center text-center gap-3">
          <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md">
            <Icon size={24} className={benefit.color} />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-800">{benefit.title}</h4>
            <p className="mt-1 text-gray-600">{benefit.desc}</p>
          </div>
        </div>
      );
    })}
  </div>
);

export default SiteWebBenefits;
