import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    excerpt: 'Découvrez les meilleures pratiques pour améliorer l\'efficacité opérationnelle de votre établissement.',
    content: 'La digitalisation de la restauration n\'est plus une option mais une nécessité...',
    author: 'Équipe QUEROX',
    date: '2025-01-15',
    readTime: '5 min',
    category: 'Gestion',
    image: '/lovable-uploads/logo-querox.png',
    tags: ['Gestion', 'Digital', 'Optimisation']
  },
  {
    id: '2',
    title: 'Les avantages du menu digital QR code pour votre restaurant',
    excerpt: 'Réduisez vos coûts d\'impression et offrez une expérience moderne à vos clients.',
    content: 'Le menu digital représente l\'avenir de la restauration...',
    author: 'Équipe QUEROX',
    date: '2025-01-10',
    readTime: '4 min',
    category: 'Technologie',
    image: '/lovable-uploads/logo-querox.png',
    tags: ['QR Code', 'Menu Digital', 'Innovation']
  },
  {
    id: '3',
    title: 'Stratégies marketing efficaces pour attirer plus de clients',
    excerpt: 'Apprenez à utiliser le marketing digital pour augmenter votre visibilité.',
    content: 'Le marketing digital offre des opportunités immenses pour les restaurateurs...',
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
                  
                  <Button variant="outline" className="w-full">
                    Lire l'article
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      
      <LandingFooter />
    </div>
  );
};

export default Blog;
