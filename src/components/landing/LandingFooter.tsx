import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Mail, MapPin, ArrowRight } from "lucide-react";
import { APP_CONFIG } from '@/config/app.config';
const LandingFooter: React.FC = () => {
  const navigate = useNavigate();
  const footerLinks = {
    product: [{
      label: 'Fonctionnalités',
      href: '#features'
    }, {
      label: 'Services Premium',
      href: '#services'
    }, {
      label: 'Tarifs',
      href: '#pricing'
    }, {
      label: 'Démo',
      href: '#demo'
    }],
    company: [{
      label: 'Blog',
      href: '/blog'
    }, {
      label: 'Partenaires',
      href: '/partner-signup'
    }],
    support: [{
      label: 'Contact',
      href: `mailto:${APP_CONFIG.contact.email}`
    }]
  };

  const handleLinkClick = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (href.startsWith('mailto:')) {
      window.location.href = href;
    } else {
      navigate(href);
    }
  };
  return <footer id="contact" className="bg-gradient-to-b from-muted via-muted to-background text-foreground relative overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,hsl(var(--primary))_0.1,transparent)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--primary))_0.1,transparent)]"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24">
        {/* Newsletter Section */}
        <div className="text-center mb-12 sm:mb-20">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-4 sm:mb-6 text-foreground">
            Restez informé de nos nouveautés
          </h3>
          <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
            Recevez les dernières fonctionnalités, conseils et actualités directement dans votre boîte mail.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <Input type="email" placeholder="Votre adresse email" className="bg-card/50 backdrop-blur-sm border-border text-foreground placeholder-muted-foreground rounded-full px-4 sm:px-6 py-2 sm:py-3 h-10 sm:h-12 flex-1" />
            <Button className="w-full sm:w-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 rounded-full px-6 sm:px-8 py-2 sm:py-3 h-10 sm:h-12 font-semibold text-sm sm:text-base">
              <span className="sm:hidden">S'abonner</span>
              <span className="hidden sm:block">S'abonner à la newsletter</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 mb-12 sm:mb-16">
          {/* Company Info */}
          <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img src="/lovable-uploads/logo-querox.png" alt="QUEROX Logo" className="h-16 sm:h-20 w-auto" />
            </div>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg">
              La solution complète nouvelle génération pour révolutionner la gestion de votre restaurant.
              Simplicité, efficacité et performance au service de votre succès.
            </p>
            <div className="space-y-3 sm:space-y-4">
              
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">{APP_CONFIG.contact.email}</span>
              </div>
            </div>
            <div className="flex space-x-4 sm:space-x-6">
              <Facebook className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Twitter className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Instagram className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>
          
          {/* Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <h4 className="text-base sm:text-lg font-bold text-foreground mb-4 sm:mb-6">Produit</h4>
              <ul className="space-y-3 sm:space-y-4">
                {footerLinks.product.map((link, index) => <li key={index}>
                    <button onClick={() => handleLinkClick(link.href)} className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200">
                      {link.label}
                    </button>
                  </li>)}
              </ul>
            </div>
            
            <div>
              <h4 className="text-base sm:text-lg font-bold text-foreground mb-4 sm:mb-6">Entreprise</h4>
              <ul className="space-y-3 sm:space-y-4">
                {footerLinks.company.map((link, index) => <li key={index}>
                    <button onClick={() => handleLinkClick(link.href)} className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200">
                      {link.label}
                    </button>
                  </li>)}
              </ul>
            </div>
            
            <div>
              <h4 className="text-base sm:text-lg font-bold text-foreground mb-4 sm:mb-6">Support</h4>
              <ul className="space-y-3 sm:space-y-4">
                {footerLinks.support.map((link, index) => <li key={index}>
                    <button onClick={() => handleLinkClick(link.href)} className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200">
                      {link.label}
                    </button>
                  </li>)}
                <li>
                  <button onClick={() => navigate('/cgu-cgv')} className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200">
                    CGU/CGV
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        
      </div>
    </footer>;
};
export default LandingFooter;