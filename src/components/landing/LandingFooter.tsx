
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Mail, MapPin, ArrowRight } from "lucide-react";

const LandingFooter: React.FC = () => {
  const footerLinks = {
    product: [
      { label: 'Fonctionnalités', href: '#features' },
      { label: 'Services Premium', href: '#services' },
      { label: 'Tarifs', href: '#pricing' },
      { label: 'Démo', href: '#demo' }
    ],
    company: [
      { label: 'À propos', href: '#about' },
      { label: 'Blog', href: '#blog' },
      { label: 'Carrières', href: '#careers' },
      { label: 'Presse', href: '#press' }
    ],
    support: [
      { label: 'Centre d\'aide', href: '#help' },
      { label: 'Contact', href: '#contact' },
      { label: 'Status', href: '#status' },
      { label: 'Documentation', href: '#docs' }
    ]
  };

  return (
    <footer id="contact" className="bg-gradient-to-b from-muted via-muted to-background text-foreground relative overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,hsl(var(--primary))_0.1,transparent)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--primary))_0.1,transparent)]"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        {/* Newsletter Section */}
        <div className="text-center mb-20">
          <h3 className="text-3xl lg:text-4xl font-black mb-6 text-foreground">
            Restez informé de nos nouveautés
          </h3>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Recevez les dernières fonctionnalités, conseils et actualités directement dans votre boîte mail.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Votre adresse email"
              className="bg-card/50 backdrop-blur-sm border-border text-foreground placeholder-muted-foreground rounded-full px-6 py-3 h-12 flex-1"
            />
            <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 rounded-full px-8 py-3 h-12 font-semibold">
              <span className="sm:hidden">S'abonner</span>
              <span className="hidden sm:block">S'abonner à la newsletter</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
          {/* Company Info */}
          <div className="space-y-8">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/a2262c2b-4c9e-4359-bc71-081861dfbd12.png" 
                alt="QUEROX Logo" 
                className="h-10 w-auto"
              />
              <h3 className="text-3xl font-black bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                QUEROX
              </h3>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              La solution complète nouvelle génération pour révolutionner la gestion de votre restaurant.
              Simplicité, efficacité et performance au service de votre succès.
            </p>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <MapPin className="h-5 w-5" />
              <span>Gabon, Libreville</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Mail className="h-5 w-5" />
              <span>contact@querox.me</span>
            </div>
            <div className="flex space-x-6">
              <Facebook className="h-8 w-8 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Twitter className="h-8 w-8 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Instagram className="h-8 w-8 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>
          
          {/* Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-bold text-foreground mb-6">Produit</h4>
              <ul className="space-y-4">
                {footerLinks.product.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-foreground mb-6">Entreprise</h4>
              <ul className="space-y-4">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-foreground mb-6">Support</h4>
              <ul className="space-y-4">
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col lg:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-center lg:text-left">
            © 2025 QUEROX. Tous droits réservés. Conçu avec ❤️ au Gabon.
          </p>
          <div className="flex items-center space-x-8 text-sm text-muted-foreground">
            <a href="#privacy" className="hover:text-foreground transition-colors">Confidentialité</a>
            <a href="#terms" className="hover:text-foreground transition-colors">Conditions</a>
            <a href="#cookies" className="hover:text-foreground transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
