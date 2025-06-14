
import React from "react";
import { Rocket, Smartphone, BadgeCheck } from "lucide-react";

const benefits = [
  {
    icon: <Rocket size={20} className="text-purple-500" />,
    title: "Mise en ligne Express",
    desc: "Site livré en 1 à 3 jours avec accompagnement humain.",
  },
  {
    icon: <Smartphone size={20} className="text-blue-500" />,
    title: "Adapté mobile/tablette",
    desc: "Design responsive conçu pour augmenter les réservations.",
  },
  {
    icon: <BadgeCheck size={20} className="text-green-500" />,
    title: "Aucun engagement",
    desc: "Zéro risque, service 100% sans abonnement, sans engagement.",
  },
];

const SiteWebBenefits: React.FC = () => (
  <div className="flex flex-col gap-3 mt-4">
    <div className="flex justify-center gap-2">
      {benefits.map((b, idx) => (
        <div
          key={idx}
          className="flex flex-col items-center text-center w-24"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 mb-1">
            {b.icon}
          </span>
          <span className="text-xs font-semibold text-gray-700">{b.title}</span>
        </div>
      ))}
    </div>
    <div className="flex justify-center gap-2 text-xs text-gray-500 mt-2">
      {benefits.map((b, idx) => (
        <span key={idx} className="w-24">{b.desc}</span>
      ))}
    </div>
  </div>
);

export default SiteWebBenefits;
