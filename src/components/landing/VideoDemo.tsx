import React from 'react';
import { Play } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const VideoDemo: React.FC = () => {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent text-sm font-semibold mb-4">
            DÉMONSTRATION
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-6">
            Découvrez Querox en action
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Voyez comment notre plateforme transforme la gestion de votre restaurant en quelques clics
          </p>
        </div>

        {/* Video Container */}
        <Card className="overflow-hidden border-border shadow-2xl max-w-5xl mx-auto">
          <CardContent className="p-0">
            <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-purple-600/20">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/0aQ0z3w58os"
                title="Démonstration Querox"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </CardContent>
        </Card>

        {/* Bottom Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-3xl font-black text-foreground mb-2">2 min</p>
            <p className="text-sm text-muted-foreground">Durée de la vidéo</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-foreground mb-2">15 min</p>
            <p className="text-sm text-muted-foreground">Configuration complète</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-foreground mb-2">Dès 59€</p>
            <p className="text-sm text-muted-foreground">Par mois</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoDemo;
