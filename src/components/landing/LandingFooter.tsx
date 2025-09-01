
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
    <footer id="contact" className="bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white relative overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.1),transparent)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.1),transparent)]"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        {/* Newsletter Section */}
        <div className="text-center mb-20">
          <h3 className="text-3xl lg:text-4xl font-black mb-6">
            Restez informé de nos nouveautés
          </h3>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Recevez les dernières fonctionnalités, conseils et actualités directement dans votre boîte mail.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Votre adresse email"
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-gray-400 rounded-full px-6 py-3 h-12 flex-1"
            />
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full px-8 py-3 h-12 font-semibold">
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
              <h3 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                QUEROX
              </h3>
            </div>
            <p className="text-lg text-gray-300 leading-relaxed max-w-lg">
              La solution complète nouvelle génération pour révolutionner la gestion de votre restaurant.
              Simplicité, efficacité et performance au service de votre succès.
            </p>
            <div className="flex items-center space-x-2 text-gray-400">
              <MapPin className="h-5 w-5" />
              <span>Gabon, Libreville</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <Mail className="h-5 w-5" />
              <span>contact@querox.me</span>
            </div>
            <div className="flex space-x-6">
              <Facebook className="h-8 w-8 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
              <Twitter className="h-8 w-8 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
              <Instagram className="h-8 w-8 text-gray-400 hover:text-pink-400 cursor-pointer transition-colors" />
            </div>
          </div>
          
          {/* Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-bold text-white mb-6">Produit</h4>
              <ul className="space-y-4">
                {footerLinks.product.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-gray-400 hover:text-white transition-colors duration-200">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-white mb-6">Entreprise</h4>
              <ul className="space-y-4">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-gray-400 hover:text-white transition-colors duration-200">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-white mb-6">Support</h4>
              <ul className="space-y-4">
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-gray-400 hover:text-white transition-colors duration-200">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col lg:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-center lg:text-left">
            © 2025 QUEROX. Tous droits réservés. Conçu avec ❤️ au Gabon.
          </p>
          <div className="flex items-center space-x-8 text-sm text-gray-400">
            <a href="#privacy" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="#terms" className="hover:text-white transition-colors">Conditions</a>
            <a href="#cookies" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
