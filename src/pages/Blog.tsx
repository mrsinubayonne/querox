import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import LandingNavigation from '@/components/landing/LandingNavigation';
import LandingFooter from '@/components/landing/LandingFooter';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  tags: string[];
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Comment optimiser la gestion de votre restaurant en 2025',
    excerpt: 'Découvrez les meilleures pratiques pour améliorer l\'efficacité opérationnelle de votre établissement grâce à la digitalisation et l\'automatisation.',
    content: `La digitalisation de la restauration n'est plus une option mais une nécessité pour rester compétitif en 2025. Voici les principales stratégies à mettre en place :

## 1. Automatisez la gestion des commandes

Les systèmes de commande digitale permettent de réduire les erreurs humaines de 80% et d'améliorer la satisfaction client. En intégrant un menu QR code, vos clients peuvent commander directement depuis leur table, ce qui fluidifie le service et libère votre personnel pour un accompagnement plus qualitatif.

## 2. Optimisez votre gestion des stocks

Une bonne gestion des stocks peut vous faire économiser jusqu'à 30% sur vos achats. Utilisez des outils qui vous alertent en temps réel sur les ruptures de stock et analysent vos tendances de consommation pour anticiper vos besoins.

## 3. Analysez vos données de vente

Les données sont votre meilleur allié pour prendre des décisions éclairées. Identifiez vos plats les plus rentables, les heures de pointe, et ajustez votre offre en conséquence. Un tableau de bord analytique vous donne une vue d'ensemble de votre activité en un coup d'œil.

## 4. Fidélisez votre clientèle

Mettez en place un programme de fidélité digital. Les clients qui reviennent régulièrement génèrent 65% du chiffre d'affaires moyen d'un restaurant. Offrez des récompenses personnalisées basées sur leurs habitudes de consommation.

## Conclusion

La digitalisation n'est pas qu'une question de technologie, c'est un investissement rentable qui améliore l'expérience client tout en optimisant vos coûts opérationnels. Commencez par les bases et évoluez progressivement vers des solutions plus avancées.`,
    author: 'Équipe QUEROX',
    date: '2025-01-15',
    readTime: '5 min',
    category: 'Gestion',
    image: '/lovable-uploads/logo-querox.png',
    tags: ['Gestion', 'Digital', 'Optimisation']
  },
  {
    id: '2',
    title: 'Menu Digital QR Code : Économisez et Modernisez votre Restaurant',
    excerpt: 'Réduisez vos coûts d\'impression de 90% et offrez une expérience client moderne et interactive avec le menu QR code.',
    content: `Le menu digital via QR code révolutionne la restauration. Voici pourquoi vous devez l'adopter dès maintenant :

## Économies substantielles

Fini les impressions coûteuses à chaque changement de menu. Un restaurant moyen dépense 2000€ par an en impression de menus. Avec le QR code, cette dépense disparaît complètement. Vous pouvez modifier vos prix, ajouter des plats ou promouvoir des offres spéciales instantanément, sans coût supplémentaire.

## Expérience client améliorée

Les clients modernes apprécient la technologie qui simplifie leur expérience. Avec un menu digital :
- Photos haute qualité de chaque plat
- Informations nutritionnelles et allergènes clairement affichés
- Traduction automatique en plusieurs langues
- Commande directe depuis la table

## Hygiène et sécurité

Plus besoin de menus physiques manipulés par des dizaines de personnes. Le QR code offre une solution hygiénique qui rassure vos clients, particulièrement important depuis la pandémie.

## Données et analytics

Suivez en temps réel quels plats attirent le plus l'attention, combien de temps les clients passent sur chaque page, et optimisez votre menu en conséquence. Ces données précieuses vous permettent d'augmenter votre chiffre d'affaires.

## Mise en place simple

L'installation est rapide : générez votre QR code, imprimez-le une seule fois sur des supports durables (table, vitrine, comptoir), et c'est parti. Vos clients scannent et accèdent instantanément à votre menu.

## Conclusion

Le menu QR code n'est plus une tendance mais un standard de l'industrie. Les restaurants qui l'adoptent constatent une augmentation de 25% de leurs commandes et une amélioration significative de la satisfaction client.`,
    author: 'Équipe QUEROX',
    date: '2025-01-10',
    readTime: '4 min',
    category: 'Technologie',
    image: '/lovable-uploads/logo-querox.png',
    tags: ['QR Code', 'Menu Digital', 'Innovation']
  },
  {
    id: '3',
    title: '7 Stratégies Marketing Qui Remplissent les Restaurants en 2025',
    excerpt: 'Apprenez à utiliser le marketing digital pour augmenter votre visibilité et attirer 3x plus de clients dans votre restaurant.',
    content: `Le marketing digital transforme la façon dont les restaurants attirent et fidélisent leurs clients. Voici les stratégies qui fonctionnent vraiment :

## 1. Optimisez votre présence Google

83% des clients recherchent un restaurant sur Google avant de se déplacer. Assurez-vous que votre fiche Google My Business est complète avec :
- Photos attractives de vos plats
- Horaires d'ouverture à jour
- Réponses aux avis clients
- Menu et tarifs clairs

## 2. Créez du contenu sur les réseaux sociaux

Postez régulièrement sur Instagram et Facebook. Les restaurants qui publient au moins 3 fois par semaine voient leur engagement augmenter de 120%. Montrez vos coulisses, vos nouveaux plats, votre équipe.

## 3. Lancez des campagnes publicitaires ciblées

Facebook et Instagram Ads permettent de cibler précisément les personnes dans un rayon de 5km autour de votre restaurant. Budget minimum : 10€/jour pour des résultats visibles.

## 4. Programme de fidélité digital

Récompensez vos clients réguliers avec des points, des réductions ou des offres exclusives. Les clients fidèles dépensent en moyenne 67% de plus que les nouveaux clients.

## 5. Partenariats avec des influenceurs locaux

Collaborez avec des food bloggers ou influenceurs de votre région. Un post d'un micro-influenceur (10k-50k abonnés) peut vous apporter 50 à 100 nouveaux clients.

## 6. Email marketing personnalisé

Collectez les emails de vos clients et envoyez des newsletters avec vos nouveautés, événements spéciaux et offres exclusives. Taux d'ouverture moyen : 25% dans la restauration.

## 7. Site web optimisé et réservation en ligne

Votre site web doit être rapide, mobile-friendly, et permettre la réservation en ligne. 70% des réservations se font maintenant depuis un smartphone.

## Conclusion

Le marketing digital n'est plus réservé aux grandes chaînes. Avec les bons outils et une stratégie cohérente, même un petit restaurant peut multiplier sa visibilité et son chiffre d'affaires. Commencez par 2-3 stratégies et développez progressivement.`,
    author: 'Équipe QUEROX',
    date: '2025-01-05',
    readTime: '6 min',
    category: 'Marketing',
    image: '/lovable-uploads/logo-querox.png',
    tags: ['Marketing', 'Fidélisation', 'Stratégie']
  }
];

const Blog: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = React.useState<BlogPost | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
              Blog QUEROX
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Conseils, actualités et bonnes pratiques pour réussir dans la restauration
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-purple-600/10 flex items-center justify-center">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-20 w-auto object-contain"
                  />
                </div>
                
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                  
                  <CardTitle className="line-clamp-2 hover:text-primary transition-colors cursor-pointer">
                    {post.title}
                  </CardTitle>
                  
                  <CardDescription className="line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setSelectedPost(post)}
                  >
                    Lire l'article
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl mb-4">{selectedPost.title}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {selectedPost.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(selectedPost.date).toLocaleDateString('fr-FR')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {selectedPost.readTime}
                  </span>
                </div>
                
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-purple-600/10 flex items-center justify-center rounded-lg">
                  <img
                    src={selectedPost.image}
                    alt={selectedPost.title}
                    className="h-24 w-auto object-contain"
                  />
                </div>
                
                <div className="prose prose-lg max-w-none">
                  <p className="text-lg text-muted-foreground mb-4">{selectedPost.excerpt}</p>
                  <p className="whitespace-pre-line">{selectedPost.content}</p>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  {selectedPost.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <LandingFooter />
    </div>
  );
};

export default Blog;
