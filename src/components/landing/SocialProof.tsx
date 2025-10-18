import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Marie Dubois",
    role: "Propriétaire, Le Petit Bistrot",
    image: "MD",
    rating: 5,
    text: "En 3 mois, j'ai augmenté mes revenus de 92% et je passe 4h de moins par jour sur l'administratif. QUEROX a complètement transformé mon restaurant.",
    result: "+92% de CA"
  },
  {
    name: "Jean-Claude Martin",
    role: "Gérant, Chez Jean",
    image: "JC",
    rating: 5,
    text: "Avant je perdais plus de 5000€ par mois en stocks. Maintenant tout est sous contrôle et mes pertes ont diminué de 85%. Un investissement qui s'est payé en 2 semaines.",
    result: "-85% de pertes"
  },
  {
    name: "Sophie Laurent",
    role: "Chef & Propriétaire, La Table",
    image: "SL",
    rating: 5,
    text: "Interface ultra intuitive. Même mon équipe qui n'est pas à l'aise avec la tech l'utilise sans problème. Et le support répond en moins de 2h à chaque fois !",
    result: "Setup en 10min"
  }
];

const stats = [
  { value: "500+", label: "Restaurants actifs" },
  { value: "4.9/5", label: "Note moyenne" },
  { value: "87%", label: "Croissance moyenne" },
  { value: "24/7", label: "Support disponible" }
];

const SocialProof: React.FC = () => {
  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 rounded-full px-4 py-2 mb-6">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-semibold">Note 4.9/5 - Plus de 500 avis</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-6">
            Ils ont transformé leur restaurant
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Découvrez comment des centaines de restaurateurs ont multiplié leurs revenus avec QUEROX
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
              <CardContent className="p-6 text-center">
                <p className="text-3xl lg:text-4xl font-black text-foreground mb-2">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border hover:shadow-xl transition-shadow">
              <CardContent className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">
                    {testimonial.image}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                  <Quote className="h-8 w-8 text-primary/20" />
                </div>

                {/* Rating */}
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Result Badge */}
                <div className="pt-4 border-t border-border">
                  <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 rounded-full px-3 py-1 text-sm font-bold">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    {testimonial.result}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-lg text-muted-foreground mb-4">
            Rejoignez-les et commencez votre transformation dès aujourd'hui
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 border-2 border-background"></div>
              ))}
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              <span className="text-foreground font-bold">+47 restaurants</span> ont rejoint cette semaine
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
